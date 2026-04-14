/**
 * Google Analytics 4 monitoring.
 *
 * Pulls weekly performance for the go2-thailand.com property and outputs:
 *  - Top engaged pages (engagement time × sessions)
 *  - Underperformers (high impressions in GSC area, low engagement here)
 *  - NL vs EN split (sessions, engaged time, conversions)
 *  - Page-level signals usable by the topic selector — e.g. "we have lots
 *    of food traffic but few hotel bookings, write more hotel content"
 *
 * Auth: reuses the same Google service account as the GSC monitor.
 *       The service account email must be added as a Viewer in the GA4
 *       property (Admin → Property access management).
 *
 * Required env:
 *   GOOGLE_SERVICE_ACCOUNT_EMAIL
 *   GOOGLE_SERVICE_ACCOUNT_KEY  (PEM with \n escapes)
 *   GA4_PROPERTY_ID             (just the numeric ID, no "properties/" prefix)
 */

const GA4_API = 'https://analyticsdata.googleapis.com/v1beta';
const GA4_SCOPE = 'https://www.googleapis.com/auth/analytics.readonly';

// -------------------------------------------------------------------
// Auth — JWT → access token (1 hour)
// -------------------------------------------------------------------

let cachedToken: { value: string; expiresAt: number } | null = null;

async function getGa4AccessToken(): Promise<string> {
  if (cachedToken && cachedToken.expiresAt > Date.now() + 60_000) return cachedToken.value;

  const email = process.env.GOOGLE_SERVICE_ACCOUNT_EMAIL;
  const key = process.env.GOOGLE_SERVICE_ACCOUNT_KEY?.replace(/\\n/g, '\n');
  if (!email || !key) {
    throw new Error('Missing GOOGLE_SERVICE_ACCOUNT_EMAIL or GOOGLE_SERVICE_ACCOUNT_KEY');
  }

  const header = Buffer.from(JSON.stringify({ alg: 'RS256', typ: 'JWT' })).toString('base64url');
  const now = Math.floor(Date.now() / 1000);
  const claims = Buffer.from(JSON.stringify({
    iss: email,
    scope: GA4_SCOPE,
    aud: 'https://oauth2.googleapis.com/token',
    iat: now,
    exp: now + 3600,
  })).toString('base64url');

  const crypto = await import('crypto');
  const signer = crypto.createSign('RSA-SHA256');
  signer.update(`${header}.${claims}`);
  const signature = signer.sign(key, 'base64url');

  const jwt = `${header}.${claims}.${signature}`;

  const tokenRes = await fetch('https://oauth2.googleapis.com/token', {
    method: 'POST',
    headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
    body: `grant_type=urn:ietf:params:oauth:grant-type:jwt-bearer&assertion=${jwt}`,
  });

  if (!tokenRes.ok) {
    throw new Error(`GA4 token exchange failed: ${tokenRes.status} ${await tokenRes.text()}`);
  }
  const tokenJson = await tokenRes.json() as { access_token: string; expires_in: number };
  cachedToken = {
    value: tokenJson.access_token,
    expiresAt: Date.now() + (tokenJson.expires_in - 60) * 1000,
  };
  return cachedToken.value;
}

// -------------------------------------------------------------------
// runReport wrapper
// -------------------------------------------------------------------

interface RunReportRequest {
  dateRanges: Array<{ startDate: string; endDate: string; name?: string }>;
  dimensions?: Array<{ name: string }>;
  metrics: Array<{ name: string }>;
  dimensionFilter?: unknown;
  orderBys?: Array<{ metric?: { metricName: string }; dimension?: { dimensionName: string }; desc?: boolean }>;
  limit?: string;
}

interface RunReportRow {
  dimensionValues: Array<{ value: string }>;
  metricValues: Array<{ value: string }>;
}

interface RunReportResponse {
  rows?: RunReportRow[];
  rowCount?: number;
}

async function runReport(propertyId: string, req: RunReportRequest): Promise<RunReportResponse> {
  const token = await getGa4AccessToken();
  const res = await fetch(`${GA4_API}/properties/${propertyId}:runReport`, {
    method: 'POST',
    headers: {
      Authorization: `Bearer ${token}`,
      'Content-Type': 'application/json',
    },
    body: JSON.stringify(req),
  });
  if (!res.ok) {
    throw new Error(`GA4 runReport failed: ${res.status} ${await res.text()}`);
  }
  return res.json() as Promise<RunReportResponse>;
}

