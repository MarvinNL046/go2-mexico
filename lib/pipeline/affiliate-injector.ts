// =============================================================================
// affiliate-injector.ts - Injects affiliate links and CTA boxes into markdown
// =============================================================================

import { siteConfig } from '../../site.config';

// ---------------------------------------------------------------------------
// Types
// ---------------------------------------------------------------------------

type AffiliateKey = keyof typeof siteConfig.affiliateLinks;

interface KeywordRule {
  /** Regex that matches one or more related keywords (case-insensitive). */
  pattern: RegExp;
  /** The affiliate link key to use when the pattern matches. */
  affiliateKey: AffiliateKey;
  /** Used to de-duplicate: only the first match in this category is linked. */
  category: string;
}

interface CtaTemplate {
  emoji: string;
  heading: string;
  body: string;
  cta: string;
  affiliateKey: AffiliateKey;
  /** Marker comment identifier, e.g. "booking" → <!-- affiliate:booking --> */
  marker: string;
}

// ---------------------------------------------------------------------------
// Keyword rules
// Order matters: more specific patterns should come first.
// ---------------------------------------------------------------------------

const KEYWORD_RULES: KeywordRule[] = [
  {
    pattern: /\b(eSIM|SIM card|SIM-card|data plan|mobile data)\b/gi,
    affiliateKey: 'saily',
    category: 'esim',
  },
  {
    pattern: /\b(VPN|online security|public wi-?fi)\b/gi,
    affiliateKey: 'nordvpn',
    category: 'vpn',
  },
  {
    pattern: /\b(hotel|hotels|accommodation|where to stay)\b/gi,
    affiliateKey: 'booking',
    category: 'accommodation',
  },
  {
    pattern: /\b(tour|tours|activities|things to do|excursion|excursions)\b/gi,
    affiliateKey: 'getYourGuide',
    category: 'tours',
  },
  {
    pattern: /\b(bus|train|ferry|transportation|getting around)\b/gi,
    affiliateKey: 'transport',
    category: 'transport',
  },
  {
    pattern: /\b(flight|flights|cheap flights?)\b/gi,
    affiliateKey: 'tripcom',
    category: 'flights',
  },
];

// ---------------------------------------------------------------------------
// CTA templates
// ---------------------------------------------------------------------------

const CTA_TEMPLATES: CtaTemplate[] = [
  {
    emoji: '🏨',
    heading: 'Find Your Perfect Hotel',
    body: 'Compare prices from top booking sites and save up to 40% on your Mexico accommodation.',
    cta: 'Search Hotels →',
    affiliateKey: 'booking',
    marker: 'booking',
  },
  {
    emoji: '🎒',
    heading: 'Book Tours & Activities',
    body: 'Skip the queue and book top-rated tours, day trips, and experiences across Mexico.',
    cta: 'Browse Tours →',
    affiliateKey: 'getYourGuide',
    marker: 'getyourguide',
  },
  {
    emoji: '📱',
    heading: 'Stay Connected in Mexico',
    body: 'Get a travel eSIM and enjoy fast, affordable mobile data from the moment you land.',
    cta: 'Get Your eSIM →',
    affiliateKey: 'saily',
    marker: 'esim',
  },
  {
    emoji: '✈️',
    heading: 'Find Cheap Flights to Mexico',
    body: 'Search hundreds of airlines and travel sites to find the best deal on your Mexico flight.',
    cta: 'Compare Flights →',
    affiliateKey: 'tripcom',
    marker: 'flights',
  },
];

// ---------------------------------------------------------------------------
// Helpers
// ---------------------------------------------------------------------------

/** Build a markdown blockquote-style CTA box. */
function buildCtaBox(template: CtaTemplate): string {
  const url = siteConfig.affiliateLinks[template.affiliateKey];
  return [
    `> **${template.emoji} ${template.heading}**`,
    `> ${template.body}`,
    `> [${template.cta}](${url})`,
  ].join('\n');
}

/** Build the widget marker comment for a given marker id. */
function buildWidgetMarker(marker: string): string {
  return `<!-- affiliate:${marker} -->`;
}

