import { GetStaticProps } from 'next';
import SEOHead from '../../components/SEOHead';
import FoodCard from '../../components/FoodCard';
import Breadcrumbs from '../../components/Breadcrumbs';
import { useTranslation } from '../../hooks/useTranslation';
import { siteConfig } from '../../site.config';

const { getAllDishes } = require('../../lib/food');

interface FoodIndexProps {
  dishes: any[];
}

export default function FoodIndex({ dishes }: FoodIndexProps) {
  const { t } = useTranslation('common');

  return (
    <>
      <SEOHead
        title={`Local Food Guide - ${siteConfig.name}`}
        description={`Discover the best local food and dishes in ${siteConfig.destination}. Complete food guide with recipes and recommendations.`}
      />
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <Breadcrumbs items={[
          { name: t('nav.home'), href: '/' },
          { name: t('nav.food'), href: '/food/' },
        ]} />
        <h1 className="text-3xl md:text-4xl font-bold text-brand-secondary mb-8">
          {siteConfig.destination} Food Guide
        </h1>
        {dishes.length === 0 ? (
          <p className="text-gray-500 text-center py-12">
            Content coming soon! We are working on adding local dishes.
          </p>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {dishes.map((dish: any) => (
              <FoodCard
                key={dish.slug}
                name={dish.name?.en || dish.name || dish.slug}
                slug={dish.slug}
                image={dish.image || '/images/placeholder.webp'}
                category={dish.category}
                description={dish.description?.en || dish.description}
              />
            ))}
          </div>
        )}
      </div>
    </>
  );
}

export const getStaticProps: GetStaticProps = async () => {
  const dishes = getAllDishes();
  return {
    props: { dishes },
    revalidate: 86400,
  };
};
