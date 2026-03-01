import Link from 'next/link';
import { ChevronRight, Home } from 'lucide-react';
import { siteConfig } from '../site.config';

interface BreadcrumbsProps {
  items: Array<{ label?: string; name?: string; href?: string }>;
}

const Breadcrumbs: React.FC<BreadcrumbsProps> = ({ items }) => {
  // Normalize items: support both 'label' and legacy 'name' prop
  const normalizedItems = items.map((item) => ({
    label: item.label || item.name || '',
    href: item.href,
  }));

  // Build JSON-LD BreadcrumbList schema
  const schemaItems = normalizedItems.map((item, i) => ({
    '@type': 'ListItem' as const,
    position: i + 1,
    name: item.label,
    ...(item.href
      ? { item: `${siteConfig.seo.siteUrl}${item.href}` }
      : {}),
  }));

  const schema = {
    '@context': 'https://schema.org',
    '@type': 'BreadcrumbList',
    itemListElement: schemaItems,
  };

  return (
    <>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(schema) }}
      />
      <nav className="flex mb-6" aria-label="Breadcrumb">
        <ol className="inline-flex items-center flex-wrap gap-1 text-sm">
          {normalizedItems.map((item, index) => {
            const isLast = index === normalizedItems.length - 1;
            const isFirst = index === 0;

            return (
              <li key={index} className="inline-flex items-center">
                {index > 0 && (
                  <ChevronRight className="w-3.5 h-3.5 text-gray-400 mx-1 flex-shrink-0" />
                )}

                {isLast ? (
                  <span className="text-gray-500 font-medium truncate max-w-[200px] sm:max-w-none">
                    {item.label}
                  </span>
                ) : item.href ? (
                  <Link
                    href={item.href}
                    className="inline-flex items-center gap-1 text-brand-secondary hover:text-brand-primary font-medium transition-colors duration-200"
                  >
                    {isFirst && <Home className="w-3.5 h-3.5" />}
                    <span>{item.label}</span>
                  </Link>
                ) : (
                  <span className="text-gray-500 font-medium">
                    {isFirst && <Home className="w-3.5 h-3.5 inline mr-1" />}
                    {item.label}
                  </span>
                )}
              </li>
            );
          })}
        </ol>
      </nav>
    </>
  );
};

export default Breadcrumbs;
