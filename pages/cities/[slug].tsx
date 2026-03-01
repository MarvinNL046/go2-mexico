import { GetStaticPaths, GetStaticProps } from 'next';
import Link from 'next/link';
import Image from 'next/image';
import {
  MapPin,
  Calendar,
  Clock,
  Star,
  Plane,
  Hotel,
  Wifi,
  Shield,
  Compass,
  ExternalLink,
} from 'lucide-react';
import SEOHead from '../../components/SEOHead';
import Breadcrumbs from '../../components/Breadcrumbs';
import { useTranslation } from '../../hooks/useTranslation';
import { siteConfig, getAuthor } from '../../site.config';
import {
  getSlugs,
  getContentBySlug,
  getContentByCity,
  getRelatedContent,
  ContentMeta,
} from '../../lib/content';
import { getAllOffersForCity, AffiliateOffer } from '../../lib/affiliates';

interface CityPageProps {
  item: {
    meta: ContentMeta;
    htmlContent: string;
    readingTime: number;
  };
  offers: {
    activities: AffiliateOffer[];
    hotels: AffiliateOffer[];
    esim: AffiliateOffer[];
    security: AffiliateOffer[];
    flights: AffiliateOffer[];
  };
  relatedDestinations: ContentMeta[];
  relatedExperiences: ContentMeta[];
}

function OfferSection({
  title,
  icon: Icon,
  offers,
  colorClass,
}: {
  title: string;
  icon: React.ComponentType<{ className?: string }>;
  offers: AffiliateOffer[];
  colorClass: string;
}) {
  if (offers.length === 0) return null;
  return (
    <div className="mb-8">
      <h3 className="flex items-center gap-2 text-xl font-bold text-brand-secondary mb-4">
        <Icon className={`w-5 h-5 ${colorClass}`} />
        {title}
      </h3>
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
        {offers.map((offer, idx) => (
          <a
            key={idx}
            href={offer.url}
            target="_blank"
            rel="noopener noreferrer nofollow sponsored"
            className="group bg-white rounded-xl border border-gray-100 shadow-sm p-5 hover:shadow-md hover:border-brand-primary/30 transition-all duration-300"
          >
            <div className="flex items-start justify-between mb-2">
              <h4 className="font-semibold text-brand-secondary group-hover:text-brand-primary transition-colors text-sm">
                {offer.title}
              </h4>
              <ExternalLink className="w-4 h-4 text-gray-400 flex-shrink-0 ml-2" />
            </div>
            <p className="text-gray-600 text-sm mb-3 line-clamp-2">
              {offer.description}
            </p>
            <span className="inline-flex items-center gap-1 bg-brand-accent text-white text-sm font-semibold px-4 py-2 rounded-lg group-hover:bg-brand-accent-600 transition-colors">
              {offer.cta}
            </span>
          </a>
        ))}
      </div>
    </div>
  );
}

