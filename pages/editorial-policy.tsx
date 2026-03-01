import Link from 'next/link';
import { CheckCircle, FileText, RefreshCw, Users, Eye, Scale } from 'lucide-react';
import SEOHead from '../components/SEOHead';
import Breadcrumbs from '../components/Breadcrumbs';
import { useTranslation } from '../hooks/useTranslation';
import { siteConfig } from '../site.config';

export default function EditorialPolicy() {
  const { t } = useTranslation('common');

  return (
    <>
      <SEOHead
        title={`Editorial Policy - ${siteConfig.name}`}
        description={`Learn how ${siteConfig.name} creates, reviews, and maintains its travel content. Our editorial standards ensure accurate, trustworthy Mexico travel guides.`}
      />

      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <Breadcrumbs
          items={[
            { name: t('nav.home'), href: '/' },
            { name: t('nav.editorialPolicy'), href: '/editorial-policy/' },
          ]}
        />

        <h1 className="text-3xl md:text-4xl font-bold text-brand-secondary mb-8">
          Editorial Policy
        </h1>

        <div className="prose prose-lg max-w-none text-gray-700">
          <p className="text-lg text-gray-600 mb-8">
            At {siteConfig.name}, we are committed to providing accurate, helpful, and trustworthy
            travel information about Mexico. This policy outlines how we create, review, and
            maintain our content.
          </p>

          {/* Key Principles */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 not-prose mb-8">
            <div className="bg-brand-primary-50 rounded-xl p-5">
              <CheckCircle className="w-6 h-6 text-brand-primary mb-2" />
              <h3 className="font-bold text-brand-secondary text-sm mb-1">Firsthand Experience</h3>
              <p className="text-gray-600 text-xs">
                Content is based on personal travel experience in Mexico.
              </p>
            </div>
            <div className="bg-brand-accent-50 rounded-xl p-5">
              <Eye className="w-6 h-6 text-brand-accent mb-2" />
              <h3 className="font-bold text-brand-secondary text-sm mb-1">Expert Review</h3>
              <p className="text-gray-600 text-xs">
                All guides are reviewed by experienced Mexico travelers.
              </p>
            </div>
            <div className="bg-blue-50 rounded-xl p-5">
              <RefreshCw className="w-6 h-6 text-blue-600 mb-2" />
              <h3 className="font-bold text-brand-secondary text-sm mb-1">Regular Updates</h3>
              <p className="text-gray-600 text-xs">
                Content is reviewed and updated at least annually.
              </p>
            </div>
            <div className="bg-green-50 rounded-xl p-5">
              <Scale className="w-6 h-6 text-green-600 mb-2" />
              <h3 className="font-bold text-brand-secondary text-sm mb-1">Editorial Independence</h3>
              <p className="text-gray-600 text-xs">
                Affiliate partnerships never influence our recommendations.
              </p>
            </div>
          </div>

          <h2>Content Creation Process</h2>
          <p>
            Every piece of content on {siteConfig.name} goes through a structured creation and
            review process:
          </p>
          <ol>
            <li>
              <strong>Research & Experience:</strong> Our writers visit destinations, try activities,
              and experience services firsthand. We supplement personal experience with additional
              research from official tourism boards, government sources, and reputable publications.
            </li>
            <li>
              <strong>Writing:</strong> Content is written with the reader in mind. We focus on
              practical, actionable information that helps travelers plan and enjoy their trip.
            </li>
            <li>
              <strong>Editorial Review:</strong> All content is reviewed by a second team member
              for accuracy, completeness, and readability before publication.
            </li>
            <li>
              <strong>Fact-Checking:</strong> Key facts such as prices, opening hours, and travel
              requirements are verified against official sources.
            </li>
            <li>
              <strong>Publication:</strong> Content is published with a clear author attribution and
              publication date.
            </li>
          </ol>

          <h2>Content Updates</h2>
          <p>
            Travel information changes frequently. We follow these update practices:
          </p>
          <ul>
            <li>All guides display a "Last updated" date so you know how current the information is.</li>
            <li>Content is reviewed and updated at minimum every 12 months.</li>
            <li>Major changes (price increases, closures, safety updates) are updated as soon as we become aware.</li>
            <li>Reader feedback about outdated information is prioritized and addressed within 48 hours.</li>
          </ul>

          <h2>Affiliate Relationships</h2>
          <p>
            {siteConfig.name} earns revenue through affiliate partnerships with trusted travel
            companies. This is how we keep our content free for readers. Important principles:
          </p>
          <ul>
            <li>We only partner with companies whose services we have personally used or thoroughly vetted.</li>
            <li>Affiliate partnerships never influence our recommendations or ratings.</li>
            <li>All affiliate links are clearly disclosed.</li>
            <li>We recommend the best option for travelers, even if it means recommending a non-affiliate service.</li>
          </ul>
          <p>
            For full details, see our{' '}
            <Link href="/affiliate-disclosure/" className="text-brand-primary hover:underline">
              Affiliate Disclosure
            </Link>
            .
          </p>

          <h2>Author Qualifications</h2>
          <p>
            Our content is written and reviewed by experienced Mexico travelers. Each author has:
          </p>
          <ul>
            <li>Extensive firsthand travel experience in Mexico (minimum 6 months cumulative)</li>
            <li>Professional writing or journalism background</li>
            <li>Specialized knowledge in their area of expertise (food, culture, adventure, etc.)</li>
          </ul>
          <p>
            Author bios with credentials are displayed on every article. Learn more about our team on
            the{' '}
            <Link href="/about/" className="text-brand-primary hover:underline">
              About page
            </Link>
            .
          </p>

          <h2>Corrections & Feedback</h2>
          <p>
            We welcome corrections and feedback. If you find inaccurate information on our site:
          </p>
          <ul>
            <li>
              Contact us through our{' '}
              <Link href="/contact/" className="text-brand-primary hover:underline">
                contact page
              </Link>
            </li>
            <li>We review all submissions within 48 hours</li>
            <li>Verified corrections are implemented promptly</li>
            <li>Significant corrections include an editor&apos;s note</li>
          </ul>
        </div>
      </div>
    </>
  );
}
