import React, { useState, useEffect } from 'react';
import {
  Clock,
  User,
  MapPin,
  Share2,
  Facebook,
  Printer,
  Volume2,
  VolumeX,
  Copy,
  Check,
  ShieldAlert,
  MessageSquare,
  Send,
  ArrowLeft,
  Flame,
  Tag,
  AlertCircle
} from 'lucide-react';
import {
  NewsItem,
  Language,
  CommentItem,
  AdvertisementItem,
  SiteSettings
} from '../types';
import { formatNewsDate, timeAgo } from '../utils/dateUtils';
import { AdSlot } from '../components/AdSlot';
import { NewsCard } from '../components/NewsCard';
import { api } from '../services/api';

interface NewsDetailPageProps {
  news: NewsItem;
  allNews: NewsItem[];
  ads: AdvertisementItem[];
  lang: Language;
  settings: SiteSettings;
  onBack: () => void;
  onSelectNews: (news: NewsItem) => void;
  onSelectCategory: (slug: string) => void;
}

export const NewsDetailPage: React.FC<NewsDetailPageProps> = ({
  news,
  allNews,
  ads,
  lang,
  settings,
  onBack,
  onSelectNews,
  onSelectCategory
}) => {
  const [fontSize, setFontSize] = useState<'normal' | 'large' | 'xlarge'>('normal');
  const [isSpeaking, setIsSpeaking] = useState(false);
  const [copiedLink, setCopiedLink] = useState(false);

  // Comments state
  const [comments, setComments] = useState<CommentItem[]>([]);
  const [commentName, setCommentName] = useState('');
  const [commentEmail, setCommentEmail] = useState('');
  const [commentText, setCommentText] = useState('');
  const [submittingComment, setSubmittingComment] = useState(false);
  const [commentStatusMsg, setCommentStatusMsg] = useState('');

  const title = lang === 'bn' ? news.titleBn : news.titleEn;
  const content = lang === 'bn' ? news.contentBn : news.contentEn;
  const shortDesc = lang === 'bn' ? news.shortDescriptionBn : news.shortDescriptionEn;
  const category = lang === 'bn' ? news.categoryBn : news.categoryEn;

  // Load comments
  useEffect(() => {
    window.scrollTo({ top: 0, behavior: 'smooth' });
    api.getComments({ newsId: news.id, status: 'approved' })
      .then(res => setComments(res))
      .catch(() => setComments([]));
  }, [news.id]);

  // Clean up speech on unmount
  useEffect(() => {
    return () => {
      if ('speechSynthesis' in window) {
        window.speechSynthesis.cancel();
      }
    };
  }, []);

  // Text to Speech
  const toggleSpeech = () => {
    if (!('speechSynthesis' in window)) {
      alert(lang === 'bn' ? 'আপনার ব্রাউজারে অডিও রিডার সমর্থিত নয়।' : 'Audio reader not supported in your browser.');
      return;
    }

    if (isSpeaking) {
      window.speechSynthesis.cancel();
      setIsSpeaking(false);
    } else {
      const textToRead = `${title}. ${shortDesc}. ${content.replace(/<[^>]*>?/gm, '')}`;
      const utterance = new SpeechSynthesisUtterance(textToRead);
      utterance.lang = lang === 'bn' ? 'bn-BD' : 'en-US';
      utterance.rate = 0.95;
      utterance.onend = () => setIsSpeaking(false);
      utterance.onerror = () => setIsSpeaking(false);
      window.speechSynthesis.speak(utterance);
      setIsSpeaking(true);
    }
  };

  // Social Sharing
  const currentUrl = window.location.href;
  const handleShare = (platform: 'fb' | 'wa' | 'x') => {
    api.recordNewsShare(news.id).catch(() => {});
    let shareUrl = '';
    if (platform === 'fb') {
      shareUrl = `https://www.facebook.com/sharer/sharer.php?u=${encodeURIComponent(currentUrl)}`;
    } else if (platform === 'wa') {
      shareUrl = `https://api.whatsapp.com/send?text=${encodeURIComponent(title + ' ' + currentUrl)}`;
    } else if (platform === 'x') {
      shareUrl = `https://twitter.com/intent/tweet?text=${encodeURIComponent(title)}&url=${encodeURIComponent(currentUrl)}`;
    }
    window.open(shareUrl, '_blank', 'width=600,height=400');
  };

  const handleCopyLink = () => {
    navigator.clipboard.writeText(currentUrl);
    setCopiedLink(true);
    setTimeout(() => setCopiedLink(false), 2000);
  };

  const handlePrint = () => {
    window.print();
  };

  // Submit comment
  const handleCommentSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!commentName || !commentText) return;
    setSubmittingComment(true);
    try {
      const res = await api.submitComment({
        newsId: news.id,
        authorName: commentName,
        authorEmail: commentEmail,
        content: commentText
      });
      setCommentStatusMsg(res.message);
      setCommentName('');
      setCommentEmail('');
      setCommentText('');
    } catch (err: any) {
      setCommentStatusMsg(err.message || 'Error submitting comment');
    } finally {
      setSubmittingComment(false);
    }
  };

  // Related and Most Read
  const relatedNews = allNews
    .filter(n => n.id !== news.id && n.categorySlug === news.categorySlug)
    .slice(0, 3);
  const popularNews = [...allNews]
    .filter(n => n.id !== news.id)
    .sort((a, b) => (b.viewCount || 0) - (a.viewCount || 0))
    .slice(0, 5);

  const getFontSizeClass = () => {
    if (fontSize === 'large') return 'text-lg leading-relaxed';
    if (fontSize === 'xlarge') return 'text-xl leading-loose';
    return 'text-base leading-relaxed';
  };

  return (
    <div className="max-w-7xl mx-auto px-4 py-6">
      {/* 1. Breadcrumb navigation */}
      <nav className="flex items-center gap-2 text-xs text-gray-500 dark:text-gray-400 mb-4 overflow-x-auto whitespace-nowrap">
        <button onClick={onBack} className="hover:text-red-600 flex items-center gap-1">
          <ArrowLeft className="w-3.5 h-3.5" />
          <span>{lang === 'bn' ? 'প্রচ্ছদ' : 'Home'}</span>
        </button>
        <span>/</span>
        <button
          onClick={() => onSelectCategory(news.categorySlug)}
          className="hover:text-red-600 font-medium text-red-600"
        >
          {category}
        </button>
        {news.locationDivision && (
          <>
            <span>/</span>
            <span>{news.locationDivision}</span>
          </>
        )}
        {news.locationDistrict && (
          <>
            <span>/</span>
            <span>{news.locationDistrict}</span>
          </>
        )}
        {news.locationUpazila && (
          <>
            <span>/</span>
            <span>{news.locationUpazila}</span>
          </>
        )}
      </nav>

      {/* 2. Top Details Ad Slot */}
      <AdSlot position="news_details_top" ads={ads} />

      {/* 3. Main Article Layout (8 cols article + 4 cols sidebar) */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
        {/* LEFT / ARTICLE BODY (8 cols) */}
        <article className="lg:col-span-8 bg-white dark:bg-slate-900 rounded-xl border border-gray-200 dark:border-slate-800 p-6 shadow-xs">
          {/* Category & Breaking Pill */}
          <div className="flex flex-wrap items-center gap-2 mb-3">
            {news.isBreaking && (
              <span className="bg-red-600 text-white text-xs font-bold px-2.5 py-0.5 rounded uppercase flex items-center gap-1 animate-pulse">
                <Flame className="w-3.5 h-3.5" />
                {lang === 'bn' ? 'ব্রেকিং নিউজ' : 'BREAKING'}
              </span>
            )}
            <span className="bg-red-50 dark:bg-red-950/40 text-red-700 dark:text-red-300 border border-red-200 dark:border-red-900/50 text-xs font-bold px-2.5 py-0.5 rounded">
              {category}
            </span>
          </div>

          {/* Headline */}
          <h1 className="font-serif-bn font-extrabold text-2xl sm:text-3xl lg:text-4xl text-gray-950 dark:text-white leading-tight mb-4">
            {title}
          </h1>

          {/* Sub-headline / Short description */}
          {shortDesc && (
            <p className="text-sm sm:text-base font-medium text-gray-600 dark:text-gray-300 leading-relaxed border-l-4 border-red-600 pl-4 mb-6 italic">
              {shortDesc}
            </p>
          )}

          {/* Reporter & Metadata Bar */}
          <div className="flex flex-wrap items-center justify-between gap-4 py-3 border-y border-gray-100 dark:border-slate-800 text-xs text-gray-600 dark:text-gray-400 mb-6">
            <div className="flex items-center gap-3 flex-wrap">
              <div className="flex items-center gap-1.5 font-semibold text-gray-900 dark:text-gray-200">
                <User className="w-4 h-4 text-red-600" />
                <span>{news.reporterName}</span>
                {news.reporterId && (
                  <span className="text-[10px] text-gray-400 font-normal">({news.reporterId})</span>
                )}
              </div>

              {news.locationDistrict && (
                <div className="flex items-center gap-1 text-gray-500">
                  <MapPin className="w-3.5 h-3.5 text-red-500" />
                  <span>
                    {news.locationUpazila ? `${news.locationUpazila}, ` : ''}
                    {news.locationDistrict}
                  </span>
                </div>
              )}

              <div className="flex items-center gap-1 text-gray-500">
                <Clock className="w-3.5 h-3.5" />
                <span>
                  {lang === 'bn' ? 'প্রকাশ: ' : 'Published: '}
                  {formatNewsDate(news.publishedDate, news.publishedTime, lang)}
                </span>
              </div>
            </div>

            {/* Interactive Reader Toolbar: Audio TTS, Font Size, Print, Share */}
            <div className="flex items-center gap-2 flex-wrap">
              {/* Text-to-Speech audio reader */}
              <button
                onClick={toggleSpeech}
                className={`p-1.5 rounded flex items-center gap-1 transition cursor-pointer ${
                  isSpeaking
                    ? 'bg-red-600 text-white animate-pulse'
                    : 'bg-gray-100 dark:bg-slate-800 hover:bg-gray-200 text-gray-700 dark:text-gray-300'
                }`}
                title={lang === 'bn' ? 'সংবাদটি শুনুন (Audio Reader)' : 'Listen to this news'}
              >
                {isSpeaking ? <VolumeX className="w-4 h-4" /> : <Volume2 className="w-4 h-4" />}
                <span className="text-[11px] font-medium hidden sm:inline">
                  {isSpeaking ? (lang === 'bn' ? 'থামুন' : 'Stop') : (lang === 'bn' ? 'শুনুন' : 'Listen')}
                </span>
              </button>

              {/* Font Size Adjuster */}
              <div className="flex items-center bg-gray-100 dark:bg-slate-800 rounded p-0.5 text-xs font-semibold">
                <button
                  onClick={() => setFontSize('normal')}
                  className={`px-1.5 py-0.5 rounded ${fontSize === 'normal' ? 'bg-white dark:bg-slate-700 text-red-600' : ''}`}
                >
                  A
                </button>
                <button
                  onClick={() => setFontSize('large')}
                  className={`px-1.5 py-0.5 rounded ${fontSize === 'large' ? 'bg-white dark:bg-slate-700 text-red-600' : ''}`}
                >
                  A+
                </button>
                <button
                  onClick={() => setFontSize('xlarge')}
                  className={`px-1.5 py-0.5 rounded ${fontSize === 'xlarge' ? 'bg-white dark:bg-slate-700 text-red-600' : ''}`}
                >
                  A++
                </button>
              </div>

              {/* Print */}
              <button
                onClick={handlePrint}
                className="p-1.5 rounded bg-gray-100 dark:bg-slate-800 hover:bg-gray-200 text-gray-700 dark:text-gray-300 transition cursor-pointer"
                title={lang === 'bn' ? 'প্রিন্ট করুন' : 'Print news'}
              >
                <Printer className="w-4 h-4" />
              </button>

              {/* Share buttons */}
              <button
                onClick={() => handleShare('fb')}
                className="p-1.5 rounded bg-blue-600 text-white hover:bg-blue-700 transition cursor-pointer"
                title="Share on Facebook"
              >
                <Facebook className="w-4 h-4" />
              </button>
              <button
                onClick={() => handleShare('wa')}
                className="p-1.5 rounded bg-emerald-600 text-white hover:bg-emerald-700 transition cursor-pointer"
                title="Share on WhatsApp"
              >
                <Share2 className="w-4 h-4" />
              </button>
              <button
                onClick={handleCopyLink}
                className="p-1.5 rounded bg-gray-200 dark:bg-slate-700 hover:bg-gray-300 text-gray-800 dark:text-gray-200 transition cursor-pointer relative"
                title={lang === 'bn' ? 'লিঙ্ক কপি করুন' : 'Copy URL'}
              >
                {copiedLink ? <Check className="w-4 h-4 text-emerald-600" /> : <Copy className="w-4 h-4" />}
              </button>
            </div>
          </div>

          {/* Featured Image & Caption */}
          <div className="mb-6 rounded-xl overflow-hidden bg-gray-100 dark:bg-slate-800 border border-gray-200 dark:border-slate-800">
            <img
              src={news.featuredImage}
              alt={title}
              className="w-full h-auto max-h-[500px] object-cover"
              referrerPolicy="no-referrer"
            />
            {news.imageCaption && (
              <p className="p-2.5 text-xs text-gray-500 dark:text-gray-400 italic bg-gray-50 dark:bg-slate-850 border-t border-gray-100 dark:border-slate-800">
                📷 {news.imageCaption}
              </p>
            )}
          </div>

          {/* Article Full Content */}
          <div
            className={`font-serif-bn text-gray-900 dark:text-gray-100 space-y-4 ${getFontSizeClass()}`}
          >
            {content.split('\n\n').map((para, idx) => (
              <p key={idx} className="leading-relaxed">
                {para}
              </p>
            ))}
          </div>

          {/* Dedicated Accused Party Response Box */}
          {news.accusedPartyResponse && (
            <div className="mt-8 p-5 rounded-xl bg-amber-50 dark:bg-amber-950/30 border-l-4 border-amber-500 dark:border-amber-600">
              <div className="flex items-center gap-2 mb-2 text-amber-900 dark:text-amber-300 font-bold text-sm">
                <ShieldAlert className="w-5 h-5 text-amber-600" />
                <span>{lang === 'bn' ? 'সংশ্লিষ্ট / অভিযুক্ত পক্ষের বক্তব্য ও প্রতিক্রিয়া' : 'Statement / Response of the Accused / Concerned Party'}</span>
              </div>
              <p className="text-xs sm:text-sm text-amber-950 dark:text-amber-200 leading-relaxed italic">
                "{news.accusedPartyResponse}"
              </p>
            </div>
          )}

          {/* Video embed if available */}
          {news.videoUrl && (
            <div className="mt-8 rounded-xl overflow-hidden border border-gray-200 dark:border-slate-800">
              <div className="p-3 bg-slate-900 text-white text-xs font-bold flex items-center gap-2">
                <span className="w-2 h-2 rounded-full bg-red-600"></span>
                <span>{lang === 'bn' ? 'সরাসরি ভিডিও প্রতিবেদন' : 'Video Report'}</span>
              </div>
              <div className="relative aspect-16/9 bg-black">
                <iframe
                  src={news.videoUrl.replace('watch?v=', 'embed/')}
                  title="News Video"
                  className="w-full h-full border-0"
                  allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                  allowFullScreen
                />
              </div>
            </div>
          )}

          {/* Middle Article Ad Slot */}
          <AdSlot position="news_details_middle" ads={ads} />

          {/* Tags Cloud */}
          {news.tags && news.tags.length > 0 && (
            <div className="mt-8 pt-4 border-t border-gray-100 dark:border-slate-800 flex flex-wrap items-center gap-2">
              <span className="text-xs font-semibold text-gray-500 flex items-center gap-1">
                <Tag className="w-3.5 h-3.5" />
                {lang === 'bn' ? 'সম্পর্কিত ট্যাগ:' : 'Tags:'}
              </span>
              {news.tags.map((tag, idx) => (
                <span
                  key={idx}
                  className="text-xs px-2.5 py-1 bg-gray-100 dark:bg-slate-800 text-gray-700 dark:text-gray-300 rounded-md hover:bg-red-50 hover:text-red-600 transition cursor-pointer"
                >
                  #{tag}
                </span>
              ))}
            </div>
          )}

          {/* Bottom Article Ad Slot */}
          <AdSlot position="news_details_bottom" ads={ads} />

          {/* 4. Comments Section */}
          <section className="mt-10 pt-6 border-t border-gray-200 dark:border-slate-800">
            <h3 className="font-serif-bn font-bold text-xl text-gray-900 dark:text-white mb-4 flex items-center gap-2">
              <MessageSquare className="w-5 h-5 text-red-600" />
              <span>{lang === 'bn' ? 'পাঠকের মন্তব্য ও প্রতিক্রিয়া' : 'Comments & Reactions'}</span>
              <span className="text-xs font-normal text-gray-500">({comments.length})</span>
            </h3>

            {/* Comment Form */}
            <form onSubmit={handleCommentSubmit} className="space-y-3 mb-8 bg-gray-50 dark:bg-slate-850 p-4 rounded-xl border border-gray-200 dark:border-slate-800 text-xs">
              <p className="text-[11px] text-gray-500 dark:text-gray-400">
                {lang === 'bn'
                  ? 'আপনার গঠনমূলক মতামত দিন। কোনো আপত্তিকর বা উসকানিমূলক মন্তব্য অনুমোদিত নয়।'
                  : 'Constructive feedback is welcomed. Abusive language will not be approved.'}
              </p>

              {commentStatusMsg && (
                <div className="p-2.5 bg-emerald-50 dark:bg-emerald-950/40 border border-emerald-300 dark:border-emerald-800 text-emerald-800 dark:text-emerald-300 rounded">
                  {commentStatusMsg}
                </div>
              )}

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <input
                  type="text"
                  required
                  placeholder={lang === 'bn' ? 'আপনার নাম *' : 'Your Name *'}
                  value={commentName}
                  onChange={e => setCommentName(e.target.value)}
                  className="px-3 py-2 border border-gray-300 dark:border-slate-700 rounded bg-white dark:bg-slate-800 text-gray-900 dark:text-white"
                />
                <input
                  type="email"
                  placeholder={lang === 'bn' ? 'আপনার ইমেইল (প্রকাশিত হবে না)' : 'Your Email (Private)'}
                  value={commentEmail}
                  onChange={e => setCommentEmail(e.target.value)}
                  className="px-3 py-2 border border-gray-300 dark:border-slate-700 rounded bg-white dark:bg-slate-800 text-gray-900 dark:text-white"
                />
              </div>

              <textarea
                required
                rows={3}
                placeholder={lang === 'bn' ? 'মন্তব্য লিখুন...' : 'Write your comment...'}
                value={commentText}
                onChange={e => setCommentText(e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 dark:border-slate-700 rounded bg-white dark:bg-slate-800 text-gray-900 dark:text-white"
              />

              <div className="flex justify-end">
                <button
                  type="submit"
                  disabled={submittingComment}
                  className="px-4 py-2 bg-red-600 hover:bg-red-700 text-white font-bold rounded flex items-center gap-1.5 transition cursor-pointer disabled:opacity-50"
                >
                  <Send className="w-3.5 h-3.5" />
                  <span>{submittingComment ? 'পাঠানো হচ্ছে...' : (lang === 'bn' ? 'মন্তব্য প্রকাশ করুন' : 'Submit Comment')}</span>
                </button>
              </div>
            </form>

            {/* Approved comments list */}
            <div className="space-y-4">
              {comments.length === 0 ? (
                <p className="text-xs text-gray-500 italic">
                  {lang === 'bn' ? 'এখনো কোনো মন্তব্য নেই। প্রথম মন্তব্যটি আপনিই করুন।' : 'No comments yet. Be the first to comment.'}
                </p>
              ) : (
                comments.map(c => (
                  <div key={c.id} className="p-3.5 rounded-lg bg-gray-50 dark:bg-slate-800/60 border border-gray-100 dark:border-slate-800 text-xs">
                    <div className="flex items-center justify-between mb-1">
                      <span className="font-bold text-gray-900 dark:text-white">{c.authorName}</span>
                      <span className="text-[11px] text-gray-400">{timeAgo(c.createdAt, undefined, lang)}</span>
                    </div>
                    <p className="text-gray-700 dark:text-gray-300 leading-relaxed">{c.content}</p>
                  </div>
                ))
              )}
            </div>
          </section>
        </article>

        {/* RIGHT / SIDEBAR (4 cols) */}
        <aside className="lg:col-span-4 space-y-6">
          {/* Most Read Stories Widget */}
          <div className="bg-white dark:bg-slate-900 rounded-xl border border-gray-200 dark:border-slate-800 p-4 shadow-xs">
            <h4 className="font-serif-bn font-bold text-base text-gray-900 dark:text-white mb-3 border-b border-gray-200 dark:border-slate-800 pb-2 flex items-center gap-2">
              <span className="w-2.5 h-2.5 rounded-full bg-red-600"></span>
              <span>{lang === 'bn' ? 'সর্বাধিক পঠিত সংবাদ' : 'Most Read Stories'}</span>
            </h4>
            <div className="divide-y divide-gray-100 dark:divide-slate-800">
              {popularNews.map((item, idx) => (
                <div key={item.id} className="py-2.5">
                  <NewsCard
                    news={item}
                    lang={lang}
                    variant="compact"
                    onClick={() => onSelectNews(item)}
                  />
                </div>
              ))}
            </div>
          </div>

          {/* Related Stories */}
          {relatedNews.length > 0 && (
            <div className="bg-white dark:bg-slate-900 rounded-xl border border-gray-200 dark:border-slate-800 p-4 shadow-xs">
              <h4 className="font-serif-bn font-bold text-base text-gray-900 dark:text-white mb-3 border-b border-gray-200 dark:border-slate-800 pb-2">
                {lang === 'bn' ? 'সম্পর্কিত অন্যান্য সংবাদ' : 'Related News'}
              </h4>
              <div className="space-y-3">
                {relatedNews.map(item => (
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
          )}

          {/* Sidebar Ad Slot */}
          <AdSlot position="sidebar_middle" ads={ads} />
        </aside>
      </div>
    </div>
  );
};
