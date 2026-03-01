import Link from 'next/link';
import { useTranslation } from '../hooks/useTranslation';
import { siteConfig, getOtherSisterSites } from '../site.config';

const Footer = () => {
  const currentYear = new Date().getFullYear();
  const { t } = useTranslation('common');
  const sisterSites = getOtherSisterSites();

  return (
    <footer className="bg-gray-900 text-gray-300">
      {/* Main footer content */}
      <div className="max-w-7xl mx-auto pt-16 pb-12 px-4 sm:px-6 lg:px-8">
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-10">
          {/* Quick Links */}
          <div>
            <h3 className="text-xs font-bold text-white tracking-widest uppercase mb-5">
              {t('footer.quickLinks')}
            </h3>
            <ul className="space-y-3">
              <li>
                <Link href="/destinations/" className="text-gray-400 hover:text-white text-sm transition-colors duration-200">
                  {t('nav.destinations')}
                </Link>
              </li>
              <li>
                <Link href="/cities/" className="text-gray-400 hover:text-white text-sm transition-colors duration-200">
                  {t('nav.cities')}
                </Link>
              </li>
              <li>
                <Link href="/experiences/" className="text-gray-400 hover:text-white text-sm transition-colors duration-200">
                  {t('nav.experiences')}
                </Link>
              </li>
              <li>
                <Link href="/itineraries/" className="text-gray-400 hover:text-white text-sm transition-colors duration-200">
                  {t('nav.itineraries')}
                </Link>
              </li>
              <li>
                <Link href="/food/" className="text-gray-400 hover:text-white text-sm transition-colors duration-200">
                  {t('nav.food')}
                </Link>
              </li>
              <li>
                <Link href="/drinks/" className="text-gray-400 hover:text-white text-sm transition-colors duration-200">
                  {t('nav.drinks')}
                </Link>
              </li>
              <li>
                <Link href="/blog/" className="text-gray-400 hover:text-white text-sm transition-colors duration-200">
                  {t('nav.blog')}
                </Link>
              </li>
            </ul>
          </div>

          {/* Travel Resources */}
          <div>
            <h3 className="text-xs font-bold text-white tracking-widest uppercase mb-5">
              {t('footer.travelResources')}
            </h3>
            <ul className="space-y-3">
              <li>
                <Link href="/visa/" className="text-gray-400 hover:text-white text-sm transition-colors duration-200">
                  {t('nav.visaGuide')}
                </Link>
              </li>
              <li>
                <Link href="/practical-info/" className="text-gray-400 hover:text-white text-sm transition-colors duration-200">
                  {t('nav.practicalInfo')}
                </Link>
              </li>
              <li>
                <Link href="/weather/" className="text-gray-400 hover:text-white text-sm transition-colors duration-200">
                  {t('nav.weather')}
                </Link>
              </li>
              <li>
                <Link href="/transport/" className="text-gray-400 hover:text-white text-sm transition-colors duration-200">
                  {t('nav.transport')}
                </Link>
              </li>
              <li>
                <Link href="/regions/" className="text-gray-400 hover:text-white text-sm transition-colors duration-200">
                  {t('nav.regions')}
                </Link>
              </li>
            </ul>
          </div>

          {/* Trust & Transparency (E-E-A-T) */}
          <div>
            <h3 className="text-xs font-bold text-white tracking-widest uppercase mb-5">
              {t('footer.trust')}
            </h3>
            <ul className="space-y-3">
              <li>
                <Link href="/about/" className="text-gray-400 hover:text-white text-sm transition-colors duration-200">
                  {t('nav.about')}
                </Link>
              </li>
              <li>
                <Link href="/contact/" className="text-gray-400 hover:text-white text-sm transition-colors duration-200">
                  {t('nav.contact')}
                </Link>
              </li>
              <li>
                <Link href="/editorial-policy/" className="text-gray-400 hover:text-white text-sm transition-colors duration-200">
                  {t('nav.editorialPolicy')}
                </Link>
              </li>
              <li>
                <Link href="/how-we-research/" className="text-gray-400 hover:text-white text-sm transition-colors duration-200">
                  {t('nav.howWeResearch')}
                </Link>
              </li>
              <li>
                <Link href="/affiliate-disclosure/" className="text-gray-400 hover:text-white text-sm transition-colors duration-200">
                  {t('nav.affiliateDisclosure')}
                </Link>
              </li>
              <li>
                <Link href="/privacy/" className="text-gray-400 hover:text-white text-sm transition-colors duration-200">
                  {t('nav.privacy')}
                </Link>
              </li>
              <li>
                <Link href="/terms/" className="text-gray-400 hover:text-white text-sm transition-colors duration-200">
                  {t('nav.terms')}
                </Link>
              </li>
            </ul>
          </div>

          {/* Brand + Sister Sites */}
          <div>
            <div className="text-xl font-bold text-brand-primary mb-3 tracking-tight">
              {siteConfig.name}
            </div>
            <p className="text-gray-500 text-sm leading-relaxed mb-6">
              {t('footer.aboutText')}
            </p>

            {/* Sister Sites */}
            <h4 className="text-xs font-bold text-white tracking-widest uppercase mb-3">
              Go2 Travel Network
            </h4>
            <ul className="space-y-2">
              {sisterSites.map((site) => (
                <li key={site.domain}>
                  <a
                    href={`https://${site.domain}`}
                    className="text-gray-500 hover:text-gray-300 text-xs transition-colors duration-200"
                    target="_blank"
                    rel="noopener"
                  >
                    {site.name} - {site.destination}
                  </a>
                </li>
              ))}
            </ul>
          </div>
        </div>
      </div>

      {/* Bottom bar */}
      <div className="border-t border-gray-800">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
          {/* Affiliate disclosure */}
          <p className="text-xs text-gray-600 text-center mb-4">
            {t('footer.affiliateNote')}
          </p>

          <div className="flex flex-col md:flex-row justify-between items-center gap-4">
            <p className="text-gray-500 text-xs">
              &copy; {currentYear} {siteConfig.domain}. {t('footer.rights')}.
            </p>
            <div className="flex items-center gap-3 text-xs">
              <Link href="/privacy/" className="text-gray-500 hover:text-white transition-colors duration-200">
                {t('footer.privacy')}
              </Link>
              <span className="text-gray-700">|</span>
              <Link href="/terms/" className="text-gray-500 hover:text-white transition-colors duration-200">
                {t('footer.terms')}
              </Link>
            </div>
            <p className="text-xs text-gray-600">
              {t('footer.travelDisclaimer')}
            </p>
          </div>
        </div>
      </div>
    </footer>
  );
};

export default Footer;
