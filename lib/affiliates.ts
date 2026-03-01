import { siteConfig, AffiliateLinks } from '../site.config';

export interface AffiliateOffer {
  partner: keyof AffiliateLinks;
  title: string;
  description: string;
  cta: string;
  url: string;
  category: 'activity' | 'hotel' | 'flight' | 'esim' | 'security' | 'transport';
  image?: string;
  price?: string;
  rating?: number;
}

export function getAffiliateUrl(
  partner: keyof AffiliateLinks,
  params?: Record<string, string>
): string {
  const baseUrl = siteConfig.affiliateLinks[partner];
  if (!params) return baseUrl;
  const sep = baseUrl.includes('?') ? '&' : '?';
  const searchParams = new URLSearchParams(params);
  return `${baseUrl}${sep}${searchParams.toString()}`;
}

export function getActivityOffers(city: string): AffiliateOffer[] {
  return [
    {
      partner: 'getYourGuide',
      title: `Top Tours & Activities in ${city}`,
      description: `Discover the best experiences in ${city} with free cancellation and instant confirmation.`,
      cta: 'Browse Activities',
      url: getAffiliateUrl('getYourGuide'),
      category: 'activity',
    },
    {
      partner: 'klook',
      title: `Things to Do in ${city}`,
      description: `Book tours, attractions, and experiences in ${city} at the best prices.`,
      cta: 'Explore on Klook',
      url: getAffiliateUrl('klook'),
      category: 'activity',
    },
    {
      partner: 'tripcom',
      title: `${city} Attractions & Tickets`,
      description: `Save on popular attractions and tours in ${city}.`,
      cta: 'View Deals',
      url: getAffiliateUrl('tripcom'),
      category: 'activity',
    },
  ];
}

export function getHotelOffers(city: string): AffiliateOffer[] {
  return [
    {
      partner: 'booking',
      title: `Hotels in ${city}`,
      description: `Find the best hotels in ${city} with free cancellation on most rooms.`,
      cta: 'Search Hotels',
      url: getAffiliateUrl('booking'),
      category: 'hotel',
    },
    {
      partner: 'tripcom',
      title: `${city} Accommodation Deals`,
      description: `Compare hotel prices in ${city} and save up to 50%.`,
      cta: 'Compare Prices',
      url: getAffiliateUrl('tripcom'),
      category: 'hotel',
    },
  ];
}

export function getEsimOffers(): AffiliateOffer[] {
  return [
    {
      partner: 'airalo',
      title: 'Mexico eSIM by Airalo',
      description: 'Stay connected in Mexico with affordable data plans. No physical SIM needed.',
      cta: 'Get eSIM',
      url: getAffiliateUrl('airalo'),
      category: 'esim',
    },
    {
      partner: 'saily',
      title: 'Saily Mexico Data Plan',
      description: 'Fast 4G/5G data coverage across Mexico with easy setup.',
      cta: 'View Plans',
      url: getAffiliateUrl('saily'),
      category: 'esim',
    },
    {
      partner: 'yesim',
      title: 'Yesim Mexico eSIM',
      description: 'Reliable mobile data in Mexico starting from $4.99.',
      cta: 'Get Started',
      url: getAffiliateUrl('yesim'),
      category: 'esim',
    },
  ];
}

export function getSecurityOffers(): AffiliateOffer[] {
  return [
    {
      partner: 'nordvpn',
      title: 'NordVPN for Mexico Travel',
      description: 'Protect your data on public WiFi and access content from home while in Mexico.',
      cta: 'Get NordVPN',
      url: getAffiliateUrl('nordvpn'),
      category: 'security',
    },
    {
      partner: 'nordpass',
      title: 'NordPass Password Manager',
      description: 'Keep your travel accounts secure with encrypted password management.',
      cta: 'Try NordPass',
      url: getAffiliateUrl('nordpass'),
      category: 'security',
    },
  ];
}

export function getFlightOffers(city: string): AffiliateOffer[] {
  return [
    {
      partner: 'tripcom',
      title: `Flights to ${city}`,
      description: `Find cheap flights to ${city}, Mexico. Compare airlines and save.`,
      cta: 'Search Flights',
      url: getAffiliateUrl('tripcom'),
      category: 'flight',
    },
  ];
}

export function getAllOffersForCity(city: string): {
  activities: AffiliateOffer[];
  hotels: AffiliateOffer[];
  esim: AffiliateOffer[];
  security: AffiliateOffer[];
  flights: AffiliateOffer[];
} {
  return {
    activities: getActivityOffers(city),
    hotels: getHotelOffers(city),
    esim: getEsimOffers(),
    security: getSecurityOffers(),
    flights: getFlightOffers(city),
  };
}