/**
 * Guard: returns true if the character at position `index` in `text` is
 * inside a markdown link, code span, fenced code block, or heading line so we
 * do not double-link or corrupt existing markup.
 */
function isInsideMarkdownMarkup(text: string, index: number): boolean {
  // Check for fenced code block (``` ... ```)
  const before = text.slice(0, index);
  const codeBlockMatches = before.match(/```/g);
  if (codeBlockMatches && codeBlockMatches.length % 2 !== 0) return true;

  // Check for inline code span (` ... `)
  const inlineCodeMatches = before.match(/(?<!`)`(?!`)/g);
  if (inlineCodeMatches && inlineCodeMatches.length % 2 !== 0) return true;

  // Check whether we are inside the text or href portion of an existing link
  // Pattern: [text](url) - look backwards for an unclosed [
  const lastOpenBracket = before.lastIndexOf('[');
  const lastCloseParen = before.lastIndexOf(')');
  if (lastOpenBracket > lastCloseParen) return true;

  // Skip matches that fall on a heading line (# / ## / ### etc.) to avoid
  // turning section headings into hyperlinks.
  const lineStart = before.lastIndexOf('\n') + 1;
  const currentLine = text.slice(lineStart, text.indexOf('\n', index));
  if (/^#{1,6}\s/.test(currentLine)) return true;

  return false;
}

// ---------------------------------------------------------------------------
// Inline link injection
// ---------------------------------------------------------------------------

/**
 * Replaces the FIRST occurrence of each keyword category with a markdown link.
 * Skips matches that are already inside markup.
 * Respects a global cap of MAX_INLINE_LINKS across all categories.
 */
const MAX_INLINE_LINKS = 6;

function injectInlineLinks(content: string): string {
  const linkedCategories = new Set<string>();
  let totalLinks = 0;
  let result = content;

  for (const rule of KEYWORD_RULES) {
    if (totalLinks >= MAX_INLINE_LINKS) break;
    if (linkedCategories.has(rule.category)) continue;

    const url = siteConfig.affiliateLinks[rule.affiliateKey];

    // Reset lastIndex before each search.
    rule.pattern.lastIndex = 0;

    let match: RegExpExecArray | null;
    let replaced = false;

    while ((match = rule.pattern.exec(result)) !== null) {
      const matchIndex = match.index;

      if (isInsideMarkdownMarkup(result, matchIndex)) {
        // Skip this occurrence and keep searching.
        continue;
      }

      const matchedText = match[0];
      const link = `[${matchedText}](${url})`;
      result =
        result.slice(0, matchIndex) +
        link +
        result.slice(matchIndex + matchedText.length);

      replaced = true;
      break; // Only link the first valid occurrence per category.
    }

    if (replaced) {
      linkedCategories.add(rule.category);
      totalLinks++;
    }

    // Reset the regex state after use.
    rule.pattern.lastIndex = 0;
  }

  return result;
}

// ---------------------------------------------------------------------------
// CTA box injection
// ---------------------------------------------------------------------------

/**
 * Splits content on H2 headings and inserts CTA boxes after every 3rd H2,
 * up to a maximum of MAX_CTA_BOXES total boxes.
 */
const MAX_CTA_BOXES = 4;
const CTA_INSERT_INTERVAL = 3; // insert after every Nth H2

function injectCtaBoxes(
  content: string,
  category: string,
  city?: string
): string {
  // Split into lines to locate H2 positions.
  const lines = content.split('\n');
  const insertions: Map<number, string> = new Map();

  let h2Count = 0;
  let ctaIndex = 0;
  let ctaBoxesInserted = 0;

  // Build a priority order of CTA templates based on the content category.
  const orderedTemplates = selectCtaOrder(category);

  for (let i = 0; i < lines.length; i++) {
    if (/^## /.test(lines[i])) {
      h2Count++;

      if (
        h2Count % CTA_INSERT_INTERVAL === 0 &&
        ctaBoxesInserted < MAX_CTA_BOXES &&
        ctaIndex < orderedTemplates.length
      ) {
        const template = orderedTemplates[ctaIndex];
        const box = buildCtaBox(template);
        // Insert after the current line (before the next line).
        insertions.set(i, box);
        ctaIndex++;
        ctaBoxesInserted++;
      }
    }
  }

  if (insertions.size === 0) return content;

  // Rebuild the content with insertions applied (in reverse so indices stay valid).
  const resultLines = [...lines];
  const insertionEntries = [...insertions.entries()].sort((a, b) => b[0] - a[0]);

  for (const [lineIndex, box] of insertionEntries) {
    resultLines.splice(lineIndex + 1, 0, '', box, '');
  }

  return resultLines.join('\n');
}

