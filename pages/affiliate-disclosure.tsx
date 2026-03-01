import Link from 'next/link';
import { DollarSign, CheckCircle2, ShieldCheck, Heart } from 'lucide-react';
import SEOHead from '../components/SEOHead';
import Breadcrumbs from '../components/Breadcrumbs';
import { useTranslation } from '../hooks/useTranslation';
import { siteConfig } from '../site.config';

export default function AffiliateDisclosure() {
  const { t } = useTranslation('common');

  return (
    <>
      <SEOHead
        title={`Affiliate Disclosure - ${siteConfig.name}`}
        description={`Full affiliate disclosure for ${siteConfig.name}. Learn how we earn revenue and how affiliate partnerships affect (and don't affect) our content.`}
      />

      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <Breadcrumbs
          items={[
            { name: t('nav.home'), href: '/' },
            { name: t('nav.affiliateDisclosure'), href: '/affiliate-disclosure/' },
          ]}
        />

        <h1 className="text-3xl md:text-4xl font-bold text-brand-secondary mb-4">
          Affiliate Disclosure
        </h1>
        <p className="text-lg text-gray-600 mb-8">
          Transparency is important to us. Here is everything you need to know about how
          {siteConfig.name} earns revenue.
        </p>

        {/* Key Points */}
        <div className="bg-brand-primary-50 rounded-xl p-6 mb-8">
          <h2 className="font-bold text-brand-secondary mb-4 text-lg">Key Points</h2>
          <div className="space-y-3">
            <div className="flex items-start gap-3">
              <CheckCircle2 className="w-5 h-5 text-brand-primary flex-shrink-0 mt-0.5" />
              <p className="text-gray-700 text-sm">
                Some links on this website are affiliate links. When you click them and make a
                purchase, we may earn a commission at <strong>no extra cost to you</strong>.
              </p>
            </div>
            <div className="flex items-start gap-3">
              <CheckCircle2 className="w-5 h-5 text-brand-primary flex-shrink-0 mt-0.5" />
              <p className="text-gray-700 text-sm">
                Affiliate commissions <strong>never influence</strong> our recommendations,
                ratings, or content.
              </p>
            </div>
            <div className="flex items-start gap-3">
              <CheckCircle2 className="w-5 h-5 text-brand-primary flex-shrink-0 mt-0.5" />
              <p className="text-gray-700 text-sm">
                Revenue from affiliate links helps us keep our content <strong>free</strong> for
                all readers.
              </p>
            </div>
            <div className="flex items-start gap-3">
              <CheckCircle2 className="w-5 h-5 text-brand-primary flex-shrink-0 mt-0.5" />
              <p className="text-gray-700 text-sm">
                We only partner with companies we have <strong>personally used</strong> or
                thoroughly vetted.
              </p>
            </div>
          </div>
        </div>

        <div className="prose prose-lg max-w-none text-gray-700">
          <h2>What Are Affiliate Links?</h2>
          <p>
            Affiliate links are special URLs that contain a tracking code. When you click one of
            these links and make a purchase (such as booking a hotel, tour, or buying travel
            insurance), the company pays us a small commission. This commission comes from the
            company&apos;s marketing budget - it does not increase the price you pay.
          </p>

          <h2>Our Affiliate Partners</h2>
          <p>
            We work with the following trusted travel companies:
          </p>

          <div className="not-prose grid grid-cols-1 sm:grid-cols-2 gap-4 my-6">
            <div className="bg-white rounded-xl border border-gray-100 shadow-sm p-4">
              <h3 className="font-semibold text-brand-secondary text-sm mb-1">Booking.com</h3>
              <p className="text-xs text-gray-500">Hotels & accommodation bookings</p>
            </div>
            <div className="bg-white rounded-xl border border-gray-100 shadow-sm p-4">
              <h3 className="font-semibold text-brand-secondary text-sm mb-1">GetYourGuide</h3>
              <p className="text-xs text-gray-500">Tours, activities & experiences</p>
            </div>
            <div className="bg-white rounded-xl border border-gray-100 shadow-sm p-4">
              <h3 className="font-semibold text-brand-secondary text-sm mb-1">Klook</h3>
              <p className="text-xs text-gray-500">Activities, attractions & transport</p>
            </div>
            <div className="bg-white rounded-xl border border-gray-100 shadow-sm p-4">
              <h3 className="font-semibold text-brand-secondary text-sm mb-1">Trip.com</h3>
              <p className="text-xs text-gray-500">Hotels, flights & activities</p>
            </div>
            <div className="bg-white rounded-xl border border-gray-100 shadow-sm p-4">
              <h3 className="font-semibold text-brand-secondary text-sm mb-1">Airalo / Saily / Yesim</h3>
              <p className="text-xs text-gray-500">eSIM data plans for Mexico</p>
            </div>
            <div className="bg-white rounded-xl border border-gray-100 shadow-sm p-4">
              <h3 className="font-semibold text-brand-secondary text-sm mb-1">NordVPN / NordPass</h3>
              <p className="text-xs text-gray-500">Online security for travelers</p>
            </div>
          </div>

          <h2>How This Affects Our Content</h2>
          <p>
            <strong>It does not.</strong> Our editorial process is completely independent from our
            affiliate partnerships. Here is how we ensure this:
          </p>
          <ul>
            <li>
              Writers create content based on their research and experience, without considering
              affiliate potential.
            </li>
            <li>
              We recommend free or budget options alongside paid services when they provide a
              better experience.
            </li>
            <li>
              If a non-affiliate product or service is the better option, we recommend it anyway.
            </li>
            <li>
              Our editorial team reviews content independently from our business team.
            </li>
          </ul>

          <h2>How to Identify Affiliate Links</h2>
          <p>
            Pages containing affiliate links include a disclosure notice at the top of the page.
            Affiliate links typically appear in &quot;Book Now&quot; buttons and service
            recommendation sections. These links are also marked with the{' '}
            <code>rel=&quot;sponsored&quot;</code> attribute.
          </p>

          <h2>Why We Use Affiliate Links</h2>
          <p>
            Creating high-quality travel content takes significant time, effort, and money.
            Our writers travel to Mexico, research destinations, verify information, and keep
            content updated. Affiliate revenue helps us:
          </p>
          <ul>
            <li>Pay our writers fairly for their expertise and research time</li>
            <li>Cover travel and research costs</li>
            <li>Keep all our content freely available to readers</li>
            <li>Regularly update guides to keep information current</li>
          </ul>

          <h2>Questions?</h2>
          <p>
            If you have any questions about our affiliate relationships or how they work, please{' '}
            <Link href="/contact/" className="text-brand-primary hover:underline">
              contact us
            </Link>
            . You can also read our{' '}
            <Link href="/editorial-policy/" className="text-brand-primary hover:underline">
              Editorial Policy
            </Link>{' '}
            for more details about our content standards.
          </p>
        </div>
      </div>
    </>
  );
}
