import { Info } from 'lucide-react';
import { useTranslation } from '../hooks/useTranslation';

const AffiliateDisclosure: React.FC = () => {
  const { t } = useTranslation('common');

  return (
    <div className="bg-brand-accent/5 border border-brand-accent/15 rounded-xl px-4 py-3 flex items-start gap-3">
      <Info className="w-4 h-4 text-brand-accent flex-shrink-0 mt-0.5" />
      <p className="text-xs text-gray-600 leading-relaxed">
        {t('sections.affiliateDisclosure')}
      </p>
    </div>
  );
};

export default AffiliateDisclosure;
