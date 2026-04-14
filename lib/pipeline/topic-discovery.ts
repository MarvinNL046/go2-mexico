/**
 * Weekly topic-discovery: queries Google Autocomplete for a small set of
 * Dutch + English seed keywords and writes the suggestions to
 * data/topic-suggestions.json. The blog generators (selectNlTopic / selectTopic)
 * read this file and bias toward suggestions that aren't yet covered by
 * existing posts.
 *
 * Free-tier budget: 5 NL seeds + 4 EN seeds = 9 SerpAPI calls per week.
 * Monthly cost: 36 calls (well under the 250 free-tier limit).
 */

import fs from 'fs';
import path from 'path';
import { getAutocompleteSuggestions } from './serpapi';
import { loadPipelineConfig } from './pipeline-config';

export interface TopicSuggestion {
  seed: string;
  locale: 'nl' | 'en';
  value: string;
  collectedAt: string;
}

export interface TopicSuggestionsFile {
  generatedAt: string;
  totalSuggestions: number;
  byLocale: { nl: number; en: number };
  suggestions: TopicSuggestion[];
}

export async function runTopicDiscovery(): Promise<TopicSuggestionsFile> {
  const cfg = loadPipelineConfig();
  const collectedAt = new Date().toISOString();
  const suggestions: TopicSuggestion[] = [];

  const NL_SEEDS = cfg.locales.includes('nl') ? (cfg.autocompleteSeeds.nl ?? []) : [];
  const EN_SEEDS = cfg.autocompleteSeeds.en ?? [];

  // NL seeds
  for (const seed of NL_SEEDS) {
    try {
      const items = await getAutocompleteSuggestions(seed, { hl: 'nl', gl: 'nl' });
      for (const it of items) {
        suggestions.push({ seed, locale: 'nl', value: it.value, collectedAt });
      }
    } catch (e) {
      console.warn(`[topic-discovery] NL seed "${seed}" failed:`, e instanceof Error ? e.message : e);
    }
  }

  // EN seeds
  for (const seed of EN_SEEDS) {
    try {
      const items = await getAutocompleteSuggestions(seed, { hl: 'en', gl: 'us' });
      for (const it of items) {
        suggestions.push({ seed, locale: 'en', value: it.value, collectedAt });
      }
    } catch (e) {
      console.warn(`[topic-discovery] EN seed "${seed}" failed:`, e instanceof Error ? e.message : e);
    }
  }

  // De-dupe by (locale + value), keep the first seed it appeared under.
  const seen = new Set<string>();
  const deduped: TopicSuggestion[] = [];
  for (const s of suggestions) {
    const k = `${s.locale}::${s.value.toLowerCase().trim()}`;
    if (seen.has(k)) continue;
    seen.add(k);
    deduped.push(s);
  }

  const out: TopicSuggestionsFile = {
    generatedAt: collectedAt,
    totalSuggestions: deduped.length,
    byLocale: {
      nl: deduped.filter(s => s.locale === 'nl').length,
      en: deduped.filter(s => s.locale === 'en').length,
    },
    suggestions: deduped,
  };

  return out;
}

// -------------------------------------------------------------------
// Reader for the blog generators
// -------------------------------------------------------------------

export function readTopicSuggestions(): TopicSuggestionsFile | null {
  try {
    const file = path.join(process.cwd(), 'data', 'topic-suggestions.json');
    if (!fs.existsSync(file)) return null;
    return JSON.parse(fs.readFileSync(file, 'utf8')) as TopicSuggestionsFile;
  } catch {
    return null;
  }
}

/**
 * Returns up to N suggestions for the given locale that have NOT been
 * published yet (best-effort fuzzy match against existing post titles).
 */
export function pickFreshSuggestions(
  locale: 'nl' | 'en',
  existingTitles: string[],
  limit = 5,
): string[] {
  const file = readTopicSuggestions();
  if (!file) return [];

  const existingNorm = existingTitles.map(t =>
    t.toLowerCase().replace(/[^a-z0-9 ]+/g, ' ').replace(/\s+/g, ' ').trim(),
  );

  const matches = (suggestion: string): boolean => {
    const s = suggestion.toLowerCase().replace(/[^a-z0-9 ]+/g, ' ').replace(/\s+/g, ' ').trim();
    if (s.length < 8) return true;          // too generic, skip
    const sWords = s.split(' ').filter(w => w.length > 3);
    if (sWords.length === 0) return true;
    for (const e of existingNorm) {
      let overlap = 0;
      for (const w of sWords) if (e.includes(w)) overlap++;
      if (overlap / sWords.length >= 0.6) return true;
    }
    return false;
  };

  return file.suggestions
    .filter(s => s.locale === locale)
    .map(s => s.value)
    .filter(v => !matches(v))
    .slice(0, limit);
}
