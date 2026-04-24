import { generateContent, type AiModel } from "./ai-provider";
import { generateBlogImage } from "./image-generator";
import { scrapeTopicContext } from "./scraper";
import { getSeasonalHook } from "./seasonal-context";
import { loadPipelineConfig } from "./pipeline-config";
import fs from "fs";
import path from "path";

// -------------------------------------------------------------------
// Types
// -------------------------------------------------------------------

export type PostCategory =
  | "city-guide"
  | "food"
  | "activities"
  | "practical"
  | "budget"
  | "seasonal"
  | "islands";

export interface BlogPostOptions {
  topic?: string;         // Override auto-selected topic
  category?: PostCategory;
  model?: AiModel;
  generateImage?: boolean;
  scrapeContext?: boolean; // Whether to scrape live data for context
  scrapeUrls?: string[]; // Specific URLs to scrape as priority sources
}

interface QueuedTopic {
  topic: string;
  category: PostCategory;
  targetKeyword: string;
  searchVolume: number;
  scrapeUrls: string[];
  priority: number;
}

export interface GeneratedPost {
  title: string;
  slug: string;
  date: string;
  author: { name: string };
  category: PostCategory;
  tags: string[];
  image: string;
  imageBase64?: string; // Base64-encoded image data for GitHub commit (not written to disk)
  description: string;
  featured: boolean;
  readingTime: number;
  lastUpdated: string;
  sources: Array<{ name: string; url: string }>;
  content: string; // Full Markdown with frontmatter
  scrapeData?: string; // Raw scraped reference data for fact-checking
}

export interface TranslatedPost {
  locale: string;
  content: string; // Full Markdown with translated frontmatter
}

// -------------------------------------------------------------------
// Topic bank — Thailand travel topics rotating across categories
// -------------------------------------------------------------------

const TOPIC_BANK: Record<PostCategory, string[]> = {
  "city-guide": [
    "Hidden Gems in Chiang Mai That Most Tourists Miss",
    "Bangkok Beyond Temples: A Local's Guide to the City",
    "Chiang Rai Day Trip: White Temple and Golden Triangle",
    "Phuket Old Town Walking Tour: Art, Food & History",
    "Pai Thailand: The Mountain Town Worth the Winding Road",
    "Ayutthaya Day Trip from Bangkok: Ancient Ruins Guide",
    "Hua Hin Travel Guide: Thailand's Royal Beach Resort",
    "Kanchanaburi Day Trip: Bridge on the River Kwai",
  ],
  food: [
    "Best Street Food Markets in Bangkok You Must Visit",
    "Thai Cooking Classes Worth Taking: Bangkok vs Chiang Mai",
    "Guide to Thai Regional Cuisines: North vs South vs Northeast",
    "Must-Try Thai Dishes for First-Time Visitors",
    "Vegan and Vegetarian Food Guide to Thailand",
    "Thailand's Best Night Markets for Food Lovers",
    "Tom Yum vs Tom Kha: Understanding Thailand's Iconic Soups",
    "Pad Thai: The Tourist Trap vs The Real Thing",
  ],
  activities: [
    "Best Snorkeling Spots in Thailand: Ranked by Water Clarity",
    "Ethical Elephant Sanctuaries in Thailand: Full Guide",
    "Rock Climbing in Railay: Thailand's Most Dramatic Setting",
    "Muay Thai in Thailand: Where to Watch and Where to Train",
    "Zip-lining in Chiang Mai: Which Operator Is Best?",
    "Thai Massage: Guide to Authentic Treatments and Prices",
    "Kayaking in Phang Nga Bay: Day Trip vs Multi-Day",
    "Scuba Diving in the Similan Islands: When to Go",
  ],
  practical: [
    "Thailand Visa Changes 2026: Complete Guide for Tourists",
    "Getting Around Thailand by Train: Routes, Prices & Tips",
    "Thailand Travel SIM Card vs eSIM: Which Is Better in 2026?",
    "Thailand Scams to Watch Out For (And How to Avoid Them)",
    "Thailand Travel Insurance: What You Actually Need",
    "Money in Thailand: ATMs, Exchange Rates & Tipping Guide",
    "Thailand Health and Vaccinations: What Doctors Recommend",
    "Airport to City: Best Transfer Options for Bangkok, Phuket & Chiang Mai",
  ],
  budget: [
    "Thailand on $30 Per Day: A Realistic Budget Travel Guide",
    "Free Things to Do in Bangkok (No Entry Fee Needed)",
    "Cheapest Way to Travel Between Thai Cities",
    "Budget Guesthouses vs Hostels in Thailand: Honest Comparison",
    "How to Eat Like a Local in Thailand for Under $5 a Day",
    "Free Things to Do in Phuket Beyond the Beaches",
    "Thailand Budget vs Comfort Travel: What's Worth Splurging On",
  ],
  seasonal: [
    "Songkran Festival Guide 2026: Thailand's Epic Water Festival",
    "Best Thai Islands to Visit During Rainy Season",
    "Thailand in November: The Best Month to Visit?",
    "Loy Krathong Festival: Where to Watch the Lantern Release",
    "Thailand Dry Season vs Wet Season: Month by Month Guide",
    "Christmas and New Year in Thailand: Where to Celebrate",
    "Thailand's King Cobra Season: What Travelers Need to Know",
  ],
  islands: [
    "Koh Lipe vs Koh Lanta: Which Island Is Right for You?",
    "Island Hopping Guide: Southern Thailand in 2 Weeks",
    "Koh Samui vs Koh Phangan: The Definitive Comparison",
    "Koh Tao for Divers: Courses, Sites & Costs in 2026",
    "Koh Chang: Thailand's Underrated Eastern Island",
    "James Bond Island Day Trip: Worth It or Tourist Trap?",
    "Best Islands for Families in Thailand: Kid-Friendly Guide",
    "Koh Yao Noi: The Island That Feels Like Thailand Used To",
  ],
};

