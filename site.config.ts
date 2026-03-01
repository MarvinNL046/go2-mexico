// =============================================================================
// site.config.ts - Central configuration for Go2 destination sites
// =============================================================================

export interface AffiliateLinks {
  booking: string;
  tripcom: string;
  transport: string;
  esim: string;
  getYourGuide: string;
  klook: string;
  nordvpn: string;
  nordpass: string;
  airalo: string;
  saily: string;
  yesim: string;
}

export interface SiteConfig {
  name: string;
  domain: string;
  destination: string;
  destinationFull: string;
  tagline: string;
  colors: {
    primary: Record<string, string>;
    secondary: Record<string, string>;
    accent: Record<string, string>;
  };
  locales: string[];
  defaultLocale: string;
  affiliateLinks: AffiliateLinks;
  seo: {
    siteUrl: string;
    ogImage: string;
    twitterHandle: string;
    googleAnalyticsId: string;
    indexNowKey: string;
  };
  contentTypes: {
    cities: boolean;
    regions: boolean;
    destinations: boolean;
    experiences: boolean;
    itineraries: boolean;
    food: boolean;
    drinks: boolean;
    blog: boolean;
    transport: boolean;
    visa: boolean;
    weather: boolean;
    practicalInfo: boolean;
    islands: boolean;
    comparisons: boolean;
    top10: boolean;
  };
  navigation: {
    mainLinks: Array<{ key: string; href: string }>;
    dropdowns: Array<{
      key: string;
      items: Array<{ key: string; href: string }>;
    }>;
  };
  sisterSites: Array<{
    name: string;
    domain: string;
    destination: string;
  }>;
  authors: Record<string, {
    name: string;
    bio: string;
    avatar: string;
    credentials: string;
  }>;
  scrapingOverrides: Record<string, { preferBrightData: boolean }>;
}

const ALL_SISTER_SITES: SiteConfig['sisterSites'] = [
  { name: 'Go2Thailand', domain: 'go2-thailand.com', destination: 'Thailand' },
  { name: 'Go2Bali', domain: 'go2-bali.com', destination: 'Bali' },
  { name: 'Go2China', domain: 'go2-china.com', destination: 'China' },
  { name: 'Go2India', domain: 'go2-india.com', destination: 'India' },
  { name: 'Go2Japan', domain: 'go2-japan.com', destination: 'Japan' },
  { name: 'Go2Mexico', domain: 'go2-mexico.com', destination: 'Mexico' },
  { name: 'Go2Morocco', domain: 'go2-morocco.com', destination: 'Morocco' },
  { name: 'Go2USA', domain: 'go2-usa.com', destination: 'USA' },
  { name: 'Go2Vietnam', domain: 'go2-vietnam.com', destination: 'Vietnam' },
];

