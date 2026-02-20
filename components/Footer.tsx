import Link from 'next/link';
import { useTranslation } from '../hooks/useTranslation';
import { siteConfig, getOtherSisterSites } from '../site.config';

const Footer = () => {
  const currentYear = new Date().getFullYear();
  const { t } = useTranslation('common');
  const sisterSites = getOtherSisterSites();

  return (
    <footer className="bg-gray-900 text-white">
      <div className="max-w-7xl mx-auto py-12 px-4 sm:px-6 lg:px-8">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
          {/* Quick Links */}
          <div>
            <h3 className="text-sm font-semibold text-gray-400 tracking-wider uppercase mb-4">
              {t('footer.quickLinks')}
            </h3>
            <ul className="space-y-2">
              <li><Link href="/city/" className="text-gray-300 hover:text-white text-sm transition-colors">{t('nav.cities')}</Link></li>
              <li><Link href="/food/" className="text-gray-300 hover:text-white text-sm transition-colors">{t('nav.food')}</Link></li>
              <li><Link href="/visa/" className="text-gray-300 hover:text-white text-sm transition-colors">{t('nav.visaGuide')}</Link></li>
              <li><Link href="/weather/" className="text-gray-300 hover:text-white text-sm transition-colors">{t('nav.weather')}</Link></li>
              <li><Link href="/transport/" className="text-gray-300 hover:text-white text-sm transition-colors">{t('nav.transport')}</Link></li>
              <li><Link href="/blog/" className="text-gray-300 hover:text-white text-sm transition-colors">{t('nav.blog')}</Link></li>
            </ul>
          </div>

          {/* Travel Resources */}
          <div>
            <h3 className="text-sm font-semibold text-gray-400 tracking-wider uppercase mb-4">
              {t('footer.travelResources')}
            </h3>
            <ul className="space-y-2">
              <li><Link href="/esim/" className="text-gray-300 hover:text-white text-sm transition-colors">{t('nav.esim')}</Link></li>
              <li><Link href="/travel-insurance/" className="text-gray-300 hover:text-white text-sm transition-colors">{t('nav.insurance')}</Link></li>
              <li><Link href="/practical-info/" className="text-gray-300 hover:text-white text-sm transition-colors">{t('nav.practicalInfo')}</Link></li>
            </ul>
          </div>

          {/* Sister Sites - Cross-linking for SEO */}
          <div>
            <h3 className="text-sm font-semibold text-gray-400 tracking-wider uppercase mb-4">
              Go2 Travel Network
            </h3>
            <ul className="space-y-2">
              {sisterSites.map((site) => (
                <li key={site.domain}>
                  <a href={`https://${site.domain}`} className="text-gray-300 hover:text-white text-sm transition-colors" target="_blank" rel="noopener">
                    {site.name} - {site.destination}
                  </a>
                </li>
              ))}
            </ul>
          </div>

          {/* Brand */}
          <div>
            <div className="text-2xl font-bold text-brand-primary mb-4">
              {siteConfig.name}
            </div>
            <p className="text-gray-400 text-sm leading-6">
              {t('footer.aboutText')}
            </p>
            <div className="mt-6">
              <p className="text-xs text-gray-500">{t('footer.builtWith')}</p>
            </div>
          </div>
        </div>

        <div className="mt-8 pt-8 border-t border-gray-800">
          <div className="flex flex-col md:flex-row justify-between items-center">
            <div className="flex flex-col md:flex-row items-center gap-4">
              <p className="text-gray-400 text-sm">
                &copy; {currentYear} {siteConfig.domain}. {t('footer.rights')}.
              </p>
              <div className="flex items-center gap-4 text-sm">
                <Link href="/privacy" className="text-gray-400 hover:text-white transition-colors">{t('footer.privacy')}</Link>
                <span className="text-gray-600">|</span>
                <Link href="/terms" className="text-gray-400 hover:text-white transition-colors">{t('footer.terms')}</Link>
              </div>
            </div>
            <div className="mt-4 md:mt-0">
              <p className="text-xs text-gray-500">{t('footer.travelDisclaimer')}</p>
            </div>
          </div>
        </div>
      </div>
    </footer>
  );
};

export default Footer;
