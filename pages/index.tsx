import { GetStaticProps } from 'next';
import Link from 'next/link';
import Image from 'next/image';
import {
  MapPin,
  Compass,
  Route,
  BookOpen,
  Star,
  Shield,
  Clock,
  ArrowRight,
  Hotel,
  Plane,
  Wifi,
  CheckCircle,
} from 'lucide-react';
import SEOHead from '../components/SEOHead';
import { useTranslation } from '../hooks/useTranslation';
import { siteConfig } from '../site.config';
import { getAllContent, ContentMeta } from '../lib/content';
import { getEsimOffers, getSecurityOffers, AffiliateOffer } from '../lib/affiliates';

interface HomeProps {
  cities: ContentMeta[];
  destinations: ContentMeta[];
  experiences: ContentMeta[];
  itineraries: ContentMeta[];
  blogPosts: ContentMeta[];
  esimOffers: AffiliateOffer[];
  securityOffers: AffiliateOffer[];
}

export default function Home({
  cities,
  destinations,
  experiences,
  itineraries,
  blogPosts,
  esimOffers,
  securityOffers,
}: HomeProps) {
  const { t } = useTranslation('common');

  return (
    <>
      <SEOHead
        title={`${siteConfig.name} - ${siteConfig.tagline}`}
        description="Your complete Mexico travel guide. Discover cities, destinations, experiences, and itineraries with expert tips on hotels, activities, food, and culture."
        ogImage={siteConfig.seo.ogImage}
      >
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{
            __html: JSON.stringify({
              '@context': 'https://schema.org',
              '@type': 'WebSite',
              name: siteConfig.name,
              url: siteConfig.seo.siteUrl,
              description: siteConfig.tagline,
              publisher: {
                '@type': 'Organization',
                name: siteConfig.name,
                url: siteConfig.seo.siteUrl,
              },
            }),
          }}
        />
      </SEOHead>

      {/* Hero Section */}
      <section className="relative bg-gradient-to-br from-brand-secondary via-brand-secondary-800 to-brand-primary min-h-[65vh] flex items-center overflow-hidden">
        <div className="absolute inset-0 bg-black/20" />
        <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-20 text-center">
          <h1 className="text-4xl md:text-6xl lg:text-7xl font-bold text-white mb-6 leading-tight">
            {t('hero.title')}
          </h1>
          <p className="text-lg md:text-xl text-white/80 mb-10 max-w-3xl mx-auto">
            {t('hero.subtitle')}
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Link
              href="/destinations/"
              className="bg-brand-accent hover:bg-brand-accent-600 text-white px-8 py-4 rounded-xl font-semibold text-lg transition-all duration-300 shadow-lg hover:shadow-xl inline-flex items-center justify-center gap-2"
            >
              <Compass className="w-5 h-5" />
              {t('hero.cta')}
            </Link>
            <Link
              href="/itineraries/"
              className="bg-white/10 hover:bg-white/20 text-white px-8 py-4 rounded-xl font-semibold text-lg transition-all duration-300 border border-white/30 inline-flex items-center justify-center gap-2"
            >
              <Route className="w-5 h-5" />
              {t('hero.secondaryCta')}
            </Link>
          </div>

          {/* Trust indicators */}
          <div className="flex flex-wrap justify-center gap-6 mt-12 text-white/60 text-sm">
            <span className="flex items-center gap-1.5">
              <CheckCircle className="w-4 h-4" />
              Expert-Written Guides
            </span>
            <span className="flex items-center gap-1.5">
              <CheckCircle className="w-4 h-4" />
              Firsthand Experience
            </span>
            <span className="flex items-center gap-1.5">
              <CheckCircle className="w-4 h-4" />
              Regularly Updated
            </span>
          </div>
        </div>
      </section>

      {/* Popular Cities */}
      {cities.length > 0 && (
        <section className="py-16 bg-white">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="flex items-end justify-between mb-10">
              <div>
                <h2 className="text-3xl md:text-4xl font-bold text-brand-secondary mb-2">
                  {t('sections.popularCities')}
                </h2>
                <p className="text-gray-600">
                  In-depth guides for Mexico&apos;s most popular cities
                </p>
              </div>
              <Link
                href="/cities/"
                className="hidden sm:inline-flex items-center gap-1 text-brand-primary hover:text-brand-primary-600 font-semibold transition-colors"
              >
                {t('sections.viewAll')}
                <ArrowRight className="w-4 h-4" />
              </Link>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {cities.slice(0, 6).map((city) => (
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
                    <h3 className="text-lg font-bold text-brand-secondary mb-1 group-hover:text-brand-primary transition-colors">
                      {city.title}
                    </h3>
                    {city.description && (
                      <p className="text-gray-600 text-sm line-clamp-2">
                        {city.description}
                      </p>
                    )}
                  </div>
                </Link>
              ))}
            </div>
            <div className="text-center mt-8 sm:hidden">
              <Link
                href="/cities/"
                className="inline-flex items-center gap-1 text-brand-primary font-semibold"
              >
                {t('sections.viewAll')} {t('nav.cities')}
                <ArrowRight className="w-4 h-4" />
              </Link>
            </div>
          </div>
        </section>
      )}

      {/* Featured Destinations */}
      {destinations.length > 0 && (
        <section className="py-16 bg-gray-50">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="flex items-end justify-between mb-10">
              <div>
                <h2 className="text-3xl md:text-4xl font-bold text-brand-secondary mb-2">
                  {t('sections.topDestinations')}
                </h2>
                <p className="text-gray-600">
                  Must-visit attractions and places across Mexico
                </p>
              </div>
              <Link
                href="/destinations/"
                className="hidden sm:inline-flex items-center gap-1 text-brand-primary hover:text-brand-primary-600 font-semibold transition-colors"
              >
                {t('sections.viewAll')}
                <ArrowRight className="w-4 h-4" />
              </Link>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
              {destinations.slice(0, 4).map((dest) => (
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
                    <div className="absolute inset-0 bg-gradient-to-t from-black/60 to-transparent" />
                    <div className="absolute bottom-3 left-3 right-3">
                      <h3 className="text-white font-bold text-lg">
                        {dest.title}
                      </h3>
                    </div>
                  </div>
                </Link>
              ))}
            </div>
            <div className="text-center mt-8 sm:hidden">
              <Link
                href="/destinations/"
                className="inline-flex items-center gap-1 text-brand-primary font-semibold"
              >
                {t('sections.viewAll')} {t('nav.destinations')}
                <ArrowRight className="w-4 h-4" />
              </Link>
            </div>
          </div>
        </section>
      )}

      {/* Featured Experiences */}
      {experiences.length > 0 && (
        <section className="py-16 bg-white">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="flex items-end justify-between mb-10">
              <div>
                <h2 className="text-3xl md:text-4xl font-bold text-brand-secondary mb-2">
                  {t('sections.featuredExperiences')}
                </h2>
                <p className="text-gray-600">
                  Unforgettable activities and things to do in Mexico
                </p>
              </div>
              <Link
                href="/experiences/"
                className="hidden sm:inline-flex items-center gap-1 text-brand-primary hover:text-brand-primary-600 font-semibold transition-colors"
              >
                {t('sections.viewAll')}
                <ArrowRight className="w-4 h-4" />
              </Link>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {experiences.slice(0, 3).map((exp) => (
                <Link
                  key={exp.slug}
                  href={`/experiences/${exp.slug}/`}
                  className="group bg-white rounded-xl shadow-md overflow-hidden hover:shadow-xl transition-all duration-300 border border-gray-100"
                >
                  <div className="relative h-48 overflow-hidden">
                    <Image
                      src={exp.heroImage || '/images/placeholder.webp'}
                      alt={exp.title}
                      fill
                      className="object-cover group-hover:scale-105 transition-transform duration-500"
                    />
                    <div className="absolute inset-0 bg-gradient-to-t from-black/40 to-transparent" />
                    {exp.duration && (
                      <span className="absolute top-3 right-3 inline-flex items-center gap-1 bg-white/90 text-brand-secondary text-xs font-semibold px-3 py-1 rounded-full">
                        <Clock className="w-3.5 h-3.5" />
                        {exp.duration}
                      </span>
                    )}
                  </div>
                  <div className="p-5">
                    <h3 className="text-lg font-bold text-brand-secondary mb-1 group-hover:text-brand-primary transition-colors">
                      {exp.title}
                    </h3>
                    {exp.description && (
                      <p className="text-gray-600 text-sm line-clamp-2">
                        {exp.description}
                      </p>
                    )}
                  </div>
                </Link>
              ))}
            </div>
            <div className="text-center mt-8 sm:hidden">
              <Link
                href="/experiences/"
                className="inline-flex items-center gap-1 text-brand-primary font-semibold"
              >
                {t('sections.viewAll')} {t('nav.experiences')}
                <ArrowRight className="w-4 h-4" />
              </Link>
            </div>
          </div>
        </section>
      )}

      {/* Suggested Itineraries */}
      {itineraries.length > 0 && (
        <section className="py-16 bg-gray-50">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="flex items-end justify-between mb-10">
              <div>
                <h2 className="text-3xl md:text-4xl font-bold text-brand-secondary mb-2">
                  {t('sections.suggestedItineraries')}
                </h2>
                <p className="text-gray-600">
                  Day-by-day travel plans crafted by our experts
                </p>
              </div>
              <Link
                href="/itineraries/"
                className="hidden sm:inline-flex items-center gap-1 text-brand-primary hover:text-brand-primary-600 font-semibold transition-colors"
              >
                {t('sections.viewAll')}
                <ArrowRight className="w-4 h-4" />
              </Link>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {itineraries.slice(0, 4).map((itin) => (
                <Link
                  key={itin.slug}
                  href={`/itineraries/${itin.slug}/`}
                  className="group flex bg-white rounded-xl shadow-md overflow-hidden hover:shadow-xl transition-all duration-300 border border-gray-100"
                >
                  <div className="relative w-32 sm:w-40 overflow-hidden flex-shrink-0">
                    <Image
                      src={itin.heroImage || '/images/placeholder.webp'}
                      alt={itin.title}
                      fill
                      className="object-cover group-hover:scale-105 transition-transform duration-500"
                    />
                  </div>
                  <div className="p-5 flex-1">
                    <div className="flex items-center gap-2 mb-2">
                      {itin.duration && (
                        <span className="inline-flex items-center gap-1 bg-brand-accent text-white text-xs font-bold px-2.5 py-1 rounded-full">
                          <Clock className="w-3 h-3" />
                          {itin.duration}
                        </span>
                      )}
                    </div>
                    <h3 className="font-bold text-brand-secondary mb-1 group-hover:text-brand-primary transition-colors">
                      {itin.title}
                    </h3>
                    {itin.description && (
                      <p className="text-gray-600 text-sm line-clamp-2">
                        {itin.description}
                      </p>
                    )}
                  </div>
                </Link>
              ))}
            </div>
            <div className="text-center mt-8 sm:hidden">
              <Link
                href="/itineraries/"
                className="inline-flex items-center gap-1 text-brand-primary font-semibold"
              >
                {t('sections.viewAll')} {t('nav.itineraries')}
                <ArrowRight className="w-4 h-4" />
              </Link>
            </div>
          </div>
        </section>
      )}

      {/* Latest Blog Posts */}
      {blogPosts.length > 0 && (
        <section className="py-16 bg-white">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="flex items-end justify-between mb-10">
              <div>
                <h2 className="text-3xl md:text-4xl font-bold text-brand-secondary mb-2">
                  {t('sections.latestBlog')}
                </h2>
                <p className="text-gray-600">
                  Travel stories, tips, and insights from our team
                </p>
              </div>
              <Link
                href="/blog/"
                className="hidden sm:inline-flex items-center gap-1 text-brand-primary hover:text-brand-primary-600 font-semibold transition-colors"
              >
                {t('sections.viewAll')}
                <ArrowRight className="w-4 h-4" />
              </Link>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {blogPosts.slice(0, 3).map((post) => (
                <Link
                  key={post.slug}
                  href={`/blog/${post.slug}/`}
                  className="group bg-white rounded-xl shadow-md overflow-hidden hover:shadow-xl transition-all duration-300 border border-gray-100"
                >
                  <div className="relative h-44 overflow-hidden">
                    <Image
                      src={post.heroImage || '/images/placeholder.webp'}
                      alt={post.title}
                      fill
                      className="object-cover group-hover:scale-105 transition-transform duration-500"
                    />
                    {post.category && (
                      <span className="absolute top-3 left-3 bg-brand-primary text-white text-xs font-semibold px-3 py-1 rounded-full">
                        {post.category}
                      </span>
                    )}
                  </div>
                  <div className="p-5">
                    <p className="text-xs text-gray-400 mb-2">
                      {new Date(post.updatedAt).toLocaleDateString('en-US', {
                        year: 'numeric',
                        month: 'long',
                        day: 'numeric',
                      })}
                    </p>
                    <h3 className="text-lg font-bold text-brand-secondary mb-1 group-hover:text-brand-primary transition-colors line-clamp-2">
                      {post.title}
                    </h3>
                    {post.description && (
                      <p className="text-gray-600 text-sm line-clamp-2">
                        {post.description}
                      </p>
                    )}
                  </div>
                </Link>
              ))}
            </div>
            <div className="text-center mt-8 sm:hidden">
              <Link
                href="/blog/"
                className="inline-flex items-center gap-1 text-brand-primary font-semibold"
              >
                {t('sections.readMore')}
                <ArrowRight className="w-4 h-4" />
              </Link>
            </div>
          </div>
        </section>
      )}

      {/* CTA Section with Affiliate Booking */}
      <section className="py-16 bg-gradient-to-br from-brand-primary via-brand-primary-700 to-brand-secondary">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-10">
            <h2 className="text-3xl md:text-4xl font-bold text-white mb-3">
              {t('sections.readyToExplore')}
            </h2>
            <p className="text-white/70 text-lg max-w-2xl mx-auto">
              {t('sections.readySubtitle')}
            </p>
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 max-w-4xl mx-auto">
            <a
              href={siteConfig.affiliateLinks.booking}
              target="_blank"
              rel="noopener noreferrer nofollow sponsored"
              className="flex flex-col items-center gap-3 bg-white/10 hover:bg-white/20 backdrop-blur-sm rounded-xl p-6 text-center transition-all duration-300 border border-white/10"
            >
              <Hotel className="w-8 h-8 text-white" />
              <span className="text-white font-semibold">{t('cta.bookHotel')}</span>
            </a>
            <a
              href={siteConfig.affiliateLinks.tripcom}
              target="_blank"
              rel="noopener noreferrer nofollow sponsored"
              className="flex flex-col items-center gap-3 bg-white/10 hover:bg-white/20 backdrop-blur-sm rounded-xl p-6 text-center transition-all duration-300 border border-white/10"
            >
              <Plane className="w-8 h-8 text-white" />
              <span className="text-white font-semibold">{t('cta.findFlights')}</span>
            </a>
            <a
              href={siteConfig.affiliateLinks.getYourGuide}
              target="_blank"
              rel="noopener noreferrer nofollow sponsored"
              className="flex flex-col items-center gap-3 bg-white/10 hover:bg-white/20 backdrop-blur-sm rounded-xl p-6 text-center transition-all duration-300 border border-white/10"
            >
              <Compass className="w-8 h-8 text-white" />
              <span className="text-white font-semibold">{t('cta.browseActivities')}</span>
            </a>
            <a
              href={siteConfig.affiliateLinks.airalo}
              target="_blank"
              rel="noopener noreferrer nofollow sponsored"
              className="flex flex-col items-center gap-3 bg-white/10 hover:bg-white/20 backdrop-blur-sm rounded-xl p-6 text-center transition-all duration-300 border border-white/10"
            >
              <Wifi className="w-8 h-8 text-white" />
              <span className="text-white font-semibold">{t('cta.getEsim')}</span>
            </a>
          </div>
          <p className="text-white/40 text-xs text-center mt-6">
            {t('sections.affiliateDisclosure')}
          </p>
        </div>
      </section>

      {/* E-E-A-T Trust Signals */}
      <section className="py-16 bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-10">
            <h2 className="text-2xl md:text-3xl font-bold text-brand-secondary mb-2">
              Why Trust {siteConfig.name}?
            </h2>
            <p className="text-gray-600">
              Our content is built on experience, expertise, and transparency
            </p>
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
            <div className="text-center p-6">
              <div className="w-14 h-14 bg-brand-primary-50 rounded-full flex items-center justify-center mx-auto mb-4">
                <Star className="w-7 h-7 text-brand-primary" />
              </div>
              <h3 className="font-bold text-brand-secondary mb-2">Expert Authors</h3>
              <p className="text-gray-600 text-sm">
                Written by travel writers with 10+ years of Mexico experience
              </p>
            </div>
            <div className="text-center p-6">
              <div className="w-14 h-14 bg-brand-accent-50 rounded-full flex items-center justify-center mx-auto mb-4">
                <MapPin className="w-7 h-7 text-brand-accent" />
              </div>
              <h3 className="font-bold text-brand-secondary mb-2">Firsthand Experience</h3>
              <p className="text-gray-600 text-sm">
                Every guide is based on personal visits and real-world testing
              </p>
            </div>
            <div className="text-center p-6">
              <div className="w-14 h-14 bg-blue-50 rounded-full flex items-center justify-center mx-auto mb-4">
                <Shield className="w-7 h-7 text-blue-600" />
              </div>
              <h3 className="font-bold text-brand-secondary mb-2">Transparent</h3>
              <p className="text-gray-600 text-sm">
                Clear affiliate disclosures and independent editorial standards
              </p>
            </div>
            <div className="text-center p-6">
              <div className="w-14 h-14 bg-green-50 rounded-full flex items-center justify-center mx-auto mb-4">
                <Clock className="w-7 h-7 text-green-600" />
              </div>
              <h3 className="font-bold text-brand-secondary mb-2">Up-to-Date</h3>
              <p className="text-gray-600 text-sm">
                Content reviewed and updated regularly to keep information current
              </p>
            </div>
          </div>
          <div className="flex flex-wrap justify-center gap-4 mt-8">
            <Link
              href="/about/"
              className="text-sm text-brand-primary hover:text-brand-primary-600 font-medium transition-colors"
            >
              About Us
            </Link>
            <span className="text-gray-300">|</span>
            <Link
              href="/editorial-policy/"
              className="text-sm text-brand-primary hover:text-brand-primary-600 font-medium transition-colors"
            >
              Editorial Policy
            </Link>
            <span className="text-gray-300">|</span>
            <Link
              href="/how-we-research/"
              className="text-sm text-brand-primary hover:text-brand-primary-600 font-medium transition-colors"
            >
              How We Research
            </Link>
            <span className="text-gray-300">|</span>
            <Link
              href="/affiliate-disclosure/"
              className="text-sm text-brand-primary hover:text-brand-primary-600 font-medium transition-colors"
            >
              Affiliate Disclosure
            </Link>
          </div>
        </div>
      </section>

      {/* Fallback content if no content exists yet */}
      {cities.length === 0 &&
        destinations.length === 0 &&
        experiences.length === 0 && (
          <section className="py-20 bg-gray-50">
            <div className="max-w-4xl mx-auto px-4 text-center">
              <Compass className="w-16 h-16 text-gray-300 mx-auto mb-6" />
              <h2 className="text-2xl font-bold text-brand-secondary mb-4">
                We are building something amazing
              </h2>
              <p className="text-gray-600 mb-8 max-w-2xl mx-auto">
                Our team is working on comprehensive guides covering Mexico&apos;s best cities,
                destinations, experiences, and travel itineraries. Check back soon for in-depth
                content to help plan your perfect Mexican adventure.
              </p>
              <Link
                href="/blog/"
                className="bg-brand-primary hover:bg-brand-primary-600 text-white px-6 py-3 rounded-lg font-semibold transition-colors"
              >
                Visit Our Blog
              </Link>
            </div>
          </section>
        )}
    </>
  );
}

export const getStaticProps: GetStaticProps = async () => {
  const cities = getAllContent('cities');
  const destinations = getAllContent('destinations');
  const experiences = getAllContent('experiences');
  const itineraries = getAllContent('itineraries');
  const blogPosts = getAllContent('blog');
  const esimOffers = getEsimOffers();
  const securityOffers = getSecurityOffers();

  return {
    props: {
      cities,
      destinations,
      experiences,
      itineraries,
      blogPosts,
      esimOffers,
      securityOffers,
    },
    revalidate: 86400,
  };
};
