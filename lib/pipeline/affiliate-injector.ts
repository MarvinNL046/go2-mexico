// -------------------------------------------------------------------
// Affiliate link injection for go2thailand.com blog posts
// -------------------------------------------------------------------
// Partners and their tracking URLs:
//   Booking.com   → https://booking.tpo.lv/2PT1kR82
//   Klook         → https://klook.tpo.lv/7Dt6WApj
//   GetYourGuide  → https://getyourguide.tpo.lv/GuAFfGGK
//   12Go Asia     → https://12go.tpo.lv/tNA80urD
//   Saily eSIM    → https://saily.tpo.lv/rf9lidnE
//   Trip.com      → https://trip.tpo.lv/TmObooZ5
//   Viator        → https://viator.tpo.lv/TUcQTS5u
//   NordVPN       → https://nordvpn.tpo.lv/ekHF1i55
//   NordPass      → https://nordvpn.tpo.lv/tp12zNjC
// -------------------------------------------------------------------

export const AFFILIATE_LINKS = {
  booking: "https://booking.tpo.lv/2PT1kR82?subid=blog",
  klook: "https://klook.tpo.lv/7Dt6WApj?subid=blog",
  getyourguide: "https://getyourguide.tpo.lv/GuAFfGGK?subid=blog",
  "12go": "https://12go.tpo.lv/tNA80urD?subid=blog",
  saily: "https://saily.tpo.lv/rf9lidnE?subid=blog",
  trip: "https://trip.tpo.lv/TmObooZ5?subid=blog",
  viator: "https://viator.tpo.lv/TUcQTS5u?subid=blog",
  nordvpn: "https://nordvpn.tpo.lv/ekHF1i55?subid=blog",
  nordpass: "https://nordvpn.tpo.lv/tp12zNjC?subid=blog",
} as const;

export type AffiliatePartner = keyof typeof AFFILIATE_LINKS;

// Specific deep links for contextual matching
export const SPECIFIC_AFFILIATE_LINKS = {
  // Booking.com specific pages
  "booking-deals": "https://booking.tpo.lv/pDNjHJA1?subid=blog",
  "booking-flights": "https://booking.tpo.lv/LUkugxWF?subid=blog",
  "booking-car-rental": "https://booking.tpo.lv/Nmm5XgwI?subid=blog",
  // Trip.com specific pages
  "trip-trains": "https://trip.tpo.lv/gNIdNBmi?subid=blog",
  "trip-bundles": "https://trip.tpo.lv/L83mcBdE?subid=blog",
  "trip-airport-transfers": "https://trip.tpo.lv/hY8hOUey?subid=blog",
  "trip-car-rental": "https://trip.tpo.lv/zGKhdcce?subid=blog",
} as const;

// -------------------------------------------------------------------
// Keyword → affiliate mapping
// -------------------------------------------------------------------

interface AffiliateRule {
  pattern: RegExp;
  partner: AffiliatePartner;
  // Text to use for the inline link anchor
  linkText: string;
  overrideUrl?: string; // Use this URL instead of the generic partner URL
}

