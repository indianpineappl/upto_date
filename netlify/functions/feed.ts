import type { Handler } from '@netlify/functions';
import { bucketFallbackChain, toBucketId } from './_lib/geobucket';
import { getSupabaseAdmin } from './_lib/supabase';

function todayDateStringUTC() {
  const now = new Date();
  const yyyy = now.getUTCFullYear();
  const mm = String(now.getUTCMonth() + 1).padStart(2, '0');
  const dd = String(now.getUTCDate()).padStart(2, '0');
  return `${yyyy}-${mm}-${dd}`;
}

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

async function getSnapshot(params: { bucketId: string; date: string }) {
  const supabase = getSupabaseAdmin();
  const { data, error } = await supabase
    .from('topic_snapshots')
    .select('snapshot_json')
    .eq('bucket_id', params.bucketId)
    .eq('snapshot_date', params.date)
    .maybeSingle();

  if (error) throw error;
  return data?.snapshot_json ?? null;
}

async function storeSnapshot(params: { bucketId: string; date: string; snapshot: any }) {
  const supabase = getSupabaseAdmin();
  const { error } = await supabase.from('topic_snapshots').upsert(
    {
      bucket_id: params.bucketId,
      snapshot_date: params.date,
      snapshot_json: params.snapshot
    },
    { onConflict: 'bucket_id,snapshot_date' }
  );

  if (error) throw error;
}

async function getUserScores(userId: string, topicIds: string[]) {
  if (!userId || topicIds.length === 0) return {} as Record<string, number>;
  const supabase = getSupabaseAdmin();

  const { data, error } = await supabase
    .from('user_topic_scores')
    .select('topic_id,score')
    .eq('user_id', userId)
    .in('topic_id', topicIds);

  if (error) throw error;

  const scores: Record<string, number> = {};
  (data || []).forEach((r: any) => {
    scores[r.topic_id] = r.score;
  });
  return scores;
}

export const handler: Handler = async (event) => {
  const qs = event.queryStringParameters || {};
  const debug = qs.debug === '1';

  try {
    const lat = qs.lat ? Number(qs.lat) : null;
    const lng = qs.lng ? Number(qs.lng) : null;
    const userId = qs.userId ? String(qs.userId) : 'anonymous';

    const date = qs.date ? String(qs.date) : todayDateStringUTC();

    const hasCoords = typeof lat === 'number' && !Number.isNaN(lat) && typeof lng === 'number' && !Number.isNaN(lng);
    const bucketId = hasCoords ? toBucketId(lat!, lng!) : 'global';

    const fallbackChain = hasCoords ? bucketFallbackChain(lat!, lng!) : ['global'];

    let snapshotBucketId: string | null = null;
    let snapshot: any = null;

    for (const b of fallbackChain) {
      const existing = await getSnapshot({ bucketId: b, date });
      if (existing) {
        snapshotBucketId = b;
        snapshot = existing;
        break;
      }
    }

    if (!snapshot) {
      return jsonResponse(404, {
        error: 'No snapshot available yet. Please try again shortly.'
      });
    }

    const topics = Array.isArray(snapshot?.topics) ? snapshot.topics : [];
    const topicIds = topics.map((t: any) => String(t.id));
    const userScores = await getUserScores(userId, topicIds);

    const rankedTopics = topics
      .map((t: any) => {
        const base = (Number(t.locationRelevance || 0) || 0) + (Number(t.trendScore || 0) || 0);
        const userAdj = userScores[String(t.id)] || 0;
        return { ...t, _score: base + userAdj };
      })
      .sort((a: any, b: any) => (b._score || 0) - (a._score || 0))
      .map((t: any) => {
        const { _score, ...rest } = t;
        return rest;
      });

    // Shape to client Topic interface (keep extra fields too)
    return jsonResponse(200, {
      bucketId: snapshotBucketId,
      snapshotDate: date,
      topics: rankedTopics
    });
  } catch (e) {
    const err = e as any;
    const message = err?.message || 'Server error';

    if (debug) {
      return jsonResponse(200, {
        ok: false,
        error: message,
        name: err?.name,
        stack: err?.stack,
        axiosStatus: err?.response?.status,
        axiosData: err?.response?.data
      });
    }

    return jsonResponse(500, { error: message });
  }
};
