// =============================================================================
// content-generator.ts - Main blog content pipeline orchestrator
// =============================================================================

import fs from 'fs';
import path from 'path';
import { generateContent } from './ai-provider';
import { researchTopic } from './scraper';
import { generateBlogImage } from './image-generator';
import { factCheckContent } from './fact-checker';
import { injectAffiliateLinks } from './affiliate-injector';
import { commitFiles, CommitFile } from './github-commit';

// ---------------------------------------------------------------------------
// Topic bank (fallback when queue is exhausted)
// ---------------------------------------------------------------------------

const TOPIC_BANK: TopicEntry[] = [
  { id: 'mexico-city-hidden-gems', title: 'Hidden Gems in Mexico City: 15 Spots Tourists Miss', category: 'city-guide', keywords: ['mexico city hidden gems', 'secret spots cdmx'], city: 'Mexico City', region: 'Central Mexico' },
  { id: 'yucatan-food-trail', title: 'Yucatan Food Trail: From Cochinita Pibil to Papadzules', category: 'food', keywords: ['yucatan food', 'cochinita pibil'], region: 'Yucatan Peninsula' },
  { id: 'oaxaca-artisan-markets', title: 'Oaxaca Artisan Markets: Complete Shopping Guide', category: 'culture', keywords: ['oaxaca markets', 'oaxaca shopping'], city: 'Oaxaca', region: 'Oaxaca & Chiapas' },
  { id: 'mexico-wellness-retreats', title: 'Best Wellness Retreats in Mexico: Yoga, Temazcal & Spa', category: 'activities', keywords: ['mexico wellness retreat', 'yoga retreat mexico'], region: 'Central Mexico' },
  { id: 'cabo-snorkeling-guide', title: 'Snorkeling in Los Cabos: Best Spots & What to Expect', category: 'beaches', keywords: ['cabo snorkeling', 'los cabos underwater'], city: 'Los Cabos', region: 'Baja California' },
  { id: 'mexico-train-travel', title: 'Train Travel in Mexico: Chepe, Tren Maya & More', category: 'practical', keywords: ['mexico train', 'chepe train', 'tren maya'], region: 'Central Mexico' },
  { id: 'puebla-day-trip-cdmx', title: 'Puebla Day Trip from Mexico City: What to See & Eat', category: 'city-guide', keywords: ['puebla day trip', 'puebla from mexico city'], city: 'Puebla', region: 'Central Mexico' },
  { id: 'mexico-cenote-types', title: 'Open, Semi-Open & Cave Cenotes: Which Type Is Right for You?', category: 'nature', keywords: ['cenote types', 'best cenotes mexico'], region: 'Yucatan Peninsula' },
  { id: 'guadalajara-tequila-express', title: 'Tequila Express: Guadalajara to Tequila Town by Train', category: 'food', keywords: ['tequila express', 'guadalajara tequila tour'], city: 'Guadalajara', region: 'Central Mexico' },
  { id: 'mexico-volcano-hikes', title: 'Volcano Hiking in Mexico: From Nevado de Toluca to Iztaccihuatl', category: 'nature', keywords: ['mexico volcano hiking', 'nevado de toluca'], region: 'Central Mexico' },
];

// ---------------------------------------------------------------------------
// Types
// ---------------------------------------------------------------------------

export interface TopicEntry {
  id: string;
  title: string;
  category: string;
  keywords: string[];
  scrapeUrls?: string[];
  city?: string;
  region?: string;
  priority?: number;
  status?: string;
}

interface QueueFile {
  topics: TopicEntry[];
  metadata?: Record<string, unknown>;
}

export interface PipelineResult {
  slug: string;
  title: string;
  category: string;
  factCheckScore: number;
  commitSha?: string;
  commitUrl?: string;
  error?: string;
}

// ---------------------------------------------------------------------------
// Authors rotation
// ---------------------------------------------------------------------------

const AUTHORS = ['go2mexico-team', 'carlos-mendoza', 'sarah-mitchell'];

function pickAuthor(): string {
  return AUTHORS[Math.floor(Math.random() * AUTHORS.length)];
}

// ---------------------------------------------------------------------------
// Topic selection
// ---------------------------------------------------------------------------

function getQueuePath(): string {
  return path.join(process.cwd(), 'content', 'topic-queue.json');
}

function loadQueue(): QueueFile {
  const queuePath = getQueuePath();
  if (!fs.existsSync(queuePath)) {
    return { topics: [] };
  }
  const raw = fs.readFileSync(queuePath, 'utf-8');
  return JSON.parse(raw) as QueueFile;
}