function buildFallbackTopicBank(country: string): Record<PostCategory, string[]> {
  if (country.toLowerCase() === "thailand") return TOPIC_BANK;

  return {
    "city-guide": [
      `Best Places to Visit in ${country}: First-Time Travel Guide`,
      `${country} Itinerary: How to Plan 7, 10 and 14 Days`,
      `Hidden Gems in ${country} That Most Travelers Miss`,
      `${country} Travel Guide: Regions, Routes and Practical Tips`,
    ],
    food: [
      `What to Eat in ${country}: Local Food Guide for Travelers`,
      `${country} Street Food and Markets: What to Try First`,
      `Vegetarian and Vegan Food in ${country}: Practical Guide`,
      `${country} Food Costs: Restaurants, Markets and Budget Meals`,
    ],
    activities: [
      `Best Things to Do in ${country}: Experiences Worth Booking`,
      `${country} Tours and Day Trips: What Is Worth It`,
      `Outdoor Adventures in ${country}: Nature, Culture and Practical Tips`,
      `${country} Attractions Guide: What to Book in Advance`,
    ],
    practical: [
      `${country} Visa Requirements 2026: Complete Tourist Guide`,
      `Getting Around ${country}: Transport, Routes and Costs`,
      `${country} eSIM and Internet Guide for Travelers`,
      `${country} Travel Safety: Scams, Health and Practical Advice`,
    ],
    budget: [
      `${country} Travel Budget 2026: Real Daily Costs`,
      `${country} on a Budget: Where to Save and Where to Spend`,
      `Cheap Places to Stay in ${country}: Hostels, Guesthouses and Hotels`,
      `How Much Does ${country} Cost? Budget vs Comfort Travel`,
    ],
    seasonal: [
      `Best Time to Visit ${country}: Month-by-Month Travel Guide`,
      `${country} Weather Guide: Seasons, Packing and Regional Differences`,
      `${country} Festivals and Events: When to Plan Your Trip`,
      `${country} in Peak Season vs Low Season: Honest Comparison`,
    ],
    islands: [
      `Best Beaches and Islands in ${country}: Where to Go First`,
      `${country} Coast Guide: Beach Towns, Islands and Routes`,
      `${country} Island Hopping Guide: Routes, Costs and Tips`,
      `Best Beach Destinations in ${country} for Different Travel Styles`,
    ],
  };
}

// Supported translation locales (English is source)
const TRANSLATION_LOCALES = ["nl", "zh", "de", "fr", "ru", "ja", "ko", "th"] as const;
export type TranslationLocale = (typeof TRANSLATION_LOCALES)[number];

// -------------------------------------------------------------------
// Topic queue
// -------------------------------------------------------------------

// Fetch existing blog slugs from GitHub (authoritative source, not stale filesystem)
async function getExistingSlugsFromGitHub(): Promise<Set<string>> {
  const slugs = new Set<string>();
  try {
    const token = process.env.GITHUB_TOKEN;
    if (!token) throw new Error("No GITHUB_TOKEN");

    // Resolve per-site repo from pipeline.config.json — critical for sister
    // sites, otherwise every site would be checking (and committing to!)
    // the Thailand repo.
    const cfg = loadPipelineConfig();
    const owner = process.env.PIPELINE_REPO_OWNER || cfg.repoOwner;
    const name = process.env.PIPELINE_REPO_NAME || cfg.repoName;

    const res = await fetch(
      `https://api.github.com/repos/${owner}/${name}/contents/content/blog/en`,
      {
        headers: {
          Authorization: `token ${token}`,
          Accept: "application/vnd.github.v3+json",
        },
        signal: AbortSignal.timeout(8000),
      }
    );
    if (!res.ok) throw new Error(`GitHub API: ${res.status}`);

    const files = (await res.json()) as Array<{ name: string }>;
    for (const f of files) {
      if (f.name.endsWith(".md")) {
        slugs.add(f.name.replace(".md", ""));
      }
    }
    console.log(`[content-generator] Found ${slugs.size} existing slugs from GitHub`);
  } catch (err) {
    console.warn("[content-generator] GitHub slug check failed, falling back to filesystem:", err);
    // Fallback to local filesystem
    const enDir = path.join(process.cwd(), "content", "blog", "en");
    if (fs.existsSync(enDir)) {
      for (const f of fs.readdirSync(enDir)) {
        if (f.endsWith(".md")) slugs.add(f.replace(".md", ""));
      }
    }
  }
  return slugs;
}

