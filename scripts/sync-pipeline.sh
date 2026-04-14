#!/usr/bin/env bash
#
# Sync the pipeline + cron + i18n tooling from go2-thailand.com (this repo)
# to a sister Go2 site repo on disk. Idempotent: re-run any time we ship a
# pipeline improvement.
#
# Usage:
#   scripts/sync-pipeline.sh /path/to/go2-vietnam.com
#   scripts/sync-pipeline.sh ../go2-bali.com
#
# What gets copied:
#   - lib/pipeline/*.ts                  (the brain)
#   - lib/i18n/index.ts                  (just the hook; per-page strings stay per-site)
#   - scripts/i18n-extract-translate.mjs
#   - scripts/translate-blog-nl.mjs
#   - pages/api/cron/{generate-blog,generate-news,topic-discovery,ga4-monitor,gsc-monitor,submit-indexnow}.ts
#
# What does NOT get copied (per-site config):
#   - vercel.json                        (cron schedule per site)
#   - pipeline.config.json               (TOPIC_BANK seeds, hostname, etc.)
#   - .env.local                         (secrets per site)
#   - content/, data/                    (per-site content)
#
# After sync the target repo still needs:
#   1. pipeline.config.json with country-specific seeds + hostname
#   2. Same env vars (OPENROUTER_API_KEY, SERPAPI_KEY, GA4_PROPERTY_ID,
#      GOOGLE_SERVICE_ACCOUNT_*, CRON_SECRET, GITHUB token for commits)
#   3. vercel.json crons updated to point at this site's cron paths
#
# The script never deletes files in the target — it only adds/overwrites
# the synced ones, so any project-specific edits the target already has
# in non-synced files survive.

set -euo pipefail

if [ "$#" -lt 3 ]; then
  echo "Usage: $0 <target-repo-path> <country-name> <site-name>" >&2
  echo "Example: $0 ../go2-vietnam.com Vietnam Go2Vietnam" >&2
  exit 1
fi

SRC="$(cd "$(dirname "${BASH_SOURCE[0]}")/.." && pwd)"
TARGET="$(cd "$1" && pwd)"
COUNTRY="$2"
SITE_NAME="$3"
HOSTNAME=$(basename "$TARGET")

if [ ! -d "$TARGET/.git" ]; then
  echo "Refusing to sync: $TARGET is not a git repo." >&2
  exit 1
fi

echo "Syncing pipeline from $SRC → $TARGET"
echo "  Country: $COUNTRY  Site: $SITE_NAME  Host: $HOSTNAME"

# --- lib/pipeline ---
mkdir -p "$TARGET/lib/pipeline"
cp -v \
  "$SRC/lib/pipeline/ai-provider.ts" \
  "$SRC/lib/pipeline/content-generator.ts" \
  "$SRC/lib/pipeline/news-generator.ts" \
  "$SRC/lib/pipeline/topic-discovery.ts" \
  "$SRC/lib/pipeline/seasonal-context.ts" \
  "$SRC/lib/pipeline/serpapi.ts" \
  "$SRC/lib/pipeline/pipeline-config.ts" \
  "$SRC/lib/pipeline/ga4-monitor.ts" \
  "$SRC/lib/pipeline/gsc-monitor.ts" \
  "$SRC/lib/pipeline/affiliate-injector.ts" \
  "$SRC/lib/pipeline/fact-checker.ts" \
  "$SRC/lib/pipeline/github-commit.ts" \
  "$SRC/lib/pipeline/image-generator.ts" \
  "$TARGET/lib/pipeline/"

# --- lib/i18n hook (only the runtime — per-page strings stay per-site) ---
mkdir -p "$TARGET/lib/i18n"
cp -v "$SRC/lib/i18n/index.ts" "$TARGET/lib/i18n/"

# --- lib helpers used by cron endpoints ---
[ -f "$SRC/lib/indexnow.ts" ] && cp -v "$SRC/lib/indexnow.ts" "$TARGET/lib/" || true

# --- scripts ---
mkdir -p "$TARGET/scripts"
cp -v \
  "$SRC/scripts/i18n-extract-translate.mjs" \
  "$SRC/scripts/translate-blog-nl.mjs" \
  "$SRC/scripts/sync-pipeline.sh" \
  "$TARGET/scripts/"

# --- cron endpoints ---
mkdir -p "$TARGET/pages/api/cron"
for cron in generate-blog generate-news topic-discovery ga4-monitor gsc-monitor submit-indexnow; do
  if [ -f "$SRC/pages/api/cron/$cron.ts" ]; then
    cp -v "$SRC/pages/api/cron/$cron.ts" "$TARGET/pages/api/cron/"
  fi