// Rules are evaluated in order — first match wins for inline injection
const AFFILIATE_RULES: AffiliateRule[] = [
  // Specific deep-link rules (evaluated first, before generic partner rules)
  {
    pattern: /\b(car rental|rent a car|hire a car|rental car)\b/i,
    partner: "booking" as AffiliatePartner,
    linkText: "Rent a Car on Booking.com",
    overrideUrl: "https://booking.tpo.lv/Nmm5XgwI?subid=blog",
  },
  {
    pattern: /\b(airport transfer|airport shuttle|airport taxi|airport pickup|airport drop)\b/i,
    partner: "trip" as AffiliatePartner,
    linkText: "Book Airport Transfer",
    overrideUrl: "https://trip.tpo.lv/hY8hOUey?subid=blog",
  },
  {
    pattern: /\b(train to|train from|Thai train|railway|train route|train station|Hua Lamphong|Bang Sue)\b/i,
    partner: "trip" as AffiliatePartner,
    linkText: "Book Train on Trip.com",
    overrideUrl: "https://trip.tpo.lv/gNIdNBmi?subid=blog",
  },
  {
    pattern: /\b(hotel.*deal|travel deal|best deal|discount hotel|cheap hotel|hotel offer|last.?minute)\b/i,
    partner: "booking" as AffiliatePartner,
    linkText: "See Deals on Booking.com",
    overrideUrl: "https://booking.tpo.lv/pDNjHJA1?subid=blog",
  },
  // eSIM / SIM Card → Saily
  {
    pattern: /\b(eSIM|e-SIM|SIM card|data SIM|travel SIM|mobile data|internet connection|stay connected)\b/i,
    partner: "saily",
    linkText: "Get Saily eSIM",
  },
  // Transport: bus, minivan, ferry, train, boat → 12Go
  {
    pattern:
      /\b(bus ticket|bus ride|minivan|night bus|overnight bus|ferry|ferry ride|boat ticket|boat ride|train ticket|train ride|train journey|book.*transport|book.*transfer|12Go|Songthaew|shared taxi|slow boat)\b/i,
    partner: "12go",
    linkText: "Book on 12Go",
  },
  // Flights / trip search → Trip.com
  {
    pattern:
      /\b(flight|flights|book.*flight|search.*flight|airline|trip\.com|cheap flight|domestic flight|fly to)\b/i,
    partner: "trip",
    linkText: "Search on Trip.com",
  },
  // Activities: tour, cooking class, snorkeling, diving, etc. → Klook (primary)
  {
    pattern:
      /\b(cooking class|snorkeling tour|snorkeling|diving course|scuba diving|day trip|elephant sanctuary|muay thai class|zip.?lin|kayak tour|Klook|boat tour|island tour|jungle trek)\b/i,
    partner: "klook",
    linkText: "Book on Klook",
  },
  // Activities: Viator/Tripadvisor tours → Viator
  {
    pattern: /\b(Viator|Tripadvisor tour|TripAdvisor experience)\b/i,
    partner: "viator",
    linkText: "Book on Viator",
  },
  // Activities: general tour/activity → GetYourGuide (secondary)
  {
    pattern:
      /\b(guided tour|walking tour|food tour|group tour|tour operator|activities|excursion|experience|GetYourGuide)\b/i,
    partner: "getyourguide",
    linkText: "Book on GetYourGuide",
  },
  // Hotels / accommodation → Booking.com
  {
    pattern:
      /\b(hotel|hotels|hostel|resort|guesthouse|guest house|villa|bungalow|accommodation|accommodations|where to stay|book.*stay|Booking\.com|place to stay|lodging)\b/i,
    partner: "booking",
    linkText: "Book on Booking.com",
  },
];

// -------------------------------------------------------------------
// CTA box templates
// -------------------------------------------------------------------

interface CtaBox {
  partner: AffiliatePartner;
  emoji: string;
  heading: string;
  body: string;
  cta: string;
  overrideUrl?: string;
}