/**
 * Returns a prioritised list of CTA templates.
 * Category-relevant CTAs come first so the most contextual CTA appears first.
 */
function selectCtaOrder(category: string): CtaTemplate[] {
  const cat = category.toLowerCase();

  const priorityMap: Record<string, string[]> = {
    accommodation: ['booking', 'getyourguide', 'flights', 'esim'],
    hotel: ['booking', 'getyourguide', 'flights', 'esim'],
    tours: ['getyourguide', 'booking', 'flights', 'esim'],
    activities: ['getyourguide', 'booking', 'flights', 'esim'],
    transport: ['flights', 'getyourguide', 'booking', 'esim'],
    flights: ['flights', 'booking', 'getyourguide', 'esim'],
    esim: ['esim', 'booking', 'getyourguide', 'flights'],
    connectivity: ['esim', 'booking', 'getyourguide', 'flights'],
  };

  // Find a matching priority list.
  let order: string[] | undefined;
  for (const [key, list] of Object.entries(priorityMap)) {
    if (cat.includes(key)) {
      order = list;
      break;
    }
  }

  // Default order when no category match.
  if (!order) {
    order = ['booking', 'getyourguide', 'flights', 'esim'];
  }

  return order
    .map((marker) => CTA_TEMPLATES.find((t) => t.marker === marker))
    .filter((t): t is CtaTemplate => t !== undefined);
}

// ---------------------------------------------------------------------------
// Widget marker injection
// ---------------------------------------------------------------------------

/**
 * Appends a set of widget marker comments near the end of the content.
 * The frontend can use these to hydrate interactive affiliate widgets.
 */
function injectWidgetMarkers(content: string, category: string): string {
  const markers = selectWidgetMarkers(category);
  if (markers.length === 0) return content;

  const markerBlock = markers.map(buildWidgetMarker).join('\n');
  return `${content.trimEnd()}\n\n${markerBlock}\n`;
}

/** Choose which widget markers to insert based on category. */
function selectWidgetMarkers(category: string): string[] {
  const cat = category.toLowerCase();

  if (cat.includes('accommodation') || cat.includes('hotel')) {
    return ['booking', 'getyourguide'];
  }
  if (cat.includes('tour') || cat.includes('activit')) {
    return ['getyourguide', 'booking'];
  }
  if (cat.includes('transport') || cat.includes('flight')) {
    return ['flights', 'booking'];
  }
  if (cat.includes('esim') || cat.includes('connectivity')) {
    return ['esim', 'booking'];
  }

  // General travel content gets the two most universally useful widgets.
  return ['booking', 'getyourguide'];
}

// ---------------------------------------------------------------------------
// Public API
// ---------------------------------------------------------------------------

/**
 * Injects affiliate links and CTA boxes into a markdown blog post.
 *
 * @param content - Raw markdown content to process.
 * @param category - Content category (e.g. "accommodation", "tours", "transport").
 * @param city - Optional city name, reserved for future personalisation.
 * @returns The processed markdown with affiliate links, CTA boxes, and markers.
 */
export function injectAffiliateLinks(
  content: string,
  category: string,
  city?: string
): string {
  if (!content || content.trim().length === 0) return content;

  let result = content;

  // 1. Replace keyword occurrences with inline affiliate links.
  result = injectInlineLinks(result);

  // 2. Insert CTA blockquote boxes after every 3rd H2.
  result = injectCtaBoxes(result, category, city);

  // 3. Append widget marker comments near the end.
  result = injectWidgetMarkers(result, category);

  return result;
}