async function getNextQueuedTopic(): Promise<(QueuedTopic & { category: PostCategory }) | null> {
  try {
    const queuePath = path.join(process.cwd(), "content", "topic-queue.json");
    if (!fs.existsSync(queuePath)) return null;

    const queue = JSON.parse(fs.readFileSync(queuePath, "utf-8")) as { topics: QueuedTopic[] };

    // Check GitHub for existing slugs (not stale local filesystem)
    const existingSlugs = await getExistingSlugsFromGitHub();

    // Sort by priority (1 first), then by searchVolume (highest first)
    const sorted = [...queue.topics].sort((a, b) => {
      if (a.priority !== b.priority) return a.priority - b.priority;
      return b.searchVolume - a.searchVolume;
    });

    // Find first topic not yet published
    // Match by significant words from targetKeyword AND topic title against existing slugs
    const STOP_WORDS = new Set(["in", "the", "a", "an", "of", "for", "to", "and", "or", "is", "vs", "at", "on", "per", "your", "you", "best", "top", "guide", "complete", "ultimate", "2026", "2025"]);
    const existingSlugList = [...existingSlugs];

    // Normalize word for matching: strip possessives, parentheses, and basic plural stemming
    const normalize = (w: string): string => {
      let n = w.replace(/[()]/g, "").replace(/'s$/i, "");
      // Basic plural stemming: itineraries→itinerary, classes→class, dishes→dish
      if (n.endsWith("ies")) n = n.slice(0, -3) + "y";
      else if (n.endsWith("es") && n.length > 4) n = n.slice(0, -2);
      else if (n.endsWith("s") && !n.endsWith("ss") && n.length > 3) n = n.slice(0, -1);
      return n;
    };

    // Check if a normalized word matches a slug segment (exact segment match only, no substring)
    const wordMatchesSlug = (word: string, slug: string): boolean => {
      const nWord = normalize(word);
      return slug.split("-").some((seg) => normalize(seg) === nWord);
    };

    for (const item of sorted) {
      // Extract significant words from keyword
      const keywordWords = item.targetKeyword
        .toLowerCase()
        .split(/\s+/)
        .filter((w) => !STOP_WORDS.has(w) && w.length > 1);

      // Also extract significant words from topic title (catches more variations)
      const topicWords = item.topic
        .toLowerCase()
        .split(/[\s:—\-,()]+/)
        .filter((w) => !STOP_WORDS.has(w) && w.length > 2);

      // Check if any existing slug matches:
      // - Keyword match: need ALL keyword words to match (exact topic duplicate)
      // - Topic match: 4+ words AND 50%+ ratio (broader title match)
      // - Skip matching for very short keywords (1 word) — too many false positives
      const alreadyPublished = existingSlugList.some((slug) => {
        const keywordMatchCount = keywordWords.filter((word) => wordMatchesSlug(word, slug)).length;
        const keywordMatchRatio = keywordWords.length > 0 ? keywordMatchCount / keywordWords.length : 0;
        const topicMatchCount = topicWords.filter((word) => wordMatchesSlug(word, slug)).length;
        const topicMatchRatio = topicWords.length > 0 ? topicMatchCount / topicWords.length : 0;
        // For short keywords (1-2 words), require exact match
        if (keywordWords.length <= 2) {
          return keywordMatchRatio === 1.0;
        }
        return (keywordMatchRatio >= 0.85) || (topicMatchCount >= 4 && topicMatchRatio >= 0.5);
      });

      if (!alreadyPublished) {
        console.log(`[content-generator] Queue: "${item.topic}" not yet published (keywords: ${keywordWords.join(",")})`);
        return item;
      } else {
        console.log(`[content-generator] Queue: "${item.topic}" already published (keywords: ${keywordWords.join(",")})`);
      }
    }

    return null; // All queue topics published
  } catch (err) {
    console.warn("[content-generator] Failed to read topic queue:", err);
    return null;
  }
}

// -------------------------------------------------------------------
// Topic selection
// -------------------------------------------------------------------

// Auto-select a site-specific travel topic, avoiding already-published ones
export async function selectTopic(
  existingTitles: string[] = [],
  preferredCategory?: PostCategory
): Promise<{ topic: string; category: PostCategory; scrapeUrls?: string[] }> {
  // Check priority queue first
  const queued = await getNextQueuedTopic();
  if (queued) {
    console.log(`[content-generator] Using queued topic: "${queued.topic}" (priority ${queued.priority}, volume: ${queued.searchVolume})`);
    return { topic: queued.topic, category: queued.category, scrapeUrls: queued.scrapeUrls };
  }

  const cfg = loadPipelineConfig();
  const topicBank = buildFallbackTopicBank(cfg.country);
  const category =
    preferredCategory ||
    randomFrom(Object.keys(topicBank) as PostCategory[]);

  const candidates = topicBank[category].filter(
    (t) => !existingTitles.some((existing) => existing.toLowerCase() === t.toLowerCase())
  );

  if (candidates.length === 0) {
    // All topics in this category are used — pick from a different one
    const otherCategory = randomFrom(
      (Object.keys(topicBank) as PostCategory[]).filter((c) => c !== category)
    );
    const otherCandidates = topicBank[otherCategory].filter(
      (t) =>
        !existingTitles.some(
          (existing) => existing.toLowerCase() === t.toLowerCase()
        )
    );
    const topic = randomFrom(otherCandidates.length > 0 ? otherCandidates : topicBank[otherCategory]);
    return { topic, category: otherCategory };
  }

  return { topic: randomFrom(candidates), category };
}

// -------------------------------------------------------------------
// Main blog post generation
// -------------------------------------------------------------------

export async function generateBlogPost(
  options: BlogPostOptions = {}
): Promise<GeneratedPost> {
  const model = options.model || "grok-writer";
  const doScrape = options.scrapeContext !== false;
  const doImage = options.generateImage !== false;

  // 1. Select topic
  let topic = options.topic;
  let category = options.category;
  let scrapeUrls = options.scrapeUrls;

  if (!topic) {
    const selected = await selectTopic([], category);
    topic = selected.topic;
    category = selected.category;
    if (selected.scrapeUrls) scrapeUrls = selected.scrapeUrls;
  } else if (!category) {
    category = detectCategory(topic);
  }

  console.log(`[content-generator] Topic: "${topic}" | Category: ${category}`);

  // 2. Scrape context (optional but recommended for E-E-A-T)
  let scrapeData: string | null = null;
  if (doScrape) {
    try {
      scrapeData = await scrapeTopicContext(topic, scrapeUrls);
      console.log(
        `[content-generator] Scraped ${scrapeData.length} chars of context`
      );
    } catch (err) {
      console.warn("[content-generator] Context scrape failed:", err);
    }
  }

  // 3. Load internal links from sitemap
  const sitemapLinks = await loadSitemapLinks();

  // 4. Build prompt and generate content
  const prompt = buildPrompt(topic, category!, sitemapLinks, scrapeData);
  const rawResponse = await generateContent(prompt, {
    model,
    maxTokens: 16384,
    temperature: 0.5, // Lower temp = more factual, less hallucination
  });

  // 5. Parse the generated Markdown + frontmatter
  const post = parseGeneratedPost(rawResponse, topic, category!);

  // Pass scrape data through for downstream fact-checking
  if (scrapeData) {
    post.scrapeData = scrapeData;
  }

  // 6. Generate featured image (base64 stored on post; caller commits via GitHub API)
  if (doImage) {
    try {
      const imageResult = await generateBlogImage(
        post.title,
        post.category,
        post.slug
      );
      post.image = imageResult.publicPath;
      post.imageBase64 = imageResult.base64;
      console.log(`[content-generator] Image generated: ${imageResult.publicPath}`);
    } catch (err) {
      console.warn("[content-generator] Image generation failed:", err);
      // Fallback image path — will be replaced manually
      post.image = `/images/blog/${post.slug}.webp`;
    }
  }

  return post;
}

// -------------------------------------------------------------------
// Translation
// -------------------------------------------------------------------

// Translate a generated post to a target locale
// Preserves all Markdown structure, URLs, image paths, and slug
export async function translatePost(
  post: GeneratedPost,
  targetLocale: TranslationLocale,
  model: AiModel = "grok-translator"
): Promise<TranslatedPost> {
  const localeNames: Record<TranslationLocale, string> = {
    nl: "Dutch",
    zh: "Simplified Chinese",
    de: "German",
    fr: "French",
    ru: "Russian",
    ja: "Japanese",
    ko: "Korean",
    th: "Thai",
  };

  const localeName = localeNames[targetLocale];

  const prompt = `You are a professional travel content translator specializing in Thai tourism content.

Translate the following blog post from English to ${localeName}.

STRICT RULES:
1. Translate ALL body text naturally and idiomatically — do NOT be literal
2. Translate: title, description, tags (in the YAML frontmatter), and all Markdown body content
3. Keep UNCHANGED: slug, date, author, category, image path, all URLs (both internal links and external affiliate links), lastUpdated, sources (names and URLs)
4. Preserve ALL Markdown formatting: headers, bold, italic, tables, blockquotes, code blocks, links
5. Keep affiliate link text in ${localeName} but keep the URL exactly as-is
6. Do NOT add or remove any content — translate only, do not summarize
7. Respond ONLY with the complete translated Markdown — no explanation, no preamble

BLOG POST TO TRANSLATE:
${post.content}`;

  const translatedContent = await generateContent(prompt, {
    model,
    maxTokens: 16384,
    temperature: 0.3, // Lower temp for translation accuracy
  });

  return {
    locale: targetLocale,
    content: translatedContent.trim(),
  };
}

// Translate a post to ALL 7 non-English locales
export async function translatePostToAllLocales(
  post: GeneratedPost,
  model: AiModel = "grok-translator"
): Promise<TranslatedPost[]> {
  const results: TranslatedPost[] = [];

  // Translate sequentially to avoid rate limits
  for (const locale of TRANSLATION_LOCALES) {
    try {
      console.log(`[content-generator] Translating to ${locale}...`);
      const translated = await translatePost(post, locale, model);
      results.push(translated);
    } catch (err) {
      console.error(`[content-generator] Translation to ${locale} failed:`, err);
    }
  }

  return results;
}

// -------------------------------------------------------------------
// Sitemap internal link loader
// -------------------------------------------------------------------

async function loadSitemapLinks(): Promise<string> {
  const cfg = loadPipelineConfig();
  const siteUrl = `https://${cfg.hostname}`;

  try {
    // Try to read from local sitemap.xml file first (faster than HTTP)
    const localSitemapPath = path.join(
      process.cwd(),
      "public",
      "sitemap.xml"
    );
    let xml: string;

    if (fs.existsSync(localSitemapPath)) {
      xml = fs.readFileSync(localSitemapPath, "utf-8");
    } else {
      // Fallback to HTTP fetch
      const response = await fetch(`${siteUrl}/sitemap.xml`, {
        signal: AbortSignal.timeout(10000),
      });
      if (!response.ok) return buildFallbackInternalLinks(cfg);
      xml = await response.text();
    }

    const urlMatches = xml.match(/<loc>([^<]+)<\/loc>/g) || [];
    const allUrls = urlMatches
      .map((m) => m.replace(/<\/?loc>/g, ""))
      .filter((url) => url.startsWith(siteUrl))
      // Keep only English (no locale prefix)
      .filter((url) => {
        const path = url.replace(siteUrl, "");
        return !path.match(/^\/(nl|de|fr|zh|ja|ko|ru)\//);
      });

    // Group by section and limit per section
    const groups: Record<string, string[]> = {};
    for (const url of allUrls) {
      const p = url.replace(siteUrl, "");
      if (!p || p === "/") continue;
      const section = p.split("/")[1] || "other";
      if (!groups[section]) groups[section] = [];
      if (groups[section].length < 15) {
        groups[section].push(url);
      }
    }

    // Build descriptive anchor text from URL structure
    const buildAnchor = (url: string, section: string): string => {
      const parts = url.split("/").filter(Boolean);
      const lastPart = parts[parts.length - 1] || section;
      const name = lastPart.replace(/-/g, " ").replace(/\b\w/g, (c: string) => c.toUpperCase());
      // Add section context for richer anchor text
      const sectionLabels: Record<string, string> = {
        city: "travel guide",
        islands: "island guide",
        food: "food guide",
        blog: "",
        compare: "comparison",
        region: "region guide",
        visa: "",
        "practical-info": "",
      };
      const label = sectionLabels[section];
      if (label && !name.toLowerCase().includes("guide") && !name.toLowerCase().includes(section)) {
        return `${name} ${label}`;
      }
      return name;
    };

    let result = "";
    for (const [section, urls] of Object.entries(groups)) {
      if (urls.length === 0) continue;
      result += `${section}:\n`;
      for (const url of urls) {
        const anchor = buildAnchor(url, section);
        result += `- [${anchor}](${url})\n`;
      }
      result += "\n";
    }
    return result || buildFallbackInternalLinks(cfg);
  } catch {
    return buildFallbackInternalLinks(cfg);
  }
}

// Fallback internal links if sitemap can't be read
function buildFallbackInternalLinks(cfg = loadPipelineConfig()): string {
  const siteUrl = `https://${cfg.hostname}`;
  return `
core:
- [${cfg.country} travel guide](${siteUrl}/)
- [${cfg.country} blog](${siteUrl}/blog/)

practical-info:
- [${cfg.country} visa guide](${siteUrl}/visa/)
- [${cfg.country} weather guide](${siteUrl}/weather/)
- [Travel insurance for ${cfg.country}](${siteUrl}/travel-insurance/)
- [${cfg.country} eSIM guide](${siteUrl}/esim/)

planning:
- [Transport in ${cfg.country}](${siteUrl}/transport/)
- [Food in ${cfg.country}](${siteUrl}/food/)
`;
}

// -------------------------------------------------------------------
// Prompt builder
// -------------------------------------------------------------------

function buildPrompt(
  topic: string,
  category: PostCategory,
  sitemapLinks: string,
  scrapeData: string | null
): string {
  const cfg = loadPipelineConfig();
  const siteUrl = `https://${cfg.hostname}`;
  const authorName = `${cfg.siteName} Team`;
  const today = new Date().toISOString().split("T")[0];
  const year = new Date().getFullYear();

  let widgetReference: string = '';
  try {
    const refPath = path.join(process.cwd(), 'content', 'writer-reference.md');
    if (fs.existsSync(refPath)) {
      widgetReference = fs.readFileSync(refPath, 'utf-8');
    }
    // Also load the full affiliate reference with all links and widget scripts
    const affRefPath = path.join(process.cwd(), 'content', 'affiliate-reference.txt');
    if (fs.existsSync(affRefPath)) {
      widgetReference += '\n\n---\nFULL AFFILIATE & WIDGET REFERENCE:\n' + fs.readFileSync(affRefPath, 'utf-8');
    }
  } catch { /* ignore */ }

  const categoryInstructions: Record<PostCategory, string> = {
    "city-guide":
      "Write an in-depth city/destination guide. Cover neighborhoods, top sights, where to eat, where to stay, and practical tips. Structure chronologically or by area. Include a 1-day and 3-day itinerary suggestion.",
    food: `Write a comprehensive ${cfg.country} food guide. Explain the dish/cuisine with cultural context, regional variations, where to find the best versions, and how to order like a local. Include a comparison table of similar dishes.`,
    activities:
      "Write a detailed activities/experiences guide. Compare options (operators, prices, locations), give honest pros/cons, and include a practical booking guide at the end.",
    practical:
      "Write a thorough practical travel guide. Cover all scenarios, give exact prices and steps, and anticipate common questions. Accuracy is critical — cite official sources where possible.",
    budget:
      "Write a realistic budget travel guide with exact costs in local currency and USD. Include sample day budgets, money-saving tips, and where to splurge vs. save.",
    seasonal:
      "Write a seasonal/festival travel guide. Cover what happens, when, where the best locations are, and how to plan. Include practical tips for crowds and booking.",
    islands:
      "Write a comprehensive island guide or comparison. Cover beaches, activities, accommodation options, how to get there, and who each island suits best.",
  };

  const seasonal = cfg.country.toLowerCase() === "thailand" ? getSeasonalHook() : null;
  const seasonalContext = seasonal ? `\nSEASONAL CONTEXT (use this to ground the article in the actual current moment — but never force a seasonal hook into a topic where it doesn't belong):
- Current month: ${seasonal.monthEn}
- Season in Thailand: ${seasonal.seasonEn}
- Weather in plain English: ${seasonal.weatherSummary.replace('Het is nu', 'It is now').replace(/\b(maart|april|mei|juni|juli|augustus|september|oktober|november|december|januari|februari)\b/g, seasonal.monthEn)}
- Relevant events / hooks for the next ~60 days:
${seasonal.upcomingEvents.replace(/\(volgende maand\)/g, '(next month)').replace(/\(([a-z]+)\)/g, `(${seasonal.monthEn})`)}
\n` : `\nSEASONAL CONTEXT:
- Current month: ${new Date().toLocaleString("en-US", { month: "long" })}
- Destination: ${cfg.country}
- Use current-season advice only when it is directly relevant to the topic and supported by reference data or a cited source.
\n`;

  const contextSection: string = scrapeData
    ? `\nREFERENCE DATA — THIS IS YOUR PRIMARY SOURCE OF TRUTH:
Use ONLY the facts, prices, statistics, and details from the data below. If a fact is NOT in this reference data, do NOT include it — leave it out rather than guess.
Every price, statistic, and specific claim MUST come from this data or a cited external source. When in doubt, say "prices vary" rather than inventing a number.
CRITICAL: Any proper noun (restaurant name, hotel name, person's name, shop name) that does NOT appear in the data below is FORBIDDEN. Do not use names from your training data. If you want to mention a specific venue, it must be named in the data below — otherwise describe it generically.

${scrapeData.slice(0, 6000)}\n`
    : `\nNO REFERENCE DATA AVAILABLE: Write only in general terms. Do NOT name any specific restaurants, hotels, venues, or people. Use generic descriptions only (e.g. "a riverside restaurant", "a local guesthouse", "a market vendor").\n`;

  return `You are a senior ${cfg.country} travel writer for ${cfg.hostname}, a comprehensive ${cfg.country} travel resource.
You and your team research ${cfg.country} travel in depth and write practical, field-tested travel advice. Use first-hand language only when it is supported by the reference data or can be phrased as team research.

Write a comprehensive, SEO-optimized blog post about: "${topic}"

${categoryInstructions[category]}

---

CONTENT REQUIREMENTS:

1. FRONTMATTER (YAML):
Generate valid YAML frontmatter with these exact fields:
\`\`\`yaml
---
title: "The Full Post Title"
slug: "url-friendly-slug"
date: "${today}"
author:
  name: "${authorName}"
category: "${category}"
tags: ["tag1", "tag2", "tag3", "tag4"]
image: "/images/blog/SLUG.webp"
description: "Compelling meta description under 155 characters"
featured: false
readingTime: 8
lastUpdated: "${today}"
sources:
  - name: "Official ${cfg.country} tourism information"
    url: "replace-with-relevant-official-tourism-url"
  - name: "Lonely Planet ${cfg.country}"
    url: "https://www.lonelyplanet.com/search?q=${encodeURIComponent(cfg.country)}"
---
\`\`\`
Replace SLUG in the image path with the actual slug value.
Replace any placeholder source URLs with real, relevant URLs before output. Add 2-3 more relevant sources. Include 4-6 specific, relevant tags.

2. OPENING PARAGRAPH:
Hook the reader immediately. Start with a compelling fact, scene-setting description, or provocative question. **Bold the primary keyword** on first mention. 2-3 sentences max before the Key Takeaways table.

3. KEY TAKEAWAYS TABLE (immediately after intro):
\`\`\`markdown
## Key Takeaways

| Question | Answer |
|----------|--------|
| **What is the best time to visit?** | Answer with **bold keyword** |
| **How much does it cost?** | Average costs in THB and USD |
| **How do I get there?** | Best transport option |
| **Is it safe?** | Honest safety assessment |
| **What should I book in advance?** | Specific recommendations |
\`\`\`
5-7 rows covering the key questions readers have.

4. BODY SECTIONS (8-10 numbered H2 sections):
Each section must have:
- Numbered H2: ## 1. Section Title
- 2 opening paragraphs with **bold keywords** on first mention
- 2 H3 subheadings (### Subheading) with 1-2 paragraphs each
- At least half the sections: a bullet list with 3-5 items. Start each item with a bold descriptive label like: **Best Spot:** or **Pro Tip:** or **Budget Option:** (use a REAL descriptive label, NEVER write the literal words "Bold Label")
- First-person experience signals ("When we visited...", "In our experience...", "During our time in...")

5. DID YOU KNOW CALLOUTS (2-3 throughout the article):
\`\`\`markdown
> **Did You Know?** The actual interesting fact with a specific statistic here.
>
> *Source: [Source Name](https://source-url.com)*
\`\`\`

6. COMPARISON TABLE (at least one):
\`\`\`markdown
| Option | Best For | Cost | Rating |
|--------|----------|------|--------|
| **Option A** | Description | THB X | ⭐⭐⭐⭐⭐ |
| **Option B** | Description | THB X | ⭐⭐⭐⭐ |
\`\`\`

7. WIDGET PLACEMENT (MANDATORY — place 3-5 widgets throughout the article):
Place these HTML comment placeholders in your output where you want a styled widget box to appear.
They will be automatically replaced with beautiful styled components.

CRITICAL FORMAT RULE: ALWAYS use EXACTLY the HTML comment syntax shown below.
NEVER write WIDGET as plain text, a list item, or markdown. NEVER write "- WIDGET:booking" or "WIDGET:booking" on its own.
The ONLY correct format is:

<!-- WIDGET:booking -->

Place the widget on its own line, with a blank line above and below it. Example of correct placement:

...end of a paragraph about hotels in Chiang Mai.

<!-- WIDGET:booking -->

## 3. Next Section Title

Available widgets (copy EXACTLY as shown, including the comment syntax):
- <!-- WIDGET:booking --> — after mentioning hotels, accommodation, where to stay
- <!-- WIDGET:klook --> — after mentioning tours, activities, cooking classes, day trips
- <!-- WIDGET:getyourguide --> — after mentioning guided tours, food tours, walking tours
- <!-- WIDGET:12go --> — after mentioning buses, trains, ferries, transport between cities
- <!-- WIDGET:saily --> — after mentioning SIM cards, eSIM, internet, staying connected
- <!-- WIDGET:trip --> — after mentioning flights, airports, flying
- <!-- WIDGET:tip:Your practical tip text here --> — for non-commercial travel advice

RULES:
- Place widgets AFTER a relevant paragraph, before the next section
- Never place two widgets back-to-back — always have text between them
- Minimum: 1x booking + 1x activity (klook or getyourguide) + 1 other
- Maximum: 5 widgets total
- The tip widget text should be a short, practical piece of advice (1-2 sentences max)
- ALWAYS use HTML comment syntax <!-- WIDGET:type --> — NEVER write WIDGET as plain text, list item, or markdown

8. FAQ SECTION (end of article — optimized for Google rich snippets):
\`\`\`markdown
## Frequently Asked Questions

### Question one here?
Answer here in 2-3 concise sentences. Include a specific detail or number.

### Question two here?
Answer here. Link to a relevant internal page for more detail.
\`\`\`
5-7 questions matching REAL Google "People Also Ask" queries for this topic. Write questions as users would actually type them (e.g., "How much does it cost to visit Koh Samui?" not "Cost information"). Keep answers concise (2-4 sentences) but include at least one specific fact per answer.

9. CONCLUSION:
Summarize key points, include a clear CTA linking to a relevant ${cfg.hostname} page, and a trust statement.

---

INTERNAL LINKING (critical for SEO — MANDATORY: include 10-15 internal links naturally woven throughout the body):
- Spread links EVENLY across ALL sections — every H2 section should have at least 1 internal link
- Use DESCRIPTIVE, keyword-rich anchor text — e.g., "our Bangkok travel guide" or "top things to do in Chiang Mai", NOT just "Bangkok" or "click here"
- Vary anchor text: mix exact city names with longer phrases like "plan your trip to [city]" or "read our [topic] guide"
- EVERY internal link MUST have a full URL starting with ${siteUrl}/. If you're unsure of the URL, use the closest match from the sitemap below or omit the link entirely.
- Link city/destination mentions to relevant destination guide pages when available.
- Link food mentions to relevant food pages when available.
- Link beach/island mentions to relevant coast or island pages when available.
- Link visa/entry mentions to a relevant visa or practical guide page.
- Link transport mentions to a relevant transport or practical info page.
- Link eSIM/connectivity mentions to the site's eSIM guide if it exists.
- Link to RELEVANT blog posts from the sitemap — e.g., if discussing budget, link to a budget blog post
- DO NOT link the same URL twice with the same anchor text — vary it

Available internal links (use the most relevant ones):
${sitemapLinks}
${widgetReference ? `\nWRITER REFERENCE (additional context):\n${widgetReference}\n` : ''}
---

E-E-A-T SIGNALS (critical for Google trust and AdSense approval):
- EXPERIENCE: Every 2-3 sections, include a specific first-person observation ("When we explored...", "Our team spent a week...", "During our last visit in [month]..."). Make these SPECIFIC, not generic — mention weather, crowds, a particular moment.
- EXPERTISE: Use precise, accurate details — prices in THB and USD, distances in km, travel times. Show deep knowledge of the topic.
- AUTHORITATIVENESS: Cite 3-5 credible external sources throughout (TAT, Lonely Planet, local news, UNESCO, official sites). Each "Did You Know" callout MUST have a verifiable source.
- TRUSTWORTHINESS: Be honest about negatives, tourist traps, and when something is overrated. Include a "What to avoid" or "Common mistakes" paragraph. Transparency builds trust.
- Every statistic MUST have a source cited inline or in a callout.
- DISCLOSURE: If the article mentions booking anything, include one sentence like: "We may earn a small commission from bookings made through our links, at no extra cost to you. This helps us keep creating free travel guides."

EXTERNAL LINKING:
Include 3-5 credible external links (official tourism boards, Lonely Planet, reputable local news, UNESCO, official venue websites). Open external links in new tabs with target="_blank".

---

ANTI-HALLUCINATION RULES (CRITICAL — FOLLOW EXACTLY):
1. NEVER invent prices, statistics, percentages, or specific numbers. Use ONLY data from the REFERENCE DATA section below or well-known public facts.
2. If you don't have a specific price from the reference data, write "prices vary" or "check the latest prices" with a link. Do NOT guess.
3. NEVER fabricate quotes, testimonials, or specific venue details you're unsure about.
4. PROPER NOUNS ARE FORBIDDEN unless they appear verbatim in the REFERENCE DATA above. This means: restaurant names, hotel names, bar names, shop names, guide names, staff names, chef names — if it's not in the reference data, do NOT name it. Write "a local noodle shop near the market" instead of inventing "Mama's Noodle House". Write "our guide" instead of inventing a name like "Krishna" or "Somchai". This rule has NO exceptions.
5. Specific addresses and opening hours MUST come verbatim from the reference data. If not in the data, omit them or link to Google Maps generically.
6. For historical facts and cultural context, use only widely known, verifiable information.
7. If the reference data contradicts common assumptions, ALWAYS prefer the reference data.
8. Every "Did You Know" callout MUST have a real, verifiable source link — not a made-up one.
9. Be honest: "Based on our research..." is better than fabricating a firsthand experience you don't have data for.
10. NEVER output meta-instructions, content strategy notes, or behind-the-scenes commentary. Your output must be ONLY the blog post that a reader would see. Do NOT include sections like "Affiliate Integration Points", "Internal linking notes", or "Examples in context".
11. NEVER mention "Booking.com", "Klook", "GetYourGuide", "12Go Asia", "Saily", or "Trip.com" by brand name. Just describe the travel action naturally — the brand names and links are added automatically after your writing.

STATISTICS & NUMBERS FACT-CHECK (MANDATORY — apply to EVERY number you write):
12. Before writing ANY statistic, percentage, or number, ask yourself: "Can I name the EXACT source this comes from?" If not, DO NOT include it.
13. FORBIDDEN number patterns — these are commonly hallucinated and MUST NOT appear unless from reference data:
    - "X% of travelers/tourists/visitors" (e.g., "45% of solo travelers are women") — these survey numbers are almost always fabricated
    - "X million visitors per year" — only use the EXACT official TAT number if you know it with certainty (e.g., 2019: 39.8M). Do NOT round or approximate.
    - "X% cheaper/more expensive than..." — unless you have both prices from reference data to calculate
    - "ranked #X in the world" — only if you can name the ranking organization
    - "X out of Y travelers recommend..." — satisfaction surveys are never general knowledge
    - "dating back X years/centuries" — only for well-documented historical facts (e.g., Ayutthaya founded 1351)
14. SAFE statistics you CAN use (well-documented public knowledge):
    - Official currency, capital, major regions, and UNESCO sites when well documented
    - Specific UNESCO World Heritage Sites and their inscription years
    - Geographic facts from official or widely cited sources
15. When in doubt, describe QUALITATIVELY instead of QUANTITATIVELY. Write "${cfg.country} is a popular destination for..." instead of inventing a fake visitor number. Write "many solo travelers report feeling safe" instead of fabricating a percentage.
16. Every "Did You Know" callout MUST pass this test: could a reader Google the exact claim and find it on a reputable site within 30 seconds? If not, rewrite it without the specific number.

---

TARGET LENGTH: 2500-3500 words of body content (excluding frontmatter). Longer posts rank better — aim for comprehensive coverage.
TONE: Knowledgeable, warm, practical — like advice from a well-traveled friend who knows ${cfg.country} deeply. Avoid generic AI-sounding phrases like "Whether you're a budget backpacker or luxury traveler" or "${cfg.country} has something for everyone". Be specific and opinionated.
${seasonalContext}${contextSection}

RESPOND WITH THE COMPLETE BLOG POST — frontmatter + Markdown body only. No preamble, no explanation.`;
}

// -------------------------------------------------------------------
// Response parser
// -------------------------------------------------------------------

function parseGeneratedPost(
  rawResponse: string,
  topic: string,
  category: PostCategory
): GeneratedPost {
  const cfg = loadPipelineConfig();
  const today = new Date().toISOString().split("T")[0];

  // Trim and strip any accidental code fences around the whole response
  let content = rawResponse.trim();

  // Strip leading "yaml" or "```yaml" or "```" that some models prepend before the frontmatter
  content = content.replace(/^```yaml\s*\n?/, "");
  content = content.replace(/^```(?:markdown|md)?\s*\n?/, "");
  content = content.replace(/^yaml\s*\n/, "");

  // Strip trailing code fence if present
  content = content.replace(/\n?\s*```\s*$/, "");

  // Strip stray ``` that appears right after the frontmatter closing ---
  content = content.replace(/^(---\s*\n[\s\S]*?\n---)\s*\n```\s*\n/, "$1\n");

  // Unwrap comparison/data tables that are wrapped inside ```markdown or ``` code blocks.
  // The AI sometimes wraps tables in fenced blocks which prevents rendering.
  // Pattern: ```[optional lang]\n<table content>\n```  → just <table content>
  content = content.replace(/```(?:markdown|md|)?\s*\n((?:[^\n]*\|[^\n]*\n)+)```/g, "$1");

  // Strip leaked AI instructions / meta-commentary that shouldn't appear in published content
  const instructionPatterns = [
    /^#+\s*Affiliate Integration Points.*$/gim,
    /^#+\s*Internal [Ll]inking.*$/gim,
    /\((?:in-text reference|link[s]? injected|links? will be injected|naturally woven)[^)]*\)/gi,
    /\([^)]*will be injected[^)]*\)/gi,
    /\([^)]*injected on publish[^)]*\)/gi,
    /^[-*]\s*(?:Hotel\/accommodation|Tour\/activity|Transport tips|eSIM\/SIM|City:|Food:|Hotels:|Attractions:|Weather:|Islands:)\s*:.*(?:injected|woven|links?).*$/gim,
    /^[-*]\s*(?:City|Food|Hotels|Attractions|Weather|Islands):\s*.+$/gim,
    /^Internal linking woven through the article:?\s*$/gim,
    /^Examples? in context:?\s*$/gim,
    // Strip "Opening paragraph" headings/labels the AI sometimes outputs as visible text
    /^#+\s*Opening paragraph\s*$/gim,
    /^Opening paragraph\s*$/gim,
    // Strip meta "External links:" section headers
    /^#+?\s*External links?:?\s*$/gim,
    // Strip trailing "Note:" lines about prices/hours (AI meta-commentary)
    /^Note:\s+Prices and opening hours.*$/gim,
    // Strip "External links for further reading" and similar meta headers
    /^#+?\s*External links?\s*(?:for further reading)?\s*$/gim,
    // Strip "Internal link:" lines in any format (with or without dash prefix)
    /^[-*]?\s*Internal links?(?:\s+to\b|\s*:).*$/gim,
    // Strip standalone instruction text that leaks from prompt
    /^Bold the primary keyword.*$/gim,
    /^Respond with the complete.*$/gim,
    /^Practical Info:\s*https?:\/\/.*$/gim,
    // Strip bare URL-only lines (not inside links or sources)
    /^(?:Pad Krapow|Khao Soi|Som Tam|Green Curry|Tom Yum).*https?:\/\/go2-thailand\.com.*$/gim,
  ];

  for (const pattern of instructionPatterns) {
    content = content.replace(pattern, '');
  }

  // Fix "Bold Label:" → just bold the label. AI sometimes writes literal "Bold Label:"
  content = content.replace(/\*?\*?Bold Label:\s*/g, '**');
  // Fix "- Bold Label: X:" → "- **X:**"
  content = content.replace(/^([-*]\s*)Bold Label:\s*(.+?):\s*/gm, '$1**$2:** ');

  // Unwrap opening paragraph from code blocks (AI wraps intro in ```markdown ... ```)
  content = content.replace(/^(---[\s\S]*?---)\s*\n+```(?:markdown|md)?\s*\n/m, '$1\n\n');

  // Clean up excessive blank lines left by removals
  content = content.replace(/\n{4,}/g, '\n\n\n');

  // Extract YAML frontmatter
  const fmMatch = content.match(/^---\s*\n([\s\S]*?)\n---/);

  let title = topic;
  let slug = slugify(topic);
  let description = "";
  let postCategory: PostCategory = category;
  let tags: string[] = [];
  let image = `/images/blog/${slug}.webp`;
  let readingTime = 8;
  let sources: Array<{ name: string; url: string }> = [];

  if (fmMatch) {
    const fm = fmMatch[1];

    // Parse individual fields from YAML (simple regex-based, no external lib needed)
    const titleMatch = fm.match(/^title:\s*["']?(.+?)["']?\s*$/m);
    const slugMatch = fm.match(/^slug:\s*["']?(.+?)["']?\s*$/m);
    const descMatch = fm.match(/^description:\s*["']?(.+?)["']?\s*$/m);
    const catMatch = fm.match(/^category:\s*["']?(.+?)["']?\s*$/m);
    const imageMatch = fm.match(/^image:\s*["']?(.+?)["']?\s*$/m);
    const rtMatch = fm.match(/^readingTime:\s*(\d+)/m);

    if (titleMatch) title = titleMatch[1].trim();
    if (slugMatch) slug = slugMatch[1].trim();
    if (descMatch) description = descMatch[1].trim().slice(0, 155);
    if (catMatch) postCategory = (catMatch[1].trim() as PostCategory) || category;
    if (imageMatch) image = imageMatch[1].trim();
    if (rtMatch) readingTime = parseInt(rtMatch[1], 10);

    // Parse tags array from YAML
    const tagsMatch = fm.match(/^tags:\s*\[([^\]]+)\]/m);
    if (tagsMatch) {
      tags = tagsMatch[1]
        .split(",")
        .map((t) => t.trim().replace(/^["']|["']$/g, ""));
    }

    // Parse sources array
    const sourceMatches = [...fm.matchAll(/- name:\s*["']?(.+?)["']?\s*\n\s*url:\s*["']?(.+?)["']?\s*$/gm)];
    sources = sourceMatches.map((m) => ({
      name: m[1].trim(),
      url: m[2].trim(),
    }));
  }

  // Fix image path — ensure slug is correct
  if (!image || image === "/images/blog/SLUG.webp") {
    image = `/images/blog/${slug}.webp`;
  } else {
    // Replace literal SLUG placeholder if the AI left it in
    image = image.replace("/SLUG.webp", `/${slug}.webp`);
  }

  return {
    title,
    slug,
    date: today,
    author: { name: `${cfg.siteName} Team` },
    category: postCategory,
    tags,
    image,
    description,
    featured: false,
    readingTime,
    lastUpdated: today,
    sources,
    content,
  };
}

// -------------------------------------------------------------------
// Utilities
// -------------------------------------------------------------------

function slugify(text: string): string {
  return text
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "")
    .slice(0, 80);
}

function randomFrom<T>(arr: T[]): T {
  return arr[Math.floor(Math.random() * arr.length)];
}

function detectCategory(topic: string): PostCategory {
  const lower = topic.toLowerCase();
  if (lower.includes("island") || lower.includes("koh ") || lower.includes("beach")) return "islands";
  if (lower.includes("food") || lower.includes("eat") || lower.includes("restaurant") || lower.includes("street food")) return "food";
  if (lower.includes("visa") || lower.includes("money") || lower.includes("scam") || lower.includes("sim") || lower.includes("esim") || lower.includes("insurance") || lower.includes("transport")) return "practical";
  if (lower.includes("budget") || lower.includes("cheap") || lower.includes("free") || lower.includes("$")) return "budget";
  if (lower.includes("festival") || lower.includes("songkran") || lower.includes("loy") || lower.includes("season") || lower.includes("rainy") || lower.includes("month")) return "seasonal";
  if (lower.includes("snorkeling") || lower.includes("diving") || lower.includes("elephant") || lower.includes("muay thai") || lower.includes("cooking class") || lower.includes("zip")) return "activities";
  return "city-guide";
}
