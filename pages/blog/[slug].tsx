import { GetStaticPaths, GetStaticProps } from 'next';
import Link from 'next/link';
import Image from 'next/image';
import {
  Calendar,
  Clock,
  User,
  Share2,
  Facebook,
  Twitter,
  Linkedin,
  Link2,
  Tag,
  ChevronRight,
  ExternalLink,
  Compass,
} from 'lucide-react';
import SEOHead from '../../components/SEOHead';
import Breadcrumbs from '../../components/Breadcrumbs';
import { useTranslation } from '../../hooks/useTranslation';
import { siteConfig, getAuthor } from '../../site.config';
import {
  getSlugs,
  getContentBySlug,
  getRelatedContent,
  extractTableOfContents,
  ContentMeta,
} from '../../lib/content';
import { getActivityOffers, AffiliateOffer } from '../../lib/affiliates';

interface TOCItem {
  id: string;
  text: string;
  level: number;
}

interface BlogPostPageProps {
  item: {
    meta: ContentMeta;
    htmlContent: string;
    readingTime: number;
  };
  toc: TOCItem[];
  relatedPosts: ContentMeta[];
  contextualOffers: AffiliateOffer[];
}

export default function BlogPostPage({
  item,
  toc,
  relatedPosts,
  contextualOffers,
}: BlogPostPageProps) {
  const { t } = useTranslation('common');
  const author = getAuthor(item.meta.author);
  const postUrl = `${siteConfig.seo.siteUrl}/blog/${item.meta.slug}/`;

  const handleCopyLink = () => {
    if (typeof navigator !== 'undefined') {
      navigator.clipboard.writeText(postUrl);
    }
  };

  return (
    <>
      <SEOHead
        title={`${item.meta.title} | ${siteConfig.name} Blog`}
        description={
          item.meta.description ||
          `Read about ${item.meta.title} on the ${siteConfig.name} blog.`
        }
        ogImage={item.meta.heroImage}
      >
        {/* BlogPosting JSON-LD */}
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{
            __html: JSON.stringify({
              '@context': 'https://schema.org',
              '@type': 'BlogPosting',
              headline: item.meta.title,
              description: item.meta.description,
              image: item.meta.heroImage,
              datePublished: item.meta.updatedAt,
              dateModified: item.meta.updatedAt,
              author: {
                '@type': 'Person',
                name: author.name,
                description: author.credentials,
              },
              publisher: {
                '@type': 'Organization',
                name: siteConfig.name,
                url: siteConfig.seo.siteUrl,
              },
              mainEntityOfPage: {
                '@type': 'WebPage',
                '@id': postUrl,
              },
              wordCount: item.htmlContent.split(/\s+/).length,
              url: postUrl,
            }),
          }}
        />
        <meta property="og:type" content="article" />
        <meta property="article:published_time" content={item.meta.updatedAt} />
        <meta property="article:modified_time" content={item.meta.updatedAt} />
        <meta property="article:author" content={author.name} />
      </SEOHead>

      {/* Hero Section */}
      <section className="relative h-[35vh] md:h-[45vh] overflow-hidden">
        <Image
          src={item.meta.heroImage || '/images/placeholder.webp'}
          alt={item.meta.title}
          fill
          className="object-cover"
          priority
        />
        <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/40 to-transparent" />
        <div className="absolute bottom-0 left-0 right-0 p-6 md:p-10">
          <div className="max-w-4xl mx-auto">
            {item.meta.category && (
              <span className="inline-block bg-brand-primary text-white text-xs font-semibold px-3 py-1 rounded-full mb-3">
                {item.meta.category}
              </span>
            )}
            <h1 className="text-2xl md:text-4xl font-bold text-white mb-3">
              {item.meta.title}
            </h1>
            <div className="flex flex-wrap items-center gap-4 text-white/70 text-sm">
              <span className="flex items-center gap-1.5">
                <User className="w-4 h-4" />
                {author.name}
              </span>
              <span className="flex items-center gap-1.5">
                <Calendar className="w-4 h-4" />
                {new Date(item.meta.updatedAt).toLocaleDateString('en-US', {
                  year: 'numeric',
                  month: 'long',
                  day: 'numeric',
                })}
              </span>
              <span className="flex items-center gap-1.5">
                <Clock className="w-4 h-4" />
                {item.readingTime} {t('content.readingTime')}
              </span>
            </div>
          </div>
        </div>
      </section>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <Breadcrumbs
          items={[
            { name: t('nav.home'), href: '/' },
            { name: t('nav.blog'), href: '/blog/' },
            { name: item.meta.title, href: `/blog/${item.meta.slug}/` },
          ]}
        />

        <div className="grid grid-cols-1 lg:grid-cols-4 gap-10">
          {/* Sidebar - Table of Contents (left on desktop) */}
          <aside className="lg:col-span-1 order-2 lg:order-1">
            {/* Table of Contents */}
            {toc.length > 0 && (
              <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-5 mb-6 lg:sticky lg:top-24">
                <h3 className="font-bold text-brand-secondary mb-3 text-sm uppercase tracking-wider">
                  {t('content.tableOfContents')}
                </h3>
                <nav className="space-y-1">
                  {toc.map((heading) => (
                    <a
                      key={heading.id}
                      href={`#${heading.id}`}
                      className={`block text-sm text-gray-600 hover:text-brand-primary transition-colors py-1 ${
                        heading.level === 3 ? 'pl-4' : ''
                      }`}
                    >
                      {heading.text}
                    </a>
                  ))}
                </nav>
              </div>
            )}

            {/* Share Buttons */}
            <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-5 mb-6">
              <h3 className="font-bold text-brand-secondary mb-3 text-sm uppercase tracking-wider">
                {t('content.shareThis')}
              </h3>
              <div className="flex flex-wrap gap-2">
                <a
                  href={`https://www.facebook.com/sharer/sharer.php?u=${encodeURIComponent(postUrl)}`}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="w-10 h-10 flex items-center justify-center rounded-full bg-blue-600 text-white hover:bg-blue-700 transition-colors"
                  aria-label="Share on Facebook"
                >
                  <Facebook className="w-4 h-4" />
                </a>
                <a
                  href={`https://twitter.com/intent/tweet?url=${encodeURIComponent(postUrl)}&text=${encodeURIComponent(item.meta.title)}`}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="w-10 h-10 flex items-center justify-center rounded-full bg-black text-white hover:bg-gray-800 transition-colors"
                  aria-label="Share on X"
                >
                  <Twitter className="w-4 h-4" />
                </a>
                <a
                  href={`https://www.linkedin.com/shareArticle?mini=true&url=${encodeURIComponent(postUrl)}&title=${encodeURIComponent(item.meta.title)}`}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="w-10 h-10 flex items-center justify-center rounded-full bg-blue-700 text-white hover:bg-blue-800 transition-colors"
                  aria-label="Share on LinkedIn"
                >
                  <Linkedin className="w-4 h-4" />
                </a>
                <button
                  onClick={handleCopyLink}
                  className="w-10 h-10 flex items-center justify-center rounded-full bg-gray-200 text-gray-600 hover:bg-gray-300 transition-colors"
                  aria-label="Copy link"
                >
                  <Link2 className="w-4 h-4" />
                </button>
              </div>
            </div>
          </aside>

          {/* Main Content */}
          <div className="lg:col-span-3 order-1 lg:order-2">
            {/* Article Content */}
            <article className="mb-10">
              <div
                className="prose prose-lg max-w-none prose-headings:text-brand-secondary prose-a:text-brand-primary prose-a:no-underline hover:prose-a:underline prose-img:rounded-xl prose-blockquote:border-brand-primary"
                dangerouslySetInnerHTML={{ __html: item.htmlContent }}
              />
            </article>

            {/* Tags */}
            {item.meta.tags && item.meta.tags.length > 0 && (
              <div className="flex flex-wrap items-center gap-2 mb-8 pb-8 border-b border-gray-200">
                <Tag className="w-4 h-4 text-gray-400" />
                {item.meta.tags.map((tag) => (
                  <span
                    key={tag}
                    className="bg-gray-100 text-gray-600 text-sm px-3 py-1 rounded-full"
                  >
                    {tag}
                  </span>
                ))}
              </div>
            )}

            {/* Contextual Affiliate Offers */}
            {contextualOffers.length > 0 && (
              <section className="mb-10">
                <h2 className="flex items-center gap-2 text-xl font-bold text-brand-secondary mb-4">
                  <Compass className="w-5 h-5 text-brand-accent" />
                  {t('sections.bookableOffers')}
                </h2>
                <p className="text-xs text-gray-400 mb-4 italic">
                  {t('sections.affiliateDisclosure')}
                </p>
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
                  {contextualOffers.map((offer, idx) => (
                    <a
                      key={idx}
                      href={offer.url}
                      target="_blank"
                      rel="noopener noreferrer nofollow sponsored"
                      className="group bg-white rounded-xl border border-gray-100 shadow-sm p-4 hover:shadow-md hover:border-brand-accent/30 transition-all duration-300"
                    >
                      <div className="flex items-start justify-between mb-2">
                        <h3 className="font-semibold text-brand-secondary group-hover:text-brand-accent transition-colors text-sm">
                          {offer.title}
                        </h3>
                        <ExternalLink className="w-4 h-4 text-gray-400 flex-shrink-0 ml-2" />
                      </div>
                      <p className="text-gray-600 text-xs mb-3">
                        {offer.description}
                      </p>
                      <span className="inline-flex items-center bg-brand-accent text-white text-xs font-semibold px-3 py-1.5 rounded-lg group-hover:bg-brand-accent-600 transition-colors">
                        {offer.cta}
                      </span>
                    </a>
                  ))}
                </div>
              </section>
            )}

            {/* Author Box */}
            <div className="bg-brand-primary-50 rounded-xl p-6 mb-10">
              <div className="flex flex-col sm:flex-row items-start gap-4">
                <div className="relative w-16 h-16 rounded-full overflow-hidden bg-brand-primary-100 flex-shrink-0">
                  <Image
                    src={author.avatar}
                    alt={author.name}
                    fill
                    className="object-cover"
                  />
                </div>
                <div>
                  <p className="text-xs text-gray-500 uppercase tracking-wider mb-1">
                    {t('content.writtenBy')}
                  </p>
                  <p className="font-bold text-brand-secondary text-lg">
                    {author.name}
                  </p>
                  <p className="text-sm text-brand-primary font-medium mb-2">
                    {author.credentials}
                  </p>
                  <p className="text-sm text-gray-600">{author.bio}</p>
                </div>
              </div>
            </div>

            {/* Related Posts */}
            {relatedPosts.length > 0 && (
              <section className="mb-10">
                <h2 className="text-2xl font-bold text-brand-secondary mb-6">
                  {t('sections.relatedContent')}
                </h2>
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                  {relatedPosts.map((post) => (
                    <Link
                      key={post.slug}
                      href={`/blog/${post.slug}/`}
                      className="group bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden hover:shadow-md transition-all duration-300"
                    >
                      <div className="relative h-36 overflow-hidden">
                        <Image
                          src={post.heroImage || '/images/placeholder.webp'}
                          alt={post.title}
                          fill
                          className="object-cover group-hover:scale-105 transition-transform duration-500"
                        />
                      </div>
                      <div className="p-4">
                        <p className="text-xs text-gray-400 mb-1">
                          {new Date(post.updatedAt).toLocaleDateString('en-US', {
                            year: 'numeric',
                            month: 'short',
                            day: 'numeric',
                          })}
                        </p>
                        <h3 className="font-semibold text-brand-secondary group-hover:text-brand-primary transition-colors text-sm line-clamp-2">
                          {post.title}
                        </h3>
                      </div>
                    </Link>
                  ))}
                </div>
              </section>
            )}
          </div>
        </div>
      </div>
    </>
  );
}

export const getStaticPaths: GetStaticPaths = async () => {
  const slugs = getSlugs('blog');
  return {
    paths: slugs.map((slug) => ({ params: { slug } })),
    fallback: false,
  };
};

export const getStaticProps: GetStaticProps = async ({ params }) => {
  const slug = params?.slug as string;
  const item = await getContentBySlug('blog', slug);
  if (!item) return { notFound: true };

  const toc = extractTableOfContents(item.htmlContent);
  const relatedPosts = getRelatedContent('blog', slug, item.meta.tags);

  // Contextual offers based on tags / city mentions
  const cityName = item.meta.city || 'Mexico';
  const contextualOffers = getActivityOffers(cityName);

  return {
    props: {
      item: {
        meta: item.meta,
        htmlContent: item.htmlContent,
        readingTime: item.readingTime,
      },
      toc,
      relatedPosts,
      contextualOffers,
    },
    revalidate: 86400,
  };
};