function getExistingSlugs(): Set<string> {
  const blogDir = path.join(process.cwd(), 'content', 'blog');
  if (!fs.existsSync(blogDir)) return new Set();
  return new Set(
    fs.readdirSync(blogDir)
      .filter(f => f.endsWith('.md'))
      .map(f => f.replace(/\.md$/, ''))
  );
}

export function selectNextTopic(): TopicEntry | null {
  const existingSlugs = getExistingSlugs();
  const queue = loadQueue();

  // Find pending topics from queue, sorted by priority
  const pending = queue.topics
    .filter(t => t.status === 'pending' && !existingSlugs.has(t.id))
    .sort((a, b) => (a.priority ?? 99) - (b.priority ?? 99));

  if (pending.length > 0) {
    return pending[0];
  }

  // Fallback to topic bank
  const bankPending = TOPIC_BANK.filter(t => !existingSlugs.has(t.id));
  if (bankPending.length > 0) {
    return bankPending[Math.floor(Math.random() * bankPending.length)];
  }

  return null;
}

function markTopicUsed(topicId: string): void {
  const queuePath = getQueuePath();
  if (!fs.existsSync(queuePath)) return;

  const queue = loadQueue();
  const topic = queue.topics.find(t => t.id === topicId);
  if (topic) {
    topic.status = 'published';
    // Don't write to filesystem in production (Vercel is read-only)
    // The topic will be tracked by the existence of the blog .md file
    try {
      fs.writeFileSync(queuePath, JSON.stringify(queue, null, 2));
    } catch {
      // Expected to fail on Vercel's read-only filesystem
      console.log(`[content-generator] Could not update queue file (read-only fs)`);
    }
  }
}

// ---------------------------------------------------------------------------
// Content generation prompt
// ---------------------------------------------------------------------------

function buildBlogPrompt(topic: TopicEntry, research: string): string {
  const cityContext = topic.city ? ` focusing on ${topic.city}` : '';
  const regionContext = topic.region ? ` in the ${topic.region} region` : '';

  return `Write a comprehensive, SEO-optimized blog article about: "${topic.title}"${cityContext}${regionContext}.

REQUIREMENTS:
- Write 1500-2500 words in engaging, informative travel writing style
- Use markdown formatting with H2 (##) and H3 (###) headings
- Include practical tips, costs in both MXN and USD, and actionable advice
- Add specific details: names of places, streets, neighborhoods, dishes
- Include a mix of well-known and lesser-known recommendations
- Write for an international English-speaking audience planning travel to Mexico
- Be honest about any downsides or things to watch out for
- Include seasonal/timing advice where relevant
- End with a practical summary or "Quick Tips" section

STRUCTURE:
1. Engaging introduction (2-3 paragraphs)
2. 4-8 main sections with H2 headings
3. Sub-sections with H3 where helpful
4. Practical tips, costs, or comparison tables
5. Closing summary with key takeaways

STYLE:
- Conversational but authoritative tone
- First-hand experience perspective
- Avoid generic filler phrases like "nestled in" or "hidden gem"
- Use specific data points and prices where possible
- Include local terminology with translations

RESEARCH DATA (use this for accuracy, but write original content):
${research.slice(0, 8000)}

TARGET KEYWORDS: ${topic.keywords.join(', ')}

OUTPUT: Return ONLY the markdown body content (no frontmatter, no title H1). Start with the first paragraph directly.`;
}

// ---------------------------------------------------------------------------
// Frontmatter generation
// ---------------------------------------------------------------------------

function buildFrontmatter(topic: TopicEntry, author: string): string {
  const today = new Date().toISOString().split('T')[0];
  const tags = generateTags(topic);

  const lines = [
    '---',
    `title: "${topic.title}"`,
    `description: "Complete guide to ${topic.title.toLowerCase()}. Practical tips, costs, and insider advice for your Mexico trip."`,
    `slug: "${topic.id}"`,
    `updatedAt: "${today}"`,
    `author: "${author}"`,
    `heroImage: "/images/blog/${topic.id}.webp"`,
    `tags: [${tags.map(t => `"${t}"`).join(', ')}]`,
    `category: "${topic.category}"`,
  ];

  if (topic.region) {
    lines.push(`region: "${topic.region}"`);
  }
  if (topic.city) {
    lines.push(`city: "${topic.city}"`);
  }

  lines.push('---');
  return lines.join('\n');
}

function generateTags(topic: TopicEntry): string[] {
  const tags = new Set<string>();

  // Category as tag
  tags.add(topic.category);

  // City and region
  if (topic.city) tags.add(topic.city.toLowerCase().replace(/\s+/g, '-'));
  if (topic.region) tags.add(topic.region.toLowerCase().replace(/\s+/g, '-'));

  // Extract meaningful words from keywords
  for (const kw of topic.keywords) {
    const words = kw.split(/\s+/).filter(w => w.length > 3);
    for (const w of words.slice(0, 2)) {
      tags.add(w.toLowerCase());
    }
  }

  return Array.from(tags).slice(0, 8);
}

