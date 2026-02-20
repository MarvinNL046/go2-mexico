const path = require('path');
const fs = require('fs');
const matter = require('gray-matter');

const blogDir = path.join(process.cwd(), 'content', 'blog');

function getAllPosts() {
  try {
    if (!fs.existsSync(blogDir)) return [];
    const files = fs.readdirSync(blogDir).filter(f => f.endsWith('.md'));

    return files.map(filename => {
      const filePath = path.join(blogDir, filename);
      const fileContent = fs.readFileSync(filePath, 'utf8');
      const { data } = matter(fileContent);

      return {
        slug: filename.replace('.md', ''),
        title: data.title || 'Untitled',
        date: data.date || new Date().toISOString(),
        excerpt: data.excerpt || '',
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
    const filePath = path.join(blogDir, `${slug}.md`);
    if (!fs.existsSync(filePath)) return null;

    const fileContent = fs.readFileSync(filePath, 'utf8');
    const { data, content } = matter(fileContent);

    // Dynamic import for ESM remark modules
    const { remark } = await import('remark');
    const remarkHtml = (await import('remark-html')).default;

    const processed = await remark().use(remarkHtml).process(content);

    return {
      slug,
      title: data.title || 'Untitled',
      date: data.date || new Date().toISOString(),
      excerpt: data.excerpt || '',
      category: data.category || 'general',
      image: data.image || '/images/blog/default.webp',
      tags: data.tags || [],
      content: processed.toString(),
    };
  } catch (error) {
    console.error(`Error loading blog post ${slug}:`, error.message);
    return null;
  }
}

function getPostSlugs() {
  return getAllPosts().map(post => post.slug);
}

module.exports = { getAllPosts, getPostBySlug, getPostSlugs };
