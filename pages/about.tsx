import Image from 'next/image';
import Link from 'next/link';
import { Users, Award, Globe, Heart } from 'lucide-react';
import SEOHead from '../components/SEOHead';
import Breadcrumbs from '../components/Breadcrumbs';
import { useTranslation } from '../hooks/useTranslation';
import { siteConfig } from '../site.config';

export default function About() {
  const { t } = useTranslation('common');
  const authors = Object.entries(siteConfig.authors);

  return (
    <>
      <SEOHead
        title={`About Us - ${siteConfig.name}`}
        description={`Learn about the ${siteConfig.name} team. We are a group of travel writers and Mexico enthusiasts sharing authentic, experience-based travel guides.`}
      />

      {/* Hero */}
      <section className="relative bg-gradient-to-br from-brand-primary via-brand-primary-700 to-brand-secondary min-h-[30vh] flex items-center">
        <div className="absolute inset-0 bg-black/10" />
        <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-14 text-center">
          <h1 className="text-4xl md:text-5xl font-bold text-white mb-4">
            About {siteConfig.name}
          </h1>
          <p className="text-lg text-white/80 max-w-2xl mx-auto">
            Your trusted guide to exploring Mexico, created by people who truly know and love this country.
          </p>
        </div>
      </section>

      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <Breadcrumbs
          items={[
            { name: t('nav.home'), href: '/' },
            { name: t('nav.about'), href: '/about/' },
          ]}
        />

        {/* Mission */}
        <section className="mb-12">
          <h2 className="text-2xl font-bold text-brand-secondary mb-4">Our Mission</h2>
          <div className="prose prose-lg max-w-none text-gray-700">
            <p>
              {siteConfig.name} was created with a simple goal: to help travelers discover the real Mexico.
              Beyond the tourist brochures and generic travel advice, we provide in-depth, experience-based
              guides that help you explore Mexico with confidence.
            </p>
            <p>
              Whether you are planning your first trip to Cancun or seeking hidden cenotes in the Yucatan,
              our team has been there. Every guide is written from firsthand experience, verified for accuracy,
              and regularly updated to keep information current.
            </p>
          </div>
        </section>

        {/* Values */}
        <section className="mb-12">
          <h2 className="text-2xl font-bold text-brand-secondary mb-6">What We Stand For</h2>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
            <div className="bg-brand-primary-50 rounded-xl p-6">
              <Award className="w-8 h-8 text-brand-primary mb-3" />
              <h3 className="font-bold text-brand-secondary mb-2">Authenticity</h3>
              <p className="text-gray-600 text-sm">
                Every recommendation comes from personal experience. We visit the places we write about
                and share honest opinions, even when it means pointing out drawbacks.
              </p>
            </div>
            <div className="bg-brand-accent-50 rounded-xl p-6">
              <Globe className="w-8 h-8 text-brand-accent mb-3" />
              <h3 className="font-bold text-brand-secondary mb-2">Accuracy</h3>
              <p className="text-gray-600 text-sm">
                Travel information changes frequently. We regularly review and update our content to
                ensure prices, opening hours, and practical details remain accurate.
              </p>
            </div>
            <div className="bg-brand-secondary-50 rounded-xl p-6">
              <Heart className="w-8 h-8 text-brand-secondary mb-3" />
              <h3 className="font-bold text-brand-secondary mb-2">Responsible Travel</h3>
              <p className="text-gray-600 text-sm">
                We promote sustainable and responsible travel practices. Our guides include tips on
                respecting local cultures, supporting local businesses, and minimizing environmental impact.
              </p>
            </div>
            <div className="bg-green-50 rounded-xl p-6">
              <Users className="w-8 h-8 text-green-600 mb-3" />
              <h3 className="font-bold text-brand-secondary mb-2">Community</h3>
              <p className="text-gray-600 text-sm">
                We believe travel is better when shared. Our content aims to build a community of
                Mexico travelers who help each other explore this incredible country.
              </p>
            </div>
          </div>
        </section>

        {/* Team */}
        <section className="mb-12">
          <h2 className="text-2xl font-bold text-brand-secondary mb-6">Meet the Team</h2>
          <div className="space-y-6">
            {authors.map(([key, author]) => (
              <div
                key={key}
                className="bg-white rounded-xl shadow-sm border border-gray-100 p-6 flex flex-col sm:flex-row items-start gap-4"
              >
                <div className="relative w-20 h-20 rounded-full overflow-hidden bg-brand-primary-100 flex-shrink-0">
                  <Image
                    src={author.avatar}
                    alt={author.name}
                    fill
                    className="object-cover"
                  />
                </div>
                <div>
                  <h3 className="font-bold text-brand-secondary text-lg">{author.name}</h3>
                  <p className="text-brand-primary text-sm font-medium mb-2">
                    {author.credentials}
                  </p>
                  <p className="text-gray-600 text-sm">{author.bio}</p>
                </div>
              </div>
            ))}
          </div>
        </section>

        {/* Transparency */}
        <section className="mb-12">
          <h2 className="text-2xl font-bold text-brand-secondary mb-4">Transparency</h2>
          <div className="prose prose-lg max-w-none text-gray-700">
            <p>
              {siteConfig.name} participates in affiliate programs with trusted travel partners. When you
              book through our links, we may earn a small commission at no extra cost to you. This helps
              us maintain and improve our free content.
            </p>
            <p>
              Affiliate partnerships never influence our recommendations. We only recommend services and
              products we have personally used or thoroughly researched. Read our full{' '}
              <Link href="/affiliate-disclosure/" className="text-brand-primary hover:underline">
                affiliate disclosure
              </Link>{' '}
              and{' '}
              <Link href="/editorial-policy/" className="text-brand-primary hover:underline">
                editorial policy
              </Link>{' '}
              for more details.
            </p>
          </div>
        </section>

        {/* Part of Go2 Network */}
        <section className="bg-gray-50 rounded-xl p-6">
          <h2 className="text-xl font-bold text-brand-secondary mb-3">Part of the Go2 Travel Network</h2>
          <p className="text-gray-600 text-sm mb-4">
            {siteConfig.name} is part of the Go2 family of destination-specific travel guides.
            Each site in our network follows the same high editorial standards.
          </p>
          <div className="flex flex-wrap gap-2">
            {siteConfig.sisterSites
              .filter((s) => s.domain !== siteConfig.domain)
              .map((site) => (
                <a
                  key={site.domain}
                  href={`https://${site.domain}`}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-sm bg-white px-3 py-1.5 rounded-full border border-gray-200 text-gray-600 hover:text-brand-primary hover:border-brand-primary transition-colors"
                >
                  {site.name}
                </a>
              ))}
          </div>
        </section>
      </div>
    </>
  );
}