// ---------------------------------------------------------------------------
// Main pipeline
// ---------------------------------------------------------------------------

export async function generateBlogPost(
  topic?: TopicEntry
): Promise<PipelineResult> {
  // 1. Topic selection
  const selectedTopic = topic ?? selectNextTopic();
  if (!selectedTopic) {
    return {
      slug: '',
      title: '',
      category: '',
      factCheckScore: 0,
      error: 'No topics available - queue and topic bank are exhausted',
    };
  }

  console.log(`[pipeline] Starting: "${selectedTopic.title}" (${selectedTopic.id})`);

  const author = pickAuthor();

  // 2. Research phase
  console.log('[pipeline] Researching topic...');
  let research = '';
  try {
    research = await researchTopic(
      selectedTopic.title,
      selectedTopic.scrapeUrls ?? []
    );
    console.log(`[pipeline] Research collected: ${research.length} chars`);
  } catch (err) {
    console.warn('[pipeline] Research failed, continuing with AI knowledge only:', err);
  }

  // 3. Content generation
  console.log('[pipeline] Generating content...');
  const prompt = buildBlogPrompt(selectedTopic, research);
  let content: string;
  try {
    content = await generateContent(prompt, {
      maxTokens: 4096,
      temperature: 0.7,
      systemPrompt: 'You are an expert Mexico travel writer. Write engaging, accurate, and helpful travel content. Always include specific prices, addresses, and practical details.',
    });
  } catch (err) {
    return {
      slug: selectedTopic.id,
      title: selectedTopic.title,
      category: selectedTopic.category,
      factCheckScore: 0,
      error: `Content generation failed: ${err instanceof Error ? err.message : String(err)}`,
    };
  }

  // 4. Fact checking
  console.log('[pipeline] Fact checking...');
  let factCheckScore = 100;
  try {
    const factResult = await factCheckContent(content, selectedTopic.title);
    factCheckScore = factResult.score;
    content = factResult.cleanedContent;

    const flagged = factResult.claims.filter(c => c.flagged);
    if (flagged.length > 0) {
      console.warn(`[pipeline] Fact check flagged ${flagged.length} claims:`);
      flagged.forEach(c => console.warn(`  - [${c.type}] "${c.text}": ${c.suggestion}`));
    }
    console.log(`[pipeline] Fact check score: ${factCheckScore}/100`);
  } catch (err) {
    console.warn('[pipeline] Fact checking failed, continuing:', err);
  }

  // 5. Affiliate link injection
  console.log('[pipeline] Injecting affiliate links...');
  content = injectAffiliateLinks(content, selectedTopic.category, selectedTopic.city);

  // 6. Build final markdown
  const frontmatter = buildFrontmatter(selectedTopic, author);
  const markdown = `${frontmatter}\n\n${content}`;

  // 7. Image generation
  console.log('[pipeline] Generating hero image...');
  let imageBuffer: Buffer | null = null;
  try {
    imageBuffer = await generateBlogImage(selectedTopic.title, selectedTopic.category);
    if (imageBuffer) {
      console.log(`[pipeline] Image generated: ${imageBuffer.length} bytes`);
    }
  } catch (err) {
    console.warn('[pipeline] Image generation failed:', err);
  }

  // 8. Commit to GitHub
  console.log('[pipeline] Committing to GitHub...');
  const files: CommitFile[] = [
    {
      path: `content/blog/${selectedTopic.id}.md`,
      content: markdown,
      encoding: 'utf-8',
    },
  ];

  if (imageBuffer) {
    files.push({
      path: `public/images/blog/${selectedTopic.id}.webp`,
      content: imageBuffer,
      encoding: 'base64',
    });
  }

  let commitSha: string | undefined;
  let commitUrl: string | undefined;

  try {
    const result = await commitFiles(
      files,
      `blog: add "${selectedTopic.title}"`
    );
    commitSha = result.sha;
    commitUrl = result.url;
    console.log(`[pipeline] Committed: ${commitSha}`);
  } catch (err) {
    return {
      slug: selectedTopic.id,
      title: selectedTopic.title,
      category: selectedTopic.category,
      factCheckScore,
      error: `GitHub commit failed: ${err instanceof Error ? err.message : String(err)}`,
    };
  }

  // 9. Mark topic as used
  markTopicUsed(selectedTopic.id);

  console.log(`[pipeline] Done: "${selectedTopic.title}"`);

  return {
    slug: selectedTopic.id,
    title: selectedTopic.title,
    category: selectedTopic.category,
    factCheckScore,
    commitSha,
    commitUrl,
  };
}
