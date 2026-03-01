import fs from 'fs';
import path from 'path';
import matter from 'gray-matter';
import { remark } from 'remark';
import remarkGfm from 'remark-gfm';
import remarkHtml from 'remark-html';

const contentDirectory = path.join(process.cwd(), 'content');

export interface ContentMeta {
  title: string;
  description: string;
  slug: string;
  updatedAt: string;
  author: string;
  heroImage: string;
  tags: string[];
  region?: string;
  city?: string;
  country?: string;
  [key: string]: any;
}

export interface ContentItem {
  meta: ContentMeta;
  content: string;
  htmlContent: string;
  readingTime: number;
}

export type ContentType = 'regions' | 'cities' | 'destinations' | 'experiences' | 'itineraries' | 'blog';

function calculateReadingTime(text: string): number {
  const wordsPerMinute = 200;
  const wordCount = text.split(/\s+/).length;
  return Math.max(1, Math.ceil(wordCount / wordsPerMinute));
}

export function getSlugs(type: ContentType): string[] {
  const dir = path.join(contentDirectory, type);
  if (!fs.existsSync(dir)) return [];
  return fs.readdirSync(dir)
    .filter((f) => f.endsWith('.md') || f.endsWith('.mdx'))
    .map((f) => f.replace(/\.mdx?$/, ''));
}

export function getAllContent(type: ContentType): ContentMeta[] {
  const slugs = getSlugs(type);
  return slugs
    .map((slug) => getContentMeta(type, slug))
    .filter((item): item is ContentMeta => item !== null)
    .sort((a, b) => new Date(b.updatedAt).getTime() - new Date(a.updatedAt).getTime());
}

export function getContentMeta(type: ContentType, slug: string): ContentMeta | null {
  const dir = path.join(contentDirectory, type);
  const mdPath = path.join(dir, `${slug}.md`);
  const mdxPath = path.join(dir, `${slug}.mdx`);
  const filePath = fs.existsSync(mdxPath) ? mdxPath : fs.existsSync(mdPath) ? mdPath : null;
  if (!filePath) return null;

  const fileContents = fs.readFileSync(filePath, 'utf8');
  const { data } = matter(fileContents);

  return {
    title: data.title || slug,
    description: data.description || '',
    slug: data.slug || slug,
    updatedAt: data.updatedAt || data.date || new Date().toISOString().split('T')[0],
    author: data.author || 'go2mexico-team',
    heroImage: data.heroImage || `/images/${type}/${slug}.webp`,
    tags: data.tags || [],
    ...data,
  };
}

export async function getContentBySlug(type: ContentType, slug: string): Promise<ContentItem | null> {
  const dir = path.join(contentDirectory, type);
  const mdPath = path.join(dir, `${slug}.md`);
  const mdxPath = path.join(dir, `${slug}.mdx`);
  const filePath = fs.existsSync(mdxPath) ? mdxPath : fs.existsSync(mdPath) ? mdPath : null;
  if (!filePath) return null;

  const fileContents = fs.readFileSync(filePath, 'utf8');
  const { data, content } = matter(fileContents);

  const processedContent = await remark()
    .use(remarkGfm)
    .use(remarkHtml, { sanitize: false })
    .process(content);

  const htmlContent = processedContent.toString();
  const readingTime = calculateReadingTime(content);

  const meta: ContentMeta = {
    title: data.title || slug,
    description: data.description || '',
    slug: data.slug || slug,
    updatedAt: data.updatedAt || data.date || new Date().toISOString().split('T')[0],
    author: data.author || 'go2mexico-team',
    heroImage: data.heroImage || `/images/${type}/${slug}.webp`,
    tags: data.tags || [],
    ...data,
  };

  return { meta, content, htmlContent, readingTime };
}

export function getRelatedContent(
  type: ContentType,
  currentSlug: string,
  tags: string[],
  limit: number = 3
): ContentMeta[] {
  const all = getAllContent(type);
  return all
    .filter((item) => item.slug !== currentSlug)
    .map((item) => ({
      ...item,
      relevance: item.tags.filter((tag) => tags.includes(tag)).length,
    }))
    .sort((a, b) => b.relevance - a.relevance)
    .slice(0, limit);
}

export function getContentByTag(type: ContentType, tag: string): ContentMeta[] {
  return getAllContent(type).filter((item) => item.tags.includes(tag));
}

export function getContentByRegion(type: ContentType, region: string): ContentMeta[] {
  return getAllContent(type).filter((item) => item.region === region);
}

export function getContentByCity(type: ContentType, city: string): ContentMeta[] {
  return getAllContent(type).filter((item) => item.city === city);
}

export function getAllTags(type: ContentType): string[] {
  const all = getAllContent(type);
  const tags = new Set<string>();
  all.forEach((item) => item.tags.forEach((tag) => tags.add(tag)));
  return Array.from(tags).sort();
}

export function getRouteManifest(): Record<ContentType, string[]> {
  const types: ContentType[] = ['regions', 'cities', 'destinations', 'experiences', 'itineraries', 'blog'];
  const manifest: Record<string, string[]> = {};
  for (const type of types) {
    manifest[type] = getSlugs(type);
  }
  return manifest as Record<ContentType, string[]>;
}

export function extractTableOfContents(html: string): Array<{ id: string; text: string; level: number }> {
  const headings: Array<{ id: string; text: string; level: number }> = [];
  const regex = /<h([2-3])[^>]*id="([^"]*)"[^>]*>(.*?)<\/h[2-3]>/gi;
  let match;
  while ((match = regex.exec(html)) !== null) {
    headings.push({
      level: parseInt(match[1]),
      id: match[2],
      text: match[3].replace(/<[^>]*>/g, ''),
    });
  }
  return headings;
}
