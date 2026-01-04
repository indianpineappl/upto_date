import type { Handler } from '@netlify/functions';
import { fetchRssRawItems } from './_lib/rss';
import { generateTopicsWithOpenAI } from './_lib/openaiTopics';
import { getSupabaseAdmin } from './_lib/supabase';
import { bucketIdToApproxCoords } from './_lib/geobucket';

function todayDateStringUTC() {
  const now = new Date();
  const yyyy = now.getUTCFullYear();
  const mm = String(now.getUTCMonth() + 1).padStart(2, '0');
  const dd = String(now.getUTCDate()).padStart(2, '0');
  return `${yyyy}-${mm}-${dd}`;
}

function utc24hAgoISOString() {
  const d = new Date(Date.now() - 24 * 60 * 60 * 1000);
  return d.toISOString();
}

function jsonResponse(statusCode: number, body: any) {
  return {
    statusCode,
    headers: {
      'Content-Type': 'application/json'
    },
    body: JSON.stringify(body)
  };
}

export const handler: Handler = async () => {
  try {
    const date = todayDateStringUTC();
    const supabase = getSupabaseAdmin();

    const { data: recentEvents, error: eventsError } = await supabase
      .from('user_events')
      .select('bucket_id,created_at')
      .gte('created_at', utc24hAgoISOString())
      .order('created_at', { ascending: false })
      .limit(5000);

    if (eventsError) throw eventsError;

    const bucketCounts: Record<string, number> = {};
    (recentEvents || []).forEach((e: any) => {
      const b = String(e.bucket_id || 'global');
      bucketCounts[b] = (bucketCounts[b] || 0) + 1;
    });

    const topBuckets = Object.entries(bucketCounts)
      .filter(([b]) => b && b !== 'global')
      .sort((a, b) => b[1] - a[1])
      .slice(0, 10)
      .map(([b]) => b);

    const bucketsToGenerate = ['global', ...topBuckets];

    const rawItems = await fetchRssRawItems(300);

    for (const bucketId of bucketsToGenerate) {
      const coords = bucketIdToApproxCoords(bucketId);

      const snapshot = await generateTopicsWithOpenAI({
        location: {
          city: null,
          country: null,
          latitude: coords ? coords.latitude : null,
          longitude: coords ? coords.longitude : null
        },
        rawItems
      });

      const { error } = await supabase.from('topic_snapshots').upsert(
        {
          bucket_id: bucketId,
          snapshot_date: date,
          snapshot_json: snapshot
        },
        { onConflict: 'bucket_id,snapshot_date' }
      );

      if (error) throw error;
    }

    return jsonResponse(200, {
      ok: true,
      date,
      generatedBuckets: bucketsToGenerate,
      rawItems: rawItems.length
    });
  } catch (e) {
    return jsonResponse(500, { error: (e as Error).message || 'Server error' });
  }
};
