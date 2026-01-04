import type { Handler } from '@netlify/functions';
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

export const handler: Handler = async (event) => {
  const debug = event?.queryStringParameters?.debug === '1';
  const date = todayDateStringUTC();
  let runId: string | null = null;

  try {
    const supabase = getSupabaseAdmin();
    const { data: runRow, error: runErr } = await supabase
      .from('ingestion_runs')
      .insert({ run_type: 'daily_ingest', status: 'running', details: { date } })
      .select('id')
      .single();

    if (runErr) throw runErr;
    runId = String(runRow.id);

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
      .slice(0, 3)
      .map(([b]) => b);

    const bucketsToGenerate = ['global', ...topBuckets];

    const { fetchRssRawItems } = await import('./_lib/rss');
    const fetchedRawItems = await fetchRssRawItems(120);

    // Persist RSS items for observability / reprocessing
    const rssRows = fetchedRawItems.map((it: any) => ({
      id: String(it.id),
      source_name: String(it.source_name),
      title: String(it.title),
      snippet: it.snippet ? String(it.snippet) : null,
      url: it.url ? String(it.url) : null,
      published_at: it.published_at ? String(it.published_at) : null,
      raw: it
    }));

    const { error: rssUpsertErr } = await supabase.from('rss_items').upsert(rssRows, { onConflict: 'id' });
    if (rssUpsertErr) throw rssUpsertErr;

    // Read latest stored items for LLM input (avoid refetching at generation time)
    const { data: storedRssItems, error: storedErr } = await supabase
      .from('rss_items')
      .select('id,source_name,title,snippet,url,published_at')
      .order('published_at', { ascending: false })
      .limit(120);

    if (storedErr) throw storedErr;

    const rawItems = (storedRssItems || []).map((r: any) => ({
      id: String(r.id),
      source_type: 'news' as const,
      source_name: String(r.source_name),
      title: String(r.title),
      snippet: r.snippet ? String(r.snippet) : null,
      url: r.url ? String(r.url) : null,
      published_at: r.published_at ? String(r.published_at) : null
    }));

    const { generateTopicsWithOpenAI } = await import('./_lib/openaiTopics');

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

    if (runId) {
      const { error: finishErr } = await supabase
        .from('ingestion_runs')
        .update({
          status: 'ok',
          finished_at: new Date().toISOString(),
          details: {
            date,
            generatedBuckets: bucketsToGenerate,
            fetchedRssItems: fetchedRawItems.length,
            storedRssItems: rawItems.length
          }
        })
        .eq('id', runId);

      if (finishErr) throw finishErr;
    }

    return jsonResponse(200, {
      ok: true,
      date,
      generatedBuckets: bucketsToGenerate,
      fetchedRssItems: fetchedRawItems.length,
      storedRssItems: rawItems.length
    });
  } catch (e) {
    const err = e as any;
    const message = err?.message || 'Server error';
    if (runId) {
      try {
        const supabase = getSupabaseAdmin();
        await supabase
          .from('ingestion_runs')
          .update({
            status: 'error',
            finished_at: new Date().toISOString(),
            details: {
              date,
              error: (e as Error)?.message || String(e)
            }
          })
          .eq('id', runId);
      } catch {
        // ignore
      }
    }

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
