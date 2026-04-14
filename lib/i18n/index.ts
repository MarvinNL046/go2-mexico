import { useRouter } from 'next/router';

/**
 * Bilingual string dictionary shape used across per-page i18n files.
 * Keys are dot-notation slugs (e.g. "hero.title", "cta.book_hotel").
 */
export interface Strings {
  en: Record<string, string>;
  nl: Record<string, string>;
}

/**
 * Hook that returns a translator function bound to the current locale.
 *
 * Usage in a page:
 *   import { useT } from '../lib/i18n';
 *   import { strings } from '../lib/i18n/about';
 *
 *   const t = useT(strings);
 *   return <h1>{t('hero.title')}</h1>;
 *
 * Falls back to English if a key is missing in the active locale, and to the
 * raw key if it is missing in both (so we fail loud in dev, not blank in prod).
 */
export function useT(strings: Strings) {
  const { locale } = useRouter();
  const nlDict = strings.nl || {};
  const enDict = strings.en || {};
  const dict = locale === 'nl' ? nlDict : enDict;
  return (key: string): string => dict[key] ?? enDict[key] ?? key;
}

/**
 * Server-side equivalent for use in getStaticProps when we need translated
 * strings in the returned props (e.g. SEO <title>/<description>).
 */
export function pickStrings(strings: Strings, locale: string | undefined) {
  return locale === 'nl' ? { ...strings.en, ...strings.nl } : strings.en;
}
