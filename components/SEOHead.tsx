import Head from 'next/head';
import { useRouter } from 'next/router';
import { ReactNode } from 'react';
import { siteConfig } from '../site.config';

interface FAQItem {
  question: string;
  answer: string;
}

interface ArticleSchema {
  headline: string;
  description: string;
  image?: string;
  datePublished?: string;
  dateModified?: string;
  authorName?: string;
  authorUrl?: string;
}

interface SEOHeadProps {
  title: string;
  description: string;
  ogImage?: string;
  canonicalUrl?: string;
  article?: ArticleSchema;
  faq?: FAQItem[];
  schema?: Record<string, unknown>;
  noIndex?: boolean;
  children?: ReactNode;
}

export default function SEOHead({
  title,
  description,
  ogImage,
  canonicalUrl,
  article,
  faq,
  schema,
  noIndex,
  children,
}: SEOHeadProps) {
  const router = useRouter();

  // Only three of twenty-nine pages passed canonicalUrl, so nearly the whole
  // site shipped without one while apex and www both serve it. Fall back to the
  // route actually being rendered. During prerender asPath can still hold the
  // unsubstituted pattern ("/city/[slug]"); emitting that would be worse than
  // none, so those fall through to no canonical as before.
  const routePath = router?.asPath?.split(/[?#]/)[0];
  const resolvedCanonical =
    canonicalUrl ?? (routePath && !routePath.includes('[') ? routePath : undefined);
  const siteUrl = siteConfig.seo.siteUrl;
  const fullOgImage = ogImage
    ? ogImage.startsWith('http') ? ogImage : `${siteUrl}${ogImage}`
    : `${siteUrl}${siteConfig.seo.ogImage}`;

  // Article structured data
  const articleSchema = article
    ? {
        '@context': 'https://schema.org',
        '@type': 'Article',
        headline: article.headline,
        description: article.description,
        image: article.image
          ? article.image.startsWith('http')
            ? article.image
            : `${siteUrl}${article.image}`
          : fullOgImage,
        datePublished: article.datePublished,
        dateModified: article.dateModified || article.datePublished,
        author: {
          '@type': 'Person',
          name: article.authorName || siteConfig.name,
          ...(article.authorUrl ? { url: article.authorUrl } : {}),
        },
        publisher: {
          '@type': 'Organization',
          name: siteConfig.name,
          logo: {
            '@type': 'ImageObject',
            url: `${siteUrl}/images/logo.webp`,
          },
        },
        mainEntityOfPage: {
          '@type': 'WebPage',
          '@id': resolvedCanonical ? `${siteUrl}${resolvedCanonical}` : siteUrl,
        },
      }
    : null;

  // FAQ structured data
  const faqSchema =
    faq && faq.length > 0
      ? {
          '@context': 'https://schema.org',
          '@type': 'FAQPage',
          mainEntity: faq.map((item) => ({
            '@type': 'Question',
            name: item.question,
            acceptedAnswer: {
              '@type': 'Answer',
              text: item.answer,
            },
          })),
        }
      : null;

  return (
    <Head>
      <title>{title}</title>
      <meta name="description" content={description} />

      {/* Open Graph */}
      <meta property="og:type" content={article ? 'article' : 'website'} />
      <meta property="og:title" content={title} />
      <meta property="og:description" content={description} />
      <meta property="og:image" content={fullOgImage} />
      <meta property="og:site_name" content={siteConfig.name} />

      {/* Twitter */}
      <meta name="twitter:card" content="summary_large_image" />
      <meta name="twitter:title" content={title} />
      <meta name="twitter:description" content={description} />
      <meta name="twitter:image" content={fullOgImage} />
      {siteConfig.seo.twitterHandle && (
        <meta name="twitter:site" content={`@${siteConfig.seo.twitterHandle}`} />
      )}

      {/* Canonical */}
      {resolvedCanonical && <link rel="canonical" href={`${siteUrl}${resolvedCanonical}`} />}

      {/* No index */}
      {noIndex && <meta name="robots" content="noindex,nofollow" />}

      {/* Article schema */}
      {articleSchema && (
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{ __html: JSON.stringify(articleSchema) }}
        />
      )}

      {/* FAQ schema */}
      {faqSchema && (
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{ __html: JSON.stringify(faqSchema) }}
        />
      )}

      {/* Custom schema */}
      {schema && (
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{ __html: JSON.stringify(schema) }}
        />
      )}

      {children}
    </Head>
  );
}
