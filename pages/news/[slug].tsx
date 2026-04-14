import { GetStaticPaths, GetStaticProps } from 'next';
import Link from 'next/link';
import { useRouter } from 'next/router';
import SEOHead from '../../components/SEOHead';
import Breadcrumbs from '../../components/Breadcrumbs';
import { getAllNews, getNewsBySlug, NewsArticle } from '../../lib/news';

interface NewsArticlePageProps {
  article: NewsArticle;
}

const categoryLabels: Record<string, { en: string; nl: string }> = {
  economy: { en: 'Economy', nl: 'Economie' },
  tourism: { en: 'Tourism', nl: 'Toerisme' },
  safety: { en: 'Safety', nl: 'Veiligheid' },
  transport: { en: 'Transport', nl: 'Vervoer' },
  'visa-immigration': { en: 'Visa & Immigration', nl: 'Visum & Immigratie' },
  culture: { en: 'Culture', nl: 'Cultuur' },
  weather: { en: 'Weather', nl: 'Weer' },
  general: { en: 'General', nl: 'Algemeen' },
};

export default function NewsArticlePage({ article }: NewsArticlePageProps) {
  const { locale } = useRouter();
  const isNl = locale === 'nl';
  const lang = isNl ? 'nl' : 'en';

  const breadcrumbs = [
    { name: 'Home', href: '/' },
    { name: isNl ? 'Mexico Nieuws' : 'Mexico News', href: '/news/' },
    { name: article.title, href: `/news/${article.slug}/` },
  ];

  const jsonLd = {
    '@context': 'https://schema.org',
    '@type': 'NewsArticle',
    headline: article.title,
    description: article.description,
    datePublished: article.date,
    dateModified: article.date,
    author: { '@type': 'Organization', name: 'Go2Mexico' },
    publisher: {
      '@type': 'Organization',
      name: 'Go2Mexico',
      url: 'https://go2-mexico.com',
    },
    mainEntityOfPage: {
      '@type': 'WebPage',
      '@id': `https://go2-mexico.com/news/${article.slug}/`,
    },
  };

  return (
    <>
      <SEOHead
        title={`${article.title} | Mexico News — Go2Mexico`}
        description={article.description}
      >
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
        />
      </SEOHead>

      <div className="bg-surface-cream min-h-screen">
        <article className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          <Breadcrumbs items={breadcrumbs} />

          <header className="mt-4 mb-8">
            <div className="flex items-center gap-3 mb-4">
              <span className="text-sm font-medium px-3 py-1 rounded-full bg-blue-100 text-blue-800">
                {categoryLabels[article.category]?.[lang] || article.category}
              </span>
              <time className="text-sm text-gray-500">{article.date}</time>
            </div>
            <h1 className="text-3xl sm:text-4xl font-bold font-heading text-gray-900">
              {article.title}
            </h1>
            {article.source && (
              <p className="mt-3 text-sm text-gray-500">
                {isNl ? 'Bron' : 'Source'}:{' '}
                <a
                  href={article.source.url}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-blue-600 hover:underline"
                >
                  {article.source.name}
                </a>
              </p>
            )}
          </header>

          <div
            className="prose prose-lg max-w-none prose-headings:font-heading prose-a:text-blue-600 prose-a:no-underline hover:prose-a:underline"
            dangerouslySetInnerHTML={{ __html: article.contentHtml || '' }}
          />

          <footer className="mt-12 pt-8 border-t border-gray-200">
            <Link
              href="/news/"
              className="text-blue-600 hover:underline font-medium"
            >
              &larr; {isNl ? 'Terug naar Mexico Nieuws' : 'Back to Mexico News'}
            </Link>
          </footer>
        </article>
      </div>
    </>
  );
}

export const getStaticPaths: GetStaticPaths = async () => {
  return { paths: [], fallback: 'blocking' };
};

export const getStaticProps: GetStaticProps<NewsArticlePageProps> = async ({ params, locale }) => {
  const slug = params?.slug as string;
  const article = await getNewsBySlug(slug, locale);

  if (!article) {
    return { notFound: true };
  }

  return {
    props: { article },
    revalidate: 604800,
  };
};
