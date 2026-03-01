import { GetStaticPaths, GetStaticProps } from 'next';
import Link from 'next/link';
import Image from 'next/image';
import { MapPin, Calendar, ArrowRight } from 'lucide-react';
import SEOHead from '../../components/SEOHead';
import Breadcrumbs from '../../components/Breadcrumbs';
import { useTranslation } from '../../hooks/useTranslation';
import { siteConfig, getAuthor } from '../../site.config';
import {
  getSlugs,
  getContentBySlug,
  getRelatedContent,
  getContentByRegion,
  ContentMeta,
  ContentItem,
} from '../../lib/content';

interface RegionPageProps {
  item: {
    meta: ContentMeta;
    htmlContent: string;
    readingTime: number;
  };
  relatedCities: ContentMeta[];
  relatedDestinations: ContentMeta[];
  relatedExperiences: ContentMeta[];
}

export default function RegionPage({
  item,
  relatedCities,
  relatedDestinations,
  relatedExperiences,
}: RegionPageProps) {
  const { t } = useTranslation('common');
  const author = getAuthor(item.meta.author);

  return (
    <>
      <SEOHead
        title={`${item.meta.title} - Mexico Region Guide | ${siteConfig.name}`}
        description={item.meta.description || `Complete travel guide to ${item.meta.title}, Mexico. Discover cities, destinations, and experiences in this region.`}
        ogImage={item.meta.heroImage}
      />

      {/* Hero Section */}
      <section className="relative h-[40vh] md:h-[50vh] overflow-hidden">
        <Image
          src={item.meta.heroImage || '/images/placeholder.webp'}
          alt={item.meta.title}
          fill
          className="object-cover"
          priority
        />
        <div className="absolute inset-0 bg-gradient-to-t from-black/70 via-black/30 to-transparent" />
        <div className="absolute bottom-0 left-0 right-0 p-6 md:p-10">
          <div className="max-w-7xl mx-auto">
            <span className="inline-flex items-center gap-1.5 bg-brand-primary text-white text-sm font-semibold px-3 py-1 rounded-full mb-3">
              <MapPin className="w-4 h-4" />
              Region
            </span>
            <h1 className="text-3xl md:text-5xl font-bold text-white mb-2">
              {item.meta.title}
            </h1>
            {item.meta.description && (
              <p className="text-white/80 text-lg max-w-2xl">
                {item.meta.description}
              </p>
            )}
          </div>
        </div>
      </section>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <Breadcrumbs
          items={[
            { name: t('nav.home'), href: '/' },
            { name: t('nav.regions'), href: '/regions/' },
            { name: item.meta.title, href: `/regions/${item.meta.slug}/` },
          ]}
        />

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-10">
          {/* Main Content */}
          <div className="lg:col-span-2">
            {/* Overview */}
            <section className="mb-10">
              <h2 className="text-2xl font-bold text-brand-secondary mb-4">
                {t('content.overview')}
              </h2>
              <div
                className="prose prose-lg max-w-none prose-headings:text-brand-secondary prose-a:text-brand-primary prose-a:no-underline hover:prose-a:underline"
                dangerouslySetInnerHTML={{ __html: item.htmlContent }}
              />
            </section>

            {/* Related Cities */}
            {relatedCities.length > 0 && (
              <section className="mb-10">
                <h2 className="text-2xl font-bold text-brand-secondary mb-6">
                  {t('sections.relatedCities')}
                </h2>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  {relatedCities.map((city) => (
                    <Link
                      key={city.slug}
                      href={`/cities/${city.slug}/`}
                      className="group flex items-center gap-4 bg-white rounded-xl shadow-sm border border-gray-100 p-4 hover:shadow-md transition-all duration-300"
                    >
                      <div className="relative w-20 h-20 rounded-lg overflow-hidden flex-shrink-0">
                        <Image
                          src={city.heroImage || '/images/placeholder.webp'}
                          alt={city.title}
                          fill
                          className="object-cover"
                        />
                      </div>
                      <div className="flex-1 min-w-0">
                        <h3 className="font-semibold text-brand-secondary group-hover:text-brand-primary transition-colors truncate">
                          {city.title}
                        </h3>
                        <p className="text-gray-500 text-sm line-clamp-2">
                          {city.description}
                        </p>
                      </div>
                      <ArrowRight className="w-5 h-5 text-gray-400 group-hover:text-brand-primary transition-colors flex-shrink-0" />
                    </Link>
                  ))}
                </div>
              </section>
            )}

            {/* Related Destinations */}
            {relatedDestinations.length > 0 && (
              <section className="mb-10">
                <h2 className="text-2xl font-bold text-brand-secondary mb-6">
                  {t('sections.relatedDestinations')}
                </h2>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  {relatedDestinations.map((dest) => (
                    <Link
                      key={dest.slug}
                      href={`/destinations/${dest.slug}/`}
                      className="group bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden hover:shadow-md transition-all duration-300"
                    >
                      <div className="relative h-36 overflow-hidden">
                        <Image
                          src={dest.heroImage || '/images/placeholder.webp'}
                          alt={dest.title}
                          fill
                          className="object-cover group-hover:scale-105 transition-transform duration-500"
                        />
                      </div>
                      <div className="p-4">
                        <h3 className="font-semibold text-brand-secondary group-hover:text-brand-primary transition-colors">
                          {dest.title}
                        </h3>
                        <p className="text-gray-500 text-sm line-clamp-2 mt-1">
                          {dest.description}
                        </p>
                      </div>
                    </Link>
                  ))}
                </div>
              </section>
            )}

            {/* Related Experiences */}
            {relatedExperiences.length > 0 && (
              <section className="mb-10">
                <h2 className="text-2xl font-bold text-brand-secondary mb-6">
                  {t('sections.relatedExperiences')}
                </h2>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  {relatedExperiences.map((exp) => (
                    <Link
                      key={exp.slug}
                      href={`/experiences/${exp.slug}/`}
                      className="group bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden hover:shadow-md transition-all duration-300"
                    >
                      <div className="relative h-36 overflow-hidden">
                        <Image
                          src={exp.heroImage || '/images/placeholder.webp'}
                          alt={exp.title}
                          fill
                          className="object-cover group-hover:scale-105 transition-transform duration-500"
                        />
                      </div>
                      <div className="p-4">
                        <h3 className="font-semibold text-brand-secondary group-hover:text-brand-primary transition-colors">
                          {exp.title}
                        </h3>
                        <p className="text-gray-500 text-sm line-clamp-2 mt-1">
                          {exp.description}
                        </p>
                      </div>
                    </Link>
                  ))}
                </div>
              </section>
            )}
          </div>

          {/* Sidebar */}
          <aside className="lg:col-span-1">
            {/* Quick Info */}
            <div className="bg-brand-primary-50 rounded-xl p-6 mb-6">
              <h3 className="font-bold text-brand-secondary mb-3">Quick Info</h3>
              <ul className="space-y-2 text-sm text-gray-700">
                {item.meta.tags && item.meta.tags.length > 0 && (
                  <li>
                    <span className="font-medium">{t('content.tags')}:</span>{' '}
                    {item.meta.tags.join(', ')}
                  </li>
                )}
                <li className="flex items-center gap-2">
                  <Calendar className="w-4 h-4 text-brand-primary" />
                  <span>
                    {t('content.lastUpdated')}:{' '}
                    {new Date(item.meta.updatedAt).toLocaleDateString('en-US', {
                      year: 'numeric',
                      month: 'long',
                      day: 'numeric',
                    })}
                  </span>
                </li>
              </ul>
            </div>

            {/* Author Box */}
            <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6">
              <div className="flex items-center gap-3 mb-3">
                <div className="relative w-12 h-12 rounded-full overflow-hidden bg-brand-primary-100">
                  <Image
                    src={author.avatar}
                    alt={author.name}
                    fill
                    className="object-cover"
                  />
                </div>
                <div>
                  <p className="font-semibold text-brand-secondary">{author.name}</p>
                  <p className="text-xs text-gray-500">{author.credentials}</p>
                </div>
              </div>
              <p className="text-sm text-gray-600">{author.bio}</p>
            </div>
          </aside>
        </div>
      </div>
    </>
  );
}

export const getStaticPaths: GetStaticPaths = async () => {
  const slugs = getSlugs('regions');
  return {
    paths: slugs.map((slug) => ({ params: { slug } })),
    fallback: false,
  };
};

export const getStaticProps: GetStaticProps = async ({ params }) => {
  const item = await getContentBySlug('regions', params?.slug as string);
  if (!item) return { notFound: true };

  const regionSlug = item.meta.slug;
  const relatedCities = getContentByRegion('cities', regionSlug).slice(0, 6);
  const relatedDestinations = getContentByRegion('destinations', regionSlug).slice(0, 4);
  const relatedExperiences = getContentByRegion('experiences', regionSlug).slice(0, 4);

  return {
    props: {
      item: {
        meta: item.meta,
        htmlContent: item.htmlContent,
        readingTime: item.readingTime,
      },
      relatedCities,
      relatedDestinations,
      relatedExperiences,
    },
    revalidate: 86400,
  };
};
