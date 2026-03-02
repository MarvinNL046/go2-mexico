import { GetStaticProps } from 'next';
import Link from 'next/link';
import Image from 'next/image';
import { useState } from 'react';
import { Landmark, Search, Filter } from 'lucide-react';
import SEOHead from '../../components/SEOHead';
import Breadcrumbs from '../../components/Breadcrumbs';
import { useTranslation } from '../../hooks/useTranslation';
import { siteConfig } from '../../site.config';
import { getAllContent, ContentMeta } from '../../lib/content';

interface DestinationsIndexProps {
  destinations: ContentMeta[];
  regions: string[];
}

export default function DestinationsIndex({
  destinations,
  regions,
}: DestinationsIndexProps) {
  const { t } = useTranslation('common');
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedRegion, setSelectedRegion] = useState('');

  const filteredDestinations = destinations.filter((dest) => {
    const matchesSearch =
      !searchQuery ||
      dest.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
      dest.description?.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesRegion = !selectedRegion || dest.region === selectedRegion;
    return matchesSearch && matchesRegion;
  });

  return (
    <>
      <SEOHead
        title={`Top Destinations & Attractions in Mexico | ${siteConfig.name}`}
        description="Discover Mexico's best destinations and attractions. From ancient Mayan ruins to stunning beaches, find must-visit places across Mexico."
        ogImage={siteConfig.seo.ogImage}
      />

      {/* Hero */}
      <section className="relative min-h-[35vh] flex items-center">
        <Image src="/images/heroes/destinations-hero.webp" alt="Chichen Itza pyramid in Mexico" fill className="object-cover" priority />
        <div className="absolute inset-0 bg-black/50" />
        <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16 text-center">
          <h1 className="text-4xl md:text-5xl font-bold text-white mb-4">
            {t('sections.topDestinations')}
          </h1>
          <p className="text-lg text-white/80 max-w-2xl mx-auto">
            Ancient ruins, stunning beaches, colonial cities, and natural wonders await you in Mexico.
          </p>
        </div>
      </section>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <Breadcrumbs
          items={[
            { name: t('nav.home'), href: '/' },
            { name: t('nav.destinations'), href: '/destinations/' },
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

        {filteredDestinations.length === 0 ? (
          <div className="text-center py-16">
            <Landmark className="w-16 h-16 text-gray-300 mx-auto mb-4" />
            <p className="text-gray-500 text-lg">
              {searchQuery || selectedRegion
                ? 'No destinations match your search. Try different keywords.'
                : 'Destination guides are coming soon. We are working on coverage of Mexico\'s top attractions.'}
            </p>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {filteredDestinations.map((dest) => (
              <Link
                key={dest.slug}
                href={`/destinations/${dest.slug}/`}
                className="group bg-white rounded-xl shadow-md overflow-hidden hover:shadow-xl transition-all duration-300 border border-gray-100"
              >
                <div className="relative h-52 overflow-hidden">
                  <Image
                    src={dest.heroImage || '/images/placeholder.webp'}
                    alt={dest.title}
                    fill
                    className="object-cover group-hover:scale-105 transition-transform duration-500"
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-black/50 to-transparent" />
                  <div className="absolute bottom-4 left-4 right-4">
                    <h2 className="text-lg font-bold text-white">
                      {dest.title}
                    </h2>
                  </div>
                  {dest.region && (
                    <span className="absolute top-3 left-3 bg-brand-accent text-white text-xs font-semibold px-3 py-1 rounded-full">
                      {dest.region}
                    </span>
                  )}
                </div>
                <div className="p-5">
                  {dest.description && (
                    <p className="text-gray-600 text-sm line-clamp-3">
                      {dest.description}
                    </p>
                  )}
                  {dest.tags && dest.tags.length > 0 && (
                    <div className="flex flex-wrap gap-1.5 mt-3">
                      {dest.tags.slice(0, 4).map((tag) => (
                        <span
                          key={tag}
                          className="bg-brand-accent-50 text-brand-accent text-xs px-2 py-0.5 rounded-full"
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
  const destinations = getAllContent('destinations');
  const allRegions = destinations
    .map((d) => d.region)
    .filter((r): r is string => !!r);
  const regions = Array.from(new Set(allRegions)).sort();

  return {
    props: { destinations, regions },
    revalidate: 86400,
  };
};
