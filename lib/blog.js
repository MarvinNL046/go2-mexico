// PATCHED: reads both content/blog/ and content/blog/en/
const path = require('path');
const fs = require('fs');
const matter = require('gray-matter');

const ROOT_DIR = path.join(process.cwd(), 'content', 'blog');
const EN_DIR = path.join(process.cwd(), 'content', 'blog', 'en');

function readBlogsFrom(dir) {
  if (!fs.existsSync(dir)) return [];
  try {
    return fs.readdirSync(dir)
      .filter(f => f.endsWith('.md'))
      .map(filename => ({ filename, dir }));
  } catch { return []; }
}

function loadAllFiles() {
  // /en/ first (takes priority on slug collision), then root.
  const bySlug = new Map();
  for (const ref of readBlogsFrom(EN_DIR)) {
    const slug = ref.filename.replace(/\.md$/, '');
    if (!bySlug.has(slug)) bySlug.set(slug, ref);
  }
  for (const ref of readBlogsFrom(ROOT_DIR)) {
    const slug = ref.filename.replace(/\.md$/, '');
    if (!bySlug.has(slug)) bySlug.set(slug, ref);
  }
  return [...bySlug.values()];
}

function getAllPosts() {
  try {
    return loadAllFiles().map(({ filename, dir }) => {
      const fileContent = fs.readFileSync(path.join(dir, filename), 'utf8');
      const { data } = matter(fileContent);
      return {
        slug: filename.replace(/\.md$/, ''),
        title: data.title || 'Untitled',
        date: data.date || new Date().toISOString(),
        excerpt: data.excerpt || data.description || '',
        category: data.category || 'general',
        image: data.image || '/images/blog/default.webp',
        tags: data.tags || [],
      };
    }).sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime());
  } catch (error) {
    console.error('Error loading blog posts:', error.message);
    return [];
  }
}

async function getPostBySlug(slug) {
  try {
    // Try /en/ first, then root.
    const candidates = [
      path.join(EN_DIR, `${slug}.md`),
      path.join(ROOT_DIR, `${slug}.md`),
    ];
    const filePath = candidates.find(p => fs.existsSync(p));
    if (!filePath) return null;

    const fileContent = fs.readFileSync(filePath, 'utf8');
    const { data, content } = matter(fileContent);

    const { remark } = await import('remark');
    const remarkHtml = (await import('remark-html')).default;
    const processed = await remark().use(remarkHtml).process(content);

    return {
      slug,
      title: data.title || 'Untitled',
      date: data.date || new Date().toISOString(),
      excerpt: data.excerpt || data.description || '',
      category: data.category || 'general',
      image: data.image || '/images/blog/default.webp',
      tags: data.tags || [],
      content: processed.toString(),
      description: data.description || data.excerpt || '',
      author: data.author || { name: 'Team' },
      readingTime: data.readingTime || 5,
      lastUpdated: data.lastUpdated || data.date,
      sources: data.sources || [],
    };
  } catch (error) {
    console.error(`Error loading blog post ${slug}:`, error.message);
    return null;
  }
}

function getAllSlugs() {
  return loadAllFiles().map(({ filename }) => filename.replace(/\.md$/, ''));
}

// Alias for legacy callers (some pages import this name).
function getPostSlugs() { return getAllSlugs(); }

// Simple tag-overlap related-posts. Returns up to `limit` posts sorted by
// descending shared-tag count, excluding the current slug.
function getRelatedPosts(currentSlug, limit = 3) {
  const all = getAllPosts();
  const current = all.find(p => p.slug === currentSlug);
  if (!current) return all.filter(p => p.slug !== currentSlug).slice(0, limit);
  const currentTags = new Set((current.tags || []).map(t => String(t).toLowerCase()));
  const scored = all
    .filter(p => p.slug !== currentSlug)
    .map(p => {
      const tags = (p.tags || []).map(t => String(t).toLowerCase());
      const overlap = tags.filter(t => currentTags.has(t)).length;
      return { post: p, score: overlap };
    })
    .sort((a, b) => b.score - a.score || new Date(b.post.date).getTime() - new Date(a.post.date).getTime());
  return scored.slice(0, limit).map(s => s.post);
}

module.exports = { getAllPosts, getPostBySlug, getAllSlugs, getPostSlugs, getRelatedPosts };
