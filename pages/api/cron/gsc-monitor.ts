import type { NextApiRequest, NextApiResponse } from 'next';
import { runGSCMonitor, GSCReport } from '../../../lib/pipeline/gsc-monitor';
import { commitFilesToGitHub } from '../../../lib/pipeline/github-commit';

export const config = {
  maxDuration: 60,
};

function formatReportMarkdown(report: GSCReport): string {
  const lines: string[] = [
    `# GSC Monitor Report — ${report.period.recent}`,
    '',
    '## Summary',
    `| Metric | Value |`,
    `|---|---|`,
    `| Clicks | ${report.summary.totalClicks} |`,
    `| Impressions | ${report.summary.totalImpressions} |`,
    `| Avg CTR | ${report.summary.avgCTR}% |`,
    `| Avg Position | ${report.summary.avgPosition} |`,
    `| Unique Queries | ${report.summary.uniqueQueries} |`,
    `| Unique Pages | ${report.summary.uniquePages} |`,
    '',
  ];

  // Quick Wins
  if (report.quickWins.length > 0) {
    lines.push('## Quick Wins (high impressions, low CTR)');
    lines.push('These pages get seen but not clicked — improve title/description.');
    lines.push('');
    lines.push('| Query | Page | Impressions | CTR | Position |');
    lines.push('|---|---|---|---|---|');
    for (const qw of report.quickWins) {
      const shortPage = qw.page.replace('https://go2-thailand.com', '');
      lines.push(`| ${qw.query} | ${shortPage} | ${qw.impressions} | ${qw.ctr}% | ${qw.position} |`);
    }
    lines.push('');
  }

  // Cannibalization
  if (report.cannibalization.length > 0) {
    lines.push('## Keyword Cannibalization');
    lines.push('Multiple pages competing for the same query — consider consolidating or adding canonical.');
    lines.push('');
    for (const issue of report.cannibalization) {
      lines.push(`### "${issue.query}"`);
      lines.push('| Page | Clicks | Impressions | Position |');
      lines.push('|---|---|---|---|');
      for (const p of issue.pages) {
        const shortPage = p.page.replace('https://go2-thailand.com', '');
        lines.push(`| ${shortPage} | ${p.clicks} | ${p.impressions} | ${Math.round(p.position * 10) / 10} |`);
      }
      lines.push('');
    }
  }

  // Content Decay
  if (report.contentDecay.length > 0) {
    lines.push('## Content Decay');
    lines.push('Pages losing traffic compared to previous period — may need refresh.');
    lines.push('');
    lines.push('| Page | Query | Previous Clicks | Recent Clicks | Drop |');
    lines.push('|---|---|---|---|---|');
    for (const d of report.contentDecay) {
      const shortPage = d.page.replace('https://go2-thailand.com', '');
      lines.push(`| ${shortPage} | ${d.query} | ${d.previousClicks} | ${d.recentClicks} | -${d.dropPercent}% |`);
    }
    lines.push('');
  }

  if (report.quickWins.length === 0 && report.cannibalization.length === 0 && report.contentDecay.length === 0) {
    lines.push('## No Issues Found');
    lines.push('All clear — no cannibalization, decay, or quick wins detected this period.');
    lines.push('');
  }

  return lines.join('\n');
}

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  const cronSecret = process.env.CRON_SECRET;
  if (!cronSecret || req.headers.authorization !== `Bearer ${cronSecret}`) {
    return res.status(401).json({ error: 'Unauthorized' });
  }

  // Check if GSC credentials are configured
  if (!process.env.GOOGLE_SERVICE_ACCOUNT_EMAIL || !process.env.GOOGLE_SERVICE_ACCOUNT_KEY) {
    console.log('[gsc-monitor] Skipping — GOOGLE_SERVICE_ACCOUNT_EMAIL or GOOGLE_SERVICE_ACCOUNT_KEY not configured');
    return res.status(200).json({
      status: 'skipped',
      reason: 'GSC credentials not configured. Set GOOGLE_SERVICE_ACCOUNT_EMAIL and GOOGLE_SERVICE_ACCOUNT_KEY.',
    });
  }

  try {
    console.log('[gsc-monitor] Starting GSC analysis...');
    const report = await runGSCMonitor();

    // Save report as JSON to repo
    const dateSlug = new Date().toISOString().split('T')[0];
    const jsonPath = `data/gsc-reports/${dateSlug}.json`;
    const mdPath = `data/gsc-reports/${dateSlug}.md`;

    await commitFilesToGitHub(
      [
        { path: jsonPath, content: JSON.stringify(report, null, 2) },
        { path: mdPath, content: formatReportMarkdown(report) },
      ],
      `GSC Monitor Report ${dateSlug}: ${report.summary.totalClicks} clicks, ${report.summary.uniqueQueries} queries`
    );

    console.log(`[gsc-monitor] Report saved: ${jsonPath}`);

    return res.status(200).json({
      status: 'success',
      summary: report.summary,
      issues: {
        cannibalization: report.cannibalization.length,
        contentDecay: report.contentDecay.length,
        quickWins: report.quickWins.length,
      },
    });
  } catch (error: any) {
    console.error('[gsc-monitor] Error:', error.message);
    return res.status(500).json({ error: error.message });
  }
}
