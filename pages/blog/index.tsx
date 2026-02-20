import { GetStaticProps } from 'next';
import Link from 'next/link';
import Image from 'next/image';
import SEOHead from '../../components/SEOHead';
import Breadcrumbs from '../../components/Breadcrumbs';
import { useTranslation } from '../../hooks/useTranslation';
import { siteConfig } from '../../site.config';

const { getAllPosts } = require('../../lib/blog');

interface BlogIndexProps {
  posts: any[];
}

export default function BlogIndex({ posts }: BlogIndexProps) {
  const { t } = useTranslation('common');

  return (
    <>
      <SEOHead
        title={`Travel Blog - ${siteConfig.name}`}
        description={`Latest ${siteConfig.destination} travel tips, guides, and stories.`}
      />
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <Breadcrumbs items={[
          { name: t('nav.home'), href: '/' },
          { name: t('nav.blog'), href: '/blog/' },
        ]} />
        <h1 className="text-3xl md:text-4xl font-bold text-brand-secondary mb-8">
          {siteConfig.destination} Travel Blog
        </h1>
        {posts.length === 0 ? (
          <p className="text-gray-500 text-center py-12">
            Blog coming soon! Stay tuned for travel stories and tips.
          </p>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {posts.map((post: any) => (
              <Link key={post.slug} href={`/blog/${post.slug}/`} className="bg-white rounded-xl shadow-lg overflow-hidden group hover:shadow-xl transition-all duration-300">
                <div className="relative h-48 overflow-hidden">
                  <Image src={post.image} alt={post.title} fill className="object-cover group-hover:scale-105 transition-transform duration-500" />
                  {post.category && (
                    <span className="absolute top-3 left-3 bg-brand-primary text-white text-xs font-semibold px-3 py-1 rounded-full">
                      {post.category}
                    </span>
                  )}
                </div>
                <div className="p-4">
                  <p className="text-xs text-gray-400 mb-2">{new Date(post.date).toLocaleDateString('en-US', { year: 'numeric', month: 'long', day: 'numeric' })}</p>
                  <h2 className="text-lg font-bold text-brand-secondary mb-2 group-hover:text-brand-primary transition-colors">{post.title}</h2>
                  <p className="text-gray-600 text-sm line-clamp-2">{post.excerpt}</p>
                </div>
              </Link>
            ))}
          </div>
        )}
      </div>
    </>
  );
}

export const getStaticProps: GetStaticProps = async () => {
  const posts = getAllPosts();
  return {
    props: { posts },
    revalidate: 86400,
  };
};
