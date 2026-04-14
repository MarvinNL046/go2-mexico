/**
 * Thin wrappers around the SerpAPI endpoints we actually use.
 *
 * Free tier is ~250 searches/month, so each helper is intentionally narrow
 * and the cron that calls them runs at most a handful of times per week.
 *
 * Required env: SERPAPI_KEY
 */

const SERP_BASE = 'https://serpapi.com/search.json';

function key(): string {
  const k = process.env.SERPAPI_KEY;
  if (!k) throw new Error('Missing SERPAPI_KEY');
  return k;
}

interface FetchOptions {
  retries?: number;
}

async function serpFetch(url: string, opts: FetchOptions = {}): Promise<unknown> {
  const retries = opts.retries ?? 1;
  let lastErr: Error | null = null;
  for (let attempt = 0; attempt <= retries; attempt++) {
    try {
      const res = await fetch(url);
      if (!res.ok) {
        const body = await res.text();
        throw new Error(`SerpAPI ${res.status}: ${body.slice(0, 200)}`);
      }
      return await res.json();
    } catch (e) {
      lastErr = e instanceof Error ? e : new Error(String(e));
      if (attempt < retries) await new Promise(r => setTimeout(r, 1000 * (attempt + 1)));
    }
  }
  throw lastErr ?? new Error('SerpAPI request failed');
}

// -------------------------------------------------------------------
// Google Autocomplete — long-tail keyword expansion.
//   Input: a seed phrase (e.g. "Thailand vakantie", "Bangkok tips")
//   Output: list of suggestions Google's autocomplete shows for that seed.
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
    engine: 'google_autocomplete',
    q: seed,
    hl: opts.hl ?? 'nl',
    gl: opts.gl ?? 'nl',
    api_key: key(),
  });
  const data = await serpFetch(`${SERP_BASE}?${params}`) as { suggestions?: AutocompleteSuggestion[] };
  return data.suggestions ?? [];
}

// -------------------------------------------------------------------
// Google Trends — what's rising for Thailand-related queries.
//   We use TIMESERIES (interest over time) for a query in a geo,
//   and RELATED_QUERIES for breakout topics.
// -------------------------------------------------------------------

export interface TrendRelatedQuery {
  query: string;
  value?: string | number;     // "Breakout", or 100, etc.
  link?: string;
}

export async function getRelatedTrends(
  query: string,
  opts: { geo?: string; date?: string } = {},
): Promise<{ rising: TrendRelatedQuery[]; top: TrendRelatedQuery[] }> {
  const params = new URLSearchParams({
    engine: 'google_trends',
    q: query,
    data_type: 'RELATED_QUERIES',
    geo: opts.geo ?? 'NL',
    date: opts.date ?? 'today 3-m',  // last 3 months
    api_key: key(),
  });
  const data = await serpFetch(`${SERP_BASE}?${params}`) as {
    related_queries?: { rising?: TrendRelatedQuery[]; top?: TrendRelatedQuery[] };
  };
  return {
    rising: data.related_queries?.rising ?? [],
    top: data.related_queries?.top ?? [],
  };
}

// -------------------------------------------------------------------
// Google News — replaces some of our HTML scraping for fresher headlines.
//   Returns up to ~20 articles per call.
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
    engine: 'google_news',
    q: query,
    hl: opts.hl ?? 'en',
    gl: opts.gl ?? 'us',
    api_key: key(),
  });
  const data = await serpFetch(`${SERP_BASE}?${params}`) as { news_results?: NewsArticle[] };
  return data.news_results ?? [];
}
