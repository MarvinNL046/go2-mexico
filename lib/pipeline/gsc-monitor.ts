/**
 * Google Search Console Monitoring Agent
 *
 * Fetches GSC data and detects:
 * 1. Keyword cannibalization (multiple pages ranking for same query)
 * 2. Content decay (pages losing clicks/impressions over time)
 * 3. Quick wins (high impressions, low CTR — need title/description optimization)
 * 4. Internal linking gaps (pages with few impressions that could be boosted)
 *
 * Requires: GOOGLE_SERVICE_ACCOUNT_EMAIL + GOOGLE_SERVICE_ACCOUNT_KEY env vars
 * Setup: Create service account in Google Cloud Console, enable Search Console API,
 *         add service account email as user in GSC property.
 */

import { commitFilesToGitHub } from './github-commit';

const GSC_API = 'https://searchconsole.googleapis.com/webmasters/v3';
const SITE_URL = 'sc-domain:go2-thailand.com';

// --- Auth ---

async function getAccessToken(): Promise<string> {
  const email = process.env.GOOGLE_SERVICE_ACCOUNT_EMAIL;
  const key = process.env.GOOGLE_SERVICE_ACCOUNT_KEY?.replace(/\\n/g, '\n');

  if (!email || !key) {
    throw new Error('Missing GOOGLE_SERVICE_ACCOUNT_EMAIL or GOOGLE_SERVICE_ACCOUNT_KEY');
  }

  // Create JWT
  const header = Buffer.from(JSON.stringify({ alg: 'RS256', typ: 'JWT' })).toString('base64url');
  const now = Math.floor(Date.now() / 1000);
  const claims = Buffer.from(JSON.stringify({
    iss: email,
    scope: 'https://www.googleapis.com/auth/webmasters.readonly',
    aud: 'https://oauth2.googleapis.com/token',
    iat: now,
    exp: now + 3600,
  })).toString('base64url');

  const crypto = await import('crypto');
  const signer = crypto.createSign('RSA-SHA256');
  signer.update(`${header}.${claims}`);
  const signature = signer.sign(key, 'base64url');

  const jwt = `${header}.${claims}.${signature}`;

  // Exchange JWT for access token
  const tokenRes = await fetch('https://oauth2.googleapis.com/token', {
    method: 'POST',
    headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
    body: `grant_type=urn:ietf:params:oauth:grant-type:jwt-bearer&assertion=${jwt}`,
  });

  if (!tokenRes.ok) {
    throw new Error(`Token exchange failed: ${tokenRes.status} ${await tokenRes.text()}`);
  }

  const { access_token } = await tokenRes.json();
  return access_token;
}

// --- GSC API Queries ---

interface GSCRow {
  keys: string[];
  clicks: number;
  impressions: number;
  ctr: number;
  position: number;
}