const CTA_BOXES: CtaBox[] = [
  {
    partner: "booking",
    emoji: "🏨",
    heading: "Book Your Stay",
    body: "Compare hotels, resorts, and guesthouses across Thailand with free cancellation on most bookings.",
    cta: "Search Hotels on Booking.com →",
  },
  {
    partner: "klook",
    emoji: "🎒",
    heading: "Book Tours & Activities",
    body: "Skip the hassle — book Thailand day trips, cooking classes, and experiences in advance with instant confirmation.",
    cta: "Browse Activities on Klook →",
  },
  {
    partner: "12go",
    emoji: "🚌",
    heading: "Book Transport in Thailand",
    body: "Book buses, trains, ferries, and transfers between Thai cities easily online. Compare routes and prices.",
    cta: "Book Transport on 12Go →",
  },
  {
    partner: "saily",
    emoji: "📱",
    heading: "Stay Connected in Thailand",
    body: "Get a Thailand eSIM before you land. No physical SIM needed — activate instantly on your phone.",
    cta: "Get Saily eSIM for Thailand →",
  },
  {
    partner: "getyourguide",
    emoji: "🗺️",
    heading: "Explore Thailand with a Guide",
    body: "Discover the best guided tours and activities in Bangkok, Chiang Mai, Phuket and beyond.",
    cta: "Browse Tours on GetYourGuide →",
  },
  {
    partner: "trip",
    emoji: "✈️",
    heading: "Find Flights to Thailand",
    body: "Search and compare flights to Bangkok, Phuket, Chiang Mai and Koh Samui at the best prices.",
    cta: "Search Flights on Trip.com →",
  },
  {
    partner: "viator",
    emoji: "🏛️",
    heading: "Popular Tours by Viator",
    body: "Browse top-rated Thailand tours and experiences curated by Tripadvisor's Viator.",
    cta: "Explore Tours on Viator →",
  },
  {
    partner: "nordvpn",
    emoji: "🔒",
    heading: "Stay Secure Online While Traveling",
    body: "Protect your connection on public WiFi in Thailand. NordVPN keeps your data private wherever you are.",
    cta: "Get NordVPN →",
  },
  {
    partner: "nordpass",
    emoji: "🔑",
    heading: "Manage Your Passwords Safely",
    body: "Travel stress-free with NordPass — a secure password manager that keeps all your accounts safe.",
    cta: "Get NordPass →",
  },
  {
    partner: "booking" as AffiliatePartner,
    emoji: "🚗",
    heading: "Rent a Car in Thailand",
    body: "Compare car rental prices across Thailand. Pick up at airports or city locations with flexible cancellation.",
    cta: "Compare Car Rentals →",
    overrideUrl: "https://booking.tpo.lv/Nmm5XgwI?subid=blog",
  },
  {
    partner: "trip" as AffiliatePartner,
    emoji: "🚂",
    heading: "Book Train Tickets in Thailand",
    body: "Thai railway tickets from Bangkok to Chiang Mai, Hua Hin, and beyond. Book online, skip the queue.",
    cta: "Book Train Tickets →",
    overrideUrl: "https://trip.tpo.lv/gNIdNBmi?subid=blog",
  },
  {
    partner: "trip" as AffiliatePartner,
    emoji: "🚕",
    heading: "Airport Transfers in Thailand",
    body: "Pre-book your airport pickup in Bangkok, Phuket, or Chiang Mai. No haggling, fixed prices.",
    cta: "Book Airport Transfer →",
    overrideUrl: "https://trip.tpo.lv/hY8hOUey?subid=blog",
  },
];

// -------------------------------------------------------------------
// Inline link injection
// -------------------------------------------------------------------

// Inject affiliate links inline into the Markdown content.
// Finds the FIRST occurrence of each matching keyword and wraps it in a link.
// Only injects once per partner to avoid over-linking.
export function injectInlineLinks(content: string): string {
  // Track which partners have already been linked inline
  const injected = new Set<AffiliatePartner>();

  // Work on the body only (skip YAML frontmatter)
  const { frontmatter, body } = splitFrontmatter(content);

  let processedBody = body;

  for (const rule of AFFILIATE_RULES) {
    if (injected.has(rule.partner)) continue;

    const url = rule.overrideUrl || AFFILIATE_LINKS[rule.partner];

    // Find the first match in the body
    const match = rule.pattern.exec(processedBody);
    if (!match) continue;

    // Don't inject inside an existing Markdown link [...](...) or code block
    const matchIndex = match.index;
    if (isInsideLink(processedBody, matchIndex)) continue;
    if (isInsideCodeBlock(processedBody, matchIndex)) continue;

    // Replace only the first occurrence with an inline link
    const originalText = match[0];
    const linkedText = `[${originalText}](${url})`;
    processedBody =
      processedBody.slice(0, matchIndex) +
      linkedText +
      processedBody.slice(matchIndex + originalText.length);

    injected.add(rule.partner);
  }

  return frontmatter + processedBody;
}

// -------------------------------------------------------------------
// CTA box injection
// -------------------------------------------------------------------