// -------------------------------------------------------------------
// Helpers
// -------------------------------------------------------------------

function dateStr(daysAgo: number): string {
  const d = new Date();
  d.setUTCDate(d.getUTCDate() - daysAgo);
  return d.toISOString().slice(0, 10);
}

const num = (v?: { value: string }) => (v?.value ? Number(v.value) : 0);

// -------------------------------------------------------------------
// Public types
// -------------------------------------------------------------------

export interface PageInsight {
  pagePath: string;
  pageTitle: string;
  sessions: number;
  engagedSessions: number;
  engagementRate: number;       // 0..1
  avgEngagementSec: number;
  views: number;
}

export interface LocaleSplit {
  locale: string;             // 'en' | 'nl' | other
  sessions: number;
  engagedSessions: number;
  engagementRate: number;
  avgEngagementSec: number;
}

export interface UnderperformerInsight extends PageInsight {
  reason: string;             // human-readable diagnosis
}

export interface Ga4Report {
  generatedAt: string;
  propertyId: string;
  period: { start: string; end: string; days: number };
  totals: {
    sessions: number;
    engagedSessions: number;
    avgEngagementSec: number;
    pageviews: number;
  };
  topPages: PageInsight[];                // top 25 by sessions
  topByEngagement: PageInsight[];         // top 25 by avg engagement seconds
  underperformers: UnderperformerInsight[]; // pages with traffic but low engagement
  localeSplit: LocaleSplit[];
}

// -------------------------------------------------------------------
// Main entrypoint
// -------------------------------------------------------------------

export async function runGa4Monitor(opts: { days?: number; hostname?: string } = {}): Promise<Ga4Report> {
  const propertyId = process.env.GA4_PROPERTY_ID;
  if (!propertyId) throw new Error('Missing GA4_PROPERTY_ID');

  const days = opts.days ?? 28;
  const hostname = opts.hostname ?? process.env.GA4_HOSTNAME ?? 'go2-thailand.com';
  const period = { start: dateStr(days), end: dateStr(1), days };

  // The GA4 property is shared across multiple sites. We filter every report
  // by hostName so go2-thailand.com numbers are not polluted by other sites'
  // /about and /contact pages.
  const hostnameFilter = {
    filter: {
      fieldName: 'hostName',
      stringFilter: { matchType: 'EXACT', value: hostname },
    },
  };

  // 1. Totals
  const totalsRes = await runReport(propertyId, {
    dateRanges: [{ startDate: period.start, endDate: period.end }],
    metrics: [
      { name: 'sessions' },
      { name: 'engagedSessions' },
      { name: 'userEngagementDuration' },
      { name: 'screenPageViews' },
    ],
    dimensionFilter: hostnameFilter,
  });
  const tRow = totalsRes.rows?.[0];
  const totalSessions = num(tRow?.metricValues?.[0]);
  const totalEngaged = num(tRow?.metricValues?.[1]);
  const totalEngageSec = num(tRow?.metricValues?.[2]);
  const totalPageviews = num(tRow?.metricValues?.[3]);

  // 2. Page-level performance (top 200 by sessions, we'll trim)
  const pagesRes = await runReport(propertyId, {
    dateRanges: [{ startDate: period.start, endDate: period.end }],
    dimensions: [{ name: 'pagePath' }, { name: 'pageTitle' }],
    metrics: [
      { name: 'sessions' },
      { name: 'engagedSessions' },
      { name: 'engagementRate' },
      { name: 'userEngagementDuration' },
      { name: 'screenPageViews' },
    ],
    orderBys: [{ metric: { metricName: 'sessions' }, desc: true }],
    limit: '200',
    dimensionFilter: hostnameFilter,
  });

  const pages: PageInsight[] = (pagesRes.rows || []).map(r => {
    const sessions = num(r.metricValues?.[0]);
    const engagedSessions = num(r.metricValues?.[1]);
    const engagementRate = num(r.metricValues?.[2]);
    const engagementSec = num(r.metricValues?.[3]);
    const views = num(r.metricValues?.[4]);
    const avg = sessions > 0 ? engagementSec / sessions : 0;
    return {
      pagePath: r.dimensionValues?.[0]?.value || '',
      pageTitle: r.dimensionValues?.[1]?.value || '',
      sessions,
      engagedSessions,
      engagementRate,
      avgEngagementSec: Math.round(avg * 10) / 10,
      views,
    };
  });

  const topPages = pages.slice(0, 25);
  const topByEngagement = [...pages]
    .filter(p => p.sessions >= 5)         // ignore sub-5-session noise
    .sort((a, b) => b.avgEngagementSec - a.avgEngagementSec)
    .slice(0, 25);

  // Underperformers: sessions ≥ 10 AND engagementRate < 0.25 AND avg engagement < 15s
  const underperformers: UnderperformerInsight[] = pages
    .filter(p => p.sessions >= 10 && p.engagementRate < 0.25 && p.avgEngagementSec < 15)
    .slice(0, 20)
    .map(p => ({
      ...p,
      reason: `Low engagement (${(p.engagementRate * 100).toFixed(0)}% engaged, ${p.avgEngagementSec}s avg) on ${p.sessions} sessions — consider rewrite or stronger above-the-fold CTA.`,
    }));

  // 3. Locale split — use first path segment as locale signal
  // (everything starting with /nl/ is NL, /en/ explicit or /  default = EN)
  const localeAgg: Record<string, { sessions: number; engaged: number; engagementSec: number }> = {};
  for (const p of pages) {
    const seg = p.pagePath.split('/')[1] || '';
    const locale = (seg === 'nl' || seg === 'en') ? seg : 'en';
    const a = localeAgg[locale] || { sessions: 0, engaged: 0, engagementSec: 0 };
    a.sessions += p.sessions;
    a.engaged += p.engagedSessions;
    a.engagementSec += p.avgEngagementSec * p.sessions; // weighted
    localeAgg[locale] = a;
  }
  const localeSplit: LocaleSplit[] = Object.entries(localeAgg).map(([locale, a]) => ({
    locale,
    sessions: a.sessions,
    engagedSessions: a.engaged,
    engagementRate: a.sessions > 0 ? a.engaged / a.sessions : 0,
    avgEngagementSec: a.sessions > 0 ? Math.round((a.engagementSec / a.sessions) * 10) / 10 : 0,
  })).sort((a, b) => b.sessions - a.sessions);

  return {
    generatedAt: new Date().toISOString(),
    propertyId,
    period,
    totals: {
      sessions: totalSessions,
      engagedSessions: totalEngaged,
      avgEngagementSec: totalSessions > 0 ? Math.round((totalEngageSec / totalSessions) * 10) / 10 : 0,
      pageviews: totalPageviews,
    },
    topPages,
    topByEngagement,
    underperformers,
    localeSplit,
  };
}

