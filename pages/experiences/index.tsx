import { GetStaticProps } from 'next';
import Link from 'next/link';
import Image from 'next/image';
import { useState } from 'react';
import { Sparkles, Search, Clock } from 'lucide-react';
import SEOHead from '../../components/SEOHead';
import Breadcrumbs from '../../components/Breadcrumbs';
import { useTranslation } from '../../hooks/useTranslation';
import { siteConfig } from '../../site.config';
import { getAllContent, ContentMeta } from '../../lib/content';

interface ExperiencesIndexProps {
  experiences: ContentMeta[];
}

export default function ExperiencesIndex({ experiences }: ExperiencesIndexProps) {
  const { t } = useTranslation('common');
  const [searchQuery, setSearchQuery] = useState('');

  const filteredExperiences = experiences.filter((exp) => {
    if (!searchQuery) return true;
    return (
      exp.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
      exp.description?.toLowerCase().includes(searchQuery.toLowerCase())
    );
  });

  return (
    <>
      <SEOHead
        title={`Things to Do in Mexico - Experiences & Activities | ${siteConfig.name}`}
        description="Discover the best things to do in Mexico. From food tours and diving to cultural experiences and adventure activities."
        ogImage={siteConfig.seo.ogImage}
      />

      {/* Hero */}
      <section className="relative min-h-[35vh] flex items-center">
        <Image src="/images/heroes/experiences-hero.webp" alt="Cenote swimming adventure in Mexico" fill className="object-cover" priority />
        <div className="absolute inset-0 bg-black/50" />
        <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16 text-center">
          <h1 className="text-4xl md:text-5xl font-bold text-white mb-4">
            {t('sections.featuredExperiences')}
          </h1>
          <p className="text-lg text-white/80 max-w-2xl mx-auto">
            Unforgettable activities and unique experiences across Mexico to make your trip truly memorable.
          </p>
        </div>
      </section>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <Breadcrumbs
          items={[
            { name: t('nav.home'), href: '/' },
            { name: t('nav.experiences'), href: '/experiences/' },
          ]}
        />

        {/* Search */}
        <div className="mb-8">
          <div className="relative max-w-md">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
            <input
              type="text"
              placeholder={t('filters.searchPlaceholder')}
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full pl-10 pr-4 py-3 rounded-lg border border-gray-200 focus:border-brand-primary focus:ring-2 focus:ring-brand-primary/20 outline-none transition-all"
            />
          </div>
        </div>

        {filteredExperiences.length === 0 ? (
          <div className="text-center py-16">
            <Sparkles className="w-16 h-16 text-gray-300 mx-auto mb-4" />
            <p className="text-gray-500 text-lg">
              {searchQuery
                ? 'No experiences match your search. Try different keywords.'
                : 'Experience guides are coming soon. We are working on curating the best things to do in Mexico.'}
            </p>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {filteredExperiences.map((exp) => (
              <Link
                key={exp.slug}
                href={`/experiences/${exp.slug}/`}
                className="group bg-white rounded-xl shadow-md overflow-hidden hover:shadow-xl transition-all duration-300 border border-gray-100"
              >
                <div className="relative h-52 overflow-hidden">
                  <Image
                    src={exp.heroImage || '/images/placeholder.webp'}
                    alt={exp.title}
                    fill
                    className="object-cover group-hover:scale-105 transition-transform duration-500"
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-black/50 to-transparent" />
                  {exp.duration && (
                    <span className="absolute top-3 right-3 inline-flex items-center gap-1 bg-white/90 text-brand-secondary text-xs font-semibold px-3 py-1 rounded-full">
                      <Clock className="w-3.5 h-3.5" />
                      {exp.duration}
                    </span>
                  )}
                  {exp.city && (
                    <span className="absolute top-3 left-3 bg-brand-primary text-white text-xs font-semibold px-3 py-1 rounded-full">
                      {exp.city}
                    </span>
                  )}
                </div>
                <div className="p-5">
                  <h2 className="text-lg font-bold text-brand-secondary mb-2 group-hover:text-brand-primary transition-colors">
                    {exp.title}
                  </h2>
                  {exp.description && (
                    <p className="text-gray-600 text-sm line-clamp-2">
                      {exp.description}
                    </p>
                  )}
                  {exp.tags && exp.tags.length > 0 && (
                    <div className="flex flex-wrap gap-1.5 mt-3">
                      {exp.tags.slice(0, 3).map((tag) => (
                        <span
                          key={tag}
                          className="bg-brand-primary-50 text-brand-primary text-xs px-2 py-0.5 rounded-full"
                        >
                          {tag}
                        </span>
                      ))}
                    </div>
                  )}
                </div>
              </Link>
            ))}
          </div>
        )}
      </div>
    </>
  );
}

export const getStaticProps: GetStaticProps = async () => {
  const experiences = getAllContent('experiences');
  return {
    props: { experiences },
    revalidate: 86400,
  };
};
