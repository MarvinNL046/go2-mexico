import Link from 'next/link';
import SEOHead from '../components/SEOHead';
import { useTranslation } from '../hooks/useTranslation';
import { siteConfig } from '../site.config';

export default function Custom404() {
  const { t } = useTranslation('common');

  return (
    <>
      <SEOHead title={`Page Not Found - ${siteConfig.name}`} description="The page you are looking for does not exist." />
      <div className="min-h-[60vh] flex items-center justify-center px-4">
        <div className="text-center">
          <h1 className="text-6xl font-bold text-brand-primary mb-4">404</h1>
          <p className="text-xl text-gray-600 mb-8">{t('common.notFound')}</p>
          <Link href="/" className="bg-brand-primary hover:bg-brand-primary-600 text-white px-6 py-3 rounded-lg font-semibold transition-colors">
            {t('common.backHome')}
          </Link>
        </div>
      </div>
    </>
  );
}