// Inject 2-3 affiliate CTA boxes into the content at strategic positions.
// Boxes are placed after H2 sections to break up the content naturally.
export function injectCtaBoxes(
  content: string,
  count: number = 3
): string {
  const { frontmatter, body } = splitFrontmatter(content);

  // Select which CTA boxes to inject based on content relevance
  const selectedBoxes = selectRelevantCtaBoxes(body, count);
  if (selectedBoxes.length === 0) return content;

  // Find H2 section positions to insert after
  const h2Positions = findH2Positions(body);

  if (h2Positions.length < 2) {
    // Not enough H2s — append at end of body
    const ctaMarkdown = selectedBoxes.map(renderCtaBox).join("\n\n");
    return frontmatter + body.trimEnd() + "\n\n" + ctaMarkdown + "\n";
  }

  // Insert boxes at evenly spaced H2 boundaries
  const insertPositions = pickInsertPositions(h2Positions, selectedBoxes.length);

  // Insert from end to start to avoid messing up indices
  let processedBody = body;
  for (let i = insertPositions.length - 1; i >= 0; i--) {
    const pos = insertPositions[i];
    const box = renderCtaBox(selectedBoxes[i]);
    processedBody =
      processedBody.slice(0, pos) +
      "\n\n" +
      box +
      "\n\n" +
      processedBody.slice(pos);
  }

  return frontmatter + processedBody;
}

// -------------------------------------------------------------------
// Main entry point — inject both inline links and CTA boxes
// -------------------------------------------------------------------

export interface InjectionOptions {
  inlineLinks?: boolean;   // Inject inline affiliate links (default: true)
  ctaBoxes?: boolean;      // Inject CTA blockquote boxes (default: true)
  ctaCount?: number;       // Number of CTA boxes to inject (default: 2)
  processWidgets?: boolean; // Process <!-- WIDGET:type --> placeholders (default: true)
}

export function injectAffiliateLinks(
  content: string,
  options: InjectionOptions = {}
): string {
  const {
    inlineLinks = true,
    ctaBoxes = true,
    ctaCount = 2,
    processWidgets = true,
  } = options;

  let result = content;

  // Process AI-placed widget placeholders first so they render before automatic CTA injection
  if (processWidgets) {
    result = processWidgetPlaceholders(result);
  }

  if (inlineLinks) {
    result = injectInlineLinks(result);
  }

  if (ctaBoxes) {
    result = injectCtaBoxes(result, ctaCount);
  }

  return result;
}

// -------------------------------------------------------------------
// Helpers
// -------------------------------------------------------------------

function renderCtaBox(box: CtaBox): string {
  const url = box.overrideUrl || AFFILIATE_LINKS[box.partner];

  const colors: Record<AffiliatePartner, { bg: string; border: string; btn: string; btnHover: string }> = {
    booking: { bg: '#EFF6FF', border: '#3B82F6', btn: '#2563EB', btnHover: '#1D4ED8' },
    klook: { bg: '#F0FDF4', border: '#22C55E', btn: '#16A34A', btnHover: '#15803D' },
    getyourguide: { bg: '#FFF7ED', border: '#F97316', btn: '#EA580C', btnHover: '#C2410C' },
    '12go': { bg: '#FFFBEB', border: '#F59E0B', btn: '#D97706', btnHover: '#B45309' },
    saily: { bg: '#FAF5FF', border: '#A855F7', btn: '#9333EA', btnHover: '#7E22CE' },
    trip: { bg: '#F0F9FF', border: '#0EA5E9', btn: '#0284C7', btnHover: '#0369A1' },
    viator: { bg: '#F0FDF4', border: '#059669', btn: '#047857', btnHover: '#065F46' },
    nordvpn: { bg: '#EFF6FF', border: '#4338CA', btn: '#4338CA', btnHover: '#3730A3' },
    nordpass: { bg: '#FDF2F8', border: '#DB2777', btn: '#BE185D', btnHover: '#9D174D' },
  };

  const qrCodes: Record<AffiliatePartner, string> = {
    booking: '/images/qrcodes/qrcode-booking.com.jpeg',
    klook: '/images/qrcodes/qrcode-klook.jpeg',
    getyourguide: '/images/qrcodes/qrcode-gyg-1.jpeg',
    '12go': '/images/qrcodes/qrcode-12go.jpeg',
    saily: '/images/qrcodes/qrcode-saily-1.jpeg',
    trip: '',
    viator: '/images/qrcodes/qrcode-viator.jpeg',
    nordvpn: '/images/qrcodes/qrcode-nordvpn.jpeg',
    nordpass: '/images/qrcodes/qrcode-nordpass.jpeg',
  };

  const c = colors[box.partner];
  const qr = qrCodes[box.partner];

  const qrHtml = qr ? `
    <a href="${url}" target="_blank" rel="noopener noreferrer sponsored" style="flex-shrink:0;text-align:center;text-decoration:none;">
      <img src="${qr}" alt="Scan to visit ${box.heading}" style="width:72px;height:72px;border-radius:8px;border:1px solid ${c.border}33;" />
      <span style="display:block;font-size:10px;color:#6B7280;margin-top:4px;">Scan me</span>
    </a>` : '';

  return `<div data-widget-fallback style="background:${c.bg};border-left:4px solid ${c.border};border-radius:12px;padding:20px 24px;margin:32px 0;box-shadow:0 1px 3px rgba(0,0,0,0.1);">
  <div style="display:flex;align-items:flex-start;gap:16px;">
    <div style="flex:1;">
      <div style="display:flex;align-items:center;gap:10px;margin-bottom:8px;">
        <span style="font-size:28px;line-height:1;">${box.emoji}</span>
        <strong style="font-size:18px;color:#1F2937;">${box.heading}</strong>
      </div>
      <p style="color:#4B5563;margin:0 0 12px 0;font-size:15px;line-height:1.5;">${box.body}</p>
      <a href="${url}" target="_blank" rel="noopener noreferrer sponsored" style="display:inline-block;background:${c.btn};color:white;padding:10px 20px;border-radius:8px;text-decoration:none;font-weight:600;font-size:14px;">${box.cta}</a>
    </div>${qrHtml}
  </div>
</div>`;
}

