/**
 * IndexNow shared utilities
 *
 * IndexNow is a protocol that notifies search engines (Bing, Yandex, etc.)
 * immediately when content changes instead of waiting for crawlers.
 */

import fs from "fs";
import path from "path";

export const INDEXNOW_KEY = "3fca2447f24ab81131b3c204ebd2ebdf";
export const INDEXNOW_HOST = "go2-thailand.com";
export const INDEXNOW_API = "https://www.bing.com/indexnow";
export const INDEXNOW_KEY_LOCATION = `https://${INDEXNOW_HOST}/${INDEXNOW_KEY}.txt`;
export const BATCH_SIZE = 10_000;

/**
 * Parse all <loc> URLs from a sitemap XML string.
 */
export function parseUrlsFromSitemap(xml: string): string[] {
  const urls: string[] = [];
  const regex = /<loc>(.*?)<\/loc>/g;
  let match;
  while ((match = regex.exec(xml)) !== null) {
    urls.push(match[1]);
  }
  return urls;
}

/**
 * Read all sitemap files from the public directory and extract URLs.
 */
export function getAllSitemapUrls(): string[] {
  const publicDir = path.join(process.cwd(), "public");
  const sitemapFiles = fs
    .readdirSync(publicDir)
    .filter(
      (f) =>
        f.startsWith("sitemap") && f.endsWith(".xml") && f !== "sitemap-index.xml"
    )
    .sort();

  const allUrls: string[] = [];

  for (const file of sitemapFiles) {
    const xml = fs.readFileSync(path.join(publicDir, file), "utf-8");
    const urls = parseUrlsFromSitemap(xml);
    allUrls.push(...urls);
  }

  return allUrls;
}

/**
 * Non-EN locale path prefixes that should NOT be submitted to IndexNow.
 * These have no real translated content (compare = EN/NL only, transport = EN only).
 */
const BLOCKED_LOCALE_PATHS = [
  "/de/compare/", "/fr/compare/", "/ru/compare/", "/ja/compare/", "/ko/compare/", "/zh/compare/",
  "/nl/transport/", "/de/transport/", "/fr/transport/", "/ru/transport/", "/ja/transport/", "/ko/transport/", "/zh/transport/",
];

/**
 * Filter sitemap URLs to only include pages worth submitting to IndexNow.
 * Removes non-translated locale pages that would waste crawl budget.
 */
export function getFilteredSitemapUrls(): string[] {
  const allUrls = getAllSitemapUrls();
  return allUrls.filter((url) => {
    const urlPath = url.replace(`https://${INDEXNOW_HOST}`, "");
    return !BLOCKED_LOCALE_PATHS.some((blocked) => urlPath.startsWith(blocked));
  });
}

/**
 * Submit a batch of URLs to the IndexNow API.
 * Returns the HTTP status code from the API.
 */
export async function submitToIndexNow(urls: string[]): Promise<{
  status: number;
  ok: boolean;
  urlCount: number;
}> {
  const body = {
    host: INDEXNOW_HOST,
    key: INDEXNOW_KEY,
    keyLocation: INDEXNOW_KEY_LOCATION,
    urlList: urls,
  };

  const response = await fetch(INDEXNOW_API, {
    method: "POST",
    headers: { "Content-Type": "application/json; charset=utf-8" },
    body: JSON.stringify(body),
  });

  return {
    status: response.status,
    ok: response.ok || response.status === 202,
    urlCount: urls.length,
  };
}

/**
 * Submit URLs in batches of BATCH_SIZE to IndexNow.
 */
export async function submitUrlsInBatches(urls: string[]): Promise<{
  totalUrls: number;
  batches: number;
  results: Array<{ batch: number; status: number; ok: boolean; urlCount: number }>;
}> {
  const results: Array<{
    batch: number;
    status: number;
    ok: boolean;
    urlCount: number;
  }> = [];

  for (let i = 0; i < urls.length; i += BATCH_SIZE) {
    const batch = urls.slice(i, i + BATCH_SIZE);
    const batchNumber = Math.floor(i / BATCH_SIZE) + 1;
    const result = await submitToIndexNow(batch);
    results.push({ batch: batchNumber, ...result });
  }

  return {
    totalUrls: urls.length,
    batches: results.length,
    results,
  };
}
