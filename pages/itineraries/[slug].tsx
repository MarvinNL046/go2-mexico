import { GetStaticPaths, GetStaticProps } from 'next';
import Link from 'next/link';
import Image from 'next/image';
import {
  MapPin,
  Calendar,
  Clock,
  Compass,
  Hotel,
  ExternalLink,
  ChevronRight,
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
import {
  getActivityOffers,
  getHotelOffers,
  AffiliateOffer,
} from '../../lib/affiliates';

interface DaySection {
  day: number;
  title: string;
  content: string;
}

interface ItineraryPageProps {
  item: {
    meta: ContentMeta;
    htmlContent: string;
    readingTime: number;
  };
  days: DaySection[];
  activityOffers: AffiliateOffer[];
  hotelOffers: AffiliateOffer[];
  relatedItineraries: ContentMeta[];
}

function parseDays(html: string): DaySection[] {
  const days: DaySection[] = [];
  // Match h2 or h3 headings that contain "Day" followed by a number
  const regex = /<h[23][^>]*>(.*?Day\s*(\d+)[^<]*)<\/h[23]>/gi;
  const parts = html.split(regex);

  if (parts.length <= 1) {
    // No day headers found, return empty
    return [];
  }

  // parts layout: [before, title1, dayNum1, content1, title2, dayNum2, content2, ...]
  for (let i = 1; i < parts.length; i += 3) {
    const title = parts[i]?.replace(/<[^>]*>/g, '') || '';
    const dayNum = parseInt(parts[i + 1] || '0', 10);
    const content = parts[i + 2] || '';
    if (dayNum > 0) {
      days.push({ day: dayNum, title, content });
    }
  }

  return days.sort((a, b) => a.day - b.day);
}

export default function ItineraryPage({
  item,
  days,
  activityOffers,
  hotelOffers,
  relatedItineraries,
}: ItineraryPageProps) {
  const { t } = useTranslation('common');
  const author = getAuthor(item.meta.author);

  return (
    <>
      <SEOHead
        title={`${item.meta.title} - Mexico Itinerary | ${siteConfig.name}`}
        description={
          item.meta.description ||
          `Day-by-day travel itinerary for ${item.meta.title}. Detailed plan with activities, hotels, and tips.`
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
              {item.meta.duration && (
                <span className="inline-flex items-center gap-1.5 bg-brand-accent text-white text-sm font-bold px-3 py-1 rounded-full">
                  <Clock className="w-4 h-4" />
                  {item.meta.duration}
                </span>
              )}
              {item.meta.region && (
                <Link
                  href={`/regions/${item.meta.region.toLowerCase().replace(/[&\s]+/g, '-').replace(/--+/g, '-')}/`}
                  className="inline-flex items-center gap-1.5 bg-white/90 text-brand-primary text-sm font-semibold px-3 py-1 rounded-full hover:bg-white transition-colors"
                >
                  <MapPin className="w-3.5 h-3.5" />
                  {item.meta.region}
                </Link>
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
            { name: t('nav.itineraries'), href: '/itineraries/' },
            {
              name: item.meta.title,
              href: `/itineraries/${item.meta.slug}/`,
            },
          ]}
        />

        <p className="text-xs text-gray-400 mb-6 italic">
          {t('sections.affiliateDisclosure')}
        </p>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-10">
          {/* Main Content */}
          <div className="lg:col-span-2">
            {/* Itinerary Overview */}
            <section className="mb-10">
              <h2 className="text-2xl font-bold text-brand-secondary mb-4">
                {t('sections.itineraryOverview')}
              </h2>

              {/* Quick facts */}
              <div className="bg-brand-primary-50 rounded-xl p-6 mb-6">
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
            </section>

            {/* Day by Day or full content */}
            {days.length > 0 ? (
              <section className="mb-10">
                <h2 className="text-2xl font-bold text-brand-secondary mb-6">
                  {t('sections.dayByDay')}
                </h2>
                <div className="space-y-6">
                  {days.map((day) => (
                    <div
                      key={day.day}
                      className="bg-white rounded-xl border border-gray-100 shadow-sm overflow-hidden"
                    >
                      <div className="bg-brand-primary px-6 py-3 flex items-center gap-3">
                        <span className="bg-white text-brand-primary font-bold text-sm w-8 h-8 rounded-full flex items-center justify-center">
                          {day.day}
                        </span>
                        <h3 className="font-semibold text-white">{day.title}</h3>
                      </div>
                      <div className="p-6">
                        <div
                          className="prose prose-sm max-w-none prose-headings:text-brand-secondary prose-a:text-brand-primary"
                          dangerouslySetInnerHTML={{ __html: day.content }}
                        />
                      </div>
                    </div>
                  ))}
                </div>
              </section>
            ) : (
              <section className="mb-10">
                <div
                  className="prose prose-lg max-w-none prose-headings:text-brand-secondary prose-a:text-brand-primary prose-a:no-underline hover:prose-a:underline"
                  dangerouslySetInnerHTML={{ __html: item.htmlContent }}
                />
              </section>
            )}

            {/* Activity Offers */}
            {activityOffers.length > 0 && (
              <section className="mb-10">
                <h2 className="flex items-center gap-2 text-2xl font-bold text-brand-secondary mb-6">
                  <Compass className="w-6 h-6 text-brand-accent" />
                  {t('sections.activities')}
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

            {/* Hotel Offers */}
            {hotelOffers.length > 0 && (
              <section className="mb-10">
                <h2 className="flex items-center gap-2 text-2xl font-bold text-brand-secondary mb-6">
                  <Hotel className="w-6 h-6 text-brand-primary" />
                  {t('sections.whereToStay')}
                </h2>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  {hotelOffers.map((offer, idx) => (
                    <a
                      key={idx}
                      href={offer.url}
                      target="_blank"
                      rel="noopener noreferrer nofollow sponsored"
                      className="group bg-white rounded-xl border border-gray-100 shadow-sm p-5 hover:shadow-md hover:border-brand-primary/30 transition-all duration-300"
                    >
                      <div className="flex items-start justify-between mb-2">
                        <h3 className="font-semibold text-brand-secondary group-hover:text-brand-primary transition-colors text-sm">
                          {offer.title}
                        </h3>
                        <ExternalLink className="w-4 h-4 text-gray-400 flex-shrink-0 ml-2" />
                      </div>
                      <p className="text-gray-600 text-sm mb-3">
                        {offer.description}
                      </p>
                      <span className="inline-flex items-center bg-brand-primary text-white text-sm font-semibold px-4 py-2 rounded-lg group-hover:bg-brand-primary-600 transition-colors">
                        {offer.cta}
                      </span>
                    </a>
                  ))}
                </div>
              </section>
            )}

            {/* Related Itineraries */}
            {relatedItineraries.length > 0 && (
              <section className="mb-10">
                <h2 className="text-2xl font-bold text-brand-secondary mb-6">
                  More Itineraries
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
                      <ChevronRight className="w-5 h-5 text-gray-400 group-hover:text-brand-primary transition-colors flex-shrink-0" />
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
  const slugs = getSlugs('itineraries');
  return {
    paths: slugs.map((slug) => ({ params: { slug } })),
    fallback: false,
  };
};

export const getStaticProps: GetStaticProps = async ({ params }) => {
  const slug = params?.slug as string;
  const item = await getContentBySlug('itineraries', slug);
  if (!item) return { notFound: true };

  const days = parseDays(item.htmlContent);
  const cityName = item.meta.city || 'Mexico';
  const activityOffers = getActivityOffers(cityName);
  const hotelOffers = getHotelOffers(cityName);
  const relatedItineraries = getRelatedContent('itineraries', slug, item.meta.tags);

  return {
    props: {
      item: {
        meta: item.meta,
        htmlContent: item.htmlContent,
        readingTime: item.readingTime,
      },
      days,
      activityOffers,
      hotelOffers,
      relatedItineraries,
    },
    revalidate: 86400,
  };
};
