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
import { localStore } from './services/localStore';
import { DEFAULT_SITE_SETTINGS } from './data/seedData';
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

function safeGetStorage(key: string, fallback: string = ''): string {
  try {
    return localStorage.getItem(key) || fallback;
  } catch {
    return fallback;
  }
}

function safeSetStorage(key: string, value: string): void {
  try {
    localStorage.setItem(key, value);
  } catch {}
}

export default function App() {
  // Language & Theme State
  const [lang, setLang] = useState<Language>(() => {
    return (safeGetStorage('durniti_lang', 'bn') as Language) || 'bn';
  });

  const [darkMode, setDarkMode] = useState<boolean>(() => {
    return safeGetStorage('durniti_theme') === 'dark';
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

  // Portal Data - Synchronously initialized for 0ms instant loading
  const [news, setNews] = useState<NewsItem[]>(() => {
    try {
      return localStore.getNews({ status: 'published', limit: 50 }).news;
    } catch {
      return [];
    }
  });
  const [categories, setCategories] = useState<CategoryItem[]>(() => {
    try {
      return localStore.getCategories();
    } catch {
      return [];
    }
  });
  const [locations, setLocations] = useState<DivisionItem[]>(() => {
    try {
      return localStore.getLocations();
    } catch {
      return [];
    }
  });
  const [ads, setAds] = useState<AdvertisementItem[]>(() => {
    try {
      return localStore.getAds();
    } catch {
      return [];
    }
  });
  const [settings, setSettings] = useState<SiteSettings>(() => {
    try {
      return localStore.getSettings();
    } catch {
      return DEFAULT_SITE_SETTINGS;
    }
  });
  const [loading, setLoading] = useState(false);

  // Handle Theme effect
  useEffect(() => {
    if (darkMode) {
      document.documentElement.classList.add('dark');
      safeSetStorage('durniti_theme', 'dark');
    } else {
      document.documentElement.classList.remove('dark');
      safeSetStorage('durniti_theme', 'light');
    }
  }, [darkMode]);

  // Handle Language switch
  const handleLanguageChange = (newLang: Language) => {
    setLang(newLang);
    safeSetStorage('durniti_lang', newLang);
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

  // Fetch initial portal data in background (non-blocking)
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

        if (newsRes?.news?.length) setNews(newsRes.news);
        if (catsRes?.length) setCategories(catsRes);
        if (locsRes?.length) setLocations(locsRes);
        if (adsRes) setAds(adsRes);
        if (setRes) setSettings(setRes);
        api.trackVisit();
      } catch (err) {
        console.warn('Portal running in offline-first mode with local cache');
      } finally {
        setLoading(false);
      }
    };

    initData();
  }, []);

  // Check URL hash or path for direct admin access (e.g. your-site.com/#admin or /admin)
  useEffect(() => {
    const handleUrlChange = () => {
      const hash = window.location.hash;
      const path = window.location.pathname;
      if (hash === '#admin' || hash === '#/admin' || path === '/admin') {
        setCurrentView('admin');
      }
    };

    handleUrlChange();
    window.addEventListener('hashchange', handleUrlChange);
    window.addEventListener('popstate', handleUrlChange);
    return () => {
      window.removeEventListener('hashchange', handleUrlChange);
      window.removeEventListener('popstate', handleUrlChange);
    };
  }, []);

  // Navigation Handlers
  const handleNavigateHome = () => {
    setCurrentView('home');
    setSelectedNews(null);
    setSelectedCategorySlug('');
    if (window.location.hash === '#admin' || window.location.hash === '#/admin') {
      try {
        window.history.replaceState(null, '', window.location.pathname);
      } catch (e) {}
    }
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
    try {
      window.location.hash = 'admin';
    } catch (e) {}
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
        {loading && news.length === 0 ? (
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
