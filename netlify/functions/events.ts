import type { Handler } from '@netlify/functions';
import { getSupabaseAdmin } from './_lib/supabase';

function jsonResponse(statusCode: number, body: any) {
  return {
    statusCode,
    headers: {
      'Content-Type': 'application/json',
      'Cache-Control': 'no-store'
    },
    body: JSON.stringify(body)
  };
}

type IncomingEvent = {
  type: string;
  ts?: number;
  topicId?: string;
  subtopicId?: string;
  dwellMs?: number;
};

function scoreDelta(ev: IncomingEvent): number {
  switch (ev.type) {
    case 'topic_swipe_right':
      return 2.0;
    case 'topic_swipe_left':
      return -3.0;
    case 'topic_open':
      return 0.6;
    case 'subtopic_open':
      return 0.5;
    case 'dwell_time': {
      const ms = Number(ev.dwellMs || 0);
      const seconds = Math.max(0, ms / 1000);
      return Math.log(1 + seconds) * 0.4;
    }
    default:
      return 0;
  }
}

export const handler: Handler = async (event) => {
  try {
    if (event.httpMethod !== 'POST') {
      return jsonResponse(405, { error: 'Method not allowed' });
    }

    const body = event.body ? JSON.parse(event.body) : null;
    if (!body?.userId || !body?.bucketId || !body?.snapshotDate || !Array.isArray(body?.events)) {
      return jsonResponse(400, { error: 'Invalid payload' });
    }

    const supabase = getSupabaseAdmin();

    const rows = body.events.map((ev: IncomingEvent) => ({
      user_id: String(body.userId),
      bucket_id: String(body.bucketId),
      snapshot_date: String(body.snapshotDate),
      event_type: String(ev.type),
      topic_id: ev.topicId ? String(ev.topicId) : null,
      subtopic_id: ev.subtopicId ? String(ev.subtopicId) : null,
      dwell_ms: ev.dwellMs ? Number(ev.dwellMs) : null
    }));

    const { error: insertError } = await supabase.from('user_events').insert(rows);
    if (insertError) throw insertError;

    // Update per-topic materialized scores
    const scoreUpdates: Record<string, number> = {};
    for (const ev of body.events as IncomingEvent[]) {
      if (!ev.topicId) continue;
      scoreUpdates[ev.topicId] = (scoreUpdates[ev.topicId] || 0) + scoreDelta(ev);
    }

    const upserts = Object.entries(scoreUpdates).map(([topicId, delta]) => ({
      user_id: String(body.userId),
      topic_id: topicId,
      score: delta,
      updated_at: new Date().toISOString()
    }));

    // For simplicity: read current score then add. (v2 can use RPC or SQL increment.)
    for (const u of upserts) {
      const { data, error } = await supabase
        .from('user_topic_scores')
        .select('score')
        .eq('user_id', u.user_id)
        .eq('topic_id', u.topic_id)
        .maybeSingle();

      if (error) throw error;
      const current = data?.score ?? 0;

      const { error: upsertErr } = await supabase.from('user_topic_scores').upsert(
        {
          user_id: u.user_id,
          topic_id: u.topic_id,
          score: Number(current) + Number(u.score),
          updated_at: u.updated_at
        },
        { onConflict: 'user_id,topic_id' }
      );

      if (upsertErr) throw upsertErr;
    }

    return jsonResponse(200, { ok: true });
  } catch (e) {
    return jsonResponse(500, { error: (e as Error).message || 'Server error' });
  }
};
