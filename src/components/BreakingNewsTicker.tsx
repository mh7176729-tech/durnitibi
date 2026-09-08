import React from 'react';
import { Flame, ChevronRight, Bell } from 'lucide-react';
import { NewsItem, Language } from '../types';

interface BreakingNewsTickerProps {
  breakingNews: NewsItem[];
  lang: Language;
  onSelectNews: (news: NewsItem) => void;
  active: boolean;
}

export const BreakingNewsTicker: React.FC<BreakingNewsTickerProps> = ({
  breakingNews,
  lang,
  onSelectNews,
  active
}) => {
  if (!active || breakingNews.length === 0) return null;

  return (
    <div className="w-full bg-red-700 text-white shadow-xs overflow-hidden border-b border-red-800">
      <div className="max-w-7xl mx-auto flex items-stretch">
        {/* Badge */}
        <div className="bg-red-900 px-4 py-2 flex items-center gap-2 font-bold text-xs uppercase tracking-wider shrink-0 z-10 shadow-md">
          <span className="relative flex h-2.5 w-2.5">
            <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-red-400 opacity-75"></span>
            <span className="relative inline-flex rounded-full h-2.5 w-2.5 bg-white"></span>
          </span>
          <Flame className="w-4 h-4 text-amber-300" />
          <span className="font-serif-bn">
            {lang === 'bn' ? 'ব্রেকিং নিউজ' : 'BREAKING NEWS'}
          </span>
        </div>

        {/* Ticker Content */}
        <div className="relative flex-1 overflow-hidden py-2 px-3 flex items-center bg-red-700">
          <div className="animate-ticker flex items-center gap-8 cursor-pointer">
            {/* Duplicated list for infinite marquee effect */}
            {[...breakingNews, ...breakingNews].map((item, idx) => (
              <button
                key={`${item.id}-${idx}`}
                onClick={() => onSelectNews(item)}
                className="inline-flex items-center gap-2 text-xs sm:text-sm font-medium hover:text-amber-200 transition whitespace-nowrap cursor-pointer"
              >
                <span className="w-1.5 h-1.5 rounded-full bg-amber-300"></span>
                <span>{lang === 'bn' ? item.titleBn : item.titleEn}</span>
                <ChevronRight className="w-3 h-3 text-red-300 inline" />
              </button>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
};
