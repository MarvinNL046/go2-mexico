import { GetStaticProps } from 'next';
import Link from 'next/link';
import Image from 'next/image';
import { useState } from 'react';
import { MapPin, Search, Filter } from 'lucide-react';
import SEOHead from '../../components/SEOHead';
import Breadcrumbs from '../../components/Breadcrumbs';
import { useTranslation } from '../../hooks/useTranslation';
import { siteConfig } from '../../site.config';
import { getAllContent, getAllTags, ContentMeta } from '../../lib/content';

interface CitiesIndexProps {
  cities: ContentMeta[];
  regions: string[];
}

export default function CitiesIndex({ cities, regions }: CitiesIndexProps) {
  const { t } = useTranslation('common');
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedRegion, setSelectedRegion] = useState('');

  const filteredCities = cities.filter((city) => {
    const matchesSearch =
      !searchQuery ||
      city.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
      city.description?.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesRegion = !selectedRegion || city.region === selectedRegion;
    return matchesSearch && matchesRegion;
  });

  return (
    <>
      <SEOHead
        title={`Cities in Mexico - Travel Guides | ${siteConfig.name}`}
        description="Explore the best cities in Mexico. Comprehensive travel guides for Mexico City, Cancun, Oaxaca, Guadalajara, and more with hotels, activities, and local tips."
        ogImage={siteConfig.seo.ogImage}
      />

      {/* Hero Section */}
      <section className="relative bg-gradient-to-br from-brand-secondary via-brand-secondary-800 to-brand-primary min-h-[35vh] flex items-center">
        <div className="absolute inset-0 bg-black/10" />
        <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16 text-center">
          <h1 className="text-4xl md:text-5xl font-bold text-white mb-4">
            {t('sections.popularCities')}
          </h1>
          <p className="text-lg text-white/80 max-w-2xl mx-auto">
            From vibrant metropolises to charming colonial towns, find your perfect Mexican city.
          </p>
        </div>
      </section>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <Breadcrumbs
          items={[
            { name: t('nav.home'), href: '/' },
            { name: t('nav.cities'), href: '/cities/' },
          ]}
        />

        {/* Search and Filter */}
        <div className="flex flex-col sm:flex-row gap-4 mb-8">
          <div className="relative flex-1">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
            <input
              type="text"
              placeholder={t('filters.searchPlaceholder')}
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full pl-10 pr-4 py-3 rounded-lg border border-gray-200 focus:border-brand-primary focus:ring-2 focus:ring-brand-primary/20 outline-none transition-all"
            />
          </div>
          {regions.length > 0 && (
            <div className="relative">
              <Filter className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
              <select
                value={selectedRegion}
                onChange={(e) => setSelectedRegion(e.target.value)}
                className="pl-10 pr-8 py-3 rounded-lg border border-gray-200 focus:border-brand-primary focus:ring-2 focus:ring-brand-primary/20 outline-none appearance-none bg-white min-w-[200px]"
              >
                <option value="">{t('filters.filterByRegion')}</option>
                {regions.map((region) => (
                  <option key={region} value={region}>
                    {region}
                  </option>
                ))}
              </select>
            </div>
          )}
        </div>

        {filteredCities.length === 0 ? (
          <div className="text-center py-16">
            <MapPin className="w-16 h-16 text-gray-300 mx-auto mb-4" />
            <p className="text-gray-500 text-lg">
              {searchQuery || selectedRegion
                ? 'No cities match your search. Try different keywords.'
                : 'City guides are coming soon. We are working on comprehensive coverage of Mexican cities.'}
            </p>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {filteredCities.map((city) => (
              <Link
                key={city.slug}
                href={`/cities/${city.slug}/`}
                className="group bg-white rounded-xl shadow-md overflow-hidden hover:shadow-xl transition-all duration-300 border border-gray-100"
              >
                <div className="relative h-48 overflow-hidden">
                  <Image
                    src={city.heroImage || '/images/placeholder.webp'}
                    alt={city.title}
                    fill
                    className="object-cover group-hover:scale-105 transition-transform duration-500"
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-black/40 to-transparent" />
                  {city.region && (
                    <span className="absolute top-3 left-3 bg-brand-primary text-white text-xs font-semibold px-3 py-1 rounded-full">
                      {city.region}
                    </span>
                  )}
                </div>
                <div className="p-5">
                  <h2 className="text-lg font-bold text-brand-secondary mb-2 group-hover:text-brand-primary transition-colors">
                    {city.title}
                  </h2>
                  {city.description && (
                    <p className="text-gray-600 text-sm line-clamp-2">
                      {city.description}
                    </p>
                  )}
                  {city.tags && city.tags.length > 0 && (
                    <div className="flex flex-wrap gap-1.5 mt-3">
                      {city.tags.slice(0, 3).map((tag) => (
                        <span
                          key={tag}
                          className="bg-gray-100 text-gray-600 text-xs px-2 py-0.5 rounded-full"
                        >
                          {tag}
                        </span>
                      ))}
                    </div>
                  )}
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
  const cities = getAllContent('cities');
  const allRegions = cities
    .map((c) => c.region)
    .filter((r): r is string => !!r);
  const regions = Array.from(new Set(allRegions)).sort();

  return {
    props: { cities, regions },
    revalidate: 86400,
  };
};
