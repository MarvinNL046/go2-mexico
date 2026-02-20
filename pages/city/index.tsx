import { GetStaticProps } from 'next';
import SEOHead from '../../components/SEOHead';
import CityCard from '../../components/CityCard';
import Breadcrumbs from '../../components/Breadcrumbs';
import { useTranslation } from '../../hooks/useTranslation';
import { siteConfig } from '../../site.config';

const { getAllCities } = require('../../lib/cities');

interface CityIndexProps {
  cities: any[];
}

export default function CityIndex({ cities }: CityIndexProps) {
  const { t } = useTranslation('common');

  return (
    <>
      <SEOHead
        title={`Cities in ${siteConfig.destination} - ${siteConfig.name}`}
        description={`Explore the best cities in ${siteConfig.destination}. Travel guides, attractions, food, hotels, and more.`}
      />
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <Breadcrumbs items={[
          { name: t('nav.home'), href: '/' },
          { name: t('nav.cities'), href: '/city/' },
        ]} />
        <h1 className="text-3xl md:text-4xl font-bold text-brand-secondary mb-8">
          {t('nav.cities')} in {siteConfig.destination}
        </h1>
        {cities.length === 0 ? (
          <p className="text-gray-500 text-center py-12">
            Content coming soon! We are working on adding cities.
          </p>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {cities.map((city: any) => (
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
        )}
      </div>
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
