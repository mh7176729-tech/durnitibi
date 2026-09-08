import { Language } from '../types';

export function toBanglaNumber(num: number | string): string {
  const bnDigits = ['০', '১', '২', '৩', '৪', '৫', '৬', '৭', '৮', '৯'];
  return String(num).replace(/[0-9]/g, digit => bnDigits[parseInt(digit, 10)]);
}

export function formatNewsDate(dateStr: string, timeStr?: string, lang: Language = 'bn'): string {
  if (!dateStr) return '';
  const date = new Date(`${dateStr}T${timeStr || '00:00'}`);
  if (isNaN(date.getTime())) return dateStr;

  if (lang === 'bn') {
    const monthsBn = [
      'জানুয়ারি', 'ফেব্রুয়ারি', 'মার্চ', 'এপ্রিল', 'মে', 'জুন',
      'জুলাই', 'আগস্ট', 'সেপ্টেম্বর', 'অক্টোবর', 'নভেম্বর', 'ডিসেম্বর'
    ];
    const day = toBanglaNumber(date.getDate());
    const month = monthsBn[date.getMonth()];
    const year = toBanglaNumber(date.getFullYear());
    const time = timeStr ? ` ${toBanglaNumber(timeStr)}` : '';
    return `${day} ${month} ${year}${time}`;
  }

  return date.toLocaleDateString('en-US', {
    month: 'short',
    day: 'numeric',
    year: 'numeric'
  }) + (timeStr ? ` ${timeStr}` : '');
}

export function getCurrentHeaderDate(lang: Language = 'bn'): string {
  const now = new Date();
  if (lang === 'bn') {
    const daysBn = ['রবিবার', 'সোমবার', 'মঙ্গলবার', 'বুধবার', 'বৃহস্পতিবার', 'শুক্রবার', 'শনিবার'];
    const monthsBn = [
      'জানুয়ারি', 'ফেব্রুয়ারি', 'মার্চ', 'এপ্রিল', 'মে', 'জুন',
      'জুলাই', 'আগস্ট', 'সেপ্টেম্বর', 'অক্টোবর', 'নভেম্বর', 'ডিসেম্বর'
    ];
    const dayName = daysBn[now.getDay()];
    const day = toBanglaNumber(now.getDate());
    const month = monthsBn[now.getMonth()];
    const year = toBanglaNumber(now.getFullYear());
    return `${dayName}, ${day} ${month} ${year}`;
  }

  return now.toLocaleDateString('en-US', {
    weekday: 'long',
    month: 'long',
    day: 'numeric',
    year: 'numeric'
  });
}

export function timeAgo(dateStr: string, timeStr?: string, lang: Language = 'bn'): string {
  if (!dateStr) return '';
  const date = new Date(`${dateStr}T${timeStr || '00:00'}`);
  if (isNaN(date.getTime())) return dateStr;

  const diffMs = Date.now() - date.getTime();
  const diffMins = Math.max(1, Math.floor(diffMs / (1000 * 60)));
  const diffHours = Math.floor(diffMins / 60);
  const diffDays = Math.floor(diffHours / 24);

  if (lang === 'bn') {
    if (diffMins < 60) return `${toBanglaNumber(diffMins)} মিনিট আগে`;
    if (diffHours < 24) return `${toBanglaNumber(diffHours)} ঘণ্টা আগে`;
    if (diffDays === 1) return 'গতকাল';
    if (diffDays < 7) return `${toBanglaNumber(diffDays)} দিন আগে`;
    return formatNewsDate(dateStr, timeStr, 'bn');
  }

  if (diffMins < 60) return `${diffMins} min ago`;
  if (diffHours < 24) return `${diffHours} hr ago`;
  if (diffDays === 1) return 'Yesterday';
  if (diffDays < 7) return `${diffDays} days ago`;
  return formatNewsDate(dateStr, timeStr, 'en');
}
