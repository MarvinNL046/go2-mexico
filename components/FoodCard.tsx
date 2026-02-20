import Image from 'next/image';
import Link from 'next/link';

interface FoodCardProps {
  name: string;
  slug: string;
  image: string;
  category?: string;
  spiceLevel?: string;
  description?: string;
}

const FoodCard: React.FC<FoodCardProps> = ({ name, slug, image, category, spiceLevel, description }) => {
  return (
    <div className="bg-white rounded-xl shadow-lg overflow-hidden group hover:shadow-xl transition-all duration-300">
      <Link href={`/food/${slug}/`}>
        <div className="relative h-44 overflow-hidden">
          <Image
            src={image}
            alt={name}
            fill
            className="object-cover group-hover:scale-110 transition-transform duration-500"
          />
          {category && (
            <span className="absolute top-3 left-3 bg-brand-accent text-brand-secondary text-xs font-semibold px-3 py-1 rounded-full">
              {category}
            </span>
          )}
        </div>
      </Link>
      <div className="p-4">
        <h3 className="text-lg font-bold text-brand-secondary mb-1">{name}</h3>
        {spiceLevel && (
          <p className="text-xs text-gray-500 mb-2">Spice level: {spiceLevel}</p>
        )}
        {description && (
          <p className="text-gray-600 text-sm line-clamp-2">{description}</p>
        )}
      </div>
    </div>
  );
};

export default FoodCard;
