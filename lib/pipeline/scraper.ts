const JINA_API_KEY = process.env.JINA_API_KEY;
const JINA_READER_URL = "https://r.jina.ai";
const JINA_SEARCH_URL = "https://s.jina.ai";

const BRIGHT_DATA_API_KEY = process.env.BRIGHT_DATA_API_KEY;
const BRIGHT_DATA_ZONE = process.env.BRIGHT_DATA_ZONE || "web_unlocker1";

const FETCH_TIMEOUT_MS = 15_000; // 15 seconds per fetch call

function fetchWithTimeout(url: string, options: RequestInit = {}, timeoutMs = FETCH_TIMEOUT_MS): Promise<Response> {
  const controller = new AbortController();
  const timer = setTimeout(() => controller.abort(), timeoutMs);
  return fetch(url, { ...options, signal: controller.signal }).finally(() => clearTimeout(timer));
}

export interface ScrapedContent {
  url: string;
  content: string;
  title?: string;
}

export interface ScrapedArticle {
  title: string;
  summary: string;
  source: string;
  url: string;
  date?: string;
}

// Thailand travel news sources
const TRAVEL_NEWS_SOURCES = [
  "https://thethaiger.com/news/thailand",
  "https://www.bangkokpost.com/travel",
  "https://www.tourismthailand.org/Articles",
  "https://www.lonelyplanet.com/thailand",
  "https://www.nomadicmatt.com/travel-guides/thailand-travel-tips/",
];

// Primary info source — scraped for latest Thailand news
const THAILAND_BLOG_URL = "https://thailandblog.nl/en/";

// Bright Data fallback — uses Web Unlocker to bypass blocks
async function scrapeWithBrightData(url: string): Promise<string> {
  if (!BRIGHT_DATA_API_KEY) {
    throw new Error("BRIGHT_DATA_API_KEY is not configured");
  }

  const response = await fetchWithTimeout("https://api.brightdata.com/request", {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${BRIGHT_DATA_API_KEY}`,
    },
    body: JSON.stringify({
      zone: BRIGHT_DATA_ZONE,
      url,
      format: "raw",
    }),
  });

  if (!response.ok) {
    throw new Error(`Bright Data scrape failed for ${url}: ${response.status} ${response.statusText}`);
  }

  return response.text();
}

// Direct fetch fallback — strips HTML tags for plain text extraction
async function directFetch(url: string): Promise<string> {
  const response = await fetchWithTimeout(url, {
    headers: {
      "User-Agent":
        "Mozilla/5.0 (compatible; Go2ThailandBot/1.0; +https://go2-thailand.com)",
    },
  });
  if (!response.ok) {
    throw new Error(`Direct fetch failed for ${url}: ${response.status}`);
  }
  const html = await response.text();
  // Basic HTML to text: strip tags, decode entities, collapse whitespace
  const text = html
    .replace(/<script[^>]*>[\s\S]*?<\/script>/gi, "")
    .replace(/<style[^>]*>[\s\S]*?<\/style>/gi, "")
    .replace(/<[^>]+>/g, "\n")
    .replace(/&amp;/g, "&")
    .replace(/&lt;/g, "<")
    .replace(/&gt;/g, ">")
    .replace(/&quot;/g, '"')
    .replace(/&#39;/g, "'")
    .replace(/&nbsp;/g, " ")
    .replace(/\n{3,}/g, "\n\n")
    .trim();
  return text.slice(0, 8000);
}

// Fetch a URL via Jina.ai Reader API (returns clean Markdown)
// Falls back to direct fetch if Jina fails
export async function scrapeUrl(url: string): Promise<string> {
  // Try Jina first
  try {
    const headers: Record<string, string> = {
      Accept: "text/markdown",
      "X-Return-Format": "markdown",
    };

    if (JINA_API_KEY && JINA_API_KEY !== "your_jina_api_key_here") {
      headers["Authorization"] = `Bearer ${JINA_API_KEY}`;
    }

    const response = await fetchWithTimeout(`${JINA_READER_URL}/${url}`, {
      method: "GET",
      headers,
    });

    if (response.ok) {
      const content = await response.text();
      if (content && content.length >= 100) {
        return content;
      }
    }
    console.warn(`[scraper] Jina failed for ${url}, trying Bright Data...`);
  } catch (e) {
    console.warn(`[scraper] Jina error for ${url}:`, e);
  }

  // Fallback: Bright Data
  try {
    const content = await scrapeWithBrightData(url);
    if (content && content.length >= 100) {
      return content;
    }
    console.warn(`[scraper] Bright Data returned insufficient content for ${url}, trying direct fetch...`);
  } catch (e) {
    console.warn(`[scraper] Bright Data error for ${url}:`, e);
  }

  // Last resort: direct fetch
  return directFetch(url);
}

// Scrape thailand-related travel news from multiple sources in parallel
export async function scrapeTravelNews(): Promise<ScrapedArticle[]> {
  const settled = await Promise.allSettled(
    TRAVEL_NEWS_SOURCES.map(async (sourceUrl) => {
      const content = await scrapeUrl(sourceUrl);
      const hostname = new URL(sourceUrl).hostname;
      return {
        title: `Thailand Travel News from ${hostname}`,
        summary: content.slice(0, 2000),
        source: hostname,
        url: sourceUrl,
        date: new Date().toISOString(),
      };
    })
  );

  const results: ScrapedArticle[] = [];
  for (const r of settled) {
    if (r.status === "fulfilled") {
      results.push(r.value);
    } else {
      console.warn("Travel news scrape failed:", r.reason);
    }
  }

  return results;
}

// Scrape thailandblog.nl/en for latest Thailand news and info
// This is the primary info source for the content pipeline
export async function scrapeThailandBlog(): Promise<ScrapedContent> {
  const content = await scrapeUrl(THAILAND_BLOG_URL);

  // Extract title if present
  const titleMatch = content.match(/^#\s+(.+)/m);
  const title = titleMatch?.[1] || "Thailand Blog — Latest News";

  return {
    url: THAILAND_BLOG_URL,
    content: content.slice(0, 6000), // Limit to first 6000 chars for prompt context
    title,
  };
}

// Search for a specific topic using Jina Search API (s.jina.ai)
export async function searchTopic(
  query: string
): Promise<Array<{ title: string; summary: string; url: string }>> {
  const headers: Record<string, string> = {
    Accept: "application/json",
  };

  if (JINA_API_KEY) {
    headers["Authorization"] = `Bearer ${JINA_API_KEY}`;
  }

  const encodedQuery = encodeURIComponent(query);
  const response = await fetchWithTimeout(`${JINA_SEARCH_URL}/${encodedQuery}`, {
    method: "GET",
    headers,
  });

  if (!response.ok) {
    console.warn(`[scraper] Jina search failed for "${query}": ${response.status}`);
    return []; // Return empty results instead of throwing
  }

  const data = await response.json();
  const items: Array<{ title: string; summary: string; url: string }> = [];

  // Jina search returns { data: [{ title, description, url, content }] }
  const results = data.data || data.results || [];
  for (const item of results.slice(0, 6)) {
    items.push({
      title: item.title || "Untitled",
      summary: (item.description || item.content || "").slice(0, 400),
      url: item.url || "",
    });
  }

  return items;
}

// Scrape specific priority URLs (e.g. from topic queue)
export async function scrapeSpecificUrls(urls: string[]): Promise<string> {
  const settled = await Promise.allSettled(
    urls.map(async (url) => {
      const content = await scrapeUrl(url);
      const hostname = new URL(url).hostname;
      return `## Source: ${hostname}\nURL: ${url}\n\n${content.slice(0, 3000)}`;
    })
  );

  const parts: string[] = [];
  for (const r of settled) {
    if (r.status === "fulfilled") {
      parts.push(r.value);
    }
  }
  return parts.join("\n\n---\n\n");
}

