import ContentCard from './ContentCard';

interface RelatedItem {
  title: string;
  slug: string;
  image: string;
  description?: string;
  basePath: string;
}

interface RelatedContentProps {
  title: string;
  items: Array<RelatedItem>;
}

const RelatedContent: React.FC<RelatedContentProps> = ({ title, items }) => {
  if (!items || items.length === 0) return null;

  return (
    <section className="py-10 border-t border-gray-100">
      <div className="flex items-center gap-3 mb-6">
        <h2 className="text-2xl font-bold text-gray-900">{title}</h2>
        <div className="flex-1 h-px bg-gray-200" />
      </div>
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
        {items.map((item) => (
          <ContentCard
            key={`${item.basePath}${item.slug}`}
            title={item.title}
            slug={item.slug}
            image={item.image}
            description={item.description}
            basePath={item.basePath}
          />
        ))}
      </div>
    </section>
  );
};

export type { RelatedContentProps, RelatedItem };
export default RelatedContent;
