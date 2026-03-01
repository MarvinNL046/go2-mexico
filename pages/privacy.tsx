import Link from 'next/link';
import SEOHead from '../components/SEOHead';
import Breadcrumbs from '../components/Breadcrumbs';
import { useTranslation } from '../hooks/useTranslation';
import { siteConfig } from '../site.config';

export default function Privacy() {
  const { t } = useTranslation('common');

  return (
    <>
      <SEOHead
        title={`Privacy Policy - ${siteConfig.name}`}
        description={`Privacy policy for ${siteConfig.domain}. Learn how we collect, use, and protect your personal information.`}
      />

      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <Breadcrumbs
          items={[
            { name: t('nav.home'), href: '/' },
            { name: t('nav.privacy'), href: '/privacy/' },
          ]}
        />

        <h1 className="text-3xl md:text-4xl font-bold text-brand-secondary mb-4">
          Privacy Policy
        </h1>
        <p className="text-sm text-gray-500 mb-8">
          Last updated: January 1, 2025
        </p>

        <div className="prose prose-lg max-w-none text-gray-700">
          <h2>Introduction</h2>
          <p>
            {siteConfig.name} (&quot;we&quot;, &quot;us&quot;, or &quot;our&quot;) operates the
            website {siteConfig.domain}. This Privacy Policy explains how we collect, use, disclose,
            and safeguard your information when you visit our website. Please read this policy
            carefully. If you do not agree with the terms of this privacy policy, please do not
            access the site.
          </p>

          <h2>Information We Collect</h2>

          <h3>Information Automatically Collected</h3>
          <p>
            When you visit our website, we may automatically collect certain information about your
            device, including:
          </p>
          <ul>
            <li>IP address</li>
            <li>Browser type and version</li>
            <li>Operating system</li>
            <li>Pages visited and time spent on each page</li>
            <li>Referring website or search terms</li>
            <li>Device type (desktop, mobile, tablet)</li>
            <li>Geographic location (country/city level only)</li>
          </ul>

          <h3>Information You Provide</h3>
          <p>
            We may collect personal information that you voluntarily provide, such as:
          </p>
          <ul>
            <li>Name and email address (if you contact us)</li>
            <li>Any information submitted through our contact form</li>
          </ul>

          <h2>Cookies and Tracking Technologies</h2>
          <p>
            We use cookies and similar tracking technologies to enhance your browsing experience.
            These include:
          </p>
          <ul>
            <li>
              <strong>Essential cookies:</strong> Required for the website to function properly
              (e.g., cookie consent preferences).
            </li>
            <li>
              <strong>Analytics cookies:</strong> Help us understand how visitors interact with our
              website (e.g., Google Analytics).
            </li>
            <li>
              <strong>Affiliate cookies:</strong> Used by our affiliate partners to track referrals
              when you click on affiliate links.
            </li>
          </ul>
          <p>
            You can control cookie preferences through your browser settings. Note that disabling
            cookies may affect website functionality.
          </p>

          <h2>Google Analytics</h2>
          <p>
            We use Google Analytics to analyze website traffic and usage patterns. Google Analytics
            uses cookies to collect anonymous data including pages visited, time on site, and
            demographic information. This data helps us improve our content and user experience.
          </p>
          <p>
            Google Analytics data is processed in accordance with Google&apos;s Privacy Policy. You
            can opt out of Google Analytics by installing the{' '}
            <a
              href="https://tools.google.com/dlpage/gaoptout"
              target="_blank"
              rel="noopener noreferrer"
              className="text-brand-primary hover:underline"
            >
              Google Analytics Opt-out Browser Add-on
            </a>
            .
          </p>

          <h2>Affiliate Links</h2>
          <p>
            Our website contains affiliate links to third-party services such as hotels, tours,
            and travel products. When you click these links:
          </p>
          <ul>
            <li>You are redirected to the partner&apos;s website</li>
            <li>The partner may place cookies on your device to track the referral</li>
            <li>If you make a purchase, we may earn a commission at no extra cost to you</li>
          </ul>
          <p>
            Each affiliate partner has their own privacy policy governing how they handle your data.
            We encourage you to review their policies before making a purchase.
          </p>
          <p>
            For more information about our affiliate partnerships, see our{' '}
            <Link href="/affiliate-disclosure/" className="text-brand-primary hover:underline">
              Affiliate Disclosure
            </Link>
            .
          </p>

          <h2>How We Use Your Information</h2>
          <p>We use the collected information to:</p>
          <ul>
            <li>Provide, maintain, and improve our website</li>
            <li>Analyze usage trends to improve our content</li>
            <li>Respond to your inquiries and contact requests</li>
            <li>Monitor and prevent any technical issues</li>
            <li>Comply with legal obligations</li>
          </ul>

          <h2>Data Sharing</h2>
          <p>
            We do not sell your personal information. We may share data with:
          </p>
          <ul>
            <li>
              <strong>Analytics providers:</strong> Google Analytics processes aggregated,
              anonymized usage data.
            </li>
            <li>
              <strong>Affiliate partners:</strong> When you click an affiliate link, the partner
              receives referral information.
            </li>
            <li>
              <strong>Legal requirements:</strong> If required by law or to protect our legal rights.
            </li>
          </ul>

          <h2>Data Retention</h2>
          <p>
            We retain automatically collected data for as long as Google Analytics retains it (up to
            26 months). Contact form submissions are retained for 12 months and then deleted.
          </p>

          <h2>Your Rights</h2>
          <p>
            Depending on your jurisdiction, you may have the right to:
          </p>
          <ul>
            <li>Access the personal data we hold about you</li>
            <li>Request correction of inaccurate data</li>
            <li>Request deletion of your data</li>
            <li>Opt out of analytics tracking</li>
            <li>Withdraw consent for data processing</li>
          </ul>
          <p>
            To exercise these rights, please{' '}
            <Link href="/contact/" className="text-brand-primary hover:underline">
              contact us
            </Link>
            .
          </p>

          <h2>Children&apos;s Privacy</h2>
          <p>
            Our website is not intended for children under 16. We do not knowingly collect
            personal information from children under 16.
          </p>

          <h2>Changes to This Policy</h2>
          <p>
            We may update this privacy policy from time to time. Changes will be posted on this
            page with an updated revision date. We encourage you to review this policy periodically.
          </p>

          <h2>Contact Us</h2>
          <p>
            If you have questions or concerns about this privacy policy, please{' '}
            <Link href="/contact/" className="text-brand-primary hover:underline">
              contact us
            </Link>{' '}
            or email us at hello@{siteConfig.domain}.
          </p>
        </div>
      </div>
    </>
  );
}
