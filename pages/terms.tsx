import Link from 'next/link';
import SEOHead from '../components/SEOHead';
import Breadcrumbs from '../components/Breadcrumbs';
import { useTranslation } from '../hooks/useTranslation';
import { siteConfig } from '../site.config';

export default function Terms() {
  const { t } = useTranslation('common');

  return (
    <>
      <SEOHead
        title={`Terms of Service - ${siteConfig.name}`}
        description={`Terms of service for ${siteConfig.domain}. Please read these terms carefully before using our website.`}
      />

      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <Breadcrumbs
          items={[
            { name: t('nav.home'), href: '/' },
            { name: t('nav.terms'), href: '/terms/' },
          ]}
        />

        <h1 className="text-3xl md:text-4xl font-bold text-brand-secondary mb-4">
          Terms of Service
        </h1>
        <p className="text-sm text-gray-500 mb-8">
          Last updated: January 1, 2025
        </p>

        <div className="prose prose-lg max-w-none text-gray-700">
          <h2>Acceptance of Terms</h2>
          <p>
            By accessing and using {siteConfig.domain} (&quot;the website&quot;), you accept and agree
            to be bound by these Terms of Service. If you do not agree to these terms, please do not
            use our website.
          </p>

          <h2>Description of Service</h2>
          <p>
            {siteConfig.name} is a travel information website that provides guides, tips, and
            recommendations for traveling in Mexico. Our content is created for informational
            purposes to help travelers plan their trips.
          </p>

          <h2>Content Accuracy</h2>
          <p>
            We strive to provide accurate and up-to-date travel information. However:
          </p>
          <ul>
            <li>
              Travel information (prices, schedules, availability, safety conditions) can change
              without notice.
            </li>
            <li>
              Our content represents the situation at the time of writing and may not reflect
              current conditions.
            </li>
            <li>
              Always verify critical information (visa requirements, safety advisories, booking
              details) directly with official sources before traveling.
            </li>
            <li>
              We are not responsible for any inaccuracies in the information provided, though we
              actively work to correct them when identified.
            </li>
          </ul>

          <h2>Affiliate Links and Third-Party Services</h2>
          <p>
            Our website contains links to third-party websites and services through affiliate
            programs. Regarding these links:
          </p>
          <ul>
            <li>
              We may earn commissions from qualifying purchases made through affiliate links.
            </li>
            <li>
              These commissions do not increase the price you pay.
            </li>
            <li>
              We are not responsible for the content, privacy practices, or services of third-party
              websites.
            </li>
            <li>
              Your use of third-party services is governed by their own terms and conditions.
            </li>
            <li>
              Any issues with purchases made through affiliate links should be directed to the
              respective service provider.
            </li>
          </ul>
          <p>
            For full details, see our{' '}
            <Link href="/affiliate-disclosure/" className="text-brand-primary hover:underline">
              Affiliate Disclosure
            </Link>
            .
          </p>

          <h2>Intellectual Property</h2>
          <p>
            All content on this website, including but not limited to text, images, graphics,
            logos, and design, is the property of {siteConfig.name} or its content creators and
            is protected by copyright law. You may not:
          </p>
          <ul>
            <li>Reproduce, distribute, or republish our content without written permission</li>
            <li>Use our content for commercial purposes without authorization</li>
            <li>Modify or create derivative works from our content</li>
          </ul>
          <p>
            You may share links to our content and quote brief excerpts with proper attribution.
          </p>

          <h2>User Conduct</h2>
          <p>When using our website, you agree not to:</p>
          <ul>
            <li>Use automated tools to scrape or copy our content</li>
            <li>Attempt to interfere with the website&apos;s operation or security</li>
            <li>Submit false or misleading information through contact forms</li>
            <li>Use the website for any illegal or unauthorized purpose</li>
          </ul>

          <h2>Limitation of Liability</h2>
          <p>
            {siteConfig.name} and its team members shall not be liable for:
          </p>
          <ul>
            <li>
              Any travel-related decisions, losses, or damages arising from the use of information
              on this website
            </li>
            <li>
              Issues with third-party services accessed through our links
            </li>
            <li>
              Temporary unavailability of the website
            </li>
            <li>
              Any indirect, incidental, or consequential damages
            </li>
          </ul>
          <p>
            By using this website, you acknowledge that travel involves inherent risks and that
            you are solely responsible for your travel decisions.
          </p>

          <h2>Disclaimer</h2>
          <p>
            The information on this website is provided &quot;as is&quot; without warranties of
            any kind, express or implied. We do not guarantee the completeness, accuracy, or
            reliability of any information on this site.
          </p>

          <h2>Indemnification</h2>
          <p>
            You agree to indemnify and hold harmless {siteConfig.name}, its authors, and affiliates
            from any claims, losses, or damages arising from your use of the website or violation
            of these terms.
          </p>

          <h2>Governing Law</h2>
          <p>
            These terms shall be governed by and construed in accordance with applicable law,
            without regard to conflict of law provisions.
          </p>

          <h2>Changes to These Terms</h2>
          <p>
            We reserve the right to modify these terms at any time. Changes will be posted on this
            page with an updated revision date. Continued use of the website after changes
            constitutes acceptance of the new terms.
          </p>

          <h2>Contact Us</h2>
          <p>
            If you have questions about these terms, please{' '}
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
