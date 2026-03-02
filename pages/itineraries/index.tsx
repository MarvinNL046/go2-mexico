import { GetStaticProps } from 'next';
import Link from 'next/link';
import Image from 'next/image';
import { useState } from 'react';
import { Route, Search, Clock, MapPin } from 'lucide-react';
import SEOHead from '../../components/SEOHead';
import Breadcrumbs from '../../components/Breadcrumbs';
import { useTranslation } from '../../hooks/useTranslation';
import { siteConfig } from '../../site.config';
import { getAllContent, ContentMeta } from '../../lib/content';

interface ItinerariesIndexProps {
  itineraries: ContentMeta[];
}

export default function ItinerariesIndex({ itineraries }: ItinerariesIndexProps) {
  const { t } = useTranslation('common');
  const [searchQuery, setSearchQuery] = useState('');

  const filteredItineraries = itineraries.filter((itin) => {
    if (!searchQuery) return true;
    return (
      itin.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
      itin.description?.toLowerCase().includes(searchQuery.toLowerCase())
    );
  });

  return (
    <>
      <SEOHead
        title={`Mexico Travel Itineraries - Trip Plans & Routes | ${siteConfig.name}`}
        description="Find the perfect Mexico travel itinerary. Day-by-day plans for 3-day, 5-day, 7-day, and 2-week trips covering the best of Mexico."
        ogImage={siteConfig.seo.ogImage}
      />

      {/* Hero */}
      <section className="relative min-h-[35vh] flex items-center">
        <Image src="/images/heroes/itineraries-hero.webp" alt="Scenic road through Mexican landscape" fill className="object-cover" priority />
        <div className="absolute inset-0 bg-black/50" />
        <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16 text-center">
          <h1 className="text-4xl md:text-5xl font-bold text-white mb-4">
            {t('sections.suggestedItineraries')}
          </h1>
          <p className="text-lg text-white/80 max-w-2xl mx-auto">
            Expertly curated day-by-day travel plans to help you make the most of your time in Mexico.
          </p>
        </div>
      </section>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <Breadcrumbs
          items={[
            { name: t('nav.home'), href: '/' },
            { name: t('nav.itineraries'), href: '/itineraries/' },
          ]}
        />

        {/* Search */}
        <div className="mb-8">
          <div className="relative max-w-md">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
            <input
              type="text"
              placeholder="Search itineraries..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full pl-10 pr-4 py-3 rounded-lg border border-gray-200 focus:border-brand-primary focus:ring-2 focus:ring-brand-primary/20 outline-none transition-all"
            />
          </div>
        </div>

        {filteredItineraries.length === 0 ? (
          <div className="text-center py-16">
            <Route className="w-16 h-16 text-gray-300 mx-auto mb-4" />
            <p className="text-gray-500 text-lg">
              {searchQuery
                ? 'No itineraries match your search. Try different keywords.'
                : 'Travel itineraries are coming soon. We are crafting detailed day-by-day plans for exploring Mexico.'}
            </p>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {filteredItineraries.map((itin) => (
              <Link
                key={itin.slug}
                href={`/itineraries/${itin.slug}/`}
                className="group bg-white rounded-xl shadow-md overflow-hidden hover:shadow-xl transition-all duration-300 border border-gray-100"
              >
                <div className="flex flex-col sm:flex-row">
                  <div className="relative h-48 sm:h-auto sm:w-48 overflow-hidden flex-shrink-0">
                    <Image
                      src={itin.heroImage || '/images/placeholder.webp'}
                      alt={itin.title}
                      fill
                      className="object-cover group-hover:scale-105 transition-transform duration-500"
                    />
                  </div>
                  <div className="p-5 flex-1">
                    <div className="flex items-center gap-2 mb-3">
                      {itin.duration && (
                        <span className="inline-flex items-center gap-1 bg-brand-accent text-white text-xs font-bold px-3 py-1 rounded-full">
                          <Clock className="w-3.5 h-3.5" />
                          {itin.duration}
                        </span>
                      )}
                      {itin.region && (
                        <span className="inline-flex items-center gap-1 bg-brand-primary-50 text-brand-primary text-xs font-semibold px-3 py-1 rounded-full">
                          <MapPin className="w-3.5 h-3.5" />
                          {itin.region}
                        </span>
                      )}
                    </div>
                    <h2 className="text-lg font-bold text-brand-secondary mb-2 group-hover:text-brand-primary transition-colors">
                      {itin.title}
                    </h2>
                    {itin.description && (
                      <p className="text-gray-600 text-sm line-clamp-3 mb-3">
                        {itin.description}
                      </p>
                    )}
                    {itin.tags && itin.tags.length > 0 && (
                      <div className="flex flex-wrap gap-1.5">
                        {itin.tags.slice(0, 4).map((tag) => (
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
  const itineraries = getAllContent('itineraries');
  return {
    props: { itineraries },
    revalidate: 86400,
  };
};
