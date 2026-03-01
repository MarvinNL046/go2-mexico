'use client';
import Link from 'next/link';
import Image from 'next/image';
import { useState } from 'react';
import { ChevronDown, Menu, X } from 'lucide-react';
import LanguageSwitcher from './LanguageSwitcher';
import { useTranslation } from '../hooks/useTranslation';
import { siteConfig, getActiveNavigation } from '../site.config';

const Header = () => {
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const [openMobileDropdown, setOpenMobileDropdown] = useState<string | null>(null);
  const { t } = useTranslation('common');
  const navigation = getActiveNavigation();

  const closeMobileMenu = () => {
    setIsMobileMenuOpen(false);
    setOpenMobileDropdown(null);
  };

  const toggleMobileDropdown = (key: string) => {
    setOpenMobileDropdown(openMobileDropdown === key ? null : key);
  };

  return (
    <header className="sticky top-0 z-50 bg-white/85 backdrop-blur-xl border-b border-gray-200/60 shadow-sm">
      <nav className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between items-center h-18">
          {/* Logo */}
          <Link href="/" className="flex items-center group" onClick={closeMobileMenu}>
            <Image
              src="/images/logo.svg"
              alt={siteConfig.name}
              width={180}
              height={32}
              className="h-8 w-auto transition-transform duration-300 group-hover:scale-105"
              priority
            />
          </Link>

          {/* Desktop Navigation */}
          <div className="hidden lg:flex items-center gap-1">
            {/* Main links from config */}
            {navigation.mainLinks.map((link) => (
              <Link
                key={link.key}
                href={link.href}
                className="text-gray-700 hover:text-brand-primary px-3 py-2 rounded-lg text-sm font-medium transition-colors duration-200 hover:bg-brand-primary/5"
              >
                {t(link.key)}
              </Link>
            ))}

            {/* Dropdown menus from config */}
            {navigation.dropdowns.map((dropdown) => (
              <div key={dropdown.key} className="relative group">
                <button className="flex items-center gap-1 text-gray-700 hover:text-brand-primary px-3 py-2 rounded-lg text-sm font-medium transition-colors duration-200 hover:bg-brand-primary/5">
                  <span>{t(dropdown.key)}</span>
                  <ChevronDown className="w-3.5 h-3.5 transition-transform duration-200 group-hover:rotate-180" />
                </button>
                <div className="absolute left-0 top-full pt-2 w-52 opacity-0 invisible group-hover:opacity-100 group-hover:visible transition-all duration-200 ease-out transform translate-y-1 group-hover:translate-y-0 z-50">
                  <div className="bg-white/95 backdrop-blur-xl rounded-xl shadow-xl shadow-gray-200/50 border border-gray-100 overflow-hidden">
                    <div className="py-1">
                      {dropdown.items.map((item) => (
                        <Link
                          key={item.key}
                          href={item.href}
                          className="flex items-center px-4 py-2.5 text-sm text-gray-700 hover:bg-brand-primary/5 hover:text-brand-primary transition-colors duration-150"
                        >
                          {t(item.key)}
                        </Link>
                      ))}
                    </div>
                  </div>
                </div>
              </div>
            ))}

            {/* CTA + Language Switcher */}
            <div className="ml-3 pl-3 border-l border-gray-200 flex items-center gap-2">
              <Link
                href="/destinations/"
                className="btn-primary text-xs px-5 py-2"
              >
                {t('nav.exploreNow')}
              </Link>
              <LanguageSwitcher />
            </div>
          </div>

          {/* Mobile menu button */}
          <button
            type="button"
            className="lg:hidden inline-flex items-center justify-center p-2.5 rounded-xl text-gray-700 hover:text-brand-primary hover:bg-brand-primary/5 transition-colors duration-200"
            onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
            aria-label={t('nav.openMainMenu')}
          >
            {isMobileMenuOpen ? (
              <X className="h-5 w-5" />
            ) : (
              <Menu className="h-5 w-5" />
            )}
          </button>
        </div>

        {/* Mobile Menu */}
        <div
          className={`lg:hidden transition-all duration-300 ease-in-out ${
            isMobileMenuOpen
              ? 'max-h-[600px] opacity-100 pb-6'
              : 'max-h-0 opacity-0 overflow-hidden'
          }`}
        >
          <div className="pt-2 space-y-1 border-t border-gray-100">
            {/* Main links */}
            {navigation.mainLinks.map((link) => (
              <Link
                key={link.key}
                href={link.href}
                className="block px-4 py-3 text-gray-700 hover:text-brand-primary hover:bg-brand-primary/5 rounded-lg text-base font-medium transition-colors duration-150"
                onClick={closeMobileMenu}
              >
                {t(link.key)}
              </Link>
            ))}

            {/* Dropdown sections */}
            {navigation.dropdowns.map((dropdown) => (
              <div key={dropdown.key}>
                <button
                  className="flex items-center justify-between w-full px-4 py-3 text-gray-700 hover:text-brand-primary rounded-lg text-base font-medium transition-colors duration-150"
                  onClick={() => toggleMobileDropdown(dropdown.key)}
                >
                  <span>{t(dropdown.key)}</span>
                  <ChevronDown
                    className={`w-4 h-4 transition-transform duration-200 ${
                      openMobileDropdown === dropdown.key ? 'rotate-180' : ''
                    }`}
                  />
                </button>
                <div
                  className={`transition-all duration-200 ease-in-out overflow-hidden ${
                    openMobileDropdown === dropdown.key ? 'max-h-96 opacity-100' : 'max-h-0 opacity-0'
                  }`}
                >
                  <div className="pl-4 space-y-1 pb-2">
                    {dropdown.items.map((item) => (
                      <Link
                        key={item.key}
                        href={item.href}
                        className="block px-4 py-2.5 text-gray-600 hover:text-brand-primary text-sm font-medium transition-colors duration-150"
                        onClick={closeMobileMenu}
                      >
                        {t(item.key)}
                      </Link>
                    ))}
                  </div>
                </div>
              </div>
            ))}

            {/* Mobile CTA */}
            <div className="pt-4 mt-2 border-t border-gray-100 px-4">
              <Link
                href="/destinations/"
                className="btn-primary w-full text-center block"
                onClick={closeMobileMenu}
              >
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
