import Link from 'next/link';
import SEOHead from '../components/SEOHead';
import Breadcrumbs from '../components/Breadcrumbs';
import { useTranslation } from '../hooks/useTranslation';
import { siteConfig } from '../site.config';

export default function CookiePolicy() {
  const { t } = useTranslation('common');

  const schema = {
    '@context': 'https://schema.org',
    '@type': 'WebPage',
    name: `Cookie Policy - ${siteConfig.name}`,
    description: `Cookie policy for ${siteConfig.domain}. Learn how we use cookies and similar technologies.`,
    url: `https://${siteConfig.domain}/cookie-policy/`,
    publisher: {
      '@type': 'Organization',
      name: siteConfig.name,
      url: `https://${siteConfig.domain}`,
    },
  };

  return (
    <>
      <SEOHead
        title={`Cookie Policy - ${siteConfig.name}`}
        description={`Cookie policy for ${siteConfig.domain}. Learn how we use cookies and similar technologies on our Mexico travel guide.`}
        schema={schema}
        noIndex
      />

      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <Breadcrumbs
          items={[
            { name: t('nav.home'), href: '/' },
            { name: 'Cookie Policy', href: '/cookie-policy/' },
          ]}
        />

        <h1 className="text-3xl md:text-4xl font-bold text-brand-secondary mb-8">
          Cookie Policy
        </h1>

        <div className="prose prose-lg max-w-none text-gray-700">
          <p className="text-sm text-gray-500 mb-8">
            Last updated: January 1, 2025
          </p>

          <h2>What Are Cookies</h2>
          <p>
            Cookies are small text files that are stored on your computer or mobile device when you visit a website. They are widely used to make websites work more efficiently and to provide information to the owners of the site. {siteConfig.name} ({siteConfig.domain}) uses cookies and similar technologies to enhance your browsing experience.
          </p>

          <h2>How We Use Cookies</h2>
          <p>We use cookies for the following purposes:</p>

          <h3>Essential Cookies</h3>
          <p>
            These cookies are necessary for the website to function properly. They enable core functionality such as page navigation and access to secure areas of the website. The website cannot function properly without these cookies.
          </p>

          <h3>Analytics Cookies</h3>
          <p>
            We use Google Analytics to understand how visitors interact with our website. These cookies collect information about how you use our site, such as which pages you visit most often and whether you receive error messages. All information these cookies collect is aggregated and anonymous. We use this data to improve how our website works and to understand what content is most useful to our visitors.
          </p>

          <h3>Advertising and Affiliate Cookies</h3>
          <p>
            Our website contains affiliate links to third-party travel services and products. When you click on these links, third-party cookies may be set by our affiliate partners (such as booking platforms, travel insurance providers, and eSIM services). These cookies are used to track referrals so that we may earn a commission at no extra cost to you. These third-party cookies are governed by the respective privacy policies of those services.
          </p>

          <h2>Third-Party Cookies</h2>
          <p>
            In addition to our own cookies, we may also use various third-party cookies to report usage statistics, deliver advertisements, and so on. These cookies may be set when you interact with embedded content or external services linked from our site.
          </p>

          <h2>Managing Cookies</h2>
          <p>
            Most web browsers allow you to control cookies through their settings. You can set your browser to refuse cookies or to alert you when cookies are being sent. Please note that if you disable cookies, some features of our website may not function properly.
          </p>
          <p>
            You can manage your cookie preferences through your browser settings. Here are links to cookie management instructions for common browsers:
          </p>
          <ul>
            <li><a href="https://support.google.com/chrome/answer/95647" target="_blank" rel="noopener noreferrer" className="text-brand-primary hover:underline">Google Chrome</a></li>
            <li><a href="https://support.mozilla.org/en-US/kb/cookies-information-websites-store-on-your-computer" target="_blank" rel="noopener noreferrer" className="text-brand-primary hover:underline">Mozilla Firefox</a></li>
            <li><a href="https://support.apple.com/guide/safari/manage-cookies-sfri11471/mac" target="_blank" rel="noopener noreferrer" className="text-brand-primary hover:underline">Apple Safari</a></li>
            <li><a href="https://support.microsoft.com/en-us/microsoft-edge/delete-cookies-in-microsoft-edge-63947406-40ac-c3b8-57b9-2a946a29ae09" target="_blank" rel="noopener noreferrer" className="text-brand-primary hover:underline">Microsoft Edge</a></li>
          </ul>

          <h2>Google Analytics Opt-Out</h2>
          <p>
            You can opt out of Google Analytics tracking by installing the{' '}
            <a href="https://tools.google.com/dlpage/gaoptout" target="_blank" rel="noopener noreferrer" className="text-brand-primary hover:underline">
              Google Analytics Opt-out Browser Add-on
            </a>.
          </p>

          <h2>Changes to This Cookie Policy</h2>
          <p>
            We may update this cookie policy from time to time to reflect changes in technology, legislation, or our data practices. When we make changes, we will update the &quot;Last updated&quot; date at the top of this page. We encourage you to review this page periodically.
          </p>

          <h2>Contact Us</h2>
          <p>
            If you have questions about our use of cookies, please{' '}
            <Link href="/contact/" className="text-brand-primary hover:underline">
              contact us
            </Link>{' '}
            or email us at{' '}
            <a href={`mailto:hello@${siteConfig.domain}`} className="text-brand-primary hover:underline">
              hello@{siteConfig.domain}
            </a>.
          </p>
        </div>
      </div>
    </>
  );
}