// Scrape a batch of Thailand travel sources for a specific topic
// Returns combined content for use as AI context — the more high-quality data, the better
export async function scrapeTopicContext(topic: string, priorityUrls?: string[]): Promise<string> {
  const year = new Date().getFullYear();
  const parts: string[] = [];

  // Scrape priority URLs in parallel with the standard searches (if provided)
  const priorityUrlsPromise = priorityUrls && priorityUrls.length > 0
    ? scrapeSpecificUrls(priorityUrls)
    : Promise.resolve(null);

  // Run multiple scrape strategies in parallel for maximum data
  const [searchResults, detailedSearch, blogContent, newsContent, priorityData] = await Promise.allSettled([
    // 1. Primary topic search
    searchTopic(`${topic} Thailand ${year} travel guide`),
    // 2. More specific search for prices, tips, and practical info
    searchTopic(`${topic} Thailand prices tips ${year}`),
    // 3. Thailand Blog as primary editorial source
    scrapeThailandBlog(),
    // 4. Scrape one relevant travel news source for freshness
    scrapeTravelNews().then((articles) => articles.slice(0, 3)),
    // 5. Priority URLs (from topic queue) — scraped in parallel
    priorityUrlsPromise,
  ]);

  // Priority reference data prepended first (authoritative sources from topic queue)
  if (priorityData.status === "fulfilled" && priorityData.value) {
    parts.unshift(`PRIORITY REFERENCE DATA (from authoritative sources):\n${priorityData.value}`);
  } else if (priorityData.status === "rejected") {
    console.warn("[scraper] Priority URL scrape failed:", priorityData.reason);
  }

  // Primary search results
  if (searchResults.status === "fulfilled" && searchResults.value.length > 0) {
    const searchText = searchResults.value
      .map((r) => `## ${r.title}\n${r.summary}\nSource: ${r.url}`)
      .join("\n\n");
    parts.push(`SEARCH RESULTS (primary):\n${searchText}`);
  } else if (searchResults.status === "rejected") {
    console.warn("[scraper] Primary topic search failed:", searchResults.reason);
  }

  // Detailed/prices search results
  if (detailedSearch.status === "fulfilled" && detailedSearch.value.length > 0) {
    const detailedText = detailedSearch.value
      .map((r) => `## ${r.title}\n${r.summary}\nSource: ${r.url}`)
      .join("\n\n");
    parts.push(`SEARCH RESULTS (prices & details):\n${detailedText}`);
  }

  // Thailand Blog
  if (blogContent.status === "fulfilled") {
    parts.push(
      `THAILAND BLOG (thailandblog.nl) — Editorial source:\n${blogContent.value.content}`
    );
  } else {
    console.warn("[scraper] Thailand blog scrape failed:", blogContent.reason);
  }

  // Recent news for freshness
  if (newsContent.status === "fulfilled" && newsContent.value.length > 0) {
    const newsText = newsContent.value
      .map((a) => `- ${a.title} (${a.source}): ${a.summary.slice(0, 300)}`)
      .join("\n");
    parts.push(`RECENT THAILAND NEWS:\n${newsText}`);
  }

  const combined = parts.join("\n\n---\n\n");
  console.log(`[scraper] Total context gathered: ${combined.length} chars from ${parts.length} sources`);
  return combined;
}
