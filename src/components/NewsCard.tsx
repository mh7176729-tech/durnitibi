import React from 'react';
import { ShieldAlert, Flame, Clock, Eye, Share2, MapPin } from 'lucide-react';
import { NewsItem, Language } from '../types';
import { formatNewsDate, timeAgo } from '../utils/dateUtils';

interface NewsCardProps {
  news: NewsItem;
  lang: Language;
  variant?: 'lead' | 'featured' | 'standard' | 'horizontal' | 'compact' | 'investigative';
  onClick: () => void;
}

export const NewsCard: React.FC<NewsCardProps> = ({
  news,
  lang,
  variant = 'standard',
  onClick
}) => {
  const title = lang === 'bn' ? news.titleBn : news.titleEn;
  const shortDesc = lang === 'bn' ? news.shortDescriptionBn : news.shortDescriptionEn;
  const category = lang === 'bn' ? news.categoryBn : news.categoryEn;

  // 1. Lead / Big Hero Story
  if (variant === 'lead') {
    return (
      <article
        onClick={onClick}
        className="group relative cursor-pointer bg-white dark:bg-slate-900 rounded-xl overflow-hidden border border-gray-200 dark:border-slate-800 shadow-xs hover:shadow-md transition-all flex flex-col h-full"
      >
        <div className="relative aspect-16/9 w-full overflow-hidden bg-gray-100 dark:bg-slate-800">
          <img
            src={news.featuredImage}
            alt={title}
            className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-105"
            loading="lazy"
            referrerPolicy="no-referrer"
          />
          <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/20 to-transparent"></div>

          {/* Badges */}
          <div className="absolute top-3 left-3 flex flex-wrap gap-1.5 z-10">
            {news.isBreaking && (
              <span className="bg-red-600 text-white text-[11px] font-bold px-2 py-0.5 rounded uppercase flex items-center gap-1 shadow-sm">
                <Flame className="w-3 h-3" />
                {lang === 'bn' ? 'ব্রেকিং' : 'BREAKING'}
              </span>
            )}
            <span className="bg-slate-900/90 text-amber-400 text-[11px] font-bold px-2.5 py-0.5 rounded shadow-sm">
              {category}
            </span>
          </div>

          {news.locationDistrict && (
            <div className="absolute bottom-3 right-3 text-white/90 text-xs flex items-center gap-1 bg-black/60 px-2 py-0.5 rounded backdrop-blur-xs">
              <MapPin className="w-3 h-3 text-red-400" />
              <span>
                {news.locationUpazila ? `${news.locationUpazila}, ` : ''}
                {news.locationDistrict}
              </span>
            </div>
          )}
        </div>

        <div className="p-5 flex-1 flex flex-col justify-between">
          <div>
            <h2 className="font-serif-bn font-bold text-xl sm:text-2xl text-gray-900 dark:text-white group-hover:text-red-600 dark:group-hover:text-red-400 transition-colors leading-tight mb-2">
              {title}
            </h2>
            <p className="text-xs sm:text-sm text-gray-600 dark:text-gray-300 line-clamp-3 leading-relaxed mb-4">
              {shortDesc}
            </p>
          </div>

          <div className="flex items-center justify-between text-xs text-gray-500 dark:text-gray-400 border-t border-gray-100 dark:border-slate-800 pt-3">
            <span className="font-medium text-gray-700 dark:text-gray-300">
              {news.reporterName}
            </span>
            <span className="flex items-center gap-1 text-[11px]">
              <Clock className="w-3 h-3" />
              {timeAgo(news.publishedDate, news.publishedTime, lang)}
            </span>
          </div>
        </div>
      </article>
    );
  }

  // 2. Investigative Card with Red Warning Motif
  if (variant === 'investigative') {
    return (
      <article
        onClick={onClick}
        className="group cursor-pointer bg-white dark:bg-slate-900 rounded-xl overflow-hidden border border-red-200 dark:border-red-950/60 hover:border-red-500 transition-all shadow-xs hover:shadow-md flex flex-col h-full"
      >
        <div className="relative aspect-16/10 w-full overflow-hidden bg-gray-100 dark:bg-slate-800">
          <img
            src={news.featuredImage}
            alt={title}
            className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-105"
            loading="lazy"
            referrerPolicy="no-referrer"
          />
          <div className="absolute top-2 left-2 bg-red-700 text-white text-[10px] font-bold px-2 py-0.5 rounded flex items-center gap-1">
            <ShieldAlert className="w-3 h-3 text-amber-300" />
            <span>{lang === 'bn' ? 'অনুসন্ধানী রিপোর্ট' : 'INVESTIGATIVE'}</span>
          </div>
        </div>

        <div className="p-4 flex-1 flex flex-col justify-between">
          <div>
            <span className="text-[10px] font-bold text-red-600 uppercase tracking-wider block mb-1">
              {category}
            </span>
            <h3 className="font-serif-bn font-bold text-base text-gray-900 dark:text-white group-hover:text-red-600 transition-colors line-clamp-2 leading-snug mb-2">
              {title}
            </h3>
            <p className="text-xs text-gray-600 dark:text-gray-400 line-clamp-2 leading-relaxed">
              {shortDesc}
            </p>
          </div>

          <div className="flex items-center justify-between text-[11px] text-gray-500 dark:text-gray-400 mt-3 pt-2 border-t border-gray-100 dark:border-slate-800">
            <span>{news.reporterName}</span>
            <span>{timeAgo(news.publishedDate, news.publishedTime, lang)}</span>
          </div>
        </div>
      </article>
    );
  }

  // 3. Horizontal Card (Row style for district/list news)
  if (variant === 'horizontal') {
    return (
      <article
        onClick={onClick}
        className="group cursor-pointer bg-white dark:bg-slate-900 rounded-lg p-3 border border-gray-100 dark:border-slate-800 hover:border-gray-200 dark:hover:border-slate-700 hover:bg-gray-50/50 dark:hover:bg-slate-800/50 transition flex gap-3.5 items-start"
      >
        <div className="w-24 sm:w-28 h-20 sm:h-22 rounded-md overflow-hidden bg-gray-100 dark:bg-slate-800 shrink-0 relative">
          <img
            src={news.featuredImage}
            alt={title}
            className="w-full h-full object-cover transition-transform group-hover:scale-105"
            loading="lazy"
            referrerPolicy="no-referrer"
          />
          {news.isBreaking && (
            <span className="absolute top-1 left-1 bg-red-600 text-white text-[9px] font-bold px-1 rounded">
              ব্রেকিং
            </span>
          )}
        </div>

        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-2 text-[10px] text-gray-400 mb-1">
            <span className="text-red-600 font-semibold">{category}</span>
            {news.locationDistrict && (
              <>
                <span>•</span>
                <span className="flex items-center gap-0.5">
                  <MapPin className="w-2.5 h-2.5 text-gray-400" />
                  {news.locationDistrict}
                </span>
              </>
            )}
          </div>
          <h4 className="font-serif-bn font-bold text-xs sm:text-sm text-gray-900 dark:text-white group-hover:text-red-600 line-clamp-2 leading-snug">
            {title}
          </h4>
          <span className="text-[10px] text-gray-400 mt-1 block">
            {timeAgo(news.publishedDate, news.publishedTime, lang)}
          </span>
        </div>
      </article>
    );
  }

  // 4. Compact / Sidebar text or mini card
  if (variant === 'compact') {
    return (
      <article
        onClick={onClick}
        className="group cursor-pointer py-2.5 border-b border-gray-100 dark:border-slate-800 last:border-b-0 hover:text-red-600 transition"
      >
        <div className="flex items-center gap-2 text-[10px] text-gray-400 mb-1">
          <span className="text-red-600 font-semibold">{category}</span>
          <span>•</span>
          <span>{timeAgo(news.publishedDate, news.publishedTime, lang)}</span>
        </div>
        <h4 className="font-serif-bn font-semibold text-xs sm:text-sm text-gray-800 dark:text-gray-200 group-hover:text-red-600 dark:group-hover:text-red-400 line-clamp-2 leading-snug">
          {title}
        </h4>
      </article>
    );
  }

  // 5. Standard 3-column / grid card
  return (
    <article
      onClick={onClick}
      className="group cursor-pointer bg-white dark:bg-slate-900 rounded-xl overflow-hidden border border-gray-200 dark:border-slate-800 hover:shadow-md transition-all flex flex-col h-full"
    >
      <div className="relative aspect-16/10 w-full overflow-hidden bg-gray-100 dark:bg-slate-800">
        <img
          src={news.featuredImage}
          alt={title}
          className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-105"
          loading="lazy"
          referrerPolicy="no-referrer"
        />
        <div className="absolute top-2 left-2 bg-slate-900/80 text-white text-[10px] font-bold px-2 py-0.5 rounded backdrop-blur-xs">
          {category}
        </div>
      </div>

      <div className="p-4 flex-1 flex flex-col justify-between">
        <div>
          <h3 className="font-serif-bn font-bold text-sm sm:text-base text-gray-900 dark:text-white group-hover:text-red-600 dark:group-hover:text-red-400 transition-colors line-clamp-2 leading-snug mb-1.5">
            {title}
          </h3>
          <p className="text-xs text-gray-600 dark:text-gray-400 line-clamp-2 leading-relaxed">
            {shortDesc}
          </p>
        </div>

        <div className="flex items-center justify-between text-[11px] text-gray-500 dark:text-gray-400 mt-3 pt-2 border-t border-gray-100 dark:border-slate-800">
          <span>{news.reporterName}</span>
          <span>{timeAgo(news.publishedDate, news.publishedTime, lang)}</span>
        </div>
      </div>
    </article>
  );
};
