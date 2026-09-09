import React, { useState, useRef } from 'react';
import {
  Search,
  Moon,
  Sun,
  Menu,
  X,
  Youtube,
  Facebook,
  Mail,
  Flame,
  ShieldAlert,
  Send,
  Lock,
  ChevronDown,
  MapPin,
  Newspaper
} from 'lucide-react';
import { Language, CategoryItem, SiteSettings } from '../types';
import { getCurrentHeaderDate } from '../utils/dateUtils';

interface HeaderProps {
  lang: Language;
  onLanguageChange: (lang: Language) => void;
  darkMode: boolean;
  onToggleDarkMode: () => void;
  categories: CategoryItem[];
  currentCategory: string;
  onSelectCategory: (catSlug: string) => void;
  onOpenSearch: () => void;
  onOpenNewsTipModal: () => void;
  onOpenSubscribeModal: () => void;
  onNavigateHome: () => void;
  onNavigateStaticPage: (pageSlug: string) => void;
  settings: SiteSettings;
}

export const Header: React.FC<HeaderProps> = ({
  lang,
  onLanguageChange,
  darkMode,
  onToggleDarkMode,
  categories,
  currentCategory,
  onSelectCategory,
  onOpenSearch,
  onOpenNewsTipModal,
  onOpenSubscribeModal,
  onNavigateHome,
  onNavigateStaticPage,
  settings
}) => {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [moreCategoriesOpen, setMoreCategoriesOpen] = useState(false);

  const mainCategories = categories.filter(c => c.isActive).slice(0, 9);
  const secondaryCategories = categories.filter(c => c.isActive).slice(9);

  const handleLogoClick = () => {
    onNavigateHome();
  };

  return (
    <header className="w-full bg-white dark:bg-[#0f172a] border-b border-gray-200 dark:border-slate-800 transition-colors">
      {/* 1. Top Utility Bar */}
      <div className="bg-gray-100 dark:bg-slate-900 border-b border-gray-200 dark:border-slate-800 text-xs text-gray-600 dark:text-gray-300 py-1.5 px-4">
        <div className="max-w-7xl mx-auto flex flex-wrap items-center justify-between gap-2">
          {/* Left: Date, Edition & Weather */}
          <div className="flex items-center gap-4 flex-wrap">
            <span className="font-medium text-gray-800 dark:text-gray-200">
              {getCurrentHeaderDate(lang)}
            </span>
            <span className="hidden sm:inline-block text-gray-400">|</span>
            <span className="hidden sm:inline-flex items-center gap-1 text-gray-500 dark:text-gray-400">
              <MapPin className="w-3 h-3 text-red-600" />
              {lang === 'bn' ? 'ঢাকা সংস্করণ' : 'Dhaka Edition'}
            </span>
            <span className="hidden md:inline-block text-gray-400">|</span>
            <span className="hidden md:inline-flex items-center gap-1 text-amber-600 dark:text-amber-400">
              <span>☀️</span>
              {lang === 'bn' ? 'ঢাকা ২৯° সে.' : 'Dhaka 29°C'}
            </span>
          </div>

          {/* Right: Actions, Language, Theme */}
          <div className="flex items-center gap-3">
            {/* Citizen Journalism Tip Button */}
            <button
              onClick={onOpenNewsTipModal}
              className="inline-flex items-center gap-1.5 bg-red-600 hover:bg-red-700 text-white px-2.5 py-1 rounded text-xs font-medium transition cursor-pointer shadow-sm"
              title={lang === 'bn' ? 'তথ্য বা সংবাদ পাঠান' : 'Send News Tip'}
            >
              <Send className="w-3 h-3" />
              <span>{lang === 'bn' ? 'সংবাদ পাঠান' : 'Send Tip'}</span>
            </button>

            {/* Language Switcher */}
            <div className="flex items-center bg-gray-200 dark:bg-slate-800 rounded p-0.5 font-medium">
              <button
                onClick={() => onLanguageChange('bn')}
                className={`px-2 py-0.5 rounded text-xs transition cursor-pointer ${
                  lang === 'bn'
                    ? 'bg-red-600 text-white shadow-xs'
                    : 'text-gray-600 dark:text-gray-300 hover:text-black dark:hover:text-white'
                }`}
              >
                বাংলা
              </button>
              <button
                onClick={() => onLanguageChange('en')}
                className={`px-2 py-0.5 rounded text-xs transition cursor-pointer ${
                  lang === 'en'
                    ? 'bg-red-600 text-white shadow-xs'
                    : 'text-gray-600 dark:text-gray-300 hover:text-black dark:hover:text-white'
                }`}
              >
                English
              </button>
            </div>

            {/* Theme Toggle */}
            <button
              onClick={onToggleDarkMode}
              className="p-1 rounded-full text-gray-500 hover:text-gray-800 dark:text-gray-400 dark:hover:text-white hover:bg-gray-200 dark:hover:bg-slate-800 transition cursor-pointer"
              aria-label="Toggle theme"
            >
              {darkMode ? <Sun className="w-3.5 h-3.5" /> : <Moon className="w-3.5 h-3.5 text-gray-600" />}
            </button>
          </div>
        </div>
      </div>

      {/* 2. Main Newspaper Masthead / Branding Area */}
      <div className="max-w-7xl mx-auto px-4 py-4 sm:py-6">
        <div className="flex flex-col md:flex-row items-center justify-between gap-4">
          {/* Mobile Menu Toggle & Search on small screens */}
          <div className="flex md:hidden items-center justify-between w-full">
            <button
              onClick={() => setMobileMenuOpen(true)}
              className="p-2 text-gray-700 dark:text-gray-200 hover:bg-gray-100 dark:hover:bg-slate-800 rounded transition cursor-pointer"
              aria-label="Open menu"
            >
              <Menu className="w-6 h-6" />
            </button>

            {/* Mini Center Logo for mobile */}
            <button onClick={handleLogoClick} className="text-center cursor-pointer">
              <span className="font-serif-bn text-xl font-bold text-red-700 dark:text-red-500 tracking-tight">
                {lang === 'bn' ? 'দুর্নীতির বিরুদ্ধে নিউজ' : 'Durniti Biruddhe News'}
              </span>
            </button>

            <button
              onClick={onOpenSearch}
              className="p-2 text-gray-700 dark:text-gray-200 hover:bg-gray-100 dark:hover:bg-slate-800 rounded transition cursor-pointer"
              aria-label="Search"
            >
              <Search className="w-5 h-5" />
            </button>
          </div>

          {/* Social Media Links (Desktop Left) */}
          <div className="hidden md:flex items-center gap-2 text-gray-500 dark:text-gray-400">
            <a
              href={settings.facebookUrl}
              target="_blank"
              rel="noopener noreferrer"
              className="w-8 h-8 rounded-full bg-blue-50 dark:bg-slate-800 flex items-center justify-center text-blue-600 hover:bg-blue-600 hover:text-white transition shadow-xs"
              title="Official Facebook Page"
            >
              <Facebook className="w-4 h-4" />
            </a>
            <a
              href={settings.youtubeUrl}
              target="_blank"
              rel="noopener noreferrer"
              className="w-8 h-8 rounded-full bg-red-50 dark:bg-slate-800 flex items-center justify-center text-red-600 hover:bg-red-600 hover:text-white transition shadow-xs"
              title="Official YouTube Channel"
            >
              <Youtube className="w-4 h-4" />
            </a>
            <a
              href={`mailto:${settings.officialEmail}`}
              className="w-8 h-8 rounded-full bg-gray-100 dark:bg-slate-800 flex items-center justify-center text-gray-700 dark:text-gray-300 hover:bg-red-600 hover:text-white transition shadow-xs"
              title="Contact Editorial Office"
            >
              <Mail className="w-4 h-4" />
            </a>
          </div>

          {/* Centered Editorial Logo */}
          <div className="hidden md:flex flex-col items-center text-center cursor-pointer select-none" onClick={handleLogoClick}>
            <div className="flex items-center gap-2 mb-1">
              <div className="bg-red-700 text-white text-[11px] font-bold px-2 py-0.5 rounded uppercase tracking-wider flex items-center gap-1">
                <ShieldAlert className="w-3 h-3" />
                <span>{lang === 'bn' ? 'অনুসন্ধানী ডিজিটাল মিডিয়া' : 'Investigative News Media'}</span>
              </div>
            </div>

            <h1 className="text-3xl lg:text-4xl font-extrabold font-serif-bn tracking-tight text-gray-950 dark:text-white hover:text-red-700 dark:hover:text-red-400 transition-colors">
              {lang === 'bn' ? settings.siteNameBn : settings.siteNameEn}
            </h1>

            <div className="text-xs font-medium text-red-700 dark:text-red-400 tracking-wider uppercase mt-0.5">
              {lang === 'bn' ? settings.siteNameEn : 'দুর্নীতির বিরুদ্ধে নিউজ'}
            </div>

            <p className="text-xs text-gray-500 dark:text-gray-400 mt-1 max-w-xl italic">
              "{lang === 'bn' ? settings.taglineBn : settings.taglineEn}"
            </p>
          </div>

          {/* Desktop Right: Search & Subscription */}
          <div className="hidden md:flex items-center gap-3">
            <button
              onClick={onOpenSearch}
              className="flex items-center gap-2 bg-gray-100 dark:bg-slate-800 hover:bg-gray-200 dark:hover:bg-slate-700 text-gray-600 dark:text-gray-300 px-3.5 py-2 rounded-lg text-xs font-medium transition cursor-pointer border border-gray-200 dark:border-slate-700"
            >
              <Search className="w-4 h-4 text-red-600" />
              <span>{lang === 'bn' ? 'সংবাদ খুঁজুন...' : 'Search news...'}</span>
              <kbd className="hidden lg:inline-block bg-white dark:bg-slate-900 border border-gray-300 dark:border-slate-600 px-1.5 py-0.5 rounded text-[10px] text-gray-400">
                ⌘K
              </kbd>
            </button>

            <button
              onClick={onOpenSubscribeModal}
              className="bg-amber-500 hover:bg-amber-600 text-slate-950 px-3 py-2 rounded-lg text-xs font-semibold transition cursor-pointer shadow-xs"
            >
              {lang === 'bn' ? '🔔 নোটিফিকেশন' : '🔔 Follow Us'}
            </button>
          </div>
        </div>
      </div>

      {/* 3. Main Sticky Category Navigation Bar */}
      <nav className="border-t border-b border-gray-200 dark:border-slate-800 bg-white dark:bg-[#0f172a] sticky top-0 z-30 shadow-xs">
        <div className="max-w-7xl mx-auto px-4 flex items-center justify-between">
          <div className="flex items-center overflow-x-auto no-scrollbar py-1 gap-1 text-sm font-semibold">
            {/* Home Link */}
            <button
              onClick={onNavigateHome}
              className={`px-3 py-2 rounded-md whitespace-nowrap transition cursor-pointer ${
                currentCategory === ''
                  ? 'text-red-600 dark:text-red-400 bg-red-50 dark:bg-red-950/40'
                  : 'text-gray-800 dark:text-gray-200 hover:text-red-600 dark:hover:text-red-400'
              }`}
            >
              {lang === 'bn' ? 'প্রচ্ছদ' : 'Home'}
            </button>

            {/* Special Highlight: Corruption / Investigative */}
            <button
              onClick={() => onSelectCategory('corruption')}
              className={`px-3 py-2 rounded-md whitespace-nowrap transition cursor-pointer flex items-center gap-1.5 ${
                currentCategory === 'corruption'
                  ? 'text-white bg-red-600 shadow-xs'
                  : 'text-red-600 dark:text-red-400 hover:bg-red-50 dark:hover:bg-red-950/40'
              }`}
            >
              <Flame className="w-4 h-4 text-red-600 animate-pulse" />
              <span>{lang === 'bn' ? 'দুর্নীতি' : 'Corruption'}</span>
            </button>

            <button
              onClick={() => onSelectCategory('investigative')}
              className={`px-3 py-2 rounded-md whitespace-nowrap transition cursor-pointer ${
                currentCategory === 'investigative'
                  ? 'text-white bg-red-600 shadow-xs'
                  : 'text-gray-800 dark:text-gray-200 hover:text-red-600 dark:hover:text-red-400'
              }`}
            >
              {lang === 'bn' ? 'অনুসন্ধানী প্রতিবেদন' : 'Investigative'}
            </button>

            {/* Dynamic Main Categories */}
            {mainCategories
              .filter(c => c.slug !== 'corruption' && c.slug !== 'investigative')
              .map(cat => (
                <button
                  key={cat.id}
                  onClick={() => onSelectCategory(cat.slug)}
                  className={`px-3 py-2 rounded-md whitespace-nowrap transition cursor-pointer ${
                    currentCategory === cat.slug
                      ? 'text-red-600 dark:text-red-400 bg-red-50 dark:bg-red-950/40'
                      : 'text-gray-800 dark:text-gray-200 hover:text-red-600 dark:hover:text-red-400'
                  }`}
                >
                  {lang === 'bn' ? cat.nameBn : cat.nameEn}
                </button>
              ))}

            {/* More Categories Dropdown */}
            {secondaryCategories.length > 0 && (
              <div className="relative">
                <button
                  onClick={() => setMoreCategoriesOpen(!moreCategoriesOpen)}
                  className="px-3 py-2 rounded-md whitespace-nowrap text-gray-700 dark:text-gray-300 hover:text-red-600 flex items-center gap-1 transition cursor-pointer"
                >
                  <span>{lang === 'bn' ? 'আরও' : 'More'}</span>
                  <ChevronDown className="w-3.5 h-3.5" />
                </button>

                {moreCategoriesOpen && (
                  <div
                    className="absolute left-0 mt-1 w-52 bg-white dark:bg-slate-900 border border-gray-200 dark:border-slate-800 rounded-lg shadow-xl py-2 z-50 animate-fadeIn"
                    onMouseLeave={() => setMoreCategoriesOpen(false)}
                  >
                    {secondaryCategories.map(cat => (
                      <button
                        key={cat.id}
                        onClick={() => {
                          onSelectCategory(cat.slug);
                          setMoreCategoriesOpen(false);
                        }}
                        className="w-full text-left px-4 py-2 text-xs font-medium text-gray-700 dark:text-gray-300 hover:bg-red-50 dark:hover:bg-red-950/40 hover:text-red-600 dark:hover:text-red-400 transition"
                      >
                        {lang === 'bn' ? cat.nameBn : cat.nameEn}
                      </button>
                    ))}
                  </div>
                )}
              </div>
            )}
          </div>
        </div>
      </nav>

      {/* 4. Responsive Mobile Drawer Menu */}
      {mobileMenuOpen && (
        <div className="fixed inset-0 z-50 flex">
          <div
            className="fixed inset-0 bg-black/60 backdrop-blur-xs"
            onClick={() => setMobileMenuOpen(false)}
          />
          <div className="relative w-4/5 max-w-sm bg-white dark:bg-slate-900 h-full shadow-2xl flex flex-col z-10 overflow-y-auto">
            {/* Drawer Header */}
            <div className="p-4 border-b border-gray-200 dark:border-slate-800 flex items-center justify-between">
              <div>
                <span className="font-serif-bn font-bold text-lg text-red-700 dark:text-red-500">
                  {lang === 'bn' ? 'দুর্নীতির বিরুদ্ধে নিউজ' : 'Durniti Biruddhe News'}
                </span>
                <p className="text-[11px] text-gray-500 dark:text-gray-400">
                  {getCurrentHeaderDate(lang)}
                </p>
              </div>
              <button
                onClick={() => setMobileMenuOpen(false)}
                className="p-1 rounded text-gray-500 hover:text-gray-800 dark:hover:text-white"
              >
                <X className="w-6 h-6" />
              </button>
            </div>

            {/* Action Bar */}
            <div className="p-4 border-b border-gray-100 dark:border-slate-800 flex items-center justify-between gap-2">
              <button
                onClick={() => {
                  setMobileMenuOpen(false);
                  onOpenNewsTipModal();
                }}
                className="w-full py-2 bg-red-600 text-white rounded text-xs font-semibold flex items-center justify-center gap-1.5"
              >
                <Send className="w-3.5 h-3.5" />
                <span>{lang === 'bn' ? 'সংবাদ পাঠান' : 'Send Tip'}</span>
              </button>

              <button
                onClick={() => {
                  setMobileMenuOpen(false);
                  onOpenSubscribeModal();
                }}
                className="w-full py-2 bg-amber-500 text-slate-950 rounded text-xs font-semibold flex items-center justify-center gap-1.5"
              >
                <span>🔔 {lang === 'bn' ? 'সাবস্ক্রাইব' : 'Subscribe'}</span>
              </button>
            </div>

            {/* Mobile Categories Navigation */}
            <div className="p-4 space-y-1 flex-1">
              <div className="text-[11px] font-bold uppercase text-gray-400 dark:text-gray-500 tracking-wider mb-2">
                {lang === 'bn' ? 'বিভাগসমূহ' : 'Categories'}
              </div>

              <button
                onClick={() => {
                  onNavigateHome();
                  setMobileMenuOpen(false);
                }}
                className="w-full text-left px-3 py-2 rounded text-sm font-semibold text-gray-800 dark:text-gray-200 hover:bg-red-50 dark:hover:bg-red-950/30"
              >
                {lang === 'bn' ? 'প্রচ্ছদ' : 'Home'}
              </button>

              {categories.map(cat => (
                <button
                  key={cat.id}
                  onClick={() => {
                    onSelectCategory(cat.slug);
                    setMobileMenuOpen(false);
                  }}
                  className={`w-full text-left px-3 py-2 rounded text-sm font-semibold transition ${
                    currentCategory === cat.slug
                      ? 'text-red-600 dark:text-red-400 bg-red-50 dark:bg-red-950/40'
                      : 'text-gray-800 dark:text-gray-200 hover:bg-gray-100 dark:hover:bg-slate-800'
                  }`}
                >
                  {lang === 'bn' ? cat.nameBn : cat.nameEn}
                </button>
              ))}

              <div className="pt-4 border-t border-gray-200 dark:border-slate-800 mt-4 space-y-1">
                <div className="text-[11px] font-bold uppercase text-gray-400 dark:text-gray-500 tracking-wider mb-2">
                  {lang === 'bn' ? 'প্রয়োজনীয় লিংক' : 'Information'}
                </div>
                <button
                  onClick={() => {
                    onNavigateStaticPage('about');
                    setMobileMenuOpen(false);
                  }}
                  className="w-full text-left px-3 py-1.5 text-xs text-gray-600 dark:text-gray-400 hover:text-red-600"
                >
                  {lang === 'bn' ? 'আমাদের সম্পর্কে' : 'About Us'}
                </button>
                <button
                  onClick={() => {
                    onNavigateStaticPage('contact');
                    setMobileMenuOpen(false);
                  }}
                  className="w-full text-left px-3 py-1.5 text-xs text-gray-600 dark:text-gray-400 hover:text-red-600"
                >
                  {lang === 'bn' ? 'যোগাযোগ' : 'Contact Us'}
                </button>
                <button
                  onClick={() => {
                    onNavigateStaticPage('editorial-policy');
                    setMobileMenuOpen(false);
                  }}
                  className="w-full text-left px-3 py-1.5 text-xs text-gray-600 dark:text-gray-400 hover:text-red-600"
                >
                  {lang === 'bn' ? 'সম্পাদকীয় নীতিমালা' : 'Editorial Policy'}
                </button>
                <button
                  onClick={() => {
                    onNavigateStaticPage('correction-policy');
                    setMobileMenuOpen(false);
                  }}
                  className="w-full text-left px-3 py-1.5 text-xs text-gray-600 dark:text-gray-400 hover:text-red-600"
                >
                  {lang === 'bn' ? 'সংবাদ সংশোধন নীতিমালা' : 'Correction Policy'}
                </button>
              </div>
            </div>

            {/* Mobile Footer & Socials */}
            <div className="p-4 border-t border-gray-200 dark:border-slate-800 bg-gray-50 dark:bg-slate-950">
              <div className="flex items-center justify-center gap-4 mb-3">
                <a
                  href={settings.facebookUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-blue-600 p-2 bg-white dark:bg-slate-800 rounded-full shadow-xs"
                >
                  <Facebook className="w-5 h-5" />
                </a>
                <a
                  href={settings.youtubeUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-red-600 p-2 bg-white dark:bg-slate-800 rounded-full shadow-xs"
                >
                  <Youtube className="w-5 h-5" />
                </a>
                <a
                  href={`mailto:${settings.officialEmail}`}
                  className="text-gray-700 dark:text-gray-300 p-2 bg-white dark:bg-slate-800 rounded-full shadow-xs"
                >
                  <Mail className="w-5 h-5" />
                </a>
              </div>
              <p className="text-[10px] text-center text-gray-400">
                {lang === 'bn' ? settings.copyrightTextBn : settings.copyrightTextEn}
              </p>
            </div>
          </div>
        </div>
      )}
    </header>
  );
};
