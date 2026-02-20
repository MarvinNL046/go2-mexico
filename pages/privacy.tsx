import SEOHead from '../components/SEOHead';
import { siteConfig } from '../site.config';

export default function Privacy() {
  return (
    <>
      <SEOHead
        title={`Privacy Policy - ${siteConfig.name}`}
        description={`Privacy policy for ${siteConfig.domain}`}
      />
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <h1 className="text-3xl font-bold text-brand-secondary mb-8">Privacy Policy</h1>
        <div className="prose prose-lg max-w-none text-gray-700">
          <p>Last updated: {new Date().toLocaleDateString('en-US', { year: 'numeric', month: 'long', day: 'numeric' })}</p>
          <h2>Introduction</h2>
          <p>{siteConfig.domain} ("we", "us", or "our") operates the {siteConfig.name} website. This page informs you of our policies regarding the collection, use, and disclosure of personal information when you use our website.</p>
          <h2>Information Collection</h2>
          <p>We may collect certain information automatically when you visit our website, including your IP address, browser type, and pages visited. We use cookies and similar technologies to enhance your experience.</p>
          <h2>Analytics</h2>
          <p>We use Google Analytics to understand how visitors interact with our website. Google Analytics uses cookies to collect anonymous usage data.</p>
          <h2>Affiliate Links</h2>
          <p>Our website contains affiliate links to third-party services. When you click these links and make a purchase, we may earn a commission at no extra cost to you.</p>
          <h2>Contact</h2>
          <p>If you have questions about this privacy policy, please contact us through our website.</p>
        </div>
      </div>
    </>
  );
}
