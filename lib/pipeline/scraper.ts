/**
 * Web scraper for the Mexico travel blog content pipeline.
 *
 * Scraping strategy (in order of preference):
 *   1. Jina Reader  – converts any URL to clean markdown
 *   2. BrightData   – unlocker proxy for sites that block Jina
 *   3. Direct fetch – plain HTTP request as last resort
 *
 * Search is handled exclusively by Jina Search.
 */

const TIMEOUT_MS = 15_000;

// ---------------------------------------------------------------------------
// Preferred Mexico travel sources (used when building research queries)
// ---------------------------------------------------------------------------
export const MEXICO_SOURCES = [
  "visitmexico.com",
  "lonelyplanet.com/mexico",
  "mexiconewsdaily.com",
  "timeout.com/mexico-city",
  "travelandleisure.com",
];

// ---------------------------------------------------------------------------
// Helpers
// ---------------------------------------------------------------------------

function getEnv(name: string): string {
  const value = process.env[name];
  if (!value) {
    throw new Error(`Missing required environment variable: ${name}`);
  }
  return value;
}

/** Strips HTML tags and collapses whitespace to produce plain text. */
function htmlToText(html: string): string {
  return html
    .replace(/<script[\s\S]*?<\/script>/gi, " ")
    .replace(/<style[\s\S]*?<\/style>/gi, " ")
    .replace(/<[^>]+>/g, " ")
    .replace(/&nbsp;/gi, " ")
    .replace(/&amp;/gi, "&")
    .replace(/&lt;/gi, "<")
    .replace(/&gt;/gi, ">")
    .replace(/&quot;/gi, '"')
    .replace(/&#39;/gi, "'")
    .replace(/\s{2,}/g, " ")
    .trim();
}

/** Wraps a fetch call with an AbortController timeout. */
async function fetchWithTimeout(
  url: string,
  init: RequestInit = {}
): Promise<Response> {
  const controller = new AbortController();
  const timer = setTimeout(() => controller.abort(), TIMEOUT_MS);
  try {
    const response = await fetch(url, { ...init, signal: controller.signal });
    return response;
  } finally {
    clearTimeout(timer);
  }
}

// ---------------------------------------------------------------------------
// Jina Reader
// ---------------------------------------------------------------------------

async function scrapeWithJina(url: string): Promise<string> {
  const apiKey = getEnv("JINA_API_KEY");
  const jinaUrl = `https://r.jina.ai/${url}`;

  const response = await fetchWithTimeout(jinaUrl, {
    headers: {
      Authorization: `Bearer ${apiKey}`,
      Accept: "application/json",
    },
  });

  if (!response.ok) {
    throw new Error(`Jina Reader returned ${response.status} for ${url}`);
  }

  const data = (await response.json()) as {
    data?: { content?: string; text?: string };
    content?: string;
    text?: string;
  };

  // Jina wraps the content in data.content or data.text
  const content =
    data?.data?.content ??
    data?.data?.text ??
    data?.content ??
    data?.text ??
    "";

  if (!content) {
    throw new Error(`Jina Reader returned empty content for ${url}`);
  }

  return content;
}

// ---------------------------------------------------------------------------
// BrightData Web Unlocker
// ---------------------------------------------------------------------------

async function scrapeWithBrightData(url: string): Promise<string> {
  const apiKey = getEnv("BRIGHT_DATA_API_KEY");

  const response = await fetchWithTimeout("https://api.brightdata.com/request", {
    method: "POST",
    headers: {
      Authorization: `Bearer ${apiKey}`,
      "Content-Type": "application/json",
    },
    body: JSON.stringify({ zone: "unlocker", url, format: "raw" }),
  });

  if (!response.ok) {
    throw new Error(`BrightData returned ${response.status} for ${url}`);
  }

  const raw = await response.text();
  return htmlToText(raw);
}

// ---------------------------------------------------------------------------
// Direct fetch (last resort)
// ---------------------------------------------------------------------------

async function scrapeDirectly(url: string): Promise<string> {
  const response = await fetchWithTimeout(url, {
    headers: {
      "User-Agent":
        "Mozilla/5.0 (compatible; Go2MexicoBot/1.0; +https://go2-mexico.com)",
    },
  });

  if (!response.ok) {
    throw new Error(`Direct fetch returned ${response.status} for ${url}`);
  }

  const raw = await response.text();
  return htmlToText(raw);
}

// ---------------------------------------------------------------------------
// Public API
// ---------------------------------------------------------------------------

/**
 * Scrape a single URL and return its content as plain text / markdown.
 *
 * Strategy: Jina Reader → BrightData → direct fetch
 */
export async function scrapeUrl(url: string): Promise<string> {
  // 1. Jina Reader
  try {
    const content = await scrapeWithJina(url);
    return content;
  } catch (jinaError) {
    console.warn(`[scraper] Jina Reader failed for ${url}:`, jinaError);
  }

  // 2. BrightData
  try {
    const content = await scrapeWithBrightData(url);
    return content;
  } catch (bdError) {
    console.warn(`[scraper] BrightData failed for ${url}:`, bdError);
  }

  // 3. Direct fetch
  const content = await scrapeDirectly(url);
  return content;
}

// ---------------------------------------------------------------------------
// Jina Search
// ---------------------------------------------------------------------------

interface JinaSearchResult {
  title: string;
  url: string;
  snippet: string;
}

interface JinaSearchResponse {
  data?: Array<{
    title?: string;
    url?: string;
    description?: string;
    content?: string;
  }>;
  results?: Array<{
    title?: string;
    url?: string;
    description?: string;
    content?: string;
  }>;
}

/**
 * Search for a query via Jina Search and return structured results.
 */
export async function searchTopic(
  query: string
): Promise<JinaSearchResult[]> {
  const apiKey = getEnv("JINA_SEARCH_API_KEY");
  const searchUrl = `https://s.jina.ai/?q=${encodeURIComponent(query)}`;

  const response = await fetchWithTimeout(searchUrl, {
    headers: {
      Authorization: `Bearer ${apiKey}`,
      Accept: "application/json",
    },
  });

  if (!response.ok) {
    throw new Error(`Jina Search returned ${response.status} for "${query}"`);
  }

  const data = (await response.json()) as JinaSearchResponse;

  const raw = data?.data ?? data?.results ?? [];

  return raw.map((item) => ({
    title: item.title ?? "",
    url: item.url ?? "",
    snippet: item.description ?? item.content ?? "",
  }));
}

// ---------------------------------------------------------------------------
// Research topic (search + scrape combined)
// ---------------------------------------------------------------------------

/**
 * Research a Mexico travel topic by:
 *   1. Optionally scraping any provided seed URLs.
 *   2. Searching Jina for the topic (preferring known Mexico sources).
 *   3. Scraping the top search results.
 *
 * Returns all collected text merged into a single string.
 */
export async function researchTopic(
  topic: string,
  urls: string[] = []
): Promise<string> {
  const sections: string[] = [];

  // Scrape any caller-provided seed URLs first
  for (const url of urls) {
    try {
      const text = await scrapeUrl(url);
      sections.push(`--- Source: ${url} ---\n${text}`);
    } catch (err) {
      console.warn(`[scraper] Failed to scrape seed URL ${url}:`, err);
    }
  }

  // Search for the topic, biased toward preferred Mexico sources
  const query = `${topic} Mexico travel`;
  let searchResults: JinaSearchResult[] = [];
  try {
    searchResults = await searchTopic(query);
  } catch (err) {
    console.warn(`[scraper] Jina Search failed for "${query}":`, err);
  }

  // Prefer results from known Mexico travel sources
  const preferred = searchResults.filter((r) =>
    MEXICO_SOURCES.some((source) => r.url.includes(source))
  );
  const others = searchResults.filter(
    (r) => !MEXICO_SOURCES.some((source) => r.url.includes(source))
  );

  // Take up to 5 results total (preferred first)
  const toScrape = [...preferred, ...others].slice(0, 5);

  // Add search snippets section
  if (toScrape.length > 0) {
    const snippetLines = toScrape
      .map((r) => `- [${r.title}](${r.url}): ${r.snippet}`)
      .join("\n");
    sections.push(`--- Search results for: ${query} ---\n${snippetLines}`);
  }

  // Scrape each result URL
  for (const result of toScrape) {
    if (!result.url) continue;
    try {
      const text = await scrapeUrl(result.url);
      sections.push(`--- Source: ${result.url} ---\n${text}`);
    } catch (err) {
      console.warn(`[scraper] Failed to scrape ${result.url}:`, err);
    }
  }

  return sections.join("\n\n");
}
