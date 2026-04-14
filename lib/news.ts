import fs from 'fs';
import path from 'path';
import matter from 'gray-matter';

const contentDirectory = path.join(process.cwd(), 'content', 'news');

export interface NewsArticle {
  slug: string;
  title: string;
  description: string;
  date: string;
  category: string;
  tags: string[];
  source?: {
    name: string;
    url: string;
    originalTitle?: string;
  };
  contentHtml?: string;
}

// Get all news articles for a locale, sorted by date descending.
// Falls back to EN for any slug missing in the target locale.
export function getAllNews(locale: string = 'en'): NewsArticle[] {
  const enDir = path.join(contentDirectory, 'en');
  if (!fs.existsSync(enDir)) return [];

  const localeDir = path.join(contentDirectory, locale);
  const hasLocaleDir = locale !== 'en' && fs.existsSync(localeDir);

  const fileNames = fs.readdirSync(enDir).filter(f => f.endsWith('.md'));
  const articles = fileNames.map(fileName => {
    const slug = fileName.replace(/\.md$/, '');
    const localePath = hasLocaleDir ? path.join(localeDir, fileName) : '';
    const fullPath = localePath && fs.existsSync(localePath) ? localePath : path.join(enDir, fileName);
    const fileContents = fs.readFileSync(fullPath, 'utf8');
    const { data } = matter(fileContents);
    return {
      slug,
      title: data.title || '',
      description: data.description || '',
      date: data.date ? String(data.date) : '',
      category: data.category || 'general',
      tags: data.tags || [],
      source: data.source || undefined,
    } as NewsArticle;
  });
  return articles.sort((a, b) => b.date.localeCompare(a.date));
}

// Get a single news article by slug for a given locale.
export async function getNewsBySlug(slug: string, locale: string = 'en'): Promise<NewsArticle | null> {
  const localePath = locale !== 'en' ? path.join(contentDirectory, locale, `${slug}.md`) : '';
  const enPath = path.join(contentDirectory, 'en', `${slug}.md`);
  const fullPath = localePath && fs.existsSync(localePath) ? localePath : enPath;
  if (!fs.existsSync(fullPath)) return null;

  const fileContents = fs.readFileSync(fullPath, 'utf8');
  const { data, content } = matter(fileContents);

  const { remark } = await import('remark');
  const remarkGfm = (await import('remark-gfm')).default;
  const remarkHtml = (await import('remark-html')).default;
  const processedContent = await remark()
    .use(remarkGfm)
    .use(remarkHtml, { sanitize: false })
    .process(content);
  let contentHtml = processedContent.toString();

  // Keep internal links in the same locale (mirrors blog.js behavior)
  if (locale && locale !== 'en') {
    contentHtml = contentHtml.replace(/href="\/([^"/][^"]*)"/g, (match, rest) => {
      const firstSeg = rest.split('/')[0];
      const skip = new Set(['en', 'nl', 'api', '_next', 'images', 'static']);
      if (skip.has(firstSeg)) return match;
      return `href="/${locale}/${rest}"`;
    });
  }

  return {
    slug,
    title: data.title || '',
    description: data.description || '',
    date: data.date ? String(data.date) : '',
    category: data.category || 'general',
    tags: data.tags || [],
    source: data.source || undefined,
    contentHtml,
  };
}

// Get all existing source URLs (for duplicate detection)
export function getExistingSourceUrls(): Set<string> {
  const urls = new Set<string>();
  const enDir = path.join(contentDirectory, 'en');

  if (!fs.existsSync(enDir)) return urls;

  const fileNames = fs.readdirSync(enDir).filter(f => f.endsWith('.md'));

  for (const fileName of fileNames) {
    const fullPath = path.join(enDir, fileName);
    const fileContents = fs.readFileSync(fullPath, 'utf8');
    const { data } = matter(fileContents);
    if (data.source?.url) {
      urls.add(data.source.url);
    }
  }

  return urls;
}
