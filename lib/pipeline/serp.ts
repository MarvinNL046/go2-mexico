/**
 * SERP adapter — tries BrightData first, falls back to SerpAPI.com.
 *
 * Callers import from './serp' and get BrightData automatically if the env
 * var BRIGHTDATA_API_KEY is set. If not, or if a specific engine isn't
 * supported (like Trends), we fall back to the SerpAPI implementation.
 *
 * Why a wrapper: sister sites can migrate at their own pace — just set
 * BRIGHTDATA_API_KEY on Vercel and they switch, no code change.
 */

import * as brd from './brightdata-serp';
import * as serp from './serpapi';

const useBright = () => !!process.env.BRIGHTDATA_API_KEY;

export async function getPeopleAlsoAsk(query: string, opts?: { hl?: string; gl?: string }): Promise<string[]> {
  if (useBright()) return brd.getPeopleAlsoAsk(query, opts);
  // SerpAPI flow — inline here because the old code did this ad-hoc in each script.
  const SERPAPI_KEY = process.env.SERPAPI_KEY;
  if (!SERPAPI_KEY) return [];
  try {
    const params = new URLSearchParams({
      engine: 'google',
      q: query,
      hl: opts?.hl ?? 'en',
      gl: opts?.gl ?? 'us',
      api_key: SERPAPI_KEY,
    });
    const res = await fetch(`https://serpapi.com/search.json?${params}`);
    if (!res.ok) return [];
    const data = await res.json() as { related_questions?: Array<{ question?: string }> };
    return (data.related_questions || []).map(q => q.question!).filter(Boolean).slice(0, 6);
  } catch { return []; }
}

export async function getAutocompleteSuggestions(seed: string, opts?: { hl?: string; gl?: string }) {
  if (useBright()) return brd.getAutocompleteSuggestions(seed, opts);
  return serp.getAutocompleteSuggestions(seed, opts);
}

export async function getGoogleNews(query: string, opts?: { hl?: string; gl?: string }) {
  if (useBright()) return brd.getGoogleNews(query, opts);
  return serp.getGoogleNews(query, opts);
}

export async function getRelatedTrends(query: string, opts?: { geo?: string; date?: string }) {
  // BrightData doesn't offer clean Trends; always use SerpAPI if key exists,
  // otherwise empty fallback. Callers should tolerate empty arrays.
  if (process.env.SERPAPI_KEY) return serp.getRelatedTrends(query, opts);
  return { rising: [], top: [] };
}

// Re-export types so callers have one import path.
export type { AutocompleteSuggestion, NewsArticle, TrendRelatedQuery } from './serpapi';
