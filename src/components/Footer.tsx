import React from 'react';
import {
  ShieldAlert,
  Facebook,
  Youtube,
  Mail,
  Phone,
  MapPin,
  Send,
  Lock,
  ArrowUp,
  Heart
} from 'lucide-react';
import { Language, CategoryItem, SiteSettings } from '../types';

interface FooterProps {
  lang: Language;
  categories: CategoryItem[];
  settings: SiteSettings;
  onSelectCategory: (catSlug: string) => void;
  onNavigateStaticPage: (pageSlug: string) => void;
  onOpenNewsTipModal: () => void;
  onNavigateAdmin: () => void;
}

export const Footer: React.FC<FooterProps> = ({
  lang,
  categories,
  settings,
  onSelectCategory,
  onNavigateStaticPage,
  onOpenNewsTipModal,
  onNavigateAdmin
}) => {
  const scrollToTop = () => {
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  return (
    <footer className="w-full bg-slate-950 text-slate-200 border-t border-slate-800 mt-12 transition-colors">
      {/* 1. Citizen Journalism Banner */}
      <div className="bg-red-700 text-white py-6 px-4">
        <div className="max-w-7xl mx-auto flex flex-col md:flex-row items-center justify-between gap-4">
          <div className="flex items-center gap-3 text-center md:text-left">
            <div className="w-12 h-12 rounded-full bg-red-800 flex items-center justify-center shrink-0">
              <ShieldAlert className="w-6 h-6 text-amber-300" />
            </div>
            <div>
              <h3 className="font-serif-bn text-lg md:text-xl font-bold">
                {lang === 'bn'
                  ? 'আপনার এলাকায় কোনো দুর্নীতি বা অনিয়ম দেখছেন? নির্ভয়ে তথ্য জানান'
                  : 'Notice Corruption or Injustice in Your Locality? Report to Us Safely'}
              </h3>
              <p className="text-xs md:text-sm text-red-100">
                {lang === 'bn'
                  ? 'আপনার পরিচয় সম্পূর্ণ গোপন রেখে আমাদের বিশেষ অনুসন্ধান সেল কাজ করবে।'
                  : 'Your identity will remain strictly confidential with our investigative unit.'}
              </p>
            </div>
          </div>

          <button
            onClick={onOpenNewsTipModal}
            className="inline-flex items-center gap-2 bg-white text-red-800 hover:bg-red-50 font-bold px-5 py-2.5 rounded-lg text-sm shadow-md transition cursor-pointer shrink-0"
          >
            <Send className="w-4 h-4 text-red-700" />
            <span>{lang === 'bn' ? 'তথ্য ও সংবাদ পাঠান' : 'Submit News Tip'}</span>
          </button>
        </div>
      </div>

      {/* 2. Main Footer Body */}
      <div className="max-w-7xl mx-auto px-4 py-12">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
          {/* Col 1: About & Masthead */}
          <div className="space-y-4">
            <div className="flex items-center gap-2">
              <div className="w-9 h-9 rounded-lg bg-red-600 flex items-center justify-center text-white">
                <ShieldAlert className="w-5 h-5" />
              </div>
              <div>
                <h4 className="font-serif-bn font-bold text-lg text-white">
                  {lang === 'bn' ? settings.siteNameBn : settings.siteNameEn}
                </h4>
                <p className="text-[10px] text-red-400 uppercase tracking-wider font-semibold">
                  {lang === 'bn' ? settings.siteNameEn : 'Durniti Biruddhe News'}
                </p>
              </div>
            </div>

            <p className="text-xs text-slate-400 leading-relaxed">
              {lang === 'bn'
                ? 'দুর্নীতির বিরুদ্ধে নিউজ একটি দায়িত্বশীল ডিজিটাল সংবাদমাধ্যম। আমরা দেশ ও বিশ্বের গুরুত্বপূর্ণ ঘটনা, দুর্নীতি, অনিয়ম, অপরাধ, জনস্বার্থ এবং সুশাসন নিয়ে নির্ভীক ও তথ্যভিত্তিক সংবাদ প্রকাশে প্রতিশ্রুতিবদ্ধ।'
                : 'Durniti Biruddhe News is an independent digital media platform committed to investigative reporting on corruption, governance, crime, and public interest.'}
            </p>

            <div className="space-y-2 text-xs text-slate-400">
              <div className="flex items-center gap-2">
                <Mail className="w-4 h-4 text-red-500 shrink-0" />
                <a href={`mailto:${settings.officialEmail}`} className="hover:text-white transition">
                  {settings.officialEmail}
                </a>
              </div>
              <div className="flex items-center gap-2">
                <MapPin className="w-4 h-4 text-red-500 shrink-0" />
                <span>{settings.address}</span>
              </div>
            </div>

            {/* Social Icons */}
            <div className="flex items-center gap-2 pt-2">
              <a
                href={settings.facebookUrl}
                target="_blank"
                rel="noopener noreferrer"
                className="w-8 h-8 rounded-full bg-slate-900 border border-slate-800 flex items-center justify-center text-blue-400 hover:bg-blue-600 hover:text-white hover:border-blue-600 transition shadow-xs"
                title="Facebook"
              >
                <Facebook className="w-4 h-4" />
              </a>
              <a
                href={settings.youtubeUrl}
                target="_blank"
                rel="noopener noreferrer"
                className="w-8 h-8 rounded-full bg-slate-900 border border-slate-800 flex items-center justify-center text-red-500 hover:bg-red-600 hover:text-white hover:border-red-600 transition shadow-xs"
                title="YouTube"
              >
                <Youtube className="w-4 h-4" />
              </a>
              <a
                href={`mailto:${settings.officialEmail}`}
                className="w-8 h-8 rounded-full bg-slate-900 border border-slate-800 flex items-center justify-center text-slate-300 hover:bg-red-600 hover:text-white hover:border-red-600 transition shadow-xs"
                title="Email"
              >
                <Mail className="w-4 h-4" />
              </a>
            </div>
          </div>

          {/* Col 2: News Categories */}
          <div>
            <h4 className="font-serif-bn font-bold text-sm text-white uppercase tracking-wider mb-4 border-b border-slate-800 pb-2 flex items-center justify-between">
              <span>{lang === 'bn' ? 'সংবাদ বিভাগসমূহ' : 'Categories'}</span>
            </h4>
            <div className="grid grid-cols-2 gap-x-2 gap-y-1.5 text-xs">
              {categories.slice(0, 14).map(cat => (
                <button
                  key={cat.id}
                  onClick={() => onSelectCategory(cat.slug)}
                  className="text-left text-slate-400 hover:text-red-400 transition py-1 truncate"
                >
                  {lang === 'bn' ? cat.nameBn : cat.nameEn}
                </button>
              ))}
            </div>
          </div>

          {/* Col 3: Editorial & Policies */}
          <div>
            <h4 className="font-serif-bn font-bold text-sm text-white uppercase tracking-wider mb-4 border-b border-slate-800 pb-2">
              {lang === 'bn' ? 'নীতিমালা ও শর্তাবলী' : 'Editorial & Policies'}
            </h4>
            <ul className="space-y-2 text-xs text-slate-400">
              <li>
                <button
                  onClick={() => onNavigateStaticPage('about')}
                  className="hover:text-red-400 transition text-left"
                >
                  {lang === 'bn' ? 'আমাদের সম্পর্কে' : 'About Us'}
                </button>
              </li>
              <li>
                <button
                  onClick={() => onNavigateStaticPage('editorial-policy')}
                  className="hover:text-red-400 transition text-left"
                >
                  {lang === 'bn' ? 'সম্পাদকীয় নীতিমালা' : 'Editorial Policy'}
                </button>
              </li>
              <li>
                <button
                  onClick={() => onNavigateStaticPage('correction-policy')}
                  className="hover:text-red-400 transition text-left"
                >
                  {lang === 'bn' ? 'সংবাদ সংশোধন নীতিমালা' : 'Correction Policy'}
                </button>
              </li>
              <li>
                <button
                  onClick={() => onNavigateStaticPage('privacy-policy')}
                  className="hover:text-red-400 transition text-left"
                >
                  {lang === 'bn' ? 'গোপনীয়তা নীতি' : 'Privacy Policy'}
                </button>
              </li>
              <li>
                <button
                  onClick={() => onNavigateStaticPage('terms')}
                  className="hover:text-red-400 transition text-left"
                >
                  {lang === 'bn' ? 'ব্যবহারের শর্তাবলী' : 'Terms & Conditions'}
                </button>
              </li>
              <li>
                <button
                  onClick={() => onNavigateStaticPage('contact')}
                  className="hover:text-red-400 transition text-left"
                >
                  {lang === 'bn' ? 'বিজ্ঞাপন ও যোগাযোগ' : 'Advertisement & Contact'}
                </button>
              </li>
            </ul>
          </div>

          {/* Col 4: Editorial Standards */}
          <div className="space-y-3">
            <h4 className="font-serif-bn font-bold text-sm text-white uppercase tracking-wider mb-4 border-b border-slate-800 pb-2">
              {lang === 'bn' ? 'পেশাদার সাংবাদিকতা' : 'Journalistic Code'}
            </h4>
            <p className="text-xs text-slate-400 leading-relaxed">
              {lang === 'bn'
                ? 'আমরা সংবাদ প্রকাশের ক্ষেত্রে তথ্য যাচাই, পক্ষপাতহীনতা এবং ব্যক্তিগত গোপনীয়তাকে সম্মান করি। কোনো অভিযোগভিত্তিক প্রতিবেদনে সংশ্লিষ্ট পক্ষের আনুষ্ঠানিক প্রতিক্রিয়া প্রকাশ করা হয়।'
                : 'We adhere to rigorous verification, neutrality, and balanced reporting. Right of reply is strictly maintained for any allegations.'}
            </p>

            <div className="pt-2">
              <button
                onClick={onNavigateAdmin}
                className="w-full py-2 px-3 bg-slate-900 hover:bg-slate-800 border border-slate-800 rounded-lg text-xs font-semibold text-slate-300 hover:text-white flex items-center justify-center gap-2 transition"
              >
                <Lock className="w-3.5 h-3.5 text-red-500" />
                <span>{lang === 'bn' ? 'অ্যাডমিন ড্যাশবোর্ড' : 'Staff Admin Panel'}</span>
              </button>
            </div>
          </div>
        </div>

        {/* 3. Bottom Copyright & Credits */}
        <div className="border-t border-slate-900 mt-12 pt-6 flex flex-col sm:flex-row items-center justify-between text-xs text-slate-500 gap-4">
          <p>
            {lang === 'bn' ? settings.copyrightTextBn : settings.copyrightTextEn}
          </p>

          <div className="flex items-center gap-4">
            <button
              onClick={scrollToTop}
              className="flex items-center gap-1 hover:text-white transition"
            >
              <span>{lang === 'bn' ? 'উপরে যান' : 'Back to top'}</span>
              <ArrowUp className="w-3.5 h-3.5" />
            </button>
          </div>
        </div>
      </div>
    </footer>
  );
};
