import Image from 'next/image';
import Link from 'next/link';

interface ContentCardProps {
  title: string;
  slug: string;
  image: string;
  description?: string;
  tags?: string[];
  basePath: string;
  region?: string;
  badge?: string;
  meta?: string;
}

const ContentCard: React.FC<ContentCardProps> = ({
  title,
  slug,
  image,
  description,
  tags = [],
  basePath,
  region,
  badge,
  meta,
}) => {
  const href = `${basePath}${slug}/`;

  return (
    <Link href={href} className="group block">
      <article className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden transition-all duration-300 hover:shadow-xl hover:shadow-gray-200/50 hover:-translate-y-1 hover:border-brand-primary/20 h-full flex flex-col">
        {/* Image */}
        <div className="relative aspect-[16/10] overflow-hidden">
          <Image
            src={image}
            alt={title}
            fill
            sizes="(max-width: 640px) 100vw, (max-width: 1024px) 50vw, 33vw"
            className="object-cover transition-transform duration-500 group-hover:scale-105"
          />

          {/* Gradient overlay */}
          <div className="absolute inset-0 bg-gradient-to-t from-black/30 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300" />

          {/* Badge */}
          {badge && (
            <span className="absolute top-3 right-3 bg-brand-accent text-white text-xs font-bold px-3 py-1 rounded-full shadow-md">
              {badge}
            </span>
          )}

          {/* Region */}
          {region && (
            <span className="absolute top-3 left-3 bg-brand-primary/90 text-white text-xs font-semibold px-3 py-1 rounded-full backdrop-blur-sm">
              {region}
            </span>
          )}
        </div>

        {/* Content */}
        <div className="p-5 flex flex-col flex-1">
          <h3 className="text-lg font-bold text-gray-900 mb-2 line-clamp-2 group-hover:text-brand-primary transition-colors duration-200">
            {title}
          </h3>

          {description && (
            <p className="text-gray-600 text-sm leading-relaxed line-clamp-2 mb-3 flex-1">
              {description}
            </p>
          )}

          {/* Tags + Meta row */}
          <div className="flex items-center justify-between gap-2 mt-auto pt-3 border-t border-gray-50">
            {tags.length > 0 && (
              <div className="flex flex-wrap gap-1.5 min-w-0">
                {tags.slice(0, 3).map((tag) => (
                  <span
                    key={tag}
                    className="text-xs bg-gray-100 text-gray-600 px-2 py-0.5 rounded-md font-medium truncate"
                  >
                    {tag}
                  </span>
                ))}
              </div>
            )}

            {meta && (
              <span className="text-xs text-gray-400 font-medium whitespace-nowrap flex-shrink-0">
                {meta}
              </span>
            )}
          </div>
        </div>
      </article>
    </Link>
  );
};

export default ContentCard;
