import Link from 'next/link';
import {
  Search,
  MapPin,
  BookOpen,
  Users,
  RefreshCw,
  CheckCircle2,
  Globe,
  Camera,
} from 'lucide-react';
import SEOHead from '../components/SEOHead';
import Breadcrumbs from '../components/Breadcrumbs';
import { useTranslation } from '../hooks/useTranslation';
import { siteConfig } from '../site.config';

export default function HowWeResearch() {
  const { t } = useTranslation('common');

  return (
    <>
      <SEOHead
        title={`How We Research - ${siteConfig.name}`}
        description={`Discover the research methodology behind ${siteConfig.name}'s travel guides. Learn how we gather, verify, and present Mexico travel information.`}
      />

      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <Breadcrumbs
          items={[
            { name: t('nav.home'), href: '/' },
            { name: t('nav.howWeResearch'), href: '/how-we-research/' },
          ]}
        />

        <h1 className="text-3xl md:text-4xl font-bold text-brand-secondary mb-4">
          How We Research
        </h1>
        <p className="text-lg text-gray-600 mb-8">
          Transparency is at the core of everything we do. Here is an inside look at how we
          create our Mexico travel guides.
        </p>

        {/* Research Process Steps */}
        <div className="space-y-8 mb-12">
          {/* Step 1 */}
          <div className="flex gap-4">
            <div className="flex-shrink-0 w-12 h-12 bg-brand-primary rounded-full flex items-center justify-center">
              <Camera className="w-6 h-6 text-white" />
            </div>
            <div>
              <h2 className="text-xl font-bold text-brand-secondary mb-2">
                1. Firsthand Experience
              </h2>
              <p className="text-gray-600">
                Our research starts on the ground. Our writers personally visit the destinations,
                hotels, restaurants, and attractions they write about. We take public transport,
                eat at local markets, and experience Mexico the way our readers will. This firsthand
                experience is the foundation of every guide.
              </p>
            </div>
          </div>

          {/* Step 2 */}
          <div className="flex gap-4">
            <div className="flex-shrink-0 w-12 h-12 bg-brand-accent rounded-full flex items-center justify-center">
              <Search className="w-6 h-6 text-white" />
            </div>
            <div>
              <h2 className="text-xl font-bold text-brand-secondary mb-2">
                2. In-Depth Research
              </h2>
              <p className="text-gray-600">
                We supplement personal experience with thorough research from multiple sources:
              </p>
              <ul className="mt-2 space-y-1 text-gray-600 text-sm">
                <li className="flex items-start gap-2">
                  <CheckCircle2 className="w-4 h-4 text-brand-primary mt-0.5 flex-shrink-0" />
                  Official tourism board websites and government travel advisories
                </li>
                <li className="flex items-start gap-2">
                  <CheckCircle2 className="w-4 h-4 text-brand-primary mt-0.5 flex-shrink-0" />
                  Academic and historical sources for cultural information
                </li>
                <li className="flex items-start gap-2">
                  <CheckCircle2 className="w-4 h-4 text-brand-primary mt-0.5 flex-shrink-0" />
                  Local news outlets for current events and changes
                </li>
                <li className="flex items-start gap-2">
                  <CheckCircle2 className="w-4 h-4 text-brand-primary mt-0.5 flex-shrink-0" />
                  Conversations with local residents, guides, and expats
                </li>
                <li className="flex items-start gap-2">
                  <CheckCircle2 className="w-4 h-4 text-brand-primary mt-0.5 flex-shrink-0" />
                  Verified traveler reviews and community feedback
                </li>
              </ul>
            </div>
          </div>

          {/* Step 3 */}
          <div className="flex gap-4">
            <div className="flex-shrink-0 w-12 h-12 bg-brand-secondary rounded-full flex items-center justify-center">
              <BookOpen className="w-6 h-6 text-white" />
            </div>
            <div>
              <h2 className="text-xl font-bold text-brand-secondary mb-2">
                3. Content Creation
              </h2>
              <p className="text-gray-600">
                With research complete, our writers create comprehensive guides focused on practical,
                actionable information. We prioritize answering the questions travelers actually have:
                How much does it cost? How do I get there? What should I know before I go? Is it safe?
              </p>
            </div>
          </div>

          {/* Step 4 */}
          <div className="flex gap-4">
            <div className="flex-shrink-0 w-12 h-12 bg-purple-600 rounded-full flex items-center justify-center">
              <Users className="w-6 h-6 text-white" />
            </div>
            <div>
              <h2 className="text-xl font-bold text-brand-secondary mb-2">
                4. Peer Review & Fact-Checking
              </h2>
              <p className="text-gray-600">
                Every article is reviewed by at least one additional team member before publication.
                This review checks for factual accuracy, completeness, reader-friendliness, and ensures
                practical details like prices and schedules are current.
              </p>
            </div>
          </div>

          {/* Step 5 */}
          <div className="flex gap-4">
            <div className="flex-shrink-0 w-12 h-12 bg-green-600 rounded-full flex items-center justify-center">
              <RefreshCw className="w-6 h-6 text-white" />
            </div>
            <div>
              <h2 className="text-xl font-bold text-brand-secondary mb-2">
                5. Ongoing Updates
              </h2>
              <p className="text-gray-600">
                Mexico is a dynamic country where travel information changes frequently. We
                systematically review and update our content based on:
              </p>
              <ul className="mt-2 space-y-1 text-gray-600 text-sm">
                <li className="flex items-start gap-2">
                  <CheckCircle2 className="w-4 h-4 text-green-600 mt-0.5 flex-shrink-0" />
                  Scheduled review cycles (every 6-12 months)
                </li>
                <li className="flex items-start gap-2">
                  <CheckCircle2 className="w-4 h-4 text-green-600 mt-0.5 flex-shrink-0" />
                  Reader feedback and correction reports
                </li>
                <li className="flex items-start gap-2">
                  <CheckCircle2 className="w-4 h-4 text-green-600 mt-0.5 flex-shrink-0" />
                  News monitoring for significant changes
                </li>
                <li className="flex items-start gap-2">
                  <CheckCircle2 className="w-4 h-4 text-green-600 mt-0.5 flex-shrink-0" />
                  Return visits by our writers
                </li>
              </ul>
            </div>
          </div>
        </div>

        {/* Sources Box */}
        <div className="bg-gray-50 rounded-xl p-6 mb-8">
          <h2 className="text-xl font-bold text-brand-secondary mb-3">
            Our Trusted Sources
          </h2>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-sm text-gray-600">
            <div className="flex items-center gap-2">
              <Globe className="w-4 h-4 text-brand-primary flex-shrink-0" />
              Mexico Tourism Board (VisitMexico)
            </div>
            <div className="flex items-center gap-2">
              <Globe className="w-4 h-4 text-brand-primary flex-shrink-0" />
              U.S. State Department Travel Advisories
            </div>
            <div className="flex items-center gap-2">
              <Globe className="w-4 h-4 text-brand-primary flex-shrink-0" />
              INAH (National Institute of Anthropology)
            </div>
            <div className="flex items-center gap-2">
              <Globe className="w-4 h-4 text-brand-primary flex-shrink-0" />
              Local tourism offices and municipal websites
            </div>
            <div className="flex items-center gap-2">
              <Globe className="w-4 h-4 text-brand-primary flex-shrink-0" />
              SECTUR (Mexico&apos;s Ministry of Tourism)
            </div>
            <div className="flex items-center gap-2">
              <Globe className="w-4 h-4 text-brand-primary flex-shrink-0" />
              Academic publications on Mexican culture
            </div>
          </div>
        </div>

        <div className="prose prose-lg max-w-none text-gray-700">
          <h2>Questions About Our Research?</h2>
          <p>
            If you have questions about how we research our content, or if you have noticed
            something that needs updating, please{' '}
            <Link href="/contact/" className="text-brand-primary hover:underline">
              contact us
            </Link>
            . We welcome feedback and are always looking to improve the quality of our guides.
          </p>
          <p>
            You can also read our{' '}
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
