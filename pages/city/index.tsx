// DEPRECATED: This page has been moved to /cities/
// This file exists for backward compatibility and redirects to the new location.
import { useEffect } from 'react';
import { useRouter } from 'next/router';

export default function OldCityIndex() {
  const router = useRouter();
  useEffect(() => {
    router.replace('/cities/');
  }, [router]);
  return null;
}
