import Image from 'next/image';
import Link from 'next/link';
import { useTranslation } from '../hooks/useTranslation';

interface CityCardProps {
  name: string;
  slug: string;
  image: string;
  region?: string;
  highlights?: string[];
  description?: string;
}

const CityCard: React.FC<CityCardProps> = ({ name, slug, image, region, highlights = [], description }) => {
  const { t } = useTranslation('common');
  const visibleHighlights = highlights.slice(0, 2);
  const moreCount = highlights.length - 2;

  return (
    <div className="bg-white rounded-xl shadow-lg overflow-hidden group hover:shadow-xl transition-all duration-300">
      <Link href={`/city/${slug}/`}>
        <div className="relative h-48 overflow-hidden">
          <Image
            src={image}
            alt={name}
            fill
            className="object-cover group-hover:scale-110 transition-transform duration-500"
          />
          {region && (
            <span className="absolute top-3 left-3 bg-brand-primary text-white text-xs font-semibold px-3 py-1 rounded-full">
              {region}
            </span>
          )}
        </div>
      </Link>
      <div className="p-4">
        <h3 className="text-lg font-bold text-brand-secondary mb-1">{name}</h3>
        {description && (
          <p className="text-gray-600 text-sm mb-3 line-clamp-2">{description}</p>
        )}
        {visibleHighlights.length > 0 && (
          <div className="flex flex-wrap gap-1 mb-3">
            {visibleHighlights.map((h, i) => (
              <span key={i} className="text-xs bg-gray-100 text-gray-600 px-2 py-1 rounded-full">{h}</span>
            ))}
            {moreCount > 0 && (
              <span className="text-xs bg-brand-primary-50 text-brand-primary px-2 py-1 rounded-full">+{moreCount} {t('common.more')}</span>
            )}
          </div>
        )}
        <Link
          href={`/city/${slug}/`}
          className="block text-center bg-gradient-to-r from-brand-primary to-brand-primary-600 text-white py-2 rounded-lg text-sm font-semibold hover:from-brand-primary-600 hover:to-brand-primary-700 transition-all duration-300"
        >
          {t('sections.exploreCity')}
        </Link>
      </div>
    </div>
  );
};

export default CityCard;