async function queryGSC(
  token: string,
  startDate: string,
  endDate: string,
  dimensions: string[],
  rowLimit = 1000
): Promise<GSCRow[]> {
  const res = await fetch(`${GSC_API}/sites/${encodeURIComponent(SITE_URL)}/searchAnalytics/query`, {
    method: 'POST',
    headers: {
      Authorization: `Bearer ${token}`,
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({
      startDate,
      endDate,
      dimensions,
      rowLimit,
      dataState: 'final',
    }),
  });

  if (!res.ok) {
    throw new Error(`GSC API error: ${res.status} ${await res.text()}`);
  }

  const data = await res.json();
  return data.rows || [];
}

function dateStr(daysAgo: number): string {
  const d = new Date();
  d.setDate(d.getDate() - daysAgo);
  return d.toISOString().split('T')[0];
}

// --- Analysis Functions ---

interface CannibalizationIssue {
  query: string;
  pages: { page: string; clicks: number; impressions: number; position: number }[];
}

function detectCannibalization(rows: GSCRow[]): CannibalizationIssue[] {
  // Group by query
  const queryMap = new Map<string, { page: string; clicks: number; impressions: number; position: number }[]>();

  for (const row of rows) {
    const [query, page] = row.keys;
    if (!queryMap.has(query)) queryMap.set(query, []);
    queryMap.get(query)!.push({
      page,
      clicks: row.clicks,
      impressions: row.impressions,
      position: row.position,
    });
  }

  // Find queries with multiple ranking pages
  const issues: CannibalizationIssue[] = [];
  for (const [query, pages] of queryMap) {
    if (pages.length >= 2 && pages.some(p => p.impressions >= 10)) {
      issues.push({
        query,
        pages: pages.sort((a, b) => a.position - b.position),
      });
    }
  }

  return issues.sort((a, b) => {
    const aImpr = a.pages.reduce((sum, p) => sum + p.impressions, 0);
    const bImpr = b.pages.reduce((sum, p) => sum + p.impressions, 0);
    return bImpr - aImpr;
  }).slice(0, 20);
}

interface DecayIssue {
  page: string;
  query: string;
  recentClicks: number;
  previousClicks: number;
  dropPercent: number;
  recentPosition: number;
}

function detectDecay(recentRows: GSCRow[], previousRows: GSCRow[]): DecayIssue[] {
  // Build lookup for previous period
  const prevMap = new Map<string, GSCRow>();
  for (const row of previousRows) {
    prevMap.set(`${row.keys[0]}|||${row.keys[1]}`, row);
  }

  const issues: DecayIssue[] = [];
  for (const row of recentRows) {
    const key = `${row.keys[0]}|||${row.keys[1]}`;
    const prev = prevMap.get(key);
    if (!prev || prev.clicks < 3) continue;

    const dropPercent = ((prev.clicks - row.clicks) / prev.clicks) * 100;
    if (dropPercent >= 40 && prev.clicks >= 5) {
      issues.push({
        page: row.keys[1],
        query: row.keys[0],
        recentClicks: row.clicks,
        previousClicks: prev.clicks,
        dropPercent: Math.round(dropPercent),
        recentPosition: row.position,
      });
    }
  }

  return issues.sort((a, b) => b.previousClicks - a.previousClicks).slice(0, 20);
}

interface QuickWin {
  page: string;
  query: string;
  impressions: number;
  clicks: number;
  ctr: number;
  position: number;
}

function findQuickWins(rows: GSCRow[]): QuickWin[] {
  // High impressions, low CTR, position 4-20 (page 1-2)
  return rows
    .filter(r => r.impressions >= 50 && r.ctr < 0.03 && r.position >= 4 && r.position <= 20)
    .map(r => ({
      page: r.keys[1],
      query: r.keys[0],
      impressions: r.impressions,
      clicks: r.clicks,
      ctr: Math.round(r.ctr * 1000) / 10,
      position: Math.round(r.position * 10) / 10,
    }))
    .sort((a, b) => b.impressions - a.impressions)
    .slice(0, 20);
}

// --- Main ---

export interface GSCReport {
  generatedAt: string;
  period: { recent: string; previous: string };
  summary: {
    totalClicks: number;
    totalImpressions: number;
    avgCTR: number;
    avgPosition: number;
    uniqueQueries: number;
    uniquePages: number;
  };
  cannibalization: CannibalizationIssue[];
  contentDecay: DecayIssue[];
  quickWins: QuickWin[];
}

export async function runGSCMonitor(): Promise<GSCReport> {
  const token = await getAccessToken();

  // Recent period: last 7 days (excluding last 3 days for data freshness)
  const recentStart = dateStr(10);
  const recentEnd = dateStr(3);
  // Previous period: 7 days before that
  const prevStart = dateStr(17);
  const prevEnd = dateStr(10);

  console.log(`[gsc-monitor] Fetching data: recent ${recentStart}→${recentEnd}, previous ${prevStart}→${prevEnd}`);

  // Fetch query+page data for both periods
  const [recentData, previousData, queryOnlyRecent] = await Promise.all([
    queryGSC(token, recentStart, recentEnd, ['query', 'page'], 1000),
    queryGSC(token, prevStart, prevEnd, ['query', 'page'], 1000),
    queryGSC(token, recentStart, recentEnd, ['query'], 500),
  ]);

  console.log(`[gsc-monitor] Got ${recentData.length} recent rows, ${previousData.length} previous rows`);

  // Summary
  const totalClicks = recentData.reduce((s, r) => s + r.clicks, 0);
  const totalImpressions = recentData.reduce((s, r) => s + r.impressions, 0);
  const uniqueQueries = new Set(recentData.map(r => r.keys[0])).size;
  const uniquePages = new Set(recentData.map(r => r.keys[1])).size;

  // Analysis
  const cannibalization = detectCannibalization(recentData);
  const contentDecay = detectDecay(recentData, previousData);
  const quickWins = findQuickWins(recentData);

  const report: GSCReport = {
    generatedAt: new Date().toISOString(),
    period: {
      recent: `${recentStart} to ${recentEnd}`,
      previous: `${prevStart} to ${prevEnd}`,
    },
    summary: {
      totalClicks,
      totalImpressions,
      avgCTR: totalImpressions > 0 ? Math.round((totalClicks / totalImpressions) * 1000) / 10 : 0,
      avgPosition: recentData.length > 0
        ? Math.round(recentData.reduce((s, r) => s + r.position, 0) / recentData.length * 10) / 10
        : 0,
      uniqueQueries,
      uniquePages,
    },
    cannibalization,
    contentDecay,
    quickWins,
  };

  console.log(`[gsc-monitor] Report: ${totalClicks} clicks, ${totalImpressions} impressions, ${uniqueQueries} queries`);
  console.log(`[gsc-monitor] Found: ${cannibalization.length} cannibalization issues, ${contentDecay.length} decaying pages, ${quickWins.length} quick wins`);

  return report;
}
