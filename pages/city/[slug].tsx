import { GetStaticPaths, GetStaticProps } from 'next';
import Image from 'next/image';
import SEOHead from '../../components/SEOHead';
import Breadcrumbs from '../../components/Breadcrumbs';
import { useTranslation } from '../../hooks/useTranslation';
import { siteConfig } from '../../site.config';

const { getCityBySlug, getCitySlugs } = require('../../lib/cities');

interface CityPageProps {
  city: any;
}

export default function CityPage({ city }: CityPageProps) {
  const { t } = useTranslation('common');
  const cityName = city.name?.en || city.name || city.slug;

  return (
    <>
      <SEOHead
        title={`${cityName} Travel Guide - ${siteConfig.name}`}
        description={city.description?.en || city.description || `Complete travel guide for ${cityName} in ${siteConfig.destination}.`}
      />
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <Breadcrumbs items={[
          { name: t('nav.home'), href: '/' },
          { name: t('nav.cities'), href: '/city/' },
          { name: cityName, href: `/city/${city.slug}/` },
        ]} />

        {/* Hero */}
        {city.image && (
          <div className="relative h-64 md:h-96 rounded-xl overflow-hidden mb-8">
            <Image src={city.image} alt={cityName} fill className="object-cover" />
            <div className="absolute inset-0 bg-gradient-to-t from-black/50 to-transparent" />
            <div className="absolute bottom-6 left-6">
              <h1 className="text-3xl md:text-5xl font-bold text-white">{cityName}</h1>
              {city.region && (
                <span className="inline-block mt-2 bg-brand-primary text-white text-sm px-3 py-1 rounded-full">{city.region}</span>
              )}
            </div>
          </div>
        )}

        {!city.image && (
          <h1 className="text-3xl md:text-4xl font-bold text-brand-secondary mb-8">{cityName}</h1>
        )}

        {/* Content */}
        <div className="prose prose-lg max-w-none">
          <p className="text-gray-700 text-lg leading-relaxed">
            {city.description?.en || city.description || `Welcome to ${cityName}. More content coming soon.`}
          </p>
        </div>

        {/* Highlights */}
        {city.highlights && city.highlights.length > 0 && (
          <div className="mt-8">
            <h2 className="text-2xl font-bold text-brand-secondary mb-4">{t('common.highlights')}</h2>
            <div className="flex flex-wrap gap-2">
              {city.highlights.map((h: string, i: number) => (
                <span key={i} className="bg-brand-primary-50 text-brand-primary px-4 py-2 rounded-full text-sm font-medium">{h}</span>
              ))}
            </div>
          </div>
        )}
      </div>
    </>
  );
}

export const getStaticPaths: GetStaticPaths = async () => {
  const slugs = getCitySlugs();
  return {
    paths: slugs.map((slug: string) => ({ params: { slug } })),
    fallback: 'blocking',
  };
};

export const getStaticProps: GetStaticProps = async ({ params }) => {
  const city = getCityBySlug(params?.slug as string);
  if (!city) return { notFound: true };
  return {
    props: { city },
    revalidate: 86400,
  };
};
