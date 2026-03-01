import { GetStaticPaths, GetStaticProps } from 'next';
import Link from 'next/link';
import Image from 'next/image';
import {
  MapPin,
  Calendar,
  Clock,
  Compass,
  ExternalLink,
  Star,
} from 'lucide-react';
import SEOHead from '../../components/SEOHead';
import Breadcrumbs from '../../components/Breadcrumbs';
import { useTranslation } from '../../hooks/useTranslation';
import { siteConfig, getAuthor } from '../../site.config';
import {
  getSlugs,
  getContentBySlug,
  getRelatedContent,
  ContentMeta,
} from '../../lib/content';
import { getActivityOffers, AffiliateOffer } from '../../lib/affiliates';

interface ExperiencePageProps {
  item: {
    meta: ContentMeta;
    htmlContent: string;
    readingTime: number;
  };
  activityOffers: AffiliateOffer[];
  relatedDestinations: ContentMeta[];
  relatedItineraries: ContentMeta[];
  relatedExperiences: ContentMeta[];
}

export default function ExperiencePage({
  item,
  activityOffers,
  relatedDestinations,
  relatedItineraries,
  relatedExperiences,
}: ExperiencePageProps) {
  const { t } = useTranslation('common');
  const author = getAuthor(item.meta.author);

  return (
    <>
      <SEOHead
        title={`${item.meta.title} - Mexico Experience | ${siteConfig.name}`}
        description={
          item.meta.description ||
          `${item.meta.title} - discover this unique experience in Mexico. Tips, booking info, and practical details.`
        }
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
            <div className="flex flex-wrap items-center gap-2 mb-3">
              {item.meta.city && (
                <Link
                  href={`/cities/${item.meta.city.toLowerCase().replace(/\s+/g, '-')}/`}
                  className="inline-flex items-center gap-1.5 bg-brand-primary/90 text-white text-sm font-semibold px-3 py-1 rounded-full hover:bg-brand-primary transition-colors"
                >
                  <MapPin className="w-3.5 h-3.5" />
                  {item.meta.city}
                </Link>
              )}
              {item.meta.duration && (
                <span className="inline-flex items-center gap-1.5 bg-white/90 text-brand-secondary text-sm font-semibold px-3 py-1 rounded-full">
                  <Clock className="w-3.5 h-3.5" />
                  {item.meta.duration}
                </span>
              )}
              {item.meta.difficulty && (
                <span className="inline-flex items-center gap-1.5 bg-brand-accent/90 text-white text-sm font-semibold px-3 py-1 rounded-full">
                  {item.meta.difficulty}
                </span>
              )}
            </div>
            <h1 className="text-3xl md:text-5xl font-bold text-white mb-2">
              {item.meta.title}
            </h1>
            <div className="flex items-center gap-4 text-white/70 text-sm">
              <span className="flex items-center gap-1">
                <Clock className="w-4 h-4" />
                {item.readingTime} {t('content.readingTime')}
              </span>
            </div>
          </div>
        </div>
      </section>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <Breadcrumbs
          items={[
            { name: t('nav.home'), href: '/' },
            { name: t('nav.experiences'), href: '/experiences/' },
            {
              name: item.meta.title,
              href: `/experiences/${item.meta.slug}/`,
            },
          ]}
        />

        <p className="text-xs text-gray-400 mb-6 italic">
          {t('sections.affiliateDisclosure')}
        </p>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-10">
          {/* Main Content */}
          <div className="lg:col-span-2">
            {/* Quick facts */}
            {(item.meta.duration || item.meta.difficulty || item.meta.budget) && (
              <div className="bg-brand-primary-50 rounded-xl p-6 mb-8">
                <div className="grid grid-cols-2 sm:grid-cols-3 gap-4">
                  {item.meta.duration && (
                    <div>
                      <p className="text-xs text-gray-500 uppercase tracking-wider mb-1">
                        {t('content.duration')}
                      </p>
                      <p className="font-semibold text-brand-secondary">
                        {item.meta.duration}
                      </p>
                    </div>
                  )}
                  {item.meta.difficulty && (
                    <div>
                      <p className="text-xs text-gray-500 uppercase tracking-wider mb-1">
                        {t('content.difficulty')}
                      </p>
                      <p className="font-semibold text-brand-secondary">
                        {item.meta.difficulty}
                      </p>
                    </div>
                  )}
                  {item.meta.budget && (
                    <div>
                      <p className="text-xs text-gray-500 uppercase tracking-wider mb-1">
                        {t('content.budget')}
                      </p>
                      <p className="font-semibold text-brand-secondary">
                        {item.meta.budget}
                      </p>
                    </div>
                  )}
                </div>
              </div>
            )}

            {/* Content */}
            <section className="mb-10">
              <div
                className="prose prose-lg max-w-none prose-headings:text-brand-secondary prose-a:text-brand-primary prose-a:no-underline hover:prose-a:underline"
                dangerouslySetInnerHTML={{ __html: item.htmlContent }}
              />
            </section>

            {/* Booking CTA */}
            {activityOffers.length > 0 && (
              <section className="mb-10">
                <h2 className="flex items-center gap-2 text-2xl font-bold text-brand-secondary mb-6">
                  <Compass className="w-6 h-6 text-brand-accent" />
                  {t('sections.bookableOffers')}
                </h2>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  {activityOffers.map((offer, idx) => (
                    <a
                      key={idx}
                      href={offer.url}
                      target="_blank"
                      rel="noopener noreferrer nofollow sponsored"
                      className="group bg-white rounded-xl border border-gray-100 shadow-sm p-5 hover:shadow-md hover:border-brand-accent/30 transition-all duration-300"
                    >
                      <div className="flex items-start justify-between mb-2">
                        <h3 className="font-semibold text-brand-secondary group-hover:text-brand-accent transition-colors text-sm">
                          {offer.title}
                        </h3>
                        <ExternalLink className="w-4 h-4 text-gray-400 flex-shrink-0 ml-2" />
                      </div>
                      <p className="text-gray-600 text-sm mb-3">
                        {offer.description}
                      </p>
                      <span className="inline-flex items-center bg-brand-accent text-white text-sm font-semibold px-4 py-2 rounded-lg group-hover:bg-brand-accent-600 transition-colors">
                        {offer.cta}
                      </span>
                    </a>
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
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                  {relatedDestinations.map((dest) => (
                    <Link
                      key={dest.slug}
                      href={`/destinations/${dest.slug}/`}
                      className="group bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden hover:shadow-md transition-all duration-300"
                    >
                      <div className="relative h-32 overflow-hidden">
                        <Image
                          src={dest.heroImage || '/images/placeholder.webp'}
                          alt={dest.title}
                          fill
                          className="object-cover group-hover:scale-105 transition-transform duration-500"
                        />
                      </div>
                      <div className="p-3">
                        <h3 className="font-semibold text-brand-secondary group-hover:text-brand-primary transition-colors text-sm">
                          {dest.title}
                        </h3>
                      </div>
                    </Link>
                  ))}
                </div>
              </section>
            )}

            {/* Related Itineraries */}
            {relatedItineraries.length > 0 && (
              <section className="mb-10">
                <h2 className="text-2xl font-bold text-brand-secondary mb-6">
                  {t('sections.suggestedItineraries')}
                </h2>
                <div className="space-y-4">
                  {relatedItineraries.map((itin) => (
                    <Link
                      key={itin.slug}
                      href={`/itineraries/${itin.slug}/`}
                      className="group flex items-center gap-4 bg-white rounded-xl shadow-sm border border-gray-100 p-4 hover:shadow-md transition-all duration-300"
                    >
                      <div className="relative w-20 h-20 rounded-lg overflow-hidden flex-shrink-0">
                        <Image
                          src={itin.heroImage || '/images/placeholder.webp'}
                          alt={itin.title}
                          fill
                          className="object-cover"
                        />
                      </div>
                      <div className="flex-1 min-w-0">
                        <h3 className="font-semibold text-brand-secondary group-hover:text-brand-primary transition-colors">
                          {itin.title}
                        </h3>
                        <p className="text-gray-500 text-sm line-clamp-1 mt-1">
                          {itin.description}
                        </p>
                        {itin.duration && (
                          <span className="inline-flex items-center gap-1 text-xs text-brand-accent font-medium mt-1">
                            <Clock className="w-3 h-3" />
                            {itin.duration}
                          </span>
                        )}
                      </div>
                    </Link>
                  ))}
                </div>
              </section>
            )}
          </div>

          {/* Sidebar */}
          <aside className="lg:col-span-1">
            {/* Tags */}
            {item.meta.tags && item.meta.tags.length > 0 && (
              <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6 mb-6">
                <h3 className="font-bold text-brand-secondary mb-3">
                  {t('content.tags')}
                </h3>
                <div className="flex flex-wrap gap-2">
                  {item.meta.tags.map((tag) => (
                    <span
                      key={tag}
                      className="bg-brand-primary-50 text-brand-primary text-xs px-3 py-1 rounded-full font-medium"
                    >
                      {tag}
                    </span>
                  ))}
                </div>
              </div>
            )}

            {/* Related Experiences */}
            {relatedExperiences.length > 0 && (
              <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6 mb-6">
                <h3 className="font-bold text-brand-secondary mb-3">
                  More Experiences
                </h3>
                <div className="space-y-3">
                  {relatedExperiences.map((exp) => (
                    <Link
                      key={exp.slug}
                      href={`/experiences/${exp.slug}/`}
                      className="flex items-center gap-3 group"
                    >
                      <div className="relative w-12 h-12 rounded-lg overflow-hidden flex-shrink-0">
                        <Image
                          src={exp.heroImage || '/images/placeholder.webp'}
                          alt={exp.title}
                          fill
                          className="object-cover"
                        />
                      </div>
                      <span className="text-sm font-medium text-gray-700 group-hover:text-brand-primary transition-colors line-clamp-2">
                        {exp.title}
                      </span>
                    </Link>
                  ))}
                </div>
              </div>
            )}

            {/* Author Box */}
            <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6">
              <h3 className="font-bold text-brand-secondary mb-3">
                {t('content.writtenBy')}
              </h3>
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
                  <p className="font-semibold text-brand-secondary">
                    {author.name}
                  </p>
                  <p className="text-xs text-gray-500">{author.credentials}</p>
                </div>
              </div>
              <p className="text-sm text-gray-600">{author.bio}</p>
              <p className="text-xs text-gray-400 mt-3">
                {t('content.lastUpdated')}:{' '}
                {new Date(item.meta.updatedAt).toLocaleDateString('en-US', {
                  year: 'numeric',
                  month: 'long',
                  day: 'numeric',
                })}
              </p>
            </div>
          </aside>
        </div>
      </div>
    </>
  );
}

export const getStaticPaths: GetStaticPaths = async () => {
  const slugs = getSlugs('experiences');
  return {
    paths: slugs.map((slug) => ({ params: { slug } })),
    fallback: false,
  };
};

export const getStaticProps: GetStaticProps = async ({ params }) => {
  const slug = params?.slug as string;
  const item = await getContentBySlug('experiences', slug);
  if (!item) return { notFound: true };

  const cityName = item.meta.city || item.meta.title;
  const activityOffers = getActivityOffers(cityName);
  const relatedDestinations = getRelatedContent('destinations', slug, item.meta.tags);
  const relatedItineraries = getRelatedContent('itineraries', slug, item.meta.tags);
  const relatedExperiences = getRelatedContent('experiences', slug, item.meta.tags);

  return {
    props: {
      item: {
        meta: item.meta,
        htmlContent: item.htmlContent,
        readingTime: item.readingTime,
      },
      activityOffers,
      relatedDestinations,
      relatedItineraries,
      relatedExperiences,
    },
    revalidate: 86400,
  };
};
