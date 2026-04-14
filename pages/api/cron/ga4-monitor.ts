import type { NextApiRequest, NextApiResponse } from 'next';
import { runGa4Monitor, renderGa4ReportMd } from '../../../lib/pipeline/ga4-monitor';
import { commitFilesToGitHub } from '../../../lib/pipeline/github-commit';

export const config = {
  maxDuration: 120,
};

/**
 * Weekly GA4 health check.
 *
 * Pulls the last 28 days of GA4 stats, writes a JSON snapshot + a Markdown
 * digest under data/ga4-reports/<date>.{json,md}, and commits both via the
 * GitHub API. The snapshot is later consumed by the topic selector to bias
 * future writes toward underperformers / under-served categories.
 *
 * Required env: GA4_PROPERTY_ID, GOOGLE_SERVICE_ACCOUNT_EMAIL,
 *               GOOGLE_SERVICE_ACCOUNT_KEY (PEM with \n escapes).
 *
 * Schedule via vercel.json.
 */
export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  const cronSecret = process.env.CRON_SECRET;
  if (!cronSecret || req.headers.authorization !== `Bearer ${cronSecret}`) {
    return res.status(401).json({ error: 'Unauthorized' });
  }

  try {
    console.log('[cron/ga4-monitor] Running 28-day report...');
    const report = await runGa4Monitor({ days: 28 });

    const today = new Date().toISOString().slice(0, 10);
    const md = renderGa4ReportMd(report);

    const filesToCommit = [
      {
        path: `data/ga4-reports/${today}.json`,
        content: JSON.stringify(report, null, 2),
        encoding: 'utf-8' as const,
      },
      {
        path: `data/ga4-reports/${today}.md`,
        content: md,
        encoding: 'utf-8' as const,
      },
      // Always overwrite the "latest" snapshot so the topic selector has a
      // stable filename to read from.
      {
        path: 'data/ga4-reports/latest.json',
        content: JSON.stringify(report, null, 2),
        encoding: 'utf-8' as const,
      },
    ];

    const commit = await commitFilesToGitHub(
      filesToCommit,
      `chore(ga4): weekly report ${today}\n\nSessions: ${report.totals.sessions}, Engaged: ${report.totals.engagedSessions}, Avg engagement: ${report.totals.avgEngagementSec}s`,
    );

    console.log(`[cron/ga4-monitor] Committed: ${commit.sha}`);

    return res.status(200).json({
      success: true,
      period: report.period,
      totals: report.totals,
      underperformerCount: report.underperformers.length,
      commitSha: commit.sha,
    });
  } catch (error) {
    console.error('[cron/ga4-monitor] Error:', error);
    return res.status(500).json({
      error: 'GA4 cron failed',
      details: error instanceof Error ? error.message : 'Unknown error',
    });
  }
}
