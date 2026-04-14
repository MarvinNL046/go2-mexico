import type { NextApiRequest, NextApiResponse } from 'next';
import { runTopicDiscovery } from '../../../lib/pipeline/topic-discovery';
import { commitFilesToGitHub } from '../../../lib/pipeline/github-commit';

export const config = {
  maxDuration: 120,
};

/**
 * Weekly topic-discovery cron.
 *
 * Calls Google Autocomplete (via SerpAPI) for 5 NL + 4 EN seed phrases,
 * dedupes the suggestions, and commits the result to
 * data/topic-suggestions.json. The blog generators read that file when
 * picking what to write next.
 *
 * Budget: ~9 SerpAPI calls per run, ~36 per month — safe under the 250
 * free-tier limit.
 *
 * Schedule via vercel.json.
 */
export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  const cronSecret = process.env.CRON_SECRET;
  if (!cronSecret || req.headers.authorization !== `Bearer ${cronSecret}`) {
    return res.status(401).json({ error: 'Unauthorized' });
  }

  try {
    console.log('[cron/topic-discovery] Querying autocomplete...');
    const file = await runTopicDiscovery();

    const today = new Date().toISOString().slice(0, 10);
    const filesToCommit = [
      {
        path: 'data/topic-suggestions.json',
        content: JSON.stringify(file, null, 2),
        encoding: 'utf-8' as const,
      },
      // Weekly archive so we can see how trends move.
      {
        path: `data/topic-suggestions-history/${today}.json`,
        content: JSON.stringify(file, null, 2),
        encoding: 'utf-8' as const,
      },
    ];

    const commit = await commitFilesToGitHub(
      filesToCommit,
      `chore(topics): refresh autocomplete suggestions ${today}\n\nNL: ${file.byLocale.nl}, EN: ${file.byLocale.en}, total: ${file.totalSuggestions}`,
    );

    console.log(`[cron/topic-discovery] Committed: ${commit.sha}`);

    return res.status(200).json({
      success: true,
      totalSuggestions: file.totalSuggestions,
      byLocale: file.byLocale,
      commitSha: commit.sha,
    });
  } catch (error) {
    console.error('[cron/topic-discovery] Error:', error);
    return res.status(500).json({
      error: 'Topic-discovery cron failed',
      details: error instanceof Error ? error.message : 'Unknown error',
    });
  }
}
