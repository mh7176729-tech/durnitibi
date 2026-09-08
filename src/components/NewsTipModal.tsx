import React, { useState } from 'react';
import { X, Send, ShieldCheck, Upload, AlertCircle } from 'lucide-react';
import { Language } from '../types';
import { api } from '../services/api';

interface NewsTipModalProps {
  isOpen: boolean;
  onClose: () => void;
  lang: Language;
}

export const NewsTipModal: React.FC<NewsTipModalProps> = ({ isOpen, onClose, lang }) => {
  const [name, setName] = useState('');
  const [contact, setContact] = useState('');
  const [email, setEmail] = useState('');
  const [title, setTitle] = useState('');
  const [location, setLocation] = useState('');
  const [description, setDescription] = useState('');
  const [attachmentUrl, setAttachmentUrl] = useState('');
  const [submitting, setSubmitting] = useState(false);
  const [successMsg, setSuccessMsg] = useState('');
  const [errorMsg, setErrorMsg] = useState('');

  if (!isOpen) return null;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!title || !description || (!contact && !email)) {
      setErrorMsg(
        lang === 'bn'
          ? 'অনুগ্রহ করে সংবাদের শিরোনাম, বিবরণ এবং যোগাযোগের নম্বর বা ইমেইল লিখুন।'
          : 'Please provide title, description, and contact phone or email.'
      );
      return;
    }

    setSubmitting(true);
    setErrorMsg('');

    try {
      const res = await api.submitNewsTip({
        name,
        contact,
        email,
        title,
        location,
        description,
        attachmentUrl
      });
      setSuccessMsg(res.message);
      setTimeout(() => {
        setName('');
        setContact('');
        setEmail('');
        setTitle('');
        setLocation('');
        setDescription('');
        setAttachmentUrl('');
        setSuccessMsg('');
        onClose();
      }, 3000);
    } catch (err: any) {
      setErrorMsg(err.message || 'Failed to submit tip');
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-xs">
      <div className="bg-white dark:bg-slate-900 border border-gray-200 dark:border-slate-800 rounded-xl shadow-2xl max-w-xl w-full p-6 relative max-h-[90vh] overflow-y-auto">
        <button
          onClick={onClose}
          className="absolute top-4 right-4 text-gray-400 hover:text-gray-700 dark:hover:text-white p-1"
        >
          <X className="w-5 h-5" />
        </button>

        <div className="flex items-center gap-2 mb-2 text-red-600">
          <ShieldCheck className="w-6 h-6" />
          <h3 className="text-xl font-bold font-serif-bn text-gray-900 dark:text-white">
            {lang === 'bn' ? 'সংবাদ বা অনিয়মের তথ্য পাঠান' : 'Submit News Tip / Injustice'}
          </h3>
        </div>

        <p className="text-xs text-gray-600 dark:text-gray-400 mb-6 leading-relaxed">
          {lang === 'bn'
            ? 'আপনার প্রেরিত তথ্য সম্পূর্ণ গোপনীয়তার সাথে যাচাই করা হবে। প্রাথমিক যাচাইয়ের পর আমাদের অনুসন্ধানী সাংবাদিক দল প্রয়োজনীয় প্রমাণ সংগ্রহ করে সংবাদ প্রকাশ করবে।'
            : 'Your submission is strictly confidential. Our investigative journalism team will verify details and reach out if necessary.'}
        </p>

        {successMsg && (
          <div className="p-4 bg-emerald-50 dark:bg-emerald-950/40 border border-emerald-300 dark:border-emerald-800 rounded-lg text-emerald-800 dark:text-emerald-300 text-sm mb-4">
            ✅ {successMsg}
          </div>
        )}

        {errorMsg && (
          <div className="p-3 bg-red-50 dark:bg-red-950/40 border border-red-300 dark:border-red-800 rounded-lg text-red-700 dark:text-red-300 text-xs mb-4 flex items-center gap-2">
            <AlertCircle className="w-4 h-4 shrink-0" />
            <span>{errorMsg}</span>
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-4 text-xs">
          <div>
            <label className="block font-semibold text-gray-700 dark:text-gray-300 mb-1">
              {lang === 'bn' ? 'সংবাদের শিরোনাম *' : 'Tip / News Title *'}
            </label>
            <input
              type="text"
              required
              value={title}
              onChange={e => setTitle(e.target.value)}
              placeholder={lang === 'bn' ? 'কী বিষয়ে অনিয়ম বা সংবাদ?' : 'What is the report or irregularity about?'}
              className="w-full px-3 py-2 border border-gray-300 dark:border-slate-700 rounded-md bg-white dark:bg-slate-800 text-gray-900 dark:text-white focus:ring-2 focus:ring-red-500 focus:outline-none"
            />
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <div>
              <label className="block font-semibold text-gray-700 dark:text-gray-300 mb-1">
                {lang === 'bn' ? 'আপনার নাম (ঐচ্ছিক)' : 'Your Name (Optional)'}
              </label>
              <input
                type="text"
                value={name}
                onChange={e => setName(e.target.value)}
                placeholder={lang === 'bn' ? 'নাম প্রকাশে অনিচ্ছুক হলে ফাঁকা রাখুন' : 'Anonymous if left blank'}
                className="w-full px-3 py-2 border border-gray-300 dark:border-slate-700 rounded-md bg-white dark:bg-slate-800 text-gray-900 dark:text-white"
              />
            </div>
            <div>
              <label className="block font-semibold text-gray-700 dark:text-gray-300 mb-1">
                {lang === 'bn' ? 'স্থান / এলাকা *' : 'Location / Upazila / District *'}
              </label>
              <input
                type="text"
                required
                value={location}
                onChange={e => setLocation(e.target.value)}
                placeholder={lang === 'bn' ? 'যেমন: ভোলা, চরফ্যাশন' : 'e.g. Bhola, Charfasson'}
                className="w-full px-3 py-2 border border-gray-300 dark:border-slate-700 rounded-md bg-white dark:bg-slate-800 text-gray-900 dark:text-white"
              />
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <div>
              <label className="block font-semibold text-gray-700 dark:text-gray-300 mb-1">
                {lang === 'bn' ? 'যোগাযোগের মোবাইল নম্বর *' : 'Contact Phone Number *'}
              </label>
              <input
                type="text"
                value={contact}
                onChange={e => setContact(e.target.value)}
                placeholder="01XXXXXXXXX"
                className="w-full px-3 py-2 border border-gray-300 dark:border-slate-700 rounded-md bg-white dark:bg-slate-800 text-gray-900 dark:text-white"
              />
            </div>
            <div>
              <label className="block font-semibold text-gray-700 dark:text-gray-300 mb-1">
                {lang === 'bn' ? 'ইমেইল (ঐচ্ছিক)' : 'Email (Optional)'}
              </label>
              <input
                type="email"
                value={email}
                onChange={e => setEmail(e.target.value)}
                placeholder="citizen@example.com"
                className="w-full px-3 py-2 border border-gray-300 dark:border-slate-700 rounded-md bg-white dark:bg-slate-800 text-gray-900 dark:text-white"
              />
            </div>
          </div>

          <div>
            <label className="block font-semibold text-gray-700 dark:text-gray-300 mb-1">
              {lang === 'bn' ? 'বিস্তারিত বিবরণ ও অভিযোগ *' : 'Detailed Report & Irregularity *'}
            </label>
            <textarea
              required
              rows={4}
              value={description}
              onChange={e => setDescription(e.target.value)}
              placeholder={lang === 'bn' ? 'ঘটনার বিস্তারিত, সংশ্লিষ্ট ব্যক্তি/দপ্তরের নাম, তারিখ ইত্যাদি উল্লেখ করুন...' : 'Describe what happened, individuals involved, date, etc.'}
              className="w-full px-3 py-2 border border-gray-300 dark:border-slate-700 rounded-md bg-white dark:bg-slate-800 text-gray-900 dark:text-white focus:ring-2 focus:ring-red-500 focus:outline-none"
            />
          </div>

          <div>
            <label className="block font-semibold text-gray-700 dark:text-gray-300 mb-1">
              {lang === 'bn' ? 'নথি বা ছবির লিঙ্ক (ঐচ্ছিক)' : 'Attachment or Document Link (Optional)'}
            </label>
            <input
              type="url"
              value={attachmentUrl}
              onChange={e => setAttachmentUrl(e.target.value)}
              placeholder="https://drive.google.com/... or image link"
              className="w-full px-3 py-2 border border-gray-300 dark:border-slate-700 rounded-md bg-white dark:bg-slate-800 text-gray-900 dark:text-white"
            />
          </div>

          <div className="pt-2 flex items-center justify-end gap-3">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 rounded-md border border-gray-300 dark:border-slate-700 text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-slate-800"
            >
              {lang === 'bn' ? 'বাতিল' : 'Cancel'}
            </button>
            <button
              type="submit"
              disabled={submitting}
              className="px-5 py-2 rounded-md bg-red-600 hover:bg-red-700 text-white font-bold flex items-center gap-2 transition cursor-pointer disabled:opacity-50"
            >
              <Send className="w-4 h-4" />
              <span>{submitting ? (lang === 'bn' ? 'জমা হচ্ছে...' : 'Sending...') : (lang === 'bn' ? 'তথ্য জমা দিন' : 'Submit Information')}</span>
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
