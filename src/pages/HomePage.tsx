import React, { useState } from 'react';
import {
  Flame,
  ShieldAlert,
  MapPin,
  TrendingUp,
  Clock,
  Send,
  Video,
  ChevronRight,
  ExternalLink,
  Youtube,
  Facebook,
  Filter
} from 'lucide-react';
import {
  NewsItem,
  Language,
  AdvertisementItem,
  DivisionItem,
  SiteSettings
} from '../types';
import { NewsCard } from '../components/NewsCard';
import { AdSlot } from '../components/AdSlot';
import { parseNewsDateTime } from '../utils/dateUtils';

interface HomePageProps {
  news: NewsItem[];
  ads: AdvertisementItem[];
  lang: Language;
  locations: DivisionItem[];
  settings: SiteSettings;
  onSelectNews: (news: NewsItem) => void;
  onSelectCategory: (slug: string) => void;
  onOpenNewsTipModal: () => void;
}

export const HomePage: React.FC<HomePageProps> = ({
  news,
  ads,
  lang,
  locations,
  settings,
  onSelectNews,
  onSelectCategory,
  onOpenNewsTipModal
}) => {
  const [sidebarTab, setSidebarTab] = useState<'latest' | 'popular'>('latest');

  // Location filter state for "জেলার সংবাদ"
  const [selectedDivision, setSelectedDivision] = useState<string>('barishal');
  const [selectedDistrict, setSelectedDistrict] = useState<string>('');
  const [selectedUpazila, setSelectedUpazila] = useState<string>('');

  // Selected division object
  const currentDivObj = locations.find(d => d.id === selectedDivision);
  const districts = currentDivObj ? currentDivObj.districts : [];
  const currentDistObj = districts.find(d => d.nameBn === selectedDistrict);
  const upazilas = currentDistObj ? currentDistObj.upazilas : [];

  // Filtered news for District section
  const locationNews = news.filter(item => {
    const itmUpazila = item.upazila || (item as any).locationUpazila;
    const itmDistrict = item.district || (item as any).locationDistrict;
    const itmDivision = item.division || (item as any).locationDivision;

    if (selectedUpazila && itmUpazila) {
      return itmUpazila === selectedUpazila;
    }
    if (selectedDistrict && itmDistrict) {
      return itmDistrict === selectedDistrict;
    }
    if (currentDivObj && itmDivision) {
      return itmDivision.includes(currentDivObj.nameBn) || currentDivObj.nameBn.includes(itmDivision);
    }
    return true;
  });

  // Categorized news splits
  const leadNews = news.find(n => n.isFeatured) || news[0];
  const featuredList = news.filter(n => n.id !== leadNews?.id).slice(0, 4);
  const corruptionReports = news.filter(n => n.categoryId === 'corruption' || n.categoryId === 'investigative' || (n as any).categorySlug === 'corruption' || (n as any).categorySlug === 'investigative');
  const nationalNews = news.filter(n => n.categoryId === 'national' || n.categoryId === 'bangladesh' || (n as any).categorySlug === 'national');
  const politicsNews = news.filter(n => n.categoryId === 'politics' || n.categoryId === 'administration' || (n as any).categorySlug === 'politics');
  const economyNews = news.filter(n => n.categoryId === 'economy' || (n as any).categorySlug === 'economy');
  const internationalNews = news.filter(n => n.categoryId === 'international' || (n as any).categorySlug === 'international');

  const latestList = [...news].sort((a, b) => {
    const timeA = parseNewsDateTime(a.publishDate || (a as any).publishedDate, a.publishTime || (a as any).publishedTime).getTime();
    const timeB = parseNewsDateTime(b.publishDate || (b as any).publishedDate, b.publishTime || (b as any).publishedTime).getTime();
    return timeB - timeA;
  }).slice(0, 7);
  const popularList = [...news].sort((a, b) => (b.viewCount || 0) - (a.viewCount || 0)).slice(0, 7);

  // Video reports
  const videoNews = news.filter(n => !!n.videoUrl);

  return (
    <div className="max-w-7xl mx-auto px-4 py-4 sm:py-6">
      {/* 1. Top Banner Advertisement */}
      <AdSlot position="top_banner" ads={ads} />

      {/* 2. Hero Section: 1 Lead investigative report + 4 Grid featured stories */}
      {leadNews && (
        <section className="mb-10">
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-5">
            {/* Left Big Hero (7 cols) */}
            <div className="lg:col-span-7">
              <NewsCard
                news={leadNews}
                lang={lang}
                variant="lead"
                onClick={() => onSelectNews(leadNews)}
              />
            </div>

            {/* Right 4-Grid / 2x2 featured stories (5 cols) */}
            <div className="lg:col-span-5 grid grid-cols-1 sm:grid-cols-2 gap-4">
              {featuredList.map(item => (
                <NewsCard
                  key={item.id}
                  news={item}
                  lang={lang}
                  variant="standard"
                  onClick={() => onSelectNews(item)}
                />
              ))}
            </div>
          </div>
        </section>
      )}

      {/* 3. Special Curated Section: "অনুসন্ধানী ও দুর্নীতি" (Investigative & Corruption) */}
      <section className="mb-10 bg-red-50/50 dark:bg-red-950/20 p-5 rounded-2xl border border-red-100 dark:border-red-900/30">
        <div className="flex items-center justify-between mb-5 border-b border-red-200 dark:border-red-900/50 pb-3">
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-lg bg-red-600 flex items-center justify-center text-white shadow-xs">
              <ShieldAlert className="w-5 h-5" />
            </div>
            <div>
              <h2 className="font-serif-bn font-bold text-xl sm:text-2xl text-red-700 dark:text-red-400 flex items-center gap-2">
                <span>{lang === 'bn' ? 'অনুসন্ধান ও দুর্নীতির চিত্র' : 'Investigative & Anti-Corruption Spotlight'}</span>
              </h2>
              <p className="text-[11px] text-gray-500 dark:text-gray-400">
                {lang === 'bn' ? 'সরাসরি মাঠ পর্যায়ের অনুসন্ধানী তথ্য ও প্রমাণভিত্তিক সংবাদ' : 'Field-level investigative journalism and evidence-based reporting'}
              </p>
            </div>
          </div>

          <button
            onClick={() => onSelectCategory('corruption')}
            className="text-xs font-bold text-red-600 hover:text-red-700 dark:text-red-400 flex items-center gap-1 transition"
          >
            <span>{lang === 'bn' ? 'সকল অনুসন্ধান' : 'All Reports'}</span>
            <ChevronRight className="w-4 h-4" />
          </button>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
          {corruptionReports.slice(0, 3).map(item => (
            <NewsCard
              key={item.id}
              news={item}
              lang={lang}
              variant="investigative"
              onClick={() => onSelectNews(item)}
            />
          ))}
        </div>
      </section>

      {/* 4. Middle Advertisement Slot */}
      <AdSlot position="homepage_middle" ads={ads} />

      {/* 5. Main 2-Column Portal Section (Left: 68% news streams, Right: 32% widgets & tabs) */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 mb-12">
        {/* LEFT COLUMN: News Categories & Regional Filter (8 of 12 cols) */}
        <main className="lg:col-span-8 space-y-10">
          {/* A. বাংলাদেশ ও জাতীয় (National) */}
          <section>
            <div className="flex items-center justify-between border-b-2 border-red-600 pb-2 mb-4">
              <h2 className="font-serif-bn font-bold text-lg sm:text-xl text-gray-900 dark:text-white">
                {lang === 'bn' ? 'বাংলাদেশ ও জাতীয়' : 'National & Bangladesh'}
              </h2>
              <button
                onClick={() => onSelectCategory('national')}
                className="text-xs font-semibold text-red-600 hover:underline flex items-center"
              >
                <span>{lang === 'bn' ? 'আরও সংবাদ' : 'More'}</span>
                <ChevronRight className="w-3.5 h-3.5" />
              </button>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              {nationalNews.slice(0, 4).map(item => (
                <NewsCard
                  key={item.id}
                  news={item}
                  lang={lang}
                  variant="standard"
                  onClick={() => onSelectNews(item)}
                />
              ))}
            </div>
          </section>

          {/* B. জেলার সংবাদ (Interactive Location Filter: Division -> District -> Upazila) */}
          <section className="bg-white dark:bg-slate-900 p-5 rounded-xl border border-gray-200 dark:border-slate-800 shadow-xs">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-gray-100 dark:border-slate-800 pb-4 mb-4">
              <div className="flex items-center gap-2">
                <MapPin className="w-5 h-5 text-red-600" />
                <div>
                  <h3 className="font-serif-bn font-bold text-lg text-gray-900 dark:text-white">
                    {lang === 'bn' ? 'জেলার সংবাদ (বিভাগ, জেলা ও উপজেলাভিত্তিক)' : 'District & Regional News'}
                  </h3>
                  <p className="text-[11px] text-gray-500 dark:text-gray-400">
                    {lang === 'bn' ? 'আপনার এলাকার তাজা সংবাদ জানতে নির্বাচন করুন' : 'Filter news by your administrative division, district and upazila'}
                  </p>
                </div>
              </div>

              {/* Location Selectors */}
              <div className="flex flex-wrap items-center gap-2 text-xs">
                {/* Division selector */}
                <select
                  value={selectedDivision}
                  onChange={e => {
                    setSelectedDivision(e.target.value);
                    setSelectedDistrict('');
                    setSelectedUpazila('');
                  }}
                  className="px-2.5 py-1.5 border border-gray-300 dark:border-slate-700 rounded-md bg-gray-50 dark:bg-slate-800 text-gray-800 dark:text-gray-200 font-medium"
                >
                  {locations.map(d => (
                    <option key={d.id} value={d.id}>
                      {lang === 'bn' ? d.nameBn : d.nameEn}
                    </option>
                  ))}
                </select>

                {/* District selector */}
                <select
                  value={selectedDistrict}
                  onChange={e => {
                    setSelectedDistrict(e.target.value);
                    setSelectedUpazila('');
                  }}
                  className="px-2.5 py-1.5 border border-gray-300 dark:border-slate-700 rounded-md bg-gray-50 dark:bg-slate-800 text-gray-800 dark:text-gray-200 font-medium"
                >
                  <option value="">{lang === 'bn' ? 'সকল জেলা' : 'All Districts'}</option>
                  {districts.map(dist => (
                    <option key={dist.id} value={dist.nameBn}>
                      {lang === 'bn' ? dist.nameBn : dist.nameEn}
                    </option>
                  ))}
                </select>

                {/* Upazila selector */}
                {upazilas.length > 0 && (
                  <select
                    value={selectedUpazila}
                    onChange={e => setSelectedUpazila(e.target.value)}
                    className="px-2.5 py-1.5 border border-gray-300 dark:border-slate-700 rounded-md bg-gray-50 dark:bg-slate-800 text-gray-800 dark:text-gray-200 font-medium"
                  >
                    <option value="">{lang === 'bn' ? 'সকল উপজেলা' : 'All Upazilas'}</option>
                    {upazilas.map(upz => {
                      const id = typeof upz === 'string' ? upz : upz.id;
                      const val = typeof upz === 'string' ? upz : upz.nameBn;
                      const label = typeof upz === 'string' ? upz : (lang === 'bn' ? upz.nameBn : upz.nameEn);
                      return (
                        <option key={id} value={val}>
                          {label}
                        </option>
                      );
                    })}
                  </select>
                )}
              </div>
            </div>

            {/* Filtered District News list */}
            {locationNews.length === 0 ? (
              <div className="py-8 text-center text-xs text-gray-500 dark:text-gray-400">
                {lang === 'bn' ? 'এই এলাকার জন্য এই মুহূর্তে কোনো প্রকাশিত সংবাদ পাওয়া যায়নি।' : 'No news found for this specific locality.'}
              </div>
            ) : (
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                {locationNews.slice(0, 6).map(item => (
                  <NewsCard
                    key={item.id}
                    news={item}
                    lang={lang}
                    variant="horizontal"
                    onClick={() => onSelectNews(item)}
                  />
                ))}
              </div>
            )}
          </section>

          {/* C. রাজনীতি ও প্রশাসন (Politics & Governance) */}
          <section>
            <div className="flex items-center justify-between border-b-2 border-red-600 pb-2 mb-4">
              <h2 className="font-serif-bn font-bold text-lg sm:text-xl text-gray-900 dark:text-white">
                {lang === 'bn' ? 'রাজনীতি ও প্রশাসন' : 'Politics & Administration'}
              </h2>
              <button
                onClick={() => onSelectCategory('politics')}
                className="text-xs font-semibold text-red-600 hover:underline flex items-center"
              >
                <span>{lang === 'bn' ? 'আরও' : 'More'}</span>
                <ChevronRight className="w-3.5 h-3.5" />
              </button>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              {politicsNews.slice(0, 4).map(item => (
                <NewsCard
                  key={item.id}
                  news={item}
                  lang={lang}
                  variant="standard"
                  onClick={() => onSelectNews(item)}
                />
              ))}
            </div>
          </section>

          {/* D. অর্থনীতি ও আন্তর্জাতিক (Economy & International) */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
            {/* Economy */}
            <div>
              <div className="flex items-center justify-between border-b-2 border-slate-700 pb-1.5 mb-3">
                <h3 className="font-serif-bn font-bold text-base text-gray-900 dark:text-white">
                  {lang === 'bn' ? 'অর্থনীতি ও বাণিজ্য' : 'Economy & Finance'}
                </h3>
                <button
                  onClick={() => onSelectCategory('economy')}
                  className="text-xs text-red-600 hover:underline"
                >
                  {lang === 'bn' ? 'আরও' : 'More'}
                </button>
              </div>
              <div className="space-y-2">
                {economyNews.slice(0, 3).map(item => (
                  <NewsCard
                    key={item.id}
                    news={item}
                    lang={lang}
                    variant="horizontal"
                    onClick={() => onSelectNews(item)}
                  />
                ))}
              </div>
            </div>

            {/* International */}
            <div>
              <div className="flex items-center justify-between border-b-2 border-slate-700 pb-1.5 mb-3">
                <h3 className="font-serif-bn font-bold text-base text-gray-900 dark:text-white">
                  {lang === 'bn' ? 'আন্তর্জাতিক' : 'International'}
                </h3>
                <button
                  onClick={() => onSelectCategory('international')}
                  className="text-xs text-red-600 hover:underline"
                >
                  {lang === 'bn' ? 'আরও' : 'More'}
                </button>
              </div>
              <div className="space-y-2">
                {internationalNews.slice(0, 3).map(item => (
                  <NewsCard
                    key={item.id}
                    news={item}
                    lang={lang}
                    variant="horizontal"
                    onClick={() => onSelectNews(item)}
                  />
                ))}
              </div>
            </div>
          </div>
        </main>

        {/* RIGHT COLUMN: Sidebar Widgets (4 of 12 cols) */}
        <aside className="lg:col-span-4 space-y-6">
          {/* Sidebar Top Ad Slot */}
          <AdSlot position="sidebar_top" ads={ads} />

          {/* 1. Latest vs Popular Tabs */}
          <div className="bg-white dark:bg-slate-900 rounded-xl border border-gray-200 dark:border-slate-800 p-4 shadow-xs">
            <div className="flex border-b border-gray-200 dark:border-slate-800 mb-3">
              <button
                onClick={() => setSidebarTab('latest')}
                className={`flex-1 pb-2.5 font-serif-bn text-sm font-bold flex items-center justify-center gap-1.5 transition cursor-pointer ${
                  sidebarTab === 'latest'
                    ? 'border-b-2 border-red-600 text-red-600 dark:text-red-400'
                    : 'text-gray-500 dark:text-gray-400 hover:text-black dark:hover:text-white'
                }`}
              >
                <Clock className="w-4 h-4" />
                <span>{lang === 'bn' ? 'সর্বশেষ সংবাদ' : 'Latest News'}</span>
              </button>
              <button
                onClick={() => setSidebarTab('popular')}
                className={`flex-1 pb-2.5 font-serif-bn text-sm font-bold flex items-center justify-center gap-1.5 transition cursor-pointer ${
                  sidebarTab === 'popular'
                    ? 'border-b-2 border-red-600 text-red-600 dark:text-red-400'
                    : 'text-gray-500 dark:text-gray-400 hover:text-black dark:hover:text-white'
                }`}
              >
                <TrendingUp className="w-4 h-4" />
                <span>{lang === 'bn' ? 'সর্বাধিক পঠিত' : 'Most Read'}</span>
              </button>
            </div>

            <div className="divide-y divide-gray-100 dark:divide-slate-800">
              {(sidebarTab === 'latest' ? latestList : popularList).map((item, idx) => (
                <div key={item.id} className="flex items-start gap-3 py-2.5">
                  <span className="font-serif-bn font-extrabold text-xl text-gray-300 dark:text-slate-700 w-5 shrink-0 text-center">
                    {idx + 1}
                  </span>
                  <div className="flex-1 min-w-0">
                    <NewsCard
                      news={item}
                      lang={lang}
                      variant="compact"
                      onClick={() => onSelectNews(item)}
                    />
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* 2. Official Social Channels Follow Card */}
          <div className="bg-white dark:bg-slate-900 rounded-xl border border-gray-200 dark:border-slate-800 p-4 shadow-xs">
            <h4 className="font-serif-bn font-bold text-sm text-gray-900 dark:text-white mb-3 flex items-center gap-2">
              <span className="w-2 h-2 rounded-full bg-red-600"></span>
              <span>{lang === 'bn' ? 'সামাজিক মাধ্যমে যুক্ত থাকুন' : 'Follow Us on Social Media'}</span>
            </h4>

            <div className="space-y-2.5 text-xs">
              {/* Facebook */}
              <a
                href={settings.facebookUrl}
                target="_blank"
                rel="noopener noreferrer"
                className="flex items-center justify-between p-3 rounded-lg bg-blue-50 dark:bg-blue-950/40 border border-blue-200 dark:border-blue-900/50 hover:bg-blue-100 transition group"
              >
                <div className="flex items-center gap-3">
                  <div className="w-8 h-8 rounded-full bg-blue-600 text-white flex items-center justify-center shrink-0">
                    <Facebook className="w-4 h-4" />
                  </div>
                  <div>
                    <span className="font-bold text-blue-900 dark:text-blue-300 block">Facebook Page</span>
                    <span className="text-[11px] text-blue-700 dark:text-blue-400">@DurnitiBiruddheNews</span>
                  </div>
                </div>
                <ExternalLink className="w-4 h-4 text-blue-600 group-hover:translate-x-0.5 transition" />
              </a>

              {/* YouTube */}
              <a
                href={settings.youtubeUrl}
                target="_blank"
                rel="noopener noreferrer"
                className="flex items-center justify-between p-3 rounded-lg bg-red-50 dark:bg-red-950/40 border border-red-200 dark:border-red-900/50 hover:bg-red-100 transition group"
              >
                <div className="flex items-center gap-3">
                  <div className="w-8 h-8 rounded-full bg-red-600 text-white flex items-center justify-center shrink-0">
                    <Youtube className="w-4 h-4" />
                  </div>
                  <div>
                    <span className="font-bold text-red-900 dark:text-red-300 block">YouTube Channel</span>
                    <span className="text-[11px] text-red-700 dark:text-red-400">@DurnitiBiruddheNews</span>
                  </div>
                </div>
                <ExternalLink className="w-4 h-4 text-red-600 group-hover:translate-x-0.5 transition" />
              </a>
            </div>
          </div>

          {/* 3. Video / Multimedia Section */}
          {videoNews.length > 0 && (
            <div className="bg-slate-900 text-white rounded-xl p-4 shadow-md">
              <div className="flex items-center justify-between mb-3 border-b border-slate-800 pb-2">
                <div className="flex items-center gap-2">
                  <Video className="w-4 h-4 text-red-500" />
                  <h4 className="font-serif-bn font-bold text-sm">
                    {lang === 'bn' ? 'ভিডিও প্রতিবেদন' : 'Video Reports'}
                  </h4>
                </div>
                <span className="text-[10px] bg-red-600 px-1.5 py-0.5 rounded font-bold uppercase">
                  HD
                </span>
              </div>

              <div className="space-y-3">
                {videoNews.slice(0, 2).map(item => (
                  <div
                    key={item.id}
                    onClick={() => onSelectNews(item)}
                    className="group cursor-pointer"
                  >
                    <div className="relative aspect-16/9 rounded-lg overflow-hidden bg-slate-800 mb-1.5">
                      <img
                        src={item.featuredImage}
                        alt=""
                        className="w-full h-full object-cover group-hover:scale-105 transition"
                        referrerPolicy="no-referrer"
                      />
                      <div className="absolute inset-0 bg-black/40 flex items-center justify-center">
                        <div className="w-10 h-10 rounded-full bg-red-600/90 text-white flex items-center justify-center shadow-lg group-hover:scale-110 transition">
                          <Video className="w-5 h-5" />
                        </div>
                      </div>
                    </div>
                    <h5 className="font-serif-bn text-xs font-semibold line-clamp-2 group-hover:text-red-400 transition">
                      {lang === 'bn' ? item.titleBn : item.titleEn}
                    </h5>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* 4. Citizen Journalist CTA Card */}
          <div className="bg-gradient-to-br from-red-600 to-red-800 text-white rounded-xl p-5 shadow-md">
            <ShieldAlert className="w-8 h-8 text-amber-300 mb-2" />
            <h4 className="font-serif-bn font-bold text-base mb-1">
              {lang === 'bn' ? 'নাগরিক তথ্য ও অভিযোগ সেল' : 'Citizen Journalism Desk'}
            </h4>
            <p className="text-xs text-red-100 leading-relaxed mb-4">
              {lang === 'bn'
                ? 'অনিয়ম, ঘুষ লেনদেন কিংবা জনদুর্ভোগের তথ্য আমাদের জানান। আপনার পরিচয় শতভাগ নিরাপদ রাখা হবে।'
                : 'Report bribery, fraud, or injustice to our confidential investigative reporters.'}
            </p>
            <button
              onClick={onOpenNewsTipModal}
              className="w-full py-2 bg-white hover:bg-red-50 text-red-800 font-bold rounded-lg text-xs flex items-center justify-center gap-1.5 transition cursor-pointer shadow-xs"
            >
              <Send className="w-3.5 h-3.5 text-red-600" />
              <span>{lang === 'bn' ? 'তথ্য ও সংবাদ পাঠান' : 'Submit News Tip'}</span>
            </button>
          </div>

          {/* Sidebar Bottom Ad Slot */}
          <AdSlot position="sidebar_bottom" ads={ads} />
        </aside>
      </div>

      {/* 6. Homepage Bottom Advertisement */}
      <AdSlot position="homepage_bottom" ads={ads} />
    </div>
  );
};