export default function CityPage({
  item,
  offers,
  relatedDestinations,
  relatedExperiences,
}: CityPageProps) {
  const { t } = useTranslation('common');
  const author = getAuthor(item.meta.author);
  const cityName = item.meta.city || item.meta.title.replace(/ Travel Guide$/, '');

  return (
    <>
      <SEOHead
        title={`${item.meta.title} - Hotels, Activities & Tips | ${siteConfig.name}`}
        description={
          item.meta.description ||
          `Complete travel guide for ${item.meta.title}, Mexico. Find the best hotels, tours, restaurants, and local tips.`
        }
        ogImage={item.meta.heroImage}
      >
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{
            __html: JSON.stringify({
              '@context': 'https://schema.org',
              '@type': 'TouristDestination',
              name: item.meta.title,
              description: item.meta.description,
              image: item.meta.heroImage,
              url: `${siteConfig.seo.siteUrl}/cities/${item.meta.slug}/`,
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
            {item.meta.region && (
              <Link
                href={`/regions/${item.meta.region.toLowerCase().replace(/[&\s]+/g, '-').replace(/--+/g, '-')}/`}
                className="inline-flex items-center gap-1.5 bg-white/90 text-brand-primary text-sm font-semibold px-3 py-1 rounded-full mb-3 hover:bg-white transition-colors"
              >
                <MapPin className="w-3.5 h-3.5" />
                {item.meta.region}
              </Link>
            )}
            <h1 className="text-3xl md:text-5xl font-bold text-white mb-2">
              {item.meta.title}
            </h1>
            <div className="flex items-center gap-4 text-white/70 text-sm">
              <span className="flex items-center gap-1">
                <Clock className="w-4 h-4" />
                {item.readingTime} {t('content.readingTime')}
              </span>
              <span className="flex items-center gap-1">
                <Calendar className="w-4 h-4" />
                {t('content.lastUpdated')}{' '}
                {new Date(item.meta.updatedAt).toLocaleDateString('en-US', {
                  year: 'numeric',
                  month: 'short',
                })}
              </span>
            </div>
          </div>
        </div>
      </section>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <Breadcrumbs
          items={[
            { name: t('nav.home'), href: '/' },
            { name: t('nav.cities'), href: '/cities/' },
            { name: item.meta.title, href: `/cities/${item.meta.slug}/` },
          ]}
        />

        {/* Affiliate Disclosure */}
        <p className="text-xs text-gray-400 mb-6 italic">
          {t('sections.affiliateDisclosure')}
        </p>

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

            {/* Activities */}
            <section className="mb-10">
              <h2 className="text-2xl font-bold text-brand-secondary mb-6">
                {t('sections.bookableOffers')}
              </h2>

              <OfferSection
                title={t('sections.activities')}
                icon={Compass}
                offers={offers.activities}
                colorClass="text-brand-accent"
              />

              <OfferSection
                title={t('sections.hotels')}
                icon={Hotel}
                offers={offers.hotels}
                colorClass="text-brand-primary"
              />

              <OfferSection
                title={t('sections.flights')}
                icon={Plane}
                offers={offers.flights}
                colorClass="text-blue-500"
              />

              <OfferSection
                title={t('sections.esim')}
                icon={Wifi}
                offers={offers.esim}
                colorClass="text-purple-500"
              />

              <OfferSection
                title={t('sections.security')}
                icon={Shield}
                offers={offers.security}
                colorClass="text-green-600"
              />
            </section>

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
            {/* Quick Book */}
            <div className="bg-brand-primary-50 rounded-xl p-6 mb-6 sticky top-24">
              <h3 className="font-bold text-brand-secondary mb-4">
                Plan Your {cityName} Trip
              </h3>
              <div className="space-y-3">
                {offers.hotels.length > 0 && (
                  <a
                    href={offers.hotels[0].url}
                    target="_blank"
                    rel="noopener noreferrer nofollow sponsored"
                    className="flex items-center gap-3 bg-white rounded-lg p-3 hover:shadow-md transition-all group"
                  >
                    <Hotel className="w-5 h-5 text-brand-primary" />
                    <span className="text-sm font-medium text-gray-700 group-hover:text-brand-primary transition-colors">
                      {t('cta.bookHotel')}
                    </span>
                  </a>
                )}
                {offers.flights.length > 0 && (
                  <a
                    href={offers.flights[0].url}
                    target="_blank"
                    rel="noopener noreferrer nofollow sponsored"
                    className="flex items-center gap-3 bg-white rounded-lg p-3 hover:shadow-md transition-all group"
                  >
                    <Plane className="w-5 h-5 text-blue-500" />
                    <span className="text-sm font-medium text-gray-700 group-hover:text-brand-primary transition-colors">
                      {t('cta.findFlights')}
                    </span>
                  </a>
                )}
                {offers.activities.length > 0 && (
                  <a
                    href={offers.activities[0].url}
                    target="_blank"
                    rel="noopener noreferrer nofollow sponsored"
                    className="flex items-center gap-3 bg-white rounded-lg p-3 hover:shadow-md transition-all group"
                  >
                    <Compass className="w-5 h-5 text-brand-accent" />
                    <span className="text-sm font-medium text-gray-700 group-hover:text-brand-primary transition-colors">
                      {t('cta.browseActivities')}
                    </span>
                  </a>
                )}
                {offers.esim.length > 0 && (
                  <a
                    href={offers.esim[0].url}
                    target="_blank"
                    rel="noopener noreferrer nofollow sponsored"
                    className="flex items-center gap-3 bg-white rounded-lg p-3 hover:shadow-md transition-all group"
                  >
                    <Wifi className="w-5 h-5 text-purple-500" />
                    <span className="text-sm font-medium text-gray-700 group-hover:text-brand-primary transition-colors">
                      {t('cta.getEsim')}
                    </span>
                  </a>
                )}
              </div>
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
  const slugs = getSlugs('cities');
  return {
    paths: slugs.map((slug) => ({ params: { slug } })),
    fallback: false,
  };
};

export const getStaticProps: GetStaticProps = async ({ params }) => {
  const slug = params?.slug as string;
  const item = await getContentBySlug('cities', slug);
  if (!item) return { notFound: true };

  const cityName = item.meta.city || item.meta.title.replace(/ Travel Guide$/, '');
  const offers = getAllOffersForCity(cityName);
  const relatedDestinations = getContentByCity('destinations', slug).slice(0, 4);
  const relatedExperiences = getContentByCity('experiences', slug).slice(0, 4);

  return {
    props: {
      item: {
        meta: item.meta,
        htmlContent: item.htmlContent,
        readingTime: item.readingTime,
      },
      offers,
      relatedDestinations,
      relatedExperiences,
    },
    revalidate: 86400,
  };
};
