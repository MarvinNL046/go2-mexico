'use client';
import Link from 'next/link';
import Image from 'next/image';
import { useState } from 'react';
import LanguageSwitcher from './LanguageSwitcher';
import { useTranslation } from '../hooks/useTranslation';
import { siteConfig } from '../site.config';

const Header = () => {
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const { t } = useTranslation('common');

  return (
    <header className="sticky top-0 z-50 bg-white/95 backdrop-blur-md border-b-2 border-brand-primary shadow-lg">
      <nav className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between items-center h-20">
          {/* Logo */}
          <Link href="/" className="flex items-center group">
            <div className="h-16 w-16 relative transform transition-transform group-hover:scale-110">
              <Image
                src="/images/logo.webp"
                alt={siteConfig.tagline}
                height={64}
                width={64}
                className="object-contain"
                priority
              />
            </div>
            <span className="ml-2 text-xl font-bold text-brand-secondary hidden sm:block">
              {siteConfig.name}
            </span>
          </Link>

          {/* Desktop Navigation */}
          <div className="hidden md:flex items-center space-x-1">
            <Link href="/" className="text-brand-secondary-700 hover:text-brand-primary px-4 py-2 rounded-lg text-sm font-medium transition-all duration-300 hover:bg-brand-primary-50">
              {t('nav.home')}
            </Link>
            <Link href="/city/" className="text-brand-secondary-700 hover:text-brand-primary px-4 py-2 rounded-lg text-sm font-medium transition-all duration-300 hover:bg-brand-primary-50">
              {t('nav.cities')}
            </Link>

            {/* Food & Drinks Dropdown */}
            <div className="relative group">
              <button className="text-brand-secondary-700 hover:text-brand-primary px-4 py-2 rounded-lg text-sm font-medium transition-all duration-300 hover:bg-brand-primary-50 flex items-center space-x-1">
                <span>{t('nav.foodDrinks')}</span>
                <svg className="w-4 h-4 transform transition-transform group-hover:rotate-180" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 9l-7 7-7-7" />
                </svg>
              </button>
              <div className="absolute left-0 mt-2 w-56 bg-white/95 backdrop-blur-md rounded-xl shadow-xl border border-gray-100 opacity-0 invisible group-hover:opacity-100 group-hover:visible transition-all duration-300 transform group-hover:translate-y-0 translate-y-2 z-50">
                <div className="py-2">
                  <Link href="/food/" className="flex items-center px-4 py-3 text-sm text-gray-700 hover:bg-brand-primary-50 hover:text-brand-primary transition-all duration-200">
                    {t('nav.food')}
                  </Link>
                  <Link href="/drinks/" className="flex items-center px-4 py-3 text-sm text-gray-700 hover:bg-brand-primary-50 hover:text-brand-primary transition-all duration-200">
                    {t('nav.drinks')}
                  </Link>
                </div>
              </div>
            </div>

            {/* Travel Info Dropdown */}
            <div className="relative group">
              <button className="text-brand-secondary-700 hover:text-brand-primary px-4 py-2 rounded-lg text-sm font-medium transition-all duration-300 hover:bg-brand-primary-50 flex items-center space-x-1">
                <span>{t('nav.travelNeeds')}</span>
                <svg className="w-4 h-4 transform transition-transform group-hover:rotate-180" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 9l-7 7-7-7" />
                </svg>
              </button>
              <div className="absolute left-0 mt-2 w-56 bg-white/95 backdrop-blur-md rounded-xl shadow-xl border border-gray-100 opacity-0 invisible group-hover:opacity-100 group-hover:visible transition-all duration-300 transform group-hover:translate-y-0 translate-y-2 z-50">
                <div className="py-2">
                  <Link href="/visa/" className="flex items-center px-4 py-3 text-sm text-gray-700 hover:bg-brand-primary-50 hover:text-brand-primary transition-all duration-200">
                    {t('nav.visaGuide')}
                  </Link>
                  <Link href="/practical-info/" className="flex items-center px-4 py-3 text-sm text-gray-700 hover:bg-brand-primary-50 hover:text-brand-primary transition-all duration-200">
                    {t('nav.practicalInfo')}
                  </Link>
                  <Link href="/weather/" className="flex items-center px-4 py-3 text-sm text-gray-700 hover:bg-brand-primary-50 hover:text-brand-primary transition-all duration-200">
                    {t('nav.weather')}
                  </Link>
                  <Link href="/transport/" className="flex items-center px-4 py-3 text-sm text-gray-700 hover:bg-brand-primary-50 hover:text-brand-primary transition-all duration-200">
                    {t('nav.transport')}
                  </Link>
                  <div className="border-t border-gray-100 my-1" />
                  <Link href="/esim/" className="flex items-center px-4 py-3 text-sm text-gray-700 hover:bg-brand-primary-50 hover:text-brand-primary transition-all duration-200">
                    {t('nav.esim')}
                  </Link>
                  <Link href="/travel-insurance/" className="flex items-center px-4 py-3 text-sm text-gray-700 hover:bg-brand-primary-50 hover:text-brand-primary transition-all duration-200">
                    {t('nav.insurance')}
                  </Link>
                </div>
              </div>
            </div>

            <Link href="/blog/" className="text-brand-secondary-700 hover:text-brand-primary px-4 py-2 rounded-lg text-sm font-medium transition-all duration-300 hover:bg-brand-primary-50">
              {t('nav.blog')}
            </Link>

            {/* CTA + Language */}
            <div className="ml-2 pl-4 border-l border-gray-200 flex items-center gap-3">
              <Link href="/city/" className="bg-gradient-to-r from-brand-primary to-brand-primary-600 text-white px-6 py-2 rounded-lg text-sm font-semibold hover:from-brand-primary-600 hover:to-brand-primary-700 transition-all duration-300 shadow-lg hover:shadow-xl transform hover:scale-105">
                {t('nav.exploreNow')}
              </Link>
              <LanguageSwitcher />
            </div>
          </div>

          {/* Mobile menu button */}
          <div className="md:hidden">
            <button
              type="button"
              className="bg-gray-50 inline-flex items-center justify-center p-3 rounded-lg text-brand-secondary hover:text-brand-primary hover:bg-brand-primary-50 transition-all duration-300"
              onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
            >
              <span className="sr-only">{t('nav.openMainMenu')}</span>
              {!isMobileMenuOpen ? (
                <svg className="block h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M4 6h16M4 12h16M4 18h16" />
                </svg>
              ) : (
                <svg className="block h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12" />
                </svg>
              )}
            </button>
          </div>
        </div>

        {/* Mobile Menu */}
        <div className={`md:hidden transition-all duration-300 ease-in-out ${isMobileMenuOpen ? 'max-h-[500px] opacity-100' : 'max-h-0 opacity-0 overflow-hidden'}`}>
          <div className="px-2 pt-2 pb-6 space-y-1 bg-gray-50 rounded-b-xl border-t border-gray-100 mt-4">
            <Link href="/" className="text-gray-700 hover:text-brand-primary block px-4 py-3 rounded-lg text-base font-medium" onClick={() => setIsMobileMenuOpen(false)}>
              {t('nav.home')}
            </Link>
            <Link href="/city/" className="text-gray-700 hover:text-brand-primary block px-4 py-3 rounded-lg text-base font-medium" onClick={() => setIsMobileMenuOpen(false)}>
              {t('nav.cities')}
            </Link>
            <Link href="/food/" className="text-gray-700 hover:text-brand-primary block px-4 py-3 rounded-lg text-base font-medium" onClick={() => setIsMobileMenuOpen(false)}>
              {t('nav.food')}
            </Link>
            <Link href="/drinks/" className="text-gray-700 hover:text-brand-primary block px-4 py-3 rounded-lg text-base font-medium" onClick={() => setIsMobileMenuOpen(false)}>
              {t('nav.drinks')}
            </Link>
            <div className="border-t border-gray-200 my-2 mx-4" />
            <Link href="/visa/" className="text-gray-700 hover:text-brand-primary block px-4 py-3 rounded-lg text-base font-medium" onClick={() => setIsMobileMenuOpen(false)}>
              {t('nav.visaGuide')}
            </Link>
            <Link href="/practical-info/" className="text-gray-700 hover:text-brand-primary block px-4 py-3 rounded-lg text-base font-medium" onClick={() => setIsMobileMenuOpen(false)}>
              {t('nav.practicalInfo')}
            </Link>
            <Link href="/weather/" className="text-gray-700 hover:text-brand-primary block px-4 py-3 rounded-lg text-base font-medium" onClick={() => setIsMobileMenuOpen(false)}>
              {t('nav.weather')}
            </Link>
            <Link href="/transport/" className="text-gray-700 hover:text-brand-primary block px-4 py-3 rounded-lg text-base font-medium" onClick={() => setIsMobileMenuOpen(false)}>
              {t('nav.transport')}
            </Link>
            <Link href="/blog/" className="text-gray-700 hover:text-brand-primary block px-4 py-3 rounded-lg text-base font-medium" onClick={() => setIsMobileMenuOpen(false)}>
              {t('nav.blog')}
            </Link>
            <div className="pt-4 mt-4 border-t border-gray-200">
              <Link href="/city/" className="bg-gradient-to-r from-brand-primary to-brand-primary-600 text-white block px-4 py-3 rounded-lg text-center font-semibold" onClick={() => setIsMobileMenuOpen(false)}>
                {t('nav.exploreNow')}
              </Link>
            </div>
          </div>
        </div>
      </nav>
    </header>
  );
};

export default Header;