done

# --- Remove deprecated translate-blog cron (we no longer translate; each
#     locale has its own native writer). Old sister copies often had
#     site-specific locale lists ('hi', 'es') that don't match our type.
[ -f "$TARGET/pages/api/cron/translate-blog.ts" ] && rm -v "$TARGET/pages/api/cron/translate-blog.ts" || true

# --- scraper.ts: only copy if target doesn't already export scrapeTopicContext
#     (some sister sites have an older scraper.ts that lacks helpers
#     content-generator depends on). When the helper is missing, replace
#     with our version. We try to detect by grepping for the export.
if [ -f "$TARGET/lib/pipeline/scraper.ts" ] && grep -q "export.*scrapeTopicContext" "$TARGET/lib/pipeline/scraper.ts"; then
  echo "(target scraper has scrapeTopicContext — keeping site-specific version)"
else
  cp -v "$SRC/lib/pipeline/scraper.ts" "$TARGET/lib/pipeline/"
fi

# --- NL-only crons: only copy if target has NL locale configured ---
if [ -f "$TARGET/pipeline.config.json" ] && grep -q '"nl"' "$TARGET/pipeline.config.json"; then
  cp -v "$SRC/lib/pipeline/content-generator-nl.ts" "$TARGET/lib/pipeline/"
  cp -v "$SRC/pages/api/cron/generate-blog-nl.ts" "$TARGET/pages/api/cron/"
else
  echo "(target has no NL locale — skipping NL writer)"
fi

# --- News pages + lib/news.ts: copy + template "Thailand"→country, "Go2Thailand"→site name, hostname ---
mkdir -p "$TARGET/pages/news"
cp -v "$SRC/pages/news/index.tsx" "$TARGET/pages/news/"
cp -v "$SRC/pages/news/[slug].tsx" "$TARGET/pages/news/"
cp -v "$SRC/lib/news.ts" "$TARGET/lib/"

# In-place template substitution. Order matters: replace "Go2Thailand" before
# "Thailand" so the brand name doesn't get partially rewritten to "Go2Vietnam"
# leaving an orphan "land".
for f in "$TARGET/pages/news/index.tsx" "$TARGET/pages/news/[slug].tsx" "$TARGET/lib/news.ts"; do
  sed -i \
    -e "s|Go2Thailand|$SITE_NAME|g" \
    -e "s|go2-thailand\.com|$HOSTNAME|g" \
    -e "s|Thailand Nieuws|$COUNTRY Nieuws|g" \
    -e "s|Thailand News|$COUNTRY News|g" \
    -e "s|Thailand reisgids|$COUNTRY reisgids|g" \
    -e "s|laatste Thailand|laatste $COUNTRY|g" \
    -e "s|nieuws uit Thailand|nieuws uit $COUNTRY|g" \
    -e "s|latest Thailand news|latest $COUNTRY news|g" \
    -e "s|news from Thailand|news from $COUNTRY|g" \
    -e "s|Thailand tourism|$COUNTRY tourism|g" \
    "$f"
done

# Generate / update pipeline.config.json with the country + site name.
if [ ! -f "$TARGET/pipeline.config.json" ]; then
  cat > "$TARGET/pipeline.config.json" <<JSON
{
  "country": "$COUNTRY",
  "siteName": "$SITE_NAME",
  "hostname": "$HOSTNAME",
  "locales": ["en"],
  "autocompleteSeeds": {
    "en": ["$COUNTRY travel", "$COUNTRY backpacker", "$COUNTRY digital nomad", "$COUNTRY visa"]
  },
  "newsQuery": "$COUNTRY",
  "scrapeNewsSources": []
}
JSON
  echo "wrote $TARGET/pipeline.config.json"
fi

echo ""
echo "Sync complete."
echo "Next steps for $TARGET:"
echo "  1. Create/edit pipeline.config.json with country, hostname, autocompleteSeeds, newsQuery."
echo "  2. Verify env vars: OPENROUTER_API_KEY, SERPAPI_KEY, GA4_PROPERTY_ID,"
echo "     GOOGLE_SERVICE_ACCOUNT_*, CRON_SECRET, plus your GitHub PAT for commits."
echo "  3. Update vercel.json crons to the desired schedule."
echo "  4. cd $TARGET && npm install && npm run build to verify."
