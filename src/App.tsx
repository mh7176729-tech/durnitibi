/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useEffect } from 'react';
import {
  NewsItem,
  CategoryItem,
  DivisionItem,
  AdvertisementItem,
  SiteSettings,
  Language
} from './types';
import { api } from './services/api';
import { Header } from './components/Header';
import { BreakingNewsTicker } from './components/BreakingNewsTicker';
import { Footer } from './components/Footer';
import { NewsTipModal } from './components/NewsTipModal';
import { SubscribeModal } from './components/SubscribeModal';
import { SearchModal } from './components/SearchModal';
import { HomePage } from './pages/HomePage';
import { NewsDetailPage } from './pages/NewsDetailPage';
import { CategoryPage } from './pages/CategoryPage';
import { StaticPages } from './pages/StaticPages';
import { AdminPortal } from './pages/AdminPortal';

export default function App() {
  // Language & Theme State
  const [lang, setLang] = useState<Language>(() => {
    return (localStorage.getItem('durniti_lang') as Language) || 'bn';
  });

  const [darkMode, setDarkMode] = useState<boolean>(() => {
    return localStorage.getItem('durniti_theme') === 'dark';
  });

  // Navigation State
  const [currentView, setCurrentView] = useState<
    'home' | 'news_detail' | 'category' | 'static_page' | 'admin'
  >('home');
  const [selectedNews, setSelectedNews] = useState<NewsItem | null>(null);
  const [selectedCategorySlug, setSelectedCategorySlug] = useState<string>('');
  const [selectedStaticPage, setSelectedStaticPage] = useState<string>('about');

  // Modals
  const [isNewsTipOpen, setIsNewsTipOpen] = useState(false);
  const [isSubscribeOpen, setIsSubscribeOpen] = useState(false);
  const [isSearchOpen, setIsSearchOpen] = useState(false);

  // Portal Data
  const [news, setNews] = useState<NewsItem[]>([]);
  const [categories, setCategories] = useState<CategoryItem[]>([]);
  const [locations, setLocations] = useState<DivisionItem[]>([]);
  const [ads, setAds] = useState<AdvertisementItem[]>([]);
  const [settings, setSettings] = useState<SiteSettings>({
    siteNameBn: 'দুর্নীতির বিরুদ্ধে নিউজ',
    siteNameEn: 'Durniti Biruddhe News',
    taglineBn: 'বস্তুনিষ্ঠ ও সাহসী অনুসন্ধানে দুর্নীতির বিরুদ্ধে আপসহীন কণ্ঠস্বর',
    taglineEn: 'Fearless investigative digital journalism against corruption',
    contactNumber: '+880 1800-000000',
    officialEmail: 'durnitibiruddhenewsbd@gmail.com',
    address: 'কারওয়ান বাজার, ঢাকা-১২১৫, বাংলাদেশ',
    facebookUrl: 'https://facebook.com/DurnitiBiruddheNews',
    youtubeUrl: 'https://www.youtube.com/@DurnitiBiruddheNews',
    editorialPolicyBn: 'আমরা সততা ও তথ্যভিত্তিক সাংবাদিকতায় বিশ্বাসী।',
    editorialPolicyEn: 'We believe in integrity and evidence-based reporting.',
    breakingNewsActive: true,
    copyrightTextBn: '© ২০২৬ দুর্নীতির বিরুদ্ধে নিউজ। সর্বস্বত্ব সংরক্ষিত।',
    copyrightTextEn: '© 2026 Durniti Biruddhe News. All Rights Reserved.'
  });
  const [loading, setLoading] = useState(true);

  // Handle Theme effect
  useEffect(() => {
    if (darkMode) {
      document.documentElement.classList.add('dark');
      localStorage.setItem('durniti_theme', 'dark');
    } else {
      document.documentElement.classList.remove('dark');
      localStorage.setItem('durniti_theme', 'light');
    }
  }, [darkMode]);

  // Handle Language switch
  const handleLanguageChange = (newLang: Language) => {
    setLang(newLang);
    localStorage.setItem('durniti_lang', newLang);
  };

  // Keyboard shortcut for search (⌘K or Ctrl+K)
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if ((e.metaKey || e.ctrlKey) && e.key === 'k') {
        e.preventDefault();
        setIsSearchOpen(true);
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, []);

  // Fetch initial portal data
  useEffect(() => {
    const initData = async () => {
      try {
        const [newsRes, catsRes, locsRes, adsRes, setRes] = await Promise.all([
          api.getNews({ status: 'published', limit: 50 }),
          api.getCategories(),
          api.getLocations(),
          api.getAds(),
          api.getSettings()
        ]);

        setNews(newsRes.news);
        setCategories(catsRes);
        setLocations(locsRes);
        setAds(adsRes);
        setSettings(setRes);
        api.trackVisit();
      } catch (err) {
        console.error('Failed to load portal data:', err);
      } finally {
        setLoading(false);
      }
    };

    initData();
  }, []);

  // Navigation Handlers
  const handleNavigateHome = () => {
    setCurrentView('home');
    setSelectedNews(null);
    setSelectedCategorySlug('');
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const handleSelectNews = (item: NewsItem) => {
    setSelectedNews(item);
    setCurrentView('news_detail');
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const handleSelectCategory = (catSlug: string) => {
    if (!catSlug) {
      handleNavigateHome();
      return;
    }
    setSelectedCategorySlug(catSlug);
    setCurrentView('category');
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const handleNavigateStaticPage = (pageSlug: string) => {
    setSelectedStaticPage(pageSlug);
    setCurrentView('static_page');
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const handleNavigateAdmin = () => {
    setCurrentView('admin');
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  // Breaking news items
  const breakingNews = news.filter(n => n.isBreaking);

  // If in admin view, render Admin Portal standalone
  if (currentView === 'admin') {
    return (
      <div className={darkMode ? 'dark' : ''}>
        <AdminPortal onBackToSite={handleNavigateHome} lang={lang} />
      </div>
    );
  }

  return (
    <div className="min-h-screen flex flex-col bg-[#fdfdfd] dark:bg-[#090d16] text-gray-900 dark:text-gray-100 transition-colors font-sans-bn">
      {/* 1. Header */}
      <Header
        lang={lang}
        onLanguageChange={handleLanguageChange}
        darkMode={darkMode}
        onToggleDarkMode={() => setDarkMode(!darkMode)}
        categories={categories}
        currentCategory={selectedCategorySlug}
        onSelectCategory={handleSelectCategory}
        onOpenSearch={() => setIsSearchOpen(true)}
        onOpenNewsTipModal={() => setIsNewsTipOpen(true)}
        onOpenSubscribeModal={() => setIsSubscribeOpen(true)}
        onNavigateHome={handleNavigateHome}
        onNavigateAdmin={handleNavigateAdmin}
        onNavigateStaticPage={handleNavigateStaticPage}
        settings={settings}
      />

      {/* 2. Breaking News Ticker */}
      <BreakingNewsTicker
        breakingNews={breakingNews}
        lang={lang}
        onSelectNews={handleSelectNews}
        active={settings.breakingNewsActive}
      />

      {/* 3. Main Content Views */}
      <div className="flex-1">
        {loading ? (
          <div className="max-w-7xl mx-auto px-4 py-24 text-center">
            <div className="w-12 h-12 border-4 border-red-600 border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
            <p className="font-serif-bn font-bold text-gray-700 dark:text-gray-300">
              {lang === 'bn' ? 'সংবাদ পোর্টাল লোড হচ্ছে...' : 'Loading News Portal...'}
            </p>
          </div>
        ) : (
          <>
            {currentView === 'home' && (
              <HomePage
                news={news}
                ads={ads}
                lang={lang}
                locations={locations}
                settings={settings}
                onSelectNews={handleSelectNews}
                onSelectCategory={handleSelectCategory}
                onOpenNewsTipModal={() => setIsNewsTipOpen(true)}
              />
            )}

            {currentView === 'news_detail' && selectedNews && (
              <NewsDetailPage
                news={selectedNews}
                allNews={news}
                ads={ads}
                lang={lang}
                settings={settings}
                onBack={handleNavigateHome}
                onSelectNews={handleSelectNews}
                onSelectCategory={handleSelectCategory}
              />
            )}

            {currentView === 'category' && (
              <CategoryPage
                categorySlug={selectedCategorySlug}
                categories={categories}
                allNews={news}
                ads={ads}
                lang={lang}
                onSelectNews={handleSelectNews}
                onBack={handleNavigateHome}
              />
            )}

            {currentView === 'static_page' && (
              <StaticPages
                pageSlug={selectedStaticPage}
                lang={lang}
                settings={settings}
                onBack={handleNavigateHome}
              />
            )}
          </>
        )}
      </div>

      {/* 4. Footer */}
      <Footer
        lang={lang}
        categories={categories}
        settings={settings}
        onSelectCategory={handleSelectCategory}
        onNavigateStaticPage={handleNavigateStaticPage}
        onOpenNewsTipModal={() => setIsNewsTipOpen(true)}
        onNavigateAdmin={handleNavigateAdmin}
      />

      {/* 5. Modals */}
      <NewsTipModal
        isOpen={isNewsTipOpen}
        onClose={() => setIsNewsTipOpen(false)}
        lang={lang}
      />

      <SubscribeModal
        isOpen={isSubscribeOpen}
        onClose={() => setIsSubscribeOpen(false)}
        lang={lang}
      />

      <SearchModal
        isOpen={isSearchOpen}
        onClose={() => setIsSearchOpen(false)}
        lang={lang}
        categories={categories}
        locations={locations}
        onSelectNews={handleSelectNews}
      />
    </div>
  );
}
