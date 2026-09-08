import React, { useState } from 'react';
import { Search, X, MapPin, Filter, Calendar } from 'lucide-react';
import { Language, CategoryItem, DivisionItem, NewsItem } from '../types';
import { api } from '../services/api';
import { formatNewsDate } from '../utils/dateUtils';

interface SearchModalProps {
  isOpen: boolean;
  onClose: () => void;
  lang: Language;
  categories: CategoryItem[];
  locations: DivisionItem[];
  onSelectNews: (news: NewsItem) => void;
}

export const SearchModal: React.FC<SearchModalProps> = ({
  isOpen,
  onClose,
  lang,
  categories,
  locations,
  onSelectNews
}) => {
  const [query, setQuery] = useState('');
  const [selectedCat, setSelectedCat] = useState('');
  const [selectedDivision, setSelectedDivision] = useState('');
  const [selectedDistrict, setSelectedDistrict] = useState('');
  const [results, setResults] = useState<NewsItem[]>([]);
  const [searched, setSearched] = useState(false);
  const [loading, setLoading] = useState(false);

  if (!isOpen) return null;

  const currentDiv = locations.find(d => d.id === selectedDivision);
  const districts = currentDiv ? currentDiv.districts : [];

  const handleSearch = async (e?: React.FormEvent) => {
    if (e) e.preventDefault();
    if (!query.trim() && !selectedCat && !selectedDivision) return;

    setLoading(true);
    setSearched(true);
    try {
      const res = await api.getNews({
        search: query.trim(),
        category: selectedCat,
        division: currentDiv?.nameBn,
        district: selectedDistrict,
        status: 'published',
        limit: 20
      });
      setResults(res.news);
    } catch (err) {
      console.error(err);
      setResults([]);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-start justify-center pt-16 p-4 bg-black/60 backdrop-blur-xs">
      <div className="bg-white dark:bg-slate-900 border border-gray-200 dark:border-slate-800 rounded-xl shadow-2xl max-w-2xl w-full p-6 relative max-h-[85vh] flex flex-col">
        <button
          onClick={onClose}
          className="absolute top-4 right-4 text-gray-400 hover:text-gray-700 dark:hover:text-white p-1"
        >
          <X className="w-5 h-5" />
        </button>

        <h3 className="font-serif-bn font-bold text-lg text-gray-900 dark:text-white mb-3 flex items-center gap-2">
          <Search className="w-5 h-5 text-red-600" />
          <span>{lang === 'bn' ? 'সংবাদ অনুসন্ধান' : 'Search News Portal'}</span>
        </h3>

        {/* Search input form */}
        <form onSubmit={handleSearch} className="space-y-3">
          <div className="relative">
            <input
              type="text"
              autoFocus
              value={query}
              onChange={e => setQuery(e.target.value)}
              placeholder={lang === 'bn' ? 'কীওয়ার্ড লিখুন (যেমন: দুর্নীতি, অনিয়ম, ভোলা...)' : 'Type keywords (e.g. corruption, scam, budget...)'}
              className="w-full pl-10 pr-24 py-2.5 border border-gray-300 dark:border-slate-700 rounded-lg bg-gray-50 dark:bg-slate-800 text-gray-900 dark:text-white text-sm focus:ring-2 focus:ring-red-500 focus:outline-none"
            />
            <Search className="w-4 h-4 text-gray-400 absolute left-3 top-3.5" />
            <button
              type="submit"
              disabled={loading}
              className="absolute right-1.5 top-1.5 bottom-1.5 px-4 bg-red-600 hover:bg-red-700 text-white rounded-md text-xs font-semibold cursor-pointer transition disabled:opacity-50"
            >
              {loading ? '...' : (lang === 'bn' ? 'খুঁজুন' : 'Search')}
            </button>
          </div>

          {/* Filters Row */}
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-2 text-xs">
            <div>
              <label className="block text-[10px] uppercase font-bold text-gray-400 mb-1">
                {lang === 'bn' ? 'বিভাগ' : 'Category'}
              </label>
              <select
                value={selectedCat}
                onChange={e => setSelectedCat(e.target.value)}
                className="w-full p-2 border border-gray-300 dark:border-slate-700 rounded bg-white dark:bg-slate-800 text-gray-800 dark:text-gray-200"
              >
                <option value="">{lang === 'bn' ? 'সকল বিভাগ' : 'All Categories'}</option>
                {categories.map(c => (
                  <option key={c.id} value={c.slug}>
                    {lang === 'bn' ? c.nameBn : c.nameEn}
                  </option>
                ))}
              </select>
            </div>

            <div>
              <label className="block text-[10px] uppercase font-bold text-gray-400 mb-1">
                {lang === 'bn' ? 'প্রশাসনিক বিভাগ' : 'Division'}
              </label>
              <select
                value={selectedDivision}
                onChange={e => {
                  setSelectedDivision(e.target.value);
                  setSelectedDistrict('');
                }}
                className="w-full p-2 border border-gray-300 dark:border-slate-700 rounded bg-white dark:bg-slate-800 text-gray-800 dark:text-gray-200"
              >
                <option value="">{lang === 'bn' ? 'সকল বিভাগ' : 'All Divisions'}</option>
                {locations.map(d => (
                  <option key={d.id} value={d.id}>
                    {lang === 'bn' ? d.nameBn : d.nameEn}
                  </option>
                ))}
              </select>
            </div>

            <div>
              <label className="block text-[10px] uppercase font-bold text-gray-400 mb-1">
                {lang === 'bn' ? 'জেলা' : 'District'}
              </label>
              <select
                disabled={!selectedDivision}
                value={selectedDistrict}
                onChange={e => setSelectedDistrict(e.target.value)}
                className="w-full p-2 border border-gray-300 dark:border-slate-700 rounded bg-white dark:bg-slate-800 text-gray-800 dark:text-gray-200 disabled:opacity-50"
              >
                <option value="">{lang === 'bn' ? 'সকল জেলা' : 'All Districts'}</option>
                {districts.map(dist => (
                  <option key={dist.id} value={dist.nameBn}>
                    {lang === 'bn' ? dist.nameBn : dist.nameEn}
                  </option>
                ))}
              </select>
            </div>
          </div>
        </form>

        {/* Results List */}
        <div className="mt-4 flex-1 overflow-y-auto space-y-3 pr-1">
          {loading && (
            <div className="py-8 text-center text-xs text-gray-500">
              {lang === 'bn' ? 'সংবাদ খোঁজা হচ্ছে...' : 'Searching articles...'}
            </div>
          )}

          {!loading && searched && results.length === 0 && (
            <div className="py-8 text-center text-xs text-gray-500">
              {lang === 'bn' ? 'কোনো সংবাদ পাওয়া যায়নি।' : 'No news reports found.'}
            </div>
          )}

          {!loading && results.map(item => (
            <div
              key={item.id}
              onClick={() => {
                onSelectNews(item);
                onClose();
              }}
              className="flex gap-3 p-2 rounded-lg border border-gray-100 dark:border-slate-800 hover:bg-gray-50 dark:hover:bg-slate-800 cursor-pointer transition"
            >
              <img
                src={item.featuredImage}
                alt=""
                className="w-20 h-16 object-cover rounded shrink-0"
                referrerPolicy="no-referrer"
              />
              <div className="flex-1 min-w-0">
                <span className="text-[10px] text-red-600 font-semibold uppercase">
                  {lang === 'bn' ? item.categoryBn : item.categoryEn}
                </span>
                <h4 className="font-serif-bn font-bold text-xs sm:text-sm text-gray-900 dark:text-white line-clamp-2 leading-snug">
                  {lang === 'bn' ? item.titleBn : item.titleEn}
                </h4>
                <span className="text-[10px] text-gray-400 mt-1 block">
                  {formatNewsDate(item.publishedDate, item.publishedTime, lang)}
                </span>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};
