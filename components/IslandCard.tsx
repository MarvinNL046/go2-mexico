import Image from 'next/image';
import Link from 'next/link';
import { useTranslation } from '../hooks/useTranslation';

interface IslandCardProps {
  name: string;
  slug: string;
  image: string;
  bestFor?: string[];
  description?: string;
}

const IslandCard: React.FC<IslandCardProps> = ({ name, slug, image, bestFor = [], description }) => {
  const { t } = useTranslation('common');

  return (
    <div className="bg-white rounded-xl shadow-lg overflow-hidden group hover:shadow-xl transition-all duration-300">
      <Link href={`/islands/${slug}/`}>
        <div className="relative h-48 overflow-hidden">
          <Image
            src={image}
            alt={name}
            fill
            className="object-cover group-hover:scale-110 transition-transform duration-500"
          />
        </div>
      </Link>
      <div className="p-4">
        <h3 className="text-lg font-bold text-brand-secondary mb-2">{name}</h3>
        {description && (
          <p className="text-gray-600 text-sm mb-3 line-clamp-2">{description}</p>
        )}
        {bestFor.length > 0 && (
          <div className="flex flex-wrap gap-1 mb-3">
            {bestFor.slice(0, 3).map((tag, i) => (
              <span key={i} className="text-xs bg-blue-50 text-blue-700 px-2 py-1 rounded-full">{tag}</span>
            ))}
          </div>
        )}
        <Link
          href={`/islands/${slug}/`}
          className="block text-center bg-gradient-to-r from-brand-primary to-brand-primary-600 text-white py-2 rounded-lg text-sm font-semibold hover:from-brand-primary-600 hover:to-brand-primary-700 transition-all duration-300"
        >
          {t('sections.learnMore')}
        </Link>
      </div>
    </div>
  );
};

export default IslandCard;