export const siteConfig: SiteConfig = {
  name: 'Go2Mexico',
  domain: 'go2-mexico.com',
  destination: 'Mexico',
  destinationFull: 'Mexico',
  tagline: 'Your Ultimate Mexico Travel Guide',

  colors: {
    primary: {
      DEFAULT: '#006847',
      '50': '#ECFDF5',
      '100': '#D1FAE5',
      '200': '#A7F3D0',
      '300': '#6EE7B7',
      '400': '#34D399',
      '500': '#10B981',
      '600': '#008C5E',
      '700': '#006847',
      '800': '#005238',
      '900': '#003D2A',
    },
    secondary: {
      DEFAULT: '#8B4513',
      '50': '#FAF5F0',
      '100': '#F0E4D6',
      '200': '#E0C9AD',
      '300': '#CDAA82',
      '400': '#B8895A',
      '500': '#A06C3A',
      '600': '#8B4513',
      '700': '#723A10',
      '800': '#5A2E0D',
      '900': '#42220A',
    },
    accent: {
      DEFAULT: '#FF6B35',
      '50': '#FFF4EE',
      '100': '#FFE4D6',
      '200': '#FFC9AD',
      '300': '#FFAB82',
      '400': '#FF8B58',
      '500': '#FF6B35',
      '600': '#E85520',
      '700': '#C4441A',
      '800': '#9E3615',
      '900': '#7E2B11',
    },
  },

  locales: ['en'],
  defaultLocale: 'en',

  affiliateLinks: {
    booking: 'https://booking.tpo.lv/2PT1kR82',
    tripcom: 'https://trip.tpo.lv/TmObooZ5',
    transport: 'https://12go.tpo.lv/tNA80urD',
    esim: 'https://saily.tpo.lv/rf9lidnE',
    getYourGuide: 'https://getyourguide.tpo.lv/6HngJ5FC',
    klook: 'https://klook.tpo.lv/7Dt6WApj',
    nordvpn: 'https://nordvpn.tpo.lv/placeholder',
    nordpass: 'https://nordpass.tpo.lv/placeholder',
    airalo: 'https://airalo.tpo.lv/placeholder',
    saily: 'https://saily.tpo.lv/rf9lidnE',
    yesim: 'https://yesim.tpo.lv/placeholder',
  },

  seo: {
    siteUrl: 'https://go2-mexico.com',
    ogImage: '/images/og-default.jpg',
    twitterHandle: 'go2mexico',
    googleAnalyticsId: '',
    indexNowKey: '',
  },

  contentTypes: {
    cities: true,
    regions: true,
    destinations: true,
    experiences: true,
    itineraries: true,
    food: true,
    drinks: true,
    blog: true,
    transport: true,
    visa: true,
    weather: true,
    practicalInfo: true,
    islands: false,
    comparisons: false,
    top10: false,
  },

  navigation: {
    mainLinks: [
      { key: 'nav.home', href: '/' },
      { key: 'nav.destinations', href: '/destinations/' },
      { key: 'nav.cities', href: '/cities/' },
      { key: 'nav.experiences', href: '/experiences/' },
      { key: 'nav.itineraries', href: '/itineraries/' },
      { key: 'nav.blog', href: '/blog/' },
    ],
    dropdowns: [
      {
        key: 'nav.explore',
        items: [
          { key: 'nav.regions', href: '/regions/' },
          { key: 'nav.food', href: '/food/' },
          { key: 'nav.drinks', href: '/drinks/' },
        ],
      },
      {
        key: 'nav.travelNeeds',
        items: [
          { key: 'nav.visaGuide', href: '/visa/' },
          { key: 'nav.practicalInfo', href: '/practical-info/' },
          { key: 'nav.weather', href: '/weather/' },
          { key: 'nav.transport', href: '/transport/' },
        ],
      },
    ],
  },

  sisterSites: ALL_SISTER_SITES,

  authors: {
    'go2mexico-team': {
      name: 'Go2Mexico Team',
      bio: 'Our team of travel writers and Mexico enthusiasts brings years of firsthand experience exploring every corner of Mexico. From bustling Mexico City markets to serene Oaxacan villages, we share authentic insights to help you plan your perfect Mexican adventure.',
      avatar: '/images/authors/team.webp',
      credentials: 'Travel writers with 10+ years of Mexico travel experience',
    },
    'carlos-mendoza': {
      name: 'Carlos Mendoza',
      bio: 'Born and raised in Mexico City, Carlos has spent over 15 years documenting travel experiences across Mexico. He specializes in cultural tourism, local cuisine, and off-the-beaten-path destinations.',
      avatar: '/images/authors/carlos.webp',
      credentials: 'Mexico City native, certified tour guide, food writer',
    },
    'sarah-mitchell': {
      name: 'Sarah Mitchell',
      bio: 'Sarah is an American expat who has called Mexico home for 8 years. She writes about practical travel tips, budget travel, and the expat experience in Mexico.',
      avatar: '/images/authors/sarah.webp',
      credentials: 'Expat in Mexico since 2018, travel blogger, budget travel specialist',
    },
  },

  scrapingOverrides: {
    klook: { preferBrightData: true },
  },
};

// Helper functions
export function getSisterSiteUrl(destination: string): string | undefined {
  const site = ALL_SISTER_SITES.find(
    (s) => s.destination.toLowerCase() === destination.toLowerCase()
  );
  return site ? `https://${site.domain}` : undefined;
}

export function getOtherSisterSites(): SiteConfig['sisterSites'] {
  return ALL_SISTER_SITES.filter((s) => s.domain !== siteConfig.domain);
}

export function getTailwindColors() {
  return {
    primary: siteConfig.colors.primary,
    secondary: siteConfig.colors.secondary,
    accent: siteConfig.colors.accent,
  };
}

export function isContentTypeEnabled(type: keyof SiteConfig['contentTypes']): boolean {
  return siteConfig.contentTypes[type];
}

export function getActiveNavigation() {
  const contentTypeRouteMap: Record<string, keyof SiteConfig['contentTypes']> = {
    '/cities/': 'cities',
    '/regions/': 'regions',
    '/destinations/': 'destinations',
    '/experiences/': 'experiences',
    '/itineraries/': 'itineraries',
    '/food/': 'food',
    '/drinks/': 'drinks',
    '/transport/': 'transport',
    '/visa/': 'visa',
    '/weather/': 'weather',
    '/blog/': 'blog',
    '/practical-info/': 'practicalInfo',
  };

  const isRouteActive = (href: string): boolean => {
    const contentType = contentTypeRouteMap[href];
    if (!contentType) return true;
    return siteConfig.contentTypes[contentType];
  };

  return {
    mainLinks: siteConfig.navigation.mainLinks.filter((link) => isRouteActive(link.href)),
    dropdowns: siteConfig.navigation.dropdowns
      .map((dropdown) => ({
        ...dropdown,
        items: dropdown.items.filter((item) => isRouteActive(item.href)),
      }))
      .filter((dropdown) => dropdown.items.length > 0),
  };
}

export function getAuthor(key: string) {
  return siteConfig.authors[key] || siteConfig.authors['go2mexico-team'];
}

export function buildAffiliateUrl(partner: keyof AffiliateLinks, params?: Record<string, string>): string {
  const baseUrl = siteConfig.affiliateLinks[partner];
  if (!params) return baseUrl;
  const searchParams = new URLSearchParams(params);
  return `${baseUrl}?${searchParams.toString()}`;
}

export default siteConfig;
