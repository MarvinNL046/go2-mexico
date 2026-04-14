import type { NextApiRequest, NextApiResponse } from "next";
import { getFilteredSitemapUrls, submitUrlsInBatches } from "../../../lib/indexnow";

export const config = {
  maxDuration: 60,
};

/**
 * GET /api/cron/submit-indexnow/
 *
 * Weekly cron job that reads all sitemap URLs and submits them to IndexNow.
 * Runs every Monday at 08:00 UTC (configured in vercel.json).
 */
export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse
) {
  // Verify cron secret (Vercel sends this automatically for cron jobs)
  const cronSecret = process.env.CRON_SECRET;
  if (!cronSecret || req.headers.authorization !== `Bearer ${cronSecret}`) {
    return res.status(401).json({ error: "Unauthorized" });
  }

  try {
    console.log("[cron/submit-indexnow] Starting IndexNow submission...");

    const urls = getFilteredSitemapUrls();
    console.log(
      `[cron/submit-indexnow] Found ${urls.length} URLs across all sitemaps.`
    );

    if (urls.length === 0) {
      return res.status(200).json({
        success: true,
        message: "No URLs found in sitemaps",
        totalUrls: 0,
      });
    }

    const result = await submitUrlsInBatches(urls);

    console.log(
      `[cron/submit-indexnow] Done. Submitted ${result.totalUrls} URLs in ${result.batches} batch(es).`
    );

    return res.status(200).json({
      success: true,
      ...result,
    });
  } catch (error) {
    console.error("[cron/submit-indexnow] Error:", error);
    return res.status(500).json({
      error: "Cron job failed",
      details: error instanceof Error ? error.message : "Unknown error",
    });
  }
}
