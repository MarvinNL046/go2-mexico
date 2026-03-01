import { generateContent } from './ai-provider';

export interface Claim {
  text: string;
  type: string;
  flagged: boolean;
  suggestion?: string;
}

export interface FactCheckResult {
  claims: Array<Claim>;
  cleanedContent: string;
  score: number;
}

// ─── Claim extraction ────────────────────────────────────────────────────────

const PATTERNS: Record<string, RegExp> = {
  price:      /\$[\d,.]+|\b[\d,.]+\s*(MXN|pesos|USD|dollars)\b/gi,
  year:       /\b(1[0-9]{3}|20[0-9]{2})\b/g,
  statistic:  /\b\d+(\.\d+)?%|\b\d{1,3}(,\d{3})+\b/g,
  distance:   /\b\d+\s*(km|miles|hours?|minutes?)\b/gi,
};

interface RawClaim {
  text: string;
  type: string;
}

/**
 * A claim is considered "risky" if it contains a very specific number that
 * would be embarrassing to get wrong in a published article.
 */
function isRisky(claim: RawClaim): boolean {
  const { text, type } = claim;

  // All prices are risky – wrong amounts erode trust quickly.
  if (type === 'price') return true;

  // Statistics (percentages, large numbers) that look precise.
  if (type === 'statistic') return true;

  // Distances are mostly risky; only skip very round numbers like "10 km".
  if (type === 'distance') {
    const num = parseFloat(text.replace(/[^\d.]/g, ''));
    return !Number.isInteger(num) || num % 5 !== 0;
  }

  // Years: flag only those that are very old or in the future, or very specific
  // historical claims that an LLM might hallucinate.
  if (type === 'year') {
    const year = parseInt(text, 10);
    const current = new Date().getFullYear();
    return year < 1800 || year > current || (year >= 1800 && year < 1900);
  }

  return false;
}

function extractClaims(content: string): RawClaim[] {
  const seen = new Set<string>();
  const results: RawClaim[] = [];

  for (const [type, pattern] of Object.entries(PATTERNS)) {
    // Reset lastIndex in case the pattern is reused.
    pattern.lastIndex = 0;
    let match: RegExpExecArray | null;

    while ((match = pattern.exec(content)) !== null) {
      const text = match[0].trim();
      const key = `${type}:${text}`;

      if (!seen.has(key)) {
        seen.add(key);
        results.push({ text, type });
      }
    }

    // Ensure patterns with the global flag don't carry stale lastIndex.
    pattern.lastIndex = 0;
  }

  return results;
}

// ─── AI verification ─────────────────────────────────────────────────────────

interface AIVerdict {
  text: string;
  flagged: boolean;
  suggestion?: string;
}

function buildVerificationPrompt(claims: RawClaim[], topic: string): string {
  const list = claims
    .map((c, i) => `${i + 1}. [${c.type}] "${c.text}"`)
    .join('\n');

  return `You are a fact-checking assistant for a Mexico travel blog. The article topic is: "${topic}".

Review the following claims extracted from the article and decide whether each one is likely correct, suspicious, or clearly wrong. Focus on Mexico-specific context (currency rates, geography, history, demographics).

Claims to review:
${list}

Respond ONLY with a JSON array. Each element must follow this exact schema:
{
  "text": "<exact claim text>",
  "flagged": <true if suspicious or wrong, false if likely correct>,
  "suggestion": "<brief correction or note, only when flagged>"
}

Do not include any explanation outside the JSON array. If you are unsure, prefer flagged: false to avoid false positives.`;
}

