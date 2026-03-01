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

interface DestinationPageProps {
  item: {
    meta: ContentMeta;
    htmlContent: string;
    readingTime: number;
  };
  activityOffers: AffiliateOffer[];
  hotelOffers: AffiliateOffer[];
  relatedExperiences: ContentMeta[];
  relatedCities: ContentMeta[];
  relatedDestinations: ContentMeta[];
}

export default function DestinationPage({
  item,
  activityOffers,
  hotelOffers,
  relatedExperiences,
  relatedCities,
  relatedDestinations,
}: DestinationPageProps) {
  const { t } = useTranslation('common');
  const author = getAuthor(item.meta.author);

  return (
    <>
      <SEOHead
        title={`${item.meta.title} - Mexico Destination Guide | ${siteConfig.name}`}
        description={
          item.meta.description ||
          `Discover ${item.meta.title} in Mexico. Travel tips, things to do, and how to visit.`
        }
        ogImage={item.meta.heroImage}
      >
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{
            __html: JSON.stringify({
              '@context': 'https://schema.org',
              '@type': 'TouristAttraction',
              name: item.meta.title,
              description: item.meta.description,
              image: item.meta.heroImage,
              url: `${siteConfig.seo.siteUrl}/destinations/${item.meta.slug}/`,
            }),
          }}
        />
      </SEOHead>

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
              {item.meta.region && (
                <Link
                  href={`/regions/${item.meta.region.toLowerCase().replace(/[&\s]+/g, '-').replace(/--+/g, '-')}/`}
                  className="inline-flex items-center gap-1.5 bg-white/90 text-brand-primary text-sm font-semibold px-3 py-1 rounded-full hover:bg-white transition-colors"
                >
                  <MapPin className="w-3.5 h-3.5" />
                  {item.meta.region}
                </Link>
              )}
              {item.meta.city && (
                <Link
                  href={`/cities/${item.meta.city.toLowerCase().replace(/\s+/g, '-')}/`}
                  className="inline-flex items-center gap-1.5 bg-brand-accent/90 text-white text-sm font-semibold px-3 py-1 rounded-full hover:bg-brand-accent transition-colors"
                >
                  {item.meta.city}
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
            { name: t('nav.destinations'), href: '/destinations/' },
            { name: item.meta.title, href: `/destinations/${item.meta.slug}/` },
          ]}
        />

        <p className="text-xs text-gray-400 mb-6 italic">
          {t('sections.affiliateDisclosure')}
        </p>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-10">
          {/* Main Content */}
          <div className="lg:col-span-2">
            {/* Content */}
            <section className="mb-10">
              <div
                className="prose prose-lg max-w-none prose-headings:text-brand-secondary prose-a:text-brand-primary prose-a:no-underline hover:prose-a:underline"
                dangerouslySetInnerHTML={{ __html: item.htmlContent }}
              />
            </section>

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
                  {t('sections.hotels')}
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

            {/* Related Cities */}
            {relatedCities.length > 0 && (
              <section className="mb-10">
                <h2 className="text-2xl font-bold text-brand-secondary mb-6">
                  {t('sections.relatedCities')}
                </h2>
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                  {relatedCities.map((city) => (
                    <Link
                      key={city.slug}
                      href={`/cities/${city.slug}/`}
                      className="group text-center bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden hover:shadow-md transition-all duration-300 p-4"
                    >
                      <div className="relative w-16 h-16 rounded-full overflow-hidden mx-auto mb-3">
                        <Image
                          src={city.heroImage || '/images/placeholder.webp'}
                          alt={city.title}
                          fill
                          className="object-cover"
                        />
                      </div>
                      <h3 className="font-semibold text-brand-secondary group-hover:text-brand-primary transition-colors text-sm">
                        {city.title}
                      </h3>
                    </Link>
                  ))}
                </div>
              </section>
            )}
          </div>

          {/* Sidebar */}
          <aside className="lg:col-span-1">
            {/* Quick Info */}
            <div className="bg-brand-accent-50 rounded-xl p-6 mb-6">
              <h3 className="font-bold text-brand-secondary mb-3">
                Destination Info
              </h3>
              <ul className="space-y-2 text-sm text-gray-700">
                {item.meta.region && (
                  <li>
                    <span className="font-medium">Region:</span>{' '}
                    <Link
                      href={`/regions/${item.meta.region.toLowerCase().replace(/[&\s]+/g, '-').replace(/--+/g, '-')}/`}
                      className="text-brand-primary hover:underline"
                    >
                      {item.meta.region}
                    </Link>
                  </li>
                )}
                {item.meta.city && (
                  <li>
                    <span className="font-medium">City:</span>{' '}
                    <Link
                      href={`/cities/${item.meta.city.toLowerCase().replace(/\s+/g, '-')}/`}
                      className="text-brand-primary hover:underline"
                    >
                      {item.meta.city}
                    </Link>
                  </li>
                )}
                <li className="flex items-center gap-2">
                  <Calendar className="w-4 h-4 text-brand-accent" />
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
                      className="bg-brand-accent-50 text-brand-accent text-xs px-3 py-1 rounded-full font-medium"
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
            </div>
          </aside>
        </div>
      </div>
    </>
  );
}

export const getStaticPaths: GetStaticPaths = async () => {
  const slugs = getSlugs('destinations');
  return {
    paths: slugs.map((slug) => ({ params: { slug } })),
    fallback: false,
  };
};

export const getStaticProps: GetStaticProps = async ({ params }) => {
  const slug = params?.slug as string;
  const item = await getContentBySlug('destinations', slug);
  if (!item) return { notFound: true };

  const cityName = item.meta.city || item.meta.title;
  const activityOffers = getActivityOffers(cityName);
  const hotelOffers = getHotelOffers(cityName);
  const relatedExperiences = getRelatedContent('experiences', slug, item.meta.tags);
  const relatedCities = getRelatedContent('cities', slug, item.meta.tags);
  const relatedDestinations = getRelatedContent('destinations', slug, item.meta.tags);

  return {
    props: {
      item: {
        meta: item.meta,
        htmlContent: item.htmlContent,
        readingTime: item.readingTime,
      },
      activityOffers,
      hotelOffers,
      relatedExperiences,
      relatedCities,
      relatedDestinations,
    },
    revalidate: 86400,
  };
};
