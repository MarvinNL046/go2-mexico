import { GetStaticProps } from 'next';
import Link from 'next/link';
import SEOHead from '../components/SEOHead';
import CityCard from '../components/CityCard';
import { useTranslation } from '../hooks/useTranslation';
import { siteConfig } from '../site.config';

const { getAllCities } = require('../lib/cities');

interface HomeProps {
  cities: any[];
}

export default function Home({ cities }: HomeProps) {
  const { t } = useTranslation('common');

  return (
    <>
      <SEOHead
        title={`${siteConfig.name} - ${siteConfig.tagline}`}
        description={`Your complete ${siteConfig.destination} travel guide with city guides, local food, practical tips, and more.`}
      />

      {/* Hero Section */}
      <section className="relative bg-gradient-to-br from-brand-secondary via-brand-secondary-800 to-brand-primary min-h-[60vh] flex items-center">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-20 text-center">
          <h1 className="text-4xl md:text-6xl font-bold text-white mb-6">
            {t('hero.title')}
          </h1>
          <p className="text-xl text-white/80 mb-8 max-w-2xl mx-auto">
            {t('hero.subtitle')}
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Link
              href="/city/"
              className="bg-brand-primary hover:bg-brand-primary-600 text-white px-8 py-3 rounded-lg font-semibold text-lg transition-all duration-300 shadow-lg hover:shadow-xl"
            >
              {t('nav.exploreNow')}
            </Link>
            <Link
              href="/blog/"
              className="bg-white/10 hover:bg-white/20 text-white px-8 py-3 rounded-lg font-semibold text-lg transition-all duration-300 border border-white/30"
            >
              {t('sections.readMore')}
            </Link>
          </div>
        </div>
      </section>

      {/* Popular Cities */}
      {cities.length > 0 && (
        <section className="section-padding bg-gray-50">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="text-center mb-10">
              <h2 className="text-3xl font-bold text-brand-secondary mb-3">
                {t('sections.popularCities')}
              </h2>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {cities.slice(0, 6).map((city: any) => (
                <CityCard
                  key={city.slug}
                  name={city.name?.en || city.name || city.slug}
                  slug={city.slug}
                  image={city.image || '/images/placeholder.webp'}
                  region={city.region}
                  highlights={city.highlights || []}
                  description={city.description?.en || city.description}
                />
              ))}
            </div>
            {cities.length > 6 && (
              <div className="text-center mt-8">
                <Link href="/city/" className="btn-primary inline-block">
                  {t('sections.viewAll')}
                </Link>
              </div>
            )}
          </div>
        </section>
      )}

      {/* CTA Section */}
      <section className="bg-brand-secondary py-16">
        <div className="max-w-4xl mx-auto px-4 text-center">
          <h2 className="text-3xl font-bold text-white mb-4">
            Ready to explore {siteConfig.destination}?
          </h2>
          <p className="text-white/70 text-lg mb-8">
            Start planning your trip with our comprehensive guides, local tips, and travel resources.
          </p>
          <Link
            href="/city/"
            className="bg-brand-primary hover:bg-brand-primary-600 text-white px-8 py-3 rounded-lg font-semibold text-lg transition-all duration-300 shadow-lg"
          >
            {t('sections.viewAll')} {t('nav.cities')}
          </Link>
        </div>
      </section>
    </>
  );
}

export const getStaticProps: GetStaticProps = async () => {
  const cities = getAllCities();
  return {
    props: { cities },
    revalidate: 86400,
  };
};
