import Head from 'next/head';
import { ReactNode } from 'react';

interface SEOHeadProps {
  title: string;
  description: string;
  ogImage?: string;
  children?: ReactNode;
}

export default function SEOHead({ title, description, ogImage, children }: SEOHeadProps) {
  return (
    <Head>
      <title>{title}</title>
      <meta name="description" content={description} />
      <meta property="og:title" content={title} />
      <meta property="og:description" content={description} />
      <meta name="twitter:title" content={title} />
      <meta name="twitter:description" content={description} />
      {ogImage && (
        <>
          <meta property="og:image" content={ogImage} />
          <meta name="twitter:image" content={ogImage} />
        </>
      )}
      {children}
    </Head>
  );
}
