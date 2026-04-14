// -------------------------------------------------------------------
// Fact-checker — regex-based claim extraction + cross-reference
// against scraped source data. No AI calls, pure string matching.
// -------------------------------------------------------------------

export interface FactClaim {
  type: "date" | "price" | "statistic" | "time";
  value: string;
  context: string; // surrounding ~60 chars
}

export interface FactCheckResult {
  totalClaims: number;
  verifiedClaims: number;
  unverifiedClaims: FactClaim[];
  riskLevel: "low" | "medium" | "high";
}

// -------------------------------------------------------------------
// Claim extraction patterns
// -------------------------------------------------------------------

const DATE_PATTERNS = [
  // "January 3", "March 5 (Thursday)", "December 25, 2026"
  /\b(January|February|March|April|May|June|July|August|September|October|November|December)\s+\d{1,2}(?:\s*\((?:Monday|Tuesday|Wednesday|Thursday|Friday|Saturday|Sunday)\))?(?:,?\s*\d{4})?\b/gi,
  // "2026-03-05", "2026-12-25"
  /\b20\d{2}-(?:0[1-9]|1[0-2])-(?:0[1-9]|[12]\d|3[01])\b/g,
  // "5 January 2026"
  /\b\d{1,2}\s+(?:January|February|March|April|May|June|July|August|September|October|November|December)\s+20\d{2}\b/gi,
];

const PRICE_PATTERNS = [
  // "10,000 THB", "500 THB", "1,500 baht"
  /\b[\d,]+\s*(?:THB|baht)\b/gi,
  // "$85 USD", "$50", "$30"
  /\$[\d,]+(?:\s*USD)?\b/g,
  // "฿1,500", "฿300"
  /฿[\d,]+/g,
  // "300–500 THB", "100-200 baht" (ranges)
  /\b[\d,]+\s*[–\-]\s*[\d,]+\s*(?:THB|baht)\b/gi,
  // "$30–$50" (USD ranges)
  /\$[\d,]+\s*[–\-]\s*\$[\d,]+/g,
];

const STATISTIC_PATTERNS = [
  // "200+ Mbps", "30,000 visitors", "5 million"
  /\b[\d,]+\+?\s*(?:Mbps|visitors|people|tourists|travelers|km|kilometers|metres|meters|hectares|temples|islands|species|rooms|beds|seats|stalls|vendors|shops|restaurants|bars|clubs)\b/gi,
  // "10%", "25 percent"
  /\b\d+(?:\.\d+)?%/g,
  /\b\d+(?:\.\d+)?\s*percent\b/gi,
  // Large round numbers: "30,000", "1 million", "2.5 million"
  /\b\d+(?:\.\d+)?\s*(?:million|billion)\b/gi,
];

const TIME_PATTERNS = [
  // "10 PM", "8 AM", "10:30 PM"
  /\b\d{1,2}(?::\d{2})?\s*(?:AM|PM|am|pm|a\.m\.|p\.m\.)\b/g,
  // "open 8 AM–5 PM", "opens at 9 AM"
  /\b(?:open|opens|closes|closing)\s+(?:at\s+)?\d{1,2}(?::\d{2})?\s*(?:AM|PM|am|pm)[^.]*?(?:\d{1,2}(?::\d{2})?\s*(?:AM|PM|am|pm))?\b/gi,
];

// -------------------------------------------------------------------
// Helpers
// -------------------------------------------------------------------

function extractContext(content: string, match: string, index: number): string {
  const start = Math.max(0, index - 30);
  const end = Math.min(content.length, index + match.length + 30);
  return content.slice(start, end).replace(/\n/g, " ").trim();
}

function normalizeForComparison(text: string): string {
  return text
    .toLowerCase()
    .replace(/[,\s]+/g, " ")
    .replace(/[–—-]/g, "-")
    .replace(/\$/g, "")
    .replace(/฿/g, "")
    .trim();
}

function stripFrontmatter(content: string): string {
  const fmMatch = content.match(/^---\s*\n[\s\S]*?\n---\s*\n/);
  return fmMatch ? content.slice(fmMatch[0].length) : content;
}

function isInScrapeData(claimValue: string, scrapeData: string): boolean {
  const normalizedClaim = normalizeForComparison(claimValue);
  const normalizedScrape = normalizeForComparison(scrapeData);

  // Exact match
  if (normalizedScrape.includes(normalizedClaim)) return true;

  // For dates: also check without day-of-week parenthetical
  const withoutDay = normalizedClaim.replace(/\s*\((?:monday|tuesday|wednesday|thursday|friday|saturday|sunday)\)/i, "");
  if (withoutDay !== normalizedClaim && normalizedScrape.includes(withoutDay)) return true;

  // For prices: extract just the number and check if it appears near currency in scrape data
  const numMatch = claimValue.match(/[\d,]+/);
  if (numMatch) {
    const num = numMatch[0].replace(/,/g, "");
    // Check if the number appears within ~20 chars of THB/baht/$
    const numPattern = new RegExp(
      `(?:THB|baht|\\$|฿).{0,10}${num}|${num}.{0,10}(?:THB|baht|\\$|฿)`,
      "i"
    );
    if (numPattern.test(scrapeData)) return true;
  }

  return false;
}

// -------------------------------------------------------------------
// Main export
// -------------------------------------------------------------------

export function factCheckPost(
  content: string,
  scrapeData: string | null
): FactCheckResult {
  const body = stripFrontmatter(content);
  const allClaims: FactClaim[] = [];
  const seen = new Set<string>(); // deduplicate by value

  // Extract claims by type
  const patternGroups: Array<{ type: FactClaim["type"]; patterns: RegExp[] }> = [
    { type: "date", patterns: DATE_PATTERNS },
    { type: "price", patterns: PRICE_PATTERNS },
    { type: "statistic", patterns: STATISTIC_PATTERNS },
    { type: "time", patterns: TIME_PATTERNS },
  ];

  for (const { type, patterns } of patternGroups) {
    for (const pattern of patterns) {
      // Reset lastIndex for global regex
      pattern.lastIndex = 0;
      let match: RegExpExecArray | null;
      while ((match = pattern.exec(body)) !== null) {
        const value = match[0].trim();
        if (!seen.has(value)) {
          seen.add(value);
          allClaims.push({
            type,
            value,
            context: extractContext(body, value, match.index),
          });
        }
      }
    }
  }

  // Cross-reference against scrape data
  let verified = 0;
  const unverified: FactClaim[] = [];

  for (const claim of allClaims) {
    if (scrapeData && isInScrapeData(claim.value, scrapeData)) {
      verified++;
    } else {
      unverified.push(claim);
    }
  }

  // Risk level
  const unverifiedCount = unverified.length;
  let riskLevel: FactCheckResult["riskLevel"];
  if (unverifiedCount <= 2) riskLevel = "low";
  else if (unverifiedCount <= 5) riskLevel = "medium";
  else riskLevel = "high";

  return {
    totalClaims: allClaims.length,
    verifiedClaims: verified,
    unverifiedClaims: unverified,
    riskLevel,
  };
}
