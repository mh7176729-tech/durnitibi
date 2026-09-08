import React, { useState } from 'react';
import { ChevronRight, ArrowLeft, Filter, Flame } from 'lucide-react';
import { NewsItem, Language, CategoryItem, AdvertisementItem } from '../types';
import { NewsCard } from '../components/NewsCard';
import { AdSlot } from '../components/AdSlot';

interface CategoryPageProps {
  categorySlug: string;
  categories: CategoryItem[];
  allNews: NewsItem[];
  ads: AdvertisementItem[];
  lang: Language;
  onSelectNews: (news: NewsItem) => void;
  onBack: () => void;
}

export const CategoryPage: React.FC<CategoryPageProps> = ({
  categorySlug,
  categories,
  allNews,
  ads,
  lang,
  onSelectNews,
  onBack
}) => {
  const [sortBy, setSortBy] = useState<'latest' | 'popular'>('latest');

  const currentCategory = categories.find(c => c.slug === categorySlug);
  const categoryName = currentCategory
    ? (lang === 'bn' ? currentCategory.nameBn : currentCategory.nameEn)
    : (lang === 'bn' ? 'সংবাদ বিভাগ' : 'Category');

  const filteredNews = allNews.filter(n => n.categorySlug === categorySlug);

  const sortedNews = [...filteredNews].sort((a, b) => {
    if (sortBy === 'popular') return (b.viewCount || 0) - (a.viewCount || 0);
    return (
      new Date(`${b.publishedDate}T${b.publishedTime}`).getTime() -
      new Date(`${a.publishedDate}T${a.publishedTime}`).getTime()
    );
  });

  return (
    <div className="max-w-7xl mx-auto px-4 py-6">
      {/* Breadcrumb */}
      <div className="flex items-center gap-2 text-xs text-gray-500 dark:text-gray-400 mb-4">
        <button onClick={onBack} className="hover:text-red-600 flex items-center gap-1">
          <ArrowLeft className="w-3.5 h-3.5" />
          <span>{lang === 'bn' ? 'প্রচ্ছদ' : 'Home'}</span>
        </button>
        <span>/</span>
        <span className="font-semibold text-red-600">{categoryName}</span>
      </div>

      {/* Category Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b-2 border-red-600 pb-4 mb-6">
        <div>
          <h1 className="font-serif-bn font-extrabold text-2xl sm:text-3xl text-gray-950 dark:text-white flex items-center gap-2">
            <span>{categoryName}</span>
            {categorySlug === 'corruption' && <Flame className="w-6 h-6 text-red-600 animate-pulse" />}
          </h1>
          <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">
            {lang === 'bn'
              ? `${categoryName} সম্পর্কিত সকল গুরুত্বপূর্ণ সংবাদ ও হালনাগাদ তথ্য`
              : `All current reports and news regarding ${categoryName}`}
          </p>
        </div>

        {/* Sort selector */}
        <div className="flex items-center gap-2 text-xs">
          <span className="text-gray-500">{lang === 'bn' ? 'বাছাই:' : 'Sort by:'}</span>
          <button
            onClick={() => setSortBy('latest')}
            className={`px-3 py-1.5 rounded-md font-semibold transition cursor-pointer ${
              sortBy === 'latest'
                ? 'bg-red-600 text-white'
                : 'bg-gray-100 dark:bg-slate-800 text-gray-700 dark:text-gray-300'
            }`}
          >
            {lang === 'bn' ? 'সর্বশেষ' : 'Latest'}
          </button>
          <button
            onClick={() => setSortBy('popular')}
            className={`px-3 py-1.5 rounded-md font-semibold transition cursor-pointer ${
              sortBy === 'popular'
                ? 'bg-red-600 text-white'
                : 'bg-gray-100 dark:bg-slate-800 text-gray-700 dark:text-gray-300'
            }`}
          >
            {lang === 'bn' ? 'জনপ্রিয়' : 'Most Read'}
          </button>
        </div>
      </div>

      {/* Ad slot */}
      <AdSlot position="top_banner" ads={ads} />

      {/* News Grid */}
      {sortedNews.length === 0 ? (
        <div className="py-16 text-center text-gray-500 dark:text-gray-400">
          <p className="font-serif-bn text-base">
            {lang === 'bn' ? 'এই বিভাগে এখনো কোনো সংবাদ প্রকাশিত হয়নি।' : 'No news found in this category.'}
          </p>
        </div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6 mb-12">
          {sortedNews.map(item => (
            <NewsCard
              key={item.id}
              news={item}
              lang={lang}
              variant="standard"
              onClick={() => onSelectNews(item)}
            />
          ))}
        </div>
      )}

      {/* Bottom Ad slot */}
      <AdSlot position="homepage_bottom" ads={ads} />
    </div>
  );
};