// -------------------------------------------------------------------
// Widget placeholder processing
// -------------------------------------------------------------------

// Replace <!-- WIDGET:type --> and <!-- WIDGET:tip:text --> placeholders with styled HTML
export function processWidgetPlaceholders(content: string): string {
  const { frontmatter, body } = splitFrontmatter(content);

  let processedBody = body;

  // Normalize various widget placeholder formats the AI might use before the main replacement loop.
  // The AI sometimes writes widgets in wrong formats (plain text, list items, etc.).
  // - "- WIDGET:booking" or "* WIDGET:booking" → <!-- WIDGET:booking -->
  processedBody = processedBody.replace(/^[-*]\s*WIDGET:(\w+)\s*$/gm, '<!-- WIDGET:$1 -->');
  // - "WIDGET:booking" (plain text on a line, no dashes) → <!-- WIDGET:booking -->
  processedBody = processedBody.replace(/^WIDGET:(\w+)\s*$/gm, '<!-- WIDGET:$1 -->');
  // - "- WIDGET:[link text](url)" (AI wrapped widget name in a Markdown link) → remove entirely
  processedBody = processedBody.replace(/^[-*]\s*WIDGET:\[.*?\]\(.*?\)\s*$/gm, '');
  // - "- WIDGET:tip:text" → <!-- WIDGET:tip:text -->
  processedBody = processedBody.replace(/^[-*]\s*WIDGET:tip:(.+)$/gm, '<!-- WIDGET:tip:$1 -->');

  // Replace partner widget placeholders with data-widget div + fallback CTA
  for (const box of CTA_BOXES) {
    const placeholder = `<!-- WIDGET:${box.partner} -->`;
    if (processedBody.includes(placeholder)) {
      const fallbackHtml = renderCtaBox(box);
      // Wrap in data-widget div so client-side JS can inject the real script widget
      const widgetHtml = `<div data-widget="${box.partner}" style="margin:32px 0;">${fallbackHtml}</div>`;
      processedBody = processedBody.replace(placeholder, widgetHtml);
    }
  }

  // Replace tip widget placeholders: <!-- WIDGET:tip:Your tip text here -->
  processedBody = processedBody.replace(
    /<!-- WIDGET:tip:(.+?) -->/g,
    (_, tipText) => {
      return `<div style="background:#FEF3C7;border-left:4px solid #F59E0B;border-radius:12px;padding:20px 24px;margin:32px 0;box-shadow:0 1px 3px rgba(0,0,0,0.1);">
  <div style="display:flex;align-items:flex-start;gap:12px;">
    <span style="font-size:28px;line-height:1;">💡</span>
    <div style="flex:1;">
      <strong style="font-size:18px;color:#92400E;display:block;margin-bottom:6px;">Pro Tip</strong>
      <p style="color:#78350F;margin:0;font-size:15px;line-height:1.5;">${tipText}</p>
    </div>
  </div>
</div>`;
    }
  );

  return frontmatter + processedBody;
}

