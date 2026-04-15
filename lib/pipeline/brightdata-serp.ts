/**
 * BrightData SERP API + Autocomplete helpers.
 *
 * Replaces the SerpAPI.com subscription with BrightData's cheaper SERP zone
 * (~17× cheaper per call). Exports the SAME function signatures as
 * `lib/pipeline/serpapi.ts` so callers can switch imports without edits.
 *
 * BrightData zones used:
 *   - SERP zone (Full JSON):   go2_projects_serp   — for PAA + Google News
 *   - Web Unlocker (residential proxy): go2_projects — for Autocomplete
 *
 * Required env:
 *   - BRIGHTDATA_API_KEY
 *   - BRIGHTDATA_SERP_ZONE    (defaults: "go2_projects_serp")
 *   - BRIGHTDATA_WEB_ZONE     (defaults: "go2_projects")
 *
 * Trends intentionally NOT implemented — Google Trends has a private API
 * that requires bespoke scraping per-change. If you need trends,
 * keep SerpAPI for that call alone or scrape trends.google.com manually.
 */

const BRD_URL = 'https://api.brightdata.com/request';

function auth(): string {
  const k = process.env.BRIGHTDATA_API_KEY;
  if (!k) throw new Error('Missing BRIGHTDATA_API_KEY');
  return k;
}
function serpZone(): string { return process.env.BRIGHTDATA_SERP_ZONE || 'go2_projects_serp'; }
function webZone(): string { return process.env.BRIGHTDATA_WEB_ZONE || 'go2_projects'; }

interface FetchOptions { retries?: number }

async function brightFetch(zone: string, targetUrl: string, format: 'raw' | 'json' = 'raw', opts: FetchOptions = {}): Promise<string> {
  const retries = opts.retries ?? 1;
  let lastErr: Error | null = null;
  for (let attempt = 0; attempt <= retries; attempt++) {
    try {
      const res = await fetch(BRD_URL, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${auth()}`,
        },
        body: JSON.stringify({ zone, url: targetUrl, format }),
      });
      if (!res.ok) {
        const body = await res.text();
        throw new Error(`BrightData ${res.status}: ${body.slice(0, 200)}`);
      }
      return await res.text();
    } catch (e) {
      lastErr = e instanceof Error ? e : new Error(String(e));
      if (attempt < retries) await new Promise(r => setTimeout(r, 1000 * (attempt + 1)));
    }
  }
  throw lastErr ?? new Error('BrightData request failed');
}

// -------------------------------------------------------------------
// People Also Ask — now via BrightData SERP zone (returns parsed JSON).
// -------------------------------------------------------------------
export async function getPeopleAlsoAsk(query: string, opts: { hl?: string; gl?: string } = {}): Promise<string[]> {
  const params = new URLSearchParams({
    q: query,
    hl: opts.hl ?? 'en',
    gl: opts.gl ?? 'us',
  });
  const targetUrl = `https://www.google.com/search?${params}`;
  try {
    const text = await brightFetch(serpZone(), targetUrl);
    const data = JSON.parse(text) as { people_also_ask?: Array<{ question?: string }> };
    return (data.people_also_ask || [])
      .map(q => q.question)
      .filter((q): q is string => !!q)
      .slice(0, 6);
  } catch (e) {
    console.warn(`[brightdata-serp] PAA fetch failed for "${query}":`, e instanceof Error ? e.message : e);
    return [];
  }
}

// -------------------------------------------------------------------
// Google Autocomplete — we fetch Google's public suggest endpoint via
// BrightData's Web Unlocker (residential proxy) to avoid IP rate limits.
// The suggest endpoint returns JSON array of format [query, [suggestions...]]
// -------------------------------------------------------------------
export interface AutocompleteSuggestion {
  value: string;
  type?: string;
  relevance?: number;
}

export async function getAutocompleteSuggestions(
  seed: string,
  opts: { hl?: string; gl?: string } = {},
): Promise<AutocompleteSuggestion[]> {
  const params = new URLSearchParams({
    client: 'firefox',
    q: seed,
    hl: opts.hl ?? 'nl',
    gl: opts.gl ?? 'nl',
  });
  const targetUrl = `https://suggestqueries.google.com/complete/search?${params}`;
  try {
    const text = await brightFetch(webZone(), targetUrl);
    const data = JSON.parse(text) as [string, string[]];
    const list = Array.isArray(data) && Array.isArray(data[1]) ? data[1] : [];
    return list.map(s => ({ value: s }));
  } catch (e) {
    console.warn(`[brightdata-serp] Autocomplete failed for "${seed}":`, e instanceof Error ? e.message : e);
    return [];
  }
}

// -------------------------------------------------------------------
// Google News — via BrightData SERP zone with tbm=nws parameter.
// -------------------------------------------------------------------
export interface NewsArticle {
  title: string;
  link: string;
  source?: { name?: string };
  snippet?: string;
  date?: string;
  thumbnail?: string;
}

export async function getGoogleNews(
  query: string,
  opts: { hl?: string; gl?: string } = {},
): Promise<NewsArticle[]> {
  const params = new URLSearchParams({
    q: query,
    tbm: 'nws',
    hl: opts.hl ?? 'en',
    gl: opts.gl ?? 'us',
  });
  const targetUrl = `https://www.google.com/search?${params}`;
  try {
    const text = await brightFetch(serpZone(), targetUrl);
    const data = JSON.parse(text) as {
      organic?: Array<{ title?: string; link?: string; source?: string; description?: string; date?: string; thumbnail?: string }>;
      news?: Array<{ title?: string; link?: string; source?: string; description?: string; date?: string; thumbnail?: string }>;
    };
    // BrightData returns news results either under `news` (tbm=nws) or `organic` (fallback).
    const results = data.news || data.organic || [];
    return results
      .filter(r => r.title && r.link)
      .map(r => ({
        title: r.title!,
        link: r.link!,
        source: r.source ? { name: r.source } : undefined,
        snippet: r.description,
        date: r.date,
        thumbnail: r.thumbnail,
      }));
  } catch (e) {
    console.warn(`[brightdata-serp] News fetch failed for "${query}":`, e instanceof Error ? e.message : e);
    return [];
  }
}

// -------------------------------------------------------------------
// Trends — NOT supported by BrightData SERP zone in a clean format.
// Callers should keep using SerpAPI for this single use-case, or drop
// trends-based topic prioritisation entirely.
// -------------------------------------------------------------------
export interface TrendRelatedQuery { query: string; value?: string | number; link?: string }

export async function getRelatedTrends(
  _query: string,
  _opts: { geo?: string; date?: string } = {},
): Promise<{ rising: TrendRelatedQuery[]; top: TrendRelatedQuery[] }> {
  // Graceful no-op — pipeline should degrade without trends rather than fail.
  return { rising: [], top: [] };
}
