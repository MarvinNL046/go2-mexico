// DEPRECATED: This page has been moved to /cities/[slug]
// This file exists for backward compatibility and redirects to the new location.
import { useEffect } from 'react';
import { useRouter } from 'next/router';
import { GetStaticPaths, GetStaticProps } from 'next';
import { getSlugs } from '../../lib/content';

export default function OldCityPage() {
  const router = useRouter();
  const { slug } = router.query;
  useEffect(() => {
    if (slug) {
      router.replace(`/cities/${slug}/`);
    }
  }, [router, slug]);
  return null;
}

export const getStaticPaths: GetStaticPaths = async () => {
  const slugs = getSlugs('cities');
  return {
    paths: slugs.map((slug) => ({ params: { slug } })),
    fallback: false,
  };
};

export const getStaticProps: GetStaticProps = async () => {
  return { props: {} };
};