// Select CTA boxes most relevant to the post content
function selectRelevantCtaBoxes(body: string, count: number): CtaBox[] {
  const lower = body.toLowerCase();
  const scored = CTA_BOXES.map((box) => {
    let score = 0;
    if (box.partner === "booking" && (lower.includes("hotel") || lower.includes("stay") || lower.includes("accommodation"))) score += 3;
    if (box.partner === "klook" && (lower.includes("tour") || lower.includes("activity") || lower.includes("cooking class") || lower.includes("elephant") || lower.includes("snorkeling"))) score += 3;
    if (box.partner === "12go" && (lower.includes("bus") || lower.includes("ferry") || lower.includes("train") || lower.includes("transport") || lower.includes("transfer"))) score += 3;
    if (box.partner === "saily" && (lower.includes("esim") || lower.includes("sim") || lower.includes("data") || lower.includes("internet") || lower.includes("connected"))) score += 3;
    if (box.partner === "getyourguide" && (lower.includes("tour") || lower.includes("guide") || lower.includes("excursion"))) score += 2;
    if (box.partner === "trip" && (lower.includes("flight") || lower.includes("airport") || lower.includes("fly"))) score += 3;
    // Everyone gets base score — Booking.com and Klook are always relevant for Thailand
    if (box.partner === "booking") score += 1;
    if (box.partner === "klook") score += 1;
    return { box, score };
  });

  return scored
    .sort((a, b) => b.score - a.score)
    .slice(0, count)
    .map((s) => s.box);
}

// Find character positions (end of line) after H2 headings in Markdown
function findH2Positions(body: string): number[] {
  const positions: number[] = [];
  const lines = body.split("\n");
  let charPos = 0;

  for (let i = 0; i < lines.length; i++) {
    const line = lines[i];
    charPos += line.length + 1; // +1 for newline

    if (line.match(/^## /)) {
      // Find the end of this H2's first paragraph (2+ blank lines or next H2)
      let endPos = charPos;
      for (let j = i + 1; j < lines.length && j < i + 20; j++) {
        const nextLine = lines[j];
        endPos += nextLine.length + 1;
        // Stop at next heading or after a substantial paragraph
        if (nextLine.match(/^#{1,3} /) && j > i + 3) break;
      }
      positions.push(endPos);
    }
  }

  return positions;
}

// Pick evenly spaced insert positions from available H2 positions
function pickInsertPositions(
  positions: number[],
  count: number
): number[] {
  if (positions.length <= count) return positions.slice(1); // Skip very first section

  const step = Math.floor(positions.length / (count + 1));
  return Array.from({ length: count }, (_, i) => positions[(i + 1) * step]);
}

// Check if a position in the string is inside an existing Markdown link
function isInsideLink(text: string, pos: number): boolean {
  // Look backwards for unmatched [ and forwards for ](
  const before = text.slice(Math.max(0, pos - 200), pos);
  const after = text.slice(pos, Math.min(text.length, pos + 200));
  // If there's a [ before that corresponds to a ]( after, we're inside a link
  const openBracket = before.lastIndexOf("[");
  const closeBracket = after.indexOf("](");
  return openBracket !== -1 && closeBracket !== -1 && openBracket > before.lastIndexOf("]");
}

// Check if a position is inside a code block (``` ... ```)
function isInsideCodeBlock(text: string, pos: number): boolean {
  const before = text.slice(0, pos);
  const codeBlockCount = (before.match(/```/g) || []).length;
  // If there's an odd number of ``` before the position, we're inside a code block
  return codeBlockCount % 2 === 1;
}

// Split content into frontmatter and body
function splitFrontmatter(content: string): {
  frontmatter: string;
  body: string;
} {
  const match = content.match(/^(---[\s\S]*?---\n?)([\s\S]*)$/);
  if (match) {
    return { frontmatter: match[1], body: match[2] };
  }
  return { frontmatter: "", body: content };
}
