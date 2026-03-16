import Link from 'next/link';
import SEOHead from '../components/SEOHead';
import Breadcrumbs from '../components/Breadcrumbs';
import { useTranslation } from '../hooks/useTranslation';
import { siteConfig } from '../site.config';

const sitemapSections = [
  {
    title: 'Main Pages',
    links: [
      { name: 'Home', href: '/' },
      { name: 'About', href: '/about/' },
      { name: 'Contact', href: '/contact/' },
      { name: 'Blog', href: '/blog/' },
    ],
  },
  {
    title: 'Destinations',
    links: [
      { name: 'Destinations', href: '/destinations/' },
      { name: 'Cities', href: '/city/' },
      { name: 'Regions', href: '/regions/' },
    ],
  },
  {
    title: 'Travel Planning',
    links: [
      { name: 'Itineraries', href: '/itineraries/' },
      { name: 'Experiences', href: '/experiences/' },
    ],
  },
  {
    title: 'Food & Drink',
    links: [
      { name: 'Food Guide', href: '/food/' },
    ],
  },
  {
    title: 'About Us',
    links: [
      { name: 'Editorial Policy', href: '/editorial-policy/' },
      { name: 'How We Research', href: '/how-we-research/' },
      { name: 'Affiliate Disclosure', href: '/affiliate-disclosure/' },
    ],
  },
  {
    title: 'Legal',
    links: [
      { name: 'Privacy Policy', href: '/privacy/' },
      { name: 'Terms of Use', href: '/terms/' },
      { name: 'Cookie Policy', href: '/cookie-policy/' },
    ],
  },
];

export default function Sitemap() {
  const { t } = useTranslation('common');

  const schema = {
    '@context': 'https://schema.org',
    '@type': 'WebPage',
    name: `Sitemap - ${siteConfig.name}`,
    description: `Complete sitemap of ${siteConfig.domain}. Find all pages and sections of our Mexico travel guide.`,
    url: `https://${siteConfig.domain}/sitemap/`,
    publisher: {
      '@type': 'Organization',
      name: siteConfig.name,
      url: `https://${siteConfig.domain}`,
    },
  };

  return (
    <>
      <SEOHead
        title={`Sitemap - ${siteConfig.name}`}
        description={`Complete sitemap of ${siteConfig.domain}. Find all pages and sections of our Mexico travel guide.`}
        schema={schema}
      />

      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <Breadcrumbs
          items={[
            { name: t('nav.home'), href: '/' },
            { name: 'Sitemap', href: '/sitemap/' },
          ]}
        />

        <h1 className="text-3xl md:text-4xl font-bold text-brand-secondary mb-8">
          Sitemap
        </h1>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
          {sitemapSections.map((section) => (
            <div key={section.title}>
              <h2 className="text-lg font-semibold text-brand-secondary mb-4">
                {section.title}
              </h2>
              <ul className="space-y-2">
                {section.links.map((link) => (
                  <li key={link.href}>
                    <Link
                      href={link.href}
                      className="text-brand-primary hover:underline"
                    >
                      {link.name}
                    </Link>
                  </li>
                ))}
              </ul>
            </div>
          ))}
        </div>
      </div>
    </>
  );
}
