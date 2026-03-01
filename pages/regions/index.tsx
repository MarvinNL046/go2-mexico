import { GetStaticProps } from 'next';
import Link from 'next/link';
import Image from 'next/image';
import { MapPin } from 'lucide-react';
import SEOHead from '../../components/SEOHead';
import Breadcrumbs from '../../components/Breadcrumbs';
import { useTranslation } from '../../hooks/useTranslation';
import { siteConfig } from '../../site.config';
import { getAllContent, ContentMeta } from '../../lib/content';

interface RegionsIndexProps {
  regions: ContentMeta[];
}

export default function RegionsIndex({ regions }: RegionsIndexProps) {
  const { t } = useTranslation('common');

  return (
    <>
      <SEOHead
        title={`Explore Mexico by Region - ${siteConfig.name}`}
        description="Discover Mexico's diverse regions from the Yucatan Peninsula to Baja California. Find travel guides, destinations, and tips for every region of Mexico."
        ogImage={siteConfig.seo.ogImage}
      />

      {/* Hero Section */}
      <section className="relative bg-gradient-to-br from-brand-primary via-brand-primary-700 to-brand-secondary min-h-[40vh] flex items-center">
        <div className="absolute inset-0 bg-black/20" />
        <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16 text-center">
          <h1 className="text-4xl md:text-5xl font-bold text-white mb-4">
            {t('sections.exploreRegions')}
          </h1>
          <p className="text-lg md:text-xl text-white/80 max-w-2xl mx-auto">
            From tropical coastlines to colonial highlands, discover the unique character of each Mexican region.
          </p>
        </div>
      </section>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <Breadcrumbs
          items={[
            { name: t('nav.home'), href: '/' },
            { name: t('nav.regions'), href: '/regions/' },
          ]}
        />

        {regions.length === 0 ? (
          <div className="text-center py-16">
            <MapPin className="w-16 h-16 text-gray-300 mx-auto mb-4" />
            <p className="text-gray-500 text-lg">
              Region guides are coming soon. We are working on comprehensive coverage of every Mexican region.
            </p>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            {regions.map((region) => (
              <Link
                key={region.slug}
                href={`/regions/${region.slug}/`}
                className="group bg-white rounded-xl shadow-md overflow-hidden hover:shadow-xl transition-all duration-300 border border-gray-100"
              >
                <div className="relative h-52 overflow-hidden">
                  <Image
                    src={region.heroImage || '/images/placeholder.webp'}
                    alt={region.title}
                    fill
                    className="object-cover group-hover:scale-105 transition-transform duration-500"
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-black/50 to-transparent" />
                  <div className="absolute bottom-4 left-4">
                    <span className="inline-flex items-center gap-1.5 bg-white/90 text-brand-primary text-xs font-semibold px-3 py-1 rounded-full">
                      <MapPin className="w-3.5 h-3.5" />
                      Region
                    </span>
                  </div>
                </div>
                <div className="p-5">
                  <h2 className="text-xl font-bold text-brand-secondary mb-2 group-hover:text-brand-primary transition-colors">
                    {region.title}
                  </h2>
                  {region.description && (
                    <p className="text-gray-600 text-sm line-clamp-3">
                      {region.description}
                    </p>
                  )}
                  {region.tags && region.tags.length > 0 && (
                    <div className="flex flex-wrap gap-1.5 mt-3">
                      {region.tags.slice(0, 3).map((tag) => (
                        <span
                          key={tag}
                          className="bg-brand-primary-50 text-brand-primary text-xs px-2 py-0.5 rounded-full"
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
  const regions = getAllContent('regions');
  return {
    props: { regions },
    revalidate: 86400,
  };
};
