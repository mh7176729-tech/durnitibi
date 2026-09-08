import React from 'react';
import { ArrowLeft, ShieldAlert, Mail, MapPin, Phone, CheckCircle2 } from 'lucide-react';
import { Language, SiteSettings } from '../types';

interface StaticPageProps {
  pageSlug: string;
  lang: Language;
  settings: SiteSettings;
  onBack: () => void;
}

export const StaticPages: React.FC<StaticPageProps> = ({ pageSlug, lang, settings, onBack }) => {
  const isBn = lang === 'bn';

  return (
    <div className="max-w-4xl mx-auto px-4 py-8">
      {/* Back button */}
      <button
        onClick={onBack}
        className="inline-flex items-center gap-2 text-xs font-semibold text-gray-600 dark:text-gray-400 hover:text-red-600 mb-6 transition"
      >
        <ArrowLeft className="w-4 h-4" />
        <span>{isBn ? 'প্রচ্ছদে ফিরে যান' : 'Back to Home'}</span>
      </button>

      <div className="bg-white dark:bg-slate-900 rounded-xl border border-gray-200 dark:border-slate-800 p-6 sm:p-10 shadow-xs">
        {/* 1. About Us */}
        {pageSlug === 'about' && (
          <article className="space-y-6 text-sm text-gray-700 dark:text-gray-300 leading-relaxed font-serif-bn">
            <div className="border-b border-gray-200 dark:border-slate-800 pb-4 mb-6">
              <span className="text-xs text-red-600 uppercase font-bold tracking-wider">আমাদের পরিচিতি</span>
              <h1 className="text-2xl sm:text-3xl font-extrabold text-gray-950 dark:text-white mt-1">
                {isBn ? 'দুর্নীতির বিরুদ্ধে নিউজ - আমাদের সম্পর্কে' : 'About Durniti Biruddhe News'}
              </h1>
            </div>

            <p>
              {isBn
                ? '“দুর্নীতির বিরুদ্ধে নিউজ” (Durniti Biruddhe News) একটি স্বাধীন, নিরপেক্ষ ও জনস্বার্থভিত্তিক ডিজিটাল সংবাদমাধ্যম। আমাদের লক্ষ্য দুর্নীতি, অনিয়ম, অর্থপাচার, ক্ষমতার অপব্যবহার, চাঁদাবাজি এবং নাগরিক বঞ্চনার বিরুদ্ধে সাহসিকতার সাথে বস্তুনিষ্ঠ তথ্য ও অনুসন্ধান জাতির সামনে তুলে ধরা।'
                : '“Durniti Biruddhe News” is an independent, public-interest digital investigative media portal. Our mission is to fearlessly expose corruption, governance irregularities, money laundering, and human rights violations through evidence-based journalism.'}
            </p>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 my-6">
              <div className="p-4 rounded-lg bg-red-50 dark:bg-red-950/30 border border-red-100 dark:border-red-900/40">
                <h3 className="font-bold text-red-700 dark:text-red-400 mb-1">
                  {isBn ? 'আমাদের দর্শন' : 'Our Philosophy'}
                </h3>
                <p className="text-xs text-gray-600 dark:text-gray-400">
                  {isBn
                    ? 'তথ্যই শক্তি। একটি দুর্নীতিমুক্ত, স্বচ্ছ এবং আইনের শাসনের বাংলাদেশ বিনির্মাণে নির্ভীক সাংবাদিকতা পরিচালনা করা।'
                    : 'Information is power. Advocating for transparency, accountability, and rule of law through rigorous reporting.'}
                </p>
              </div>

              <div className="p-4 rounded-lg bg-slate-50 dark:bg-slate-800/60 border border-gray-200 dark:border-slate-800">
                <h3 className="font-bold text-gray-900 dark:text-white mb-1">
                  {isBn ? 'পেশাদারিত্ব ও ভারসাম্য' : 'Professionalism'}
                </h3>
                <p className="text-xs text-gray-600 dark:text-gray-400">
                  {isBn
                    ? 'প্রতিটি অভিযোগের বিপরীতে সংশ্লিষ্ট পক্ষের প্রাতিষ্ঠানিক বক্তব্য সংগ্রহ ও যাচাই করা আমাদের অন্যতম মূল সাংবাদিক নীতিমালা।'
                    : 'Right of reply and thorough document verification are strictly integrated into every published report.'}
                </p>
              </div>
            </div>

            <h2 className="text-lg font-bold text-gray-900 dark:text-white pt-2">
              {isBn ? 'সম্পাদক ও বার্তা কক্ষ' : 'Editorial Desk'}
            </h2>
            <p>
              {isBn
                ? 'আমাদের কেন্দ্রীয় বার্তা কক্ষ ছাড়াও বাংলাদেশের প্রতিটি প্রশাসনিক বিভাগ, ৬৪ জেলা এবং গুরুত্বপূর্ণ উপজেলাগুলোতে আমাদের দায়িত্বশীল প্রতিনিধি ও সাংবাদিক নেটওয়ার্ক সক্রিয় রয়েছে।'
                : 'Along with our central newsroom in Dhaka, we maintain a dedicated network of investigative correspondents across all 8 administrative divisions, 64 districts, and upazilas.'}
            </p>
          </article>
        )}

        {/* 2. Contact Us */}
        {pageSlug === 'contact' && (
          <article className="space-y-6 text-sm text-gray-700 dark:text-gray-300 leading-relaxed font-serif-bn">
            <div className="border-b border-gray-200 dark:border-slate-800 pb-4 mb-6">
              <span className="text-xs text-red-600 uppercase font-bold tracking-wider">যোগাযোগ ও অফিস</span>
              <h1 className="text-2xl sm:text-3xl font-extrabold text-gray-950 dark:text-white mt-1">
                {isBn ? 'বিজ্ঞাপন ও বার্তা বিভাগের সাথে যোগাযোগ' : 'Contact Us & Editorial Office'}
              </h1>
            </div>

            <p>
              {isBn
                ? 'সংবাদ, প্রেস বিজ্ঞপ্তি, তথ্য সংশোধন বা বিজ্ঞাপনের জন্য নিচের ঠিকানায় অথবা ইমেইলে আমাদের সাথে যোগাযোগ করুন।'
                : 'For press releases, editorial feedback, corrections, or advertisements, reach out to our team.'}
            </p>

            <div className="space-y-4 pt-2">
              <div className="flex items-start gap-3 p-4 rounded-lg bg-gray-50 dark:bg-slate-800 border border-gray-200 dark:border-slate-700">
                <Mail className="w-5 h-5 text-red-600 shrink-0 mt-0.5" />
                <div>
                  <h4 className="font-bold text-gray-900 dark:text-white">
                    {isBn ? 'অফিসিয়াল ইমেইল' : 'Official Email'}
                  </h4>
                  <a href={`mailto:${settings.officialEmail}`} className="text-red-600 hover:underline">
                    {settings.officialEmail}
                  </a>
                  <p className="text-xs text-gray-500 mt-0.5">
                    {isBn ? 'বার্তা ও অনুসন্ধানী তথ্যের জন্য ২৪ ঘণ্টা উন্মুক্ত' : 'Available 24/7 for tips and editorial communication'}
                  </p>
                </div>
              </div>

              <div className="flex items-start gap-3 p-4 rounded-lg bg-gray-50 dark:bg-slate-800 border border-gray-200 dark:border-slate-700">
                <MapPin className="w-5 h-5 text-red-600 shrink-0 mt-0.5" />
                <div>
                  <h4 className="font-bold text-gray-900 dark:text-white">
                    {isBn ? 'প্রধান কার্যালয়' : 'Head Office'}
                  </h4>
                  <p className="text-gray-700 dark:text-gray-300">{settings.address}</p>
                </div>
              </div>
            </div>
          </article>
        )}

        {/* 3. Editorial Policy */}
        {pageSlug === 'editorial-policy' && (
          <article className="space-y-5 text-sm text-gray-700 dark:text-gray-300 leading-relaxed font-serif-bn">
            <div className="border-b border-gray-200 dark:border-slate-800 pb-4 mb-6">
              <span className="text-xs text-red-600 uppercase font-bold tracking-wider">নীতিমালা</span>
              <h1 className="text-2xl sm:text-3xl font-extrabold text-gray-950 dark:text-white mt-1">
                {isBn ? 'সম্পাদকীয় নীতিমালা (Editorial Policy)' : 'Editorial Policy'}
              </h1>
            </div>

            <h3 className="font-bold text-base text-gray-900 dark:text-white">১. বস্তুনিষ্ঠতা ও সত্যতা যাচাই</h3>
            <p>
              {isBn
                ? 'কোনো তথ্য বা নথি হাতে পাওয়ার পর অন্তত দুটি স্বাধীন উৎস থেকে তা যাচাই না করে সংবাদ হিসেবে প্রকাশ করা হয় না।'
                : 'Every allegation or document is cross-checked with at least two independent credible sources.'}
            </p>

            <h3 className="font-bold text-base text-gray-900 dark:text-white">২. অভিযুক্ত পক্ষের আত্মপক্ষ সমর্থন</h3>
            <p>
              {isBn
                ? 'যেকোনো অনিয়ম বা দুর্নীতির প্রতিবেদনে অভিযুক্ত ব্যক্তি বা প্রতিষ্ঠানের বক্তব্য পাওয়ার জন্য সরাসরি বা টেলিফোনে যোগাযোগ করা বাধ্যতামূলক। তাদের বক্তব্য সংবাদের বিশেষ অংশে গুরুত্বের সাথে তুলে ধরা হয়।'
                : 'We prioritize fair hearing. Statements from all involved entities are collected and published prominently.'}
            </p>

            <h3 className="font-bold text-base text-gray-900 dark:text-white">৩. সোর্স সুরক্ষা (Source Protection)</h3>
            <p>
              {isBn
                ? 'নাগরিক সাংবাদিক বা তথ্য প্রদানকারীর অনুরোধে তার পরিচয় সর্বোচ্চ পেশাদার গোপনীয়তার সাথে সুরক্ষিত রাখা হয়।'
                : 'Confidentiality of citizen informants and whistleblowers is protected with the highest editorial integrity.'}
            </p>
          </article>
        )}

        {/* 4. Correction Policy */}
        {pageSlug === 'correction-policy' && (
          <article className="space-y-5 text-sm text-gray-700 dark:text-gray-300 leading-relaxed font-serif-bn">
            <div className="border-b border-gray-200 dark:border-slate-800 pb-4 mb-6">
              <span className="text-xs text-red-600 uppercase font-bold tracking-wider">সংশোধন নীতি</span>
              <h1 className="text-2xl sm:text-3xl font-extrabold text-gray-950 dark:text-white mt-1">
                {isBn ? 'সংবাদ সংশোধন নীতিমালা (Correction Policy)' : 'Correction Policy'}
              </h1>
            </div>

            <p>
              {isBn
                ? '“দুর্নীতির বিরুদ্ধে নিউজ” নির্ভুল সংবাদ পরিবেশনে প্রতিশ্রুতিবদ্ধ। অসাবধানতাবশত কোনো তথ্যে ত্রুটি বা বিভ্রান্তি দেখা দিলে আমরা তা দ্রুত ও স্বচ্ছতার সাথে সংশোধন করি।'
                : 'We are committed to total accuracy. If an unintentional factual error occurs, we rectify it promptly and transparently.'}
            </p>

            <p>
              {isBn
                ? 'কোনো সংবাদে তথ্যগত ভুল প্রমাণিত হলে সংশোধিত প্রতিবেদনের নিচে স্পষ্ট করে সংশোধনের তারিখ, সময় ও কারণ উল্লেখ করা হয়।'
                : 'When a substantive correction is made, an editor note is appended specifying the exact date, time, and correction details.'}
            </p>
          </article>
        )}

        {/* 5. Privacy Policy */}
        {pageSlug === 'privacy-policy' && (
          <article className="space-y-5 text-sm text-gray-700 dark:text-gray-300 leading-relaxed font-serif-bn">
            <div className="border-b border-gray-200 dark:border-slate-800 pb-4 mb-6">
              <span className="text-xs text-red-600 uppercase font-bold tracking-wider">আইনি দিক</span>
              <h1 className="text-2xl sm:text-3xl font-extrabold text-gray-950 dark:text-white mt-1">
                {isBn ? 'গোপনীয়তা নীতি (Privacy Policy)' : 'Privacy Policy'}
              </h1>
            </div>

            <p>
              {isBn
                ? 'পাঠক ও ব্যবহারকারীদের ব্যক্তিগত তথ্যের গোপনীয়তা রক্ষা করা আমাদের দায়িত্ব। আমরা ব্যবহারকারীর ব্যক্তিগত ডেটা তৃতীয় কোনো পক্ষের কাছে বিক্রি বা অপব্যবহার করি না।'
                : 'We respect your privacy. Personal information collected through citizen tips or newsletter subscriptions is never sold or disclosed to unauthorized parties.'}
            </p>
          </article>
        )}

        {/* 6. Terms of Use */}
        {pageSlug === 'terms' && (
          <article className="space-y-5 text-sm text-gray-700 dark:text-gray-300 leading-relaxed font-serif-bn">
            <div className="border-b border-gray-200 dark:border-slate-800 pb-4 mb-6">
              <span className="text-xs text-red-600 uppercase font-bold tracking-wider">শর্তাবলী</span>
              <h1 className="text-2xl sm:text-3xl font-extrabold text-gray-950 dark:text-white mt-1">
                {isBn ? 'ব্যবহারের শর্তাবলী (Terms & Conditions)' : 'Terms of Service'}
              </h1>
            </div>

            <p>
              {isBn
                ? 'এই ওয়েবসাইটের সকল সংবাদ, ছবি, ভিডিও এবং অডিও সামগ্রী “দুর্নীতির বিরুদ্ধে নিউজ”-এর নিজস্ব বুদ্ধিবৃত্তিক সম্পত্তি। অনুমতি ব্যতিরেকে বাণিজ্যিক উদ্দেশ্যে সম্পূর্ণ কপি বা পুনঃপ্রকাশ নিষিদ্ধ।'
                : 'All articles, photos, and video assets are intellectual properties of Durniti Biruddhe News. Unauthorized commercial reproduction without explicit credit is strictly prohibited.'}
            </p>
          </article>
        )}
      </div>
    </div>
  );
};