async function verifyClaimsWithAI(
  claims: RawClaim[],
  topic: string
): Promise<AIVerdict[]> {
  if (claims.length === 0) return [];

  const prompt = buildVerificationPrompt(claims, topic);

  const raw = await generateContent(prompt, {
    maxTokens: 1024,
    temperature: 0.2,
    systemPrompt:
      'You are a precise fact-checking assistant. Respond only with valid JSON.',
  });

  // Strip markdown code fences if the model adds them.
  const cleaned = raw.replace(/^```(?:json)?\s*/i, '').replace(/\s*```\s*$/i, '').trim();

  let parsed: unknown;
  try {
    parsed = JSON.parse(cleaned);
  } catch {
    // If parsing fails, treat all claims as unverified (not flagged).
    console.warn('[fact-checker] Could not parse AI response as JSON:', cleaned.slice(0, 200));
    return [];
  }

  if (!Array.isArray(parsed)) {
    console.warn('[fact-checker] AI response was not a JSON array.');
    return [];
  }

  return (parsed as Array<Record<string, unknown>>).map((item) => ({
    text:       typeof item.text === 'string'       ? item.text       : '',
    flagged:    typeof item.flagged === 'boolean'   ? item.flagged    : false,
    suggestion: typeof item.suggestion === 'string' ? item.suggestion : undefined,
  }));
}

// ─── Scoring ──────────────────────────────────────────────────────────────────

/**
 * Score reflects how trustworthy the content appears after the check.
 *
 * 100  – no claims extracted at all (nothing to dispute)
 * 90   – claims found but none flagged
 * Decreases by a small amount per flagged claim, capped at 0.
 */
function computeScore(total: number, flaggedCount: number): number {
  if (total === 0) return 100;
  const baseScore = flaggedCount === 0 ? 90 : 90;
  const penalty = Math.min(flaggedCount * 10, 90);
  return Math.max(0, baseScore - penalty);
}

// ─── Public API ───────────────────────────────────────────────────────────────

/**
 * Check a piece of generated blog content for potentially incorrect claims.
 *
 * The function extracts numeric claims (prices, dates, statistics, distances)
 * via regex, selects the riskiest ones for AI verification, and returns a
 * structured result with a confidence score.
 *
 * @param content - The raw article text to check.
 * @param topic   - The article topic (used to give the AI relevant context).
 */
export async function factCheckContent(
  content: string,
  topic: string
): Promise<FactCheckResult> {
  const rawClaims = extractClaims(content);

  // Separate risky claims that warrant AI review from benign ones.
  const riskyClaims  = rawClaims.filter(isRisky);
  const benignClaims = rawClaims.filter((c) => !isRisky(c));

  // Cap AI calls: when there are many risky claims, only send the first 20.
  // This keeps latency acceptable and avoids huge prompts.
  const MAX_AI_CLAIMS = 20;
  const claimsToVerify = riskyClaims.slice(0, MAX_AI_CLAIMS);
  const unverifiedRisky = riskyClaims.slice(MAX_AI_CLAIMS);

  let verdicts: AIVerdict[] = [];

  if (claimsToVerify.length > 0) {
    try {
      verdicts = await verifyClaimsWithAI(claimsToVerify, topic);
    } catch (err) {
      console.warn(
        '[fact-checker] AI verification failed, skipping:',
        err instanceof Error ? err.message : err
      );
    }
  }

  // Build a lookup from claim text -> verdict for quick merging.
  const verdictMap = new Map<string, AIVerdict>(
    verdicts.map((v) => [v.text, v])
  );

  // Assemble the final claims list.
  const claims: Claim[] = [
    // Verified risky claims.
    ...claimsToVerify.map((raw): Claim => {
      const verdict = verdictMap.get(raw.text);
      return {
        text:       raw.text,
        type:       raw.type,
        flagged:    verdict?.flagged ?? false,
        suggestion: verdict?.suggestion,
      };
    }),
    // Risky claims that exceeded the AI batch cap – mark not flagged.
    ...unverifiedRisky.map((raw): Claim => ({
      text:    raw.text,
      type:    raw.type,
      flagged: false,
    })),
    // Benign claims are included for completeness but never flagged.
    ...benignClaims.map((raw): Claim => ({
      text:    raw.text,
      type:    raw.type,
      flagged: false,
    })),
  ];

  const flaggedCount = claims.filter((c) => c.flagged).length;
  const score = computeScore(claims.length, flaggedCount);

  // cleanedContent is the original content unchanged. Callers can use the
  // `claims` list to decide whether to re-generate or surface warnings.
  // Applying automated edits to prose based on AI verdicts is out of scope
  // for a sanity-check tool.
  const cleanedContent = content;

  return { claims, cleanedContent, score };
}