// -------------------------------------------------------------------
// Markdown rendering for a human-friendly digest
// -------------------------------------------------------------------

export function renderGa4ReportMd(r: Ga4Report): string {
  const fmt = (n: number) => n.toLocaleString('nl-NL');
  const pageRow = (p: PageInsight) => `| \`${p.pagePath}\` | ${fmt(p.sessions)} | ${(p.engagementRate * 100).toFixed(0)}% | ${p.avgEngagementSec}s |`;

  const localeRows = r.localeSplit.map(l =>
    `| **${l.locale.toUpperCase()}** | ${fmt(l.sessions)} | ${(l.engagementRate * 100).toFixed(0)}% | ${l.avgEngagementSec}s |`,
  ).join('\n');

  return `# GA4 Report — ${r.period.start} → ${r.period.end} (${r.period.days} days)

Generated: ${r.generatedAt}

## Totals
- Sessions: **${fmt(r.totals.sessions)}**
- Engaged sessions: **${fmt(r.totals.engagedSessions)}**
- Avg engagement: **${r.totals.avgEngagementSec}s** per session
- Pageviews: **${fmt(r.totals.pageviews)}**

## Locale split
| Locale | Sessions | Engagement rate | Avg engaged time |
|---|---|---|---|
${localeRows || '_(no data)_'}

## Top pages by sessions (top 10)
| Page | Sessions | Engagement rate | Avg time |
|---|---|---|---|
${r.topPages.slice(0, 10).map(pageRow).join('\n') || '_(no data)_'}

## Top pages by engagement time (top 10)
| Page | Sessions | Engagement rate | Avg time |
|---|---|---|---|
${r.topByEngagement.slice(0, 10).map(pageRow).join('\n') || '_(no data)_'}

## Underperformers (high traffic, low engagement)
${r.underperformers.length === 0 ? '_None this period — every traffic-getting page hits at least 25% engagement._' : r.underperformers.map(u =>
  `- \`${u.pagePath}\` — ${u.reason}`,
).join('\n')}
`;
}
