import { GetStaticProps } from 'next';
import Link from 'next/link';
import { useRouter } from 'next/router';
import SEOHead from '../../components/SEOHead';
import Breadcrumbs from '../../components/Breadcrumbs';
import { getAllNews, NewsArticle } from '../../lib/news';

interface NewsPageProps {
  articles: NewsArticle[];
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

export default function NewsPage({ articles }: NewsPageProps) {
  const { locale } = useRouter();
  const isNl = locale === 'nl';
  const lang = isNl ? 'nl' : 'en';

  const breadcrumbs = [
    { name: 'Home', href: '/' },
    { name: isNl ? 'Mexico Nieuws' : 'Mexico News', href: '/news/' },
  ];

  return (
    <>
      <SEOHead
        title={isNl ? "Mexico Nieuws — Laatste Updates & Verhalen | Go2Mexico" : "Mexico News — Latest Updates & Stories | Go2Mexico"}
        description={isNl ? "Blijf op de hoogte van het laatste Mexico nieuws: toerisme-updates, visumwijzigingen, veiligheidswaarschuwingen en culturele verhalen. Dagelijks bijgewerkt." : "Stay informed with the latest Mexico news: tourism updates, visa changes, safety alerts, and cultural stories. Updated daily."}
      />

      <div className="bg-surface-cream min-h-screen">
        <section className="bg-white shadow-sm">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
            <Breadcrumbs items={breadcrumbs} />
            <h1 className="text-4xl font-bold font-heading text-gray-900 mt-4">
              {isNl ? 'Mexico Nieuws' : 'Mexico News'}
            </h1>
            <p className="mt-3 text-lg text-gray-600 max-w-3xl">
              {isNl ? 'Het laatste nieuws uit Mexico — toerisme-updates, visumwijzigingen, economie, veiligheid en cultuur. Dagelijks bijgewerkt uit betrouwbare bronnen.' : 'The latest news from Mexico — tourism updates, visa changes, economy, safety, and culture. Updated daily from trusted sources.'}
            </p>
          </div>
        </section>

        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          {articles.length === 0 ? (
            <p className="text-gray-500 text-center py-12">{isNl ? 'Nog geen nieuwsartikelen. Kom snel terug!' : 'No news articles yet. Check back soon!'}</p>
          ) : (
            <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
              {articles.map((article) => (
                <Link
                  key={article.slug}
                  href={`/news/${article.slug}/`}
                  className="bg-white rounded-xl shadow-sm hover:shadow-md transition-shadow p-6 flex flex-col"
                >
                  <div className="flex items-center gap-2 mb-3">
                    <span className="text-xs font-medium px-2 py-1 rounded-full bg-blue-100 text-blue-800">
                      {categoryLabels[article.category]?.[lang] || article.category}
                    </span>
                    <time className="text-xs text-gray-500">{article.date}</time>
                  </div>
                  <h2 className="text-lg font-semibold text-gray-900 mb-2 line-clamp-2">
                    {article.title}
                  </h2>
                  <p className="text-sm text-gray-600 line-clamp-3 flex-1">
                    {article.description}
                  </p>
                  {article.source && (
                    <p className="text-xs text-gray-400 mt-3">
                      {isNl ? 'Bron' : 'Source'}: {article.source.name}
                    </p>
                  )}
                </Link>
              ))}
            </div>
          )}
        </div>
      </div>
    </>
  );
}

export const getStaticProps: GetStaticProps<NewsPageProps> = async ({ locale }) => {
  const articles = getAllNews(locale);

  return {
    props: { articles },
    revalidate: 604800,
  };
};
