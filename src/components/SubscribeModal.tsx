import React, { useState } from 'react';
import { X, Bell, CheckCircle, ShieldAlert, AlertCircle } from 'lucide-react';
import { Language } from '../types';
import { api } from '../services/api';

interface SubscribeModalProps {
  isOpen: boolean;
  onClose: () => void;
  lang: Language;
}

export const SubscribeModal: React.FC<SubscribeModalProps> = ({ isOpen, onClose, lang }) => {
  const [email, setEmail] = useState('');
  const [status, setStatus] = useState<'idle' | 'loading' | 'success' | 'error'>('idle');
  const [message, setMessage] = useState('');

  if (!isOpen) return null;

  const handleBrowserPushSubscribe = async () => {
    setStatus('loading');
    try {
      if ('Notification' in window) {
        const perm = await Notification.requestPermission();
        if (perm === 'granted') {
          await api.subscribePush(email || 'browser-push-subscriber@user.local', 'web-push-endpoint-demo');
          setStatus('success');
          setMessage(
            lang === 'bn'
              ? 'ধন্যবাদ! আপনি ব্রাউজার নোটিফিকেশনে সফলভাবে সাবস্ক্রাইব করেছেন।'
              : 'Thank you! You have successfully subscribed to instant browser news notifications.'
          );
          setTimeout(() => onClose(), 2500);
          return;
        }
      }
      // Fallback to email subscription
      if (email) {
        const res = await api.subscribePush(email);
        setStatus('success');
        setMessage(res.message);
        setTimeout(() => onClose(), 2500);
      } else {
        setStatus('error');
        setMessage(
          lang === 'bn'
            ? 'অনুগ্রহ করে একটি সচল ইমেইল লিখুন বা ব্রাউজার নোটিফিকেশন অনুমোদন করুন।'
            : 'Please provide an active email address or allow browser notifications.'
        );
      }
    } catch (err: any) {
      setStatus('error');
      setMessage(err.message || 'Subscription failed');
    }
  };

  const handleEmailSubscribe = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!email) return;
    setStatus('loading');
    try {
      const res = await api.subscribePush(email);
      setStatus('success');
      setMessage(res.message);
      setTimeout(() => onClose(), 2500);
    } catch (err: any) {
      setStatus('error');
      setMessage(err.message || 'Subscription failed');
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-xs">
      <div className="bg-white dark:bg-slate-900 border border-gray-200 dark:border-slate-800 rounded-xl shadow-2xl max-w-md w-full p-6 relative">
        <button
          onClick={onClose}
          className="absolute top-4 right-4 text-gray-400 hover:text-gray-700 dark:hover:text-white p-1"
        >
          <X className="w-5 h-5" />
        </button>

        <div className="w-12 h-12 bg-amber-100 dark:bg-amber-950/50 rounded-full flex items-center justify-center text-amber-600 mb-4 mx-auto">
          <Bell className="w-6 h-6 animate-bounce" />
        </div>

        <h3 className="text-center font-serif-bn font-bold text-xl text-gray-900 dark:text-white mb-1">
          {lang === 'bn' ? 'তাজা খবরের নোটিফিকেশন পান' : 'Get Instant Breaking News'}
        </h3>
        <p className="text-center text-xs text-gray-600 dark:text-gray-400 mb-6">
          {lang === 'bn'
            ? 'গুরুত্বপূর্ণ জাতীয় সংবাদ ও বিশেষ অনুসন্ধানী প্রতিবেদন প্রকাশের সাথে সাথে সবার আগে অ্যালার্ট পান।'
            : 'Be the first to receive notifications on major investigative stories and national alerts.'}
        </p>

        {status === 'success' ? (
          <div className="p-4 bg-emerald-50 dark:bg-emerald-950/40 border border-emerald-300 dark:border-emerald-800 rounded-lg text-center text-emerald-800 dark:text-emerald-200 text-xs">
            <CheckCircle className="w-8 h-8 text-emerald-600 mx-auto mb-2" />
            <p className="font-semibold">{message}</p>
          </div>
        ) : (
          <div className="space-y-4 text-xs">
            {status === 'error' && (
              <div className="p-3 bg-red-50 dark:bg-red-950/40 border border-red-200 dark:border-red-800 rounded-lg text-red-700 dark:text-red-300 flex items-center gap-2">
                <AlertCircle className="w-4 h-4 shrink-0" />
                <span>{message}</span>
              </div>
            )}

            {/* Instant Browser Push Button */}
            <button
              onClick={handleBrowserPushSubscribe}
              disabled={status === 'loading'}
              className="w-full py-2.5 bg-red-600 hover:bg-red-700 text-white rounded-lg font-bold flex items-center justify-center gap-2 transition cursor-pointer shadow-md"
            >
              <Bell className="w-4 h-4" />
              <span>
                {status === 'loading'
                  ? (lang === 'bn' ? 'অনুরোধ যাচাই হচ্ছে...' : 'Enabling...')
                  : (lang === 'bn' ? 'ব্রাউজার পুশ নোটিফিকেশন চালু করুন' : 'Enable Web Push Alerts')}
              </span>
            </button>

            <div className="relative flex py-1 items-center">
              <div className="flex-grow border-t border-gray-200 dark:border-slate-800"></div>
              <span className="flex-shrink mx-3 text-gray-400 text-[11px]">
                {lang === 'bn' ? 'অথবা ইমেইলে নিন' : 'OR VIA EMAIL'}
              </span>
              <div className="flex-grow border-t border-gray-200 dark:border-slate-800"></div>
            </div>

            <form onSubmit={handleEmailSubscribe} className="space-y-2">
              <input
                type="email"
                required
                value={email}
                onChange={e => setEmail(e.target.value)}
                placeholder="reader@example.com"
                className="w-full px-3 py-2 border border-gray-300 dark:border-slate-700 rounded-lg bg-white dark:bg-slate-800 text-gray-900 dark:text-white"
              />
              <button
                type="submit"
                disabled={status === 'loading'}
                className="w-full py-2 bg-gray-900 dark:bg-slate-800 hover:bg-gray-800 text-white rounded-lg font-semibold transition"
              >
                {lang === 'bn' ? 'ইমেইল নিউজলেটারে যোগ দিন' : 'Subscribe to Newsletter'}
              </button>
            </form>

            <p className="text-[10px] text-center text-gray-400">
              {lang === 'bn'
                ? 'আমরা কোনো স্প্যাম করি না। যেকোনো সময় নোটিফিকেশন বন্ধ করা যাবে।'
                : 'No spam ever. You can unsubscribe or revoke permission anytime.'}
            </p>
          </div>
        )}
      </div>
    </div>
  );
};
