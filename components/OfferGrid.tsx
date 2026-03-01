import OfferCard from './OfferCard';
import type { OfferCardProps } from './OfferCard';

interface OfferGridProps {
  title: string;
  offers: Array<OfferCardProps>;
  columns?: 2 | 3;
}

const OfferGrid: React.FC<OfferGridProps> = ({ title, offers, columns = 3 }) => {
  if (!offers || offers.length === 0) return null;

  const gridCols = columns === 2
    ? 'grid-cols-1 sm:grid-cols-2'
    : 'grid-cols-1 sm:grid-cols-2 lg:grid-cols-3';

  return (
    <section className="py-10">
      <div className="flex items-center gap-3 mb-6">
        <h2 className="text-2xl font-bold text-gray-900">{title}</h2>
        <div className="flex-1 h-px bg-gray-200" />
      </div>
      <div className={`grid ${gridCols} gap-5`}>
        {offers.map((offer, index) => (
          <OfferCard key={`${offer.partner}-${index}`} {...offer} />
        ))}
      </div>
    </section>
  );
};

export type { OfferGridProps };
export default OfferGrid;
