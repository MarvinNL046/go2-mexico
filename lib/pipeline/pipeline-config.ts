/**
 * Per-site pipeline configuration.
 *
 * Each Go2 sister site reads its own `pipeline.config.json` from the project
 * root. The defaults below describe go2-thailand.com so the sync script has
 * a working reference template; a sister site overrides the values that
 * differ (country name, hostname, autocomplete seeds, scrape sources).
 *
 * Fields are intentionally minimal — anything more specific (per-category
 * topic banks, prompt overrides) lives in the generators themselves.
 */

import fs from 'fs';
import path from 'path';

export interface PipelineConfig {
  /** Display country, used in prompts ("comprehensive {country} travel resource"). */
  country: string;
  /** Site brand name shown in titles/headers (e.g. "Go2Thailand", "Go2Vietnam"). */
  siteName: string;
  /** Production hostname used by GA4 hostname filter and internal-link checks. */
  hostname: string;
  /** Locales the writers produce. EN-only sites: ['en']. */
  locales: Array<'en' | 'nl'>;
  /** Google Autocomplete seed phrases per locale. */
  autocompleteSeeds: { en: string[]; nl?: string[] };
  /** Google News query (single phrase, e.g. "Thailand"). */
  newsQuery: string;
  /** Vanilla scrape fallback URLs (used when SerpAPI is unavailable). */
  scrapeNewsSources: string[];
  /** GitHub org/user that owns this site's repo — pipeline commits go here. */
  repoOwner: string;
  /** GitHub repo name for this site — e.g. "go2thailand.com", "go2-bali.com". */
  repoName: string;
  /** Optional branch override for GitHub API commits. Defaults to the repo default branch. */
  branch?: string;
}

const DEFAULT_CONFIG: PipelineConfig = {
  country: 'Thailand',
  siteName: 'Go2Thailand',
  hostname: 'go2-thailand.com',
  locales: ['en', 'nl'],
  autocompleteSeeds: {
    en: ['Thailand travel', 'Bangkok', 'Thailand backpacker', 'Thailand digital nomad'],
    nl: ['Thailand vakantie', 'Bangkok tips', 'Phuket', 'Chiang Mai', 'Thailand visa'],
  },
  newsQuery: 'Thailand',
  scrapeNewsSources: [
    'https://thethaiger.com/news/thailand',
    'https://www.bangkokpost.com/thailand',
    'https://www.bangkokpost.com/travel',
    'https://www.thailandblog.nl/en/',
    'https://www.tatnews.org/',
  ],
  repoOwner: 'MarvinNL046',
  repoName: 'go2thailand.com',
};

let cached: PipelineConfig | null = null;

export function loadPipelineConfig(): PipelineConfig {
  if (cached) return cached;
  try {
    const file = path.join(process.cwd(), 'pipeline.config.json');
    if (fs.existsSync(file)) {
      const user = JSON.parse(fs.readFileSync(file, 'utf8')) as Partial<PipelineConfig>;
      cached = { ...DEFAULT_CONFIG, ...user, autocompleteSeeds: { ...DEFAULT_CONFIG.autocompleteSeeds, ...(user.autocompleteSeeds || {}) } };
    } else {
      cached = DEFAULT_CONFIG;
    }
  } catch {
    cached = DEFAULT_CONFIG;
  }
  return cached;
}
