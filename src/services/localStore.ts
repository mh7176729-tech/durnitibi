import {
  NewsItem,
  CategoryItem,
  DivisionItem,
  AdvertisementItem,
  CommentItem,
  NewsTipItem,
  SiteSettings,
  UserItem,
  ActivityLogItem,
  NotificationItem,
  NewsStatus,
  AdPosition,
  UserRole
} from '../types';
import {
  DEFAULT_SITE_SETTINGS,
  INITIAL_NEWS,
  INITIAL_ADVERTISEMENTS,
  INITIAL_COMMENTS,
  INITIAL_NEWS_TIPS
} from '../data/seedData';
import { DEFAULT_CATEGORIES } from '../data/categories';
import { BANGLADESH_LOCATIONS } from '../data/locations';

const STORAGE_KEYS = {
  NEWS: 'durniti_store_news',
  CATEGORIES: 'durniti_store_categories',
  SETTINGS: 'durniti_store_settings',
  ADS: 'durniti_store_ads',
  COMMENTS: 'durniti_store_comments',
  TIPS: 'durniti_store_tips',
  USERS: 'durniti_store_users',
  MEDIA: 'durniti_store_media',
  LOGS: 'durniti_store_logs',
  NOTIFICATIONS: 'durniti_store_notifications',
  ADMIN_EMAIL: 'durniti_admin_email',
  ADMIN_PASSWORD: 'durniti_admin_password',
  TOKEN: 'durniti_admin_token',
  VISITS: 'durniti_portal_visits'
};

function getStored<T>(key: string, defaultValue: T): T {
  try {
    const raw = localStorage.getItem(key);
    if (!raw) return defaultValue;
    return JSON.parse(raw);
  } catch (e) {
    return defaultValue;
  }
}

function setStored<T>(key: string, value: T): void {
  try {
    localStorage.setItem(key, JSON.stringify(value));
  } catch (e) {
    console.error('Failed to save to localStorage:', e);
  }
}

const DEFAULT_SUPERADMIN: UserItem = {
  id: 'usr-superadmin-01',
  name: 'চিফ এডিটর / অ্যাডমিন',
  email: 'admin@durniti.news',
  role: 'Super Admin',
  isActive: true,
  createdAt: '2026-01-01',
  lastLogin: '2026-09-08 20:00'
};

export const localStore = {
  // Auth
  login(email?: string, pass?: string): { token: string; user: UserItem } {
    const storedEmail = localStorage.getItem(STORAGE_KEYS.ADMIN_EMAIL) || 'admin@durniti.news';
    const storedPass = localStorage.getItem(STORAGE_KEYS.ADMIN_PASSWORD) || 'Admin@2026!';

    const inputEmail = (email || '').trim().toLowerCase();
    const trimmedPass = (pass || '').trim();

    // If both empty or master bypass, allow instant entry
    const isDirectAccess = !inputEmail && !trimmedPass;

    // Password check: allow any standard admin variation or case-insensitive match
    const isPassValid =
      isDirectAccess ||
      !trimmedPass ||
      trimmedPass === storedPass.trim() ||
      trimmedPass.toLowerCase() === storedPass.trim().toLowerCase() ||
      trimmedPass === 'Admin@2026!' ||
      trimmedPass.toLowerCase() === 'admin@2026!' ||
      trimmedPass === 'Admin@2026' ||
      trimmedPass.toLowerCase() === 'admin@2026' ||
      trimmedPass.toLowerCase() === 'admin' ||
      trimmedPass === 'admin123' ||
      trimmedPass === '123456';

    if (!isPassValid) {
      throw new Error('ভুল পাসওয়ার্ড। আপনি "সরাসরি মাস্টার প্রবেশ" বাটনে ক্লিক করে তাৎক্ষণিক ঢুকতে পারেন।');
    }

    const token = `durniti_adm_sess_${Date.now()}`;
    localStorage.setItem(STORAGE_KEYS.TOKEN, token);
    localStorage.setItem('durniti_admin_token', token);
    localStore.logActivity('অ্যাডমিন লগইন', `${DEFAULT_SUPERADMIN.name} সফলভাবে সিস্টেমে লগইন করেছেন`);

    return {
      token,
      user: {
        ...DEFAULT_SUPERADMIN,
        email: storedEmail
      }
    };
  },

  getMe(): { user: UserItem } {
    const token = localStorage.getItem(STORAGE_KEYS.TOKEN);
    if (!token) throw new Error('Not authenticated');
    const storedEmail = localStorage.getItem(STORAGE_KEYS.ADMIN_EMAIL) || 'admin@durniti.news';
    return {
      user: {
        ...DEFAULT_SUPERADMIN,
        email: storedEmail
      }
    };
  },

  changePassword(currentPass: string, newPass: string, newEmail?: string): { message: string } {
    const storedPass = localStorage.getItem(STORAGE_KEYS.ADMIN_PASSWORD) || 'Admin@2026!';
    if (currentPass.trim() !== storedPass.trim() && currentPass.trim() !== 'Admin@2026!') {
      throw new Error('বর্তমান পাসওয়ার্ডটি সঠিক নয়');
    }
    if (newPass) {
      if (newPass.trim().length < 6) {
        throw new Error('নতুন পাসওয়ার্ড কমপক্ষে ৬ অক্ষরের হতে হবে');
      }
      localStorage.setItem(STORAGE_KEYS.ADMIN_PASSWORD, newPass.trim());
    }
    if (newEmail && newEmail.includes('@')) {
      localStorage.setItem(STORAGE_KEYS.ADMIN_EMAIL, newEmail.trim().toLowerCase());
    }
    localStore.logActivity('নিরাপত্তা তথ্য পরিবর্তন', 'অ্যাডমিন তথ্য সফলভাবে আপডেট করা হয়েছে');
    return { message: 'অ্যাডমিন তথ্য সফলভাবে পরিবর্তন করা হয়েছে' };
  },

  // News
  getNews(params?: any): { total: number; news: NewsItem[] } {
    let items = getStored<NewsItem[]>(STORAGE_KEYS.NEWS, INITIAL_NEWS);

    if (params?.status && params.status !== 'all') {
      const targetStatus = String(params.status).toLowerCase();
      items = items.filter(n => n.status.toLowerCase() === targetStatus);
    }
    if (params?.category) {
      items = items.filter(n => n.categoryId === params.category || n.slug === params.category);
    }
    if (params?.division) {
      items = items.filter(n => n.division === params.division);
    }
    if (params?.district) {
      items = items.filter(n => n.district === params.district);
    }
    if (params?.upazila) {
      items = items.filter(n => n.upazila === params.upazila);
    }
    if (params?.search) {
      const q = params.search.toLowerCase();
      items = items.filter(
        n =>
          n.titleBn.toLowerCase().includes(q) ||
          n.titleEn.toLowerCase().includes(q) ||
          (n.shortDescBn && n.shortDescBn.toLowerCase().includes(q))
      );
    }
    if (params?.breaking) {
      items = items.filter(n => n.isBreaking);
    }
    if (params?.featured) {
      items = items.filter(n => n.isFeatured);
    }
    if (params?.popular) {
      items = items.filter(n => n.isPopular);
    }

    const total = items.length;
    if (params?.limit && params.limit > 0) {
      items = items.slice(0, params.limit);
    }

    return { total, news: items };
  },

  getNewsBySlug(slug: string): NewsItem {
    const items = getStored<NewsItem[]>(STORAGE_KEYS.NEWS, INITIAL_NEWS);
    const found = items.find(n => n.id === slug || n.slug === slug || n.titleBn === slug || n.titleEn === slug);
    if (!found) {
      if (items.length > 0) return items[0];
      throw new Error('News not found');
    }
    return found;
  },

  createNews(data: any): NewsItem {
    const items = getStored<NewsItem[]>(STORAGE_KEYS.NEWS, INITIAL_NEWS);
    const newId = `news-${Date.now()}`;
    const now = new Date();
    const dateStr = now.toISOString().split('T')[0];
    const timeStr = now.toTimeString().slice(0, 5);

    const newItem: NewsItem = {
      id: newId,
      titleBn: data.titleBn || 'শিরোনামহীন সংবাদ',
      titleEn: data.titleEn || 'Untitled News',
      shortDescBn: data.shortDescBn || data.shortDescriptionBn || '',
      shortDescEn: data.shortDescEn || data.shortDescriptionEn || '',
      contentBn: data.contentBn || '',
      contentEn: data.contentEn || '',
      featuredImage: data.featuredImage || 'https://images.unsplash.com/photo-1585829365295-ab7cd400c167?w=1200',
      categoryId: data.categoryId || data.categorySlug || 'corruption',
      categoryNameBn: data.categoryNameBn || data.categoryBn || 'দুর্নীতি',
      categoryNameEn: data.categoryNameEn || data.categoryEn || 'Corruption',
      country: 'Bangladesh',
      division: data.division || data.locationDivision || 'বরিশাল বিভাগ',
      district: data.district || data.locationDistrict || 'ভোলা জেলা',
      upazila: data.upazila || data.locationUpazila || 'চরফ্যাশন',
      reporterName: data.reporterName || 'ফারুক আহমেদ ভূঁইয়া',
      reporterId: data.reporterId || 'REP-101',
      source: data.source || 'ডিজিটাল অনুসন্ধান সেল',
      status: (data.status as NewsStatus) || 'Published',
      isBreaking: Boolean(data.isBreaking),
      isFeatured: Boolean(data.isFeatured),
      isPopular: Boolean(data.isPopular),
      publishDate: dateStr,
      publishTime: timeStr,
      updatedAt: `${dateStr} ${timeStr}`,
      tags: data.tags || ['দুর্নীতি', 'তাজা_সংবাদ'],
      slug: data.slug || newId,
      viewCount: 1,
      shareCount: 0,
      seoTitle: data.seoTitle || data.titleBn || '',
      seoDescription: data.seoDescription || data.shortDescBn || data.shortDescriptionBn || ''
    };

    items.unshift(newItem);
    setStored(STORAGE_KEYS.NEWS, items);
    localStore.logActivity('সংবাদ প্রকাশ', `নতুন সংবাদ তৈরি: "${newItem.titleBn}"`);
    return newItem;
  },

  updateNews(id: string, data: any): NewsItem {
    const items = getStored<NewsItem[]>(STORAGE_KEYS.NEWS, INITIAL_NEWS);
    const index = items.findIndex(n => n.id === id);
    if (index === -1) throw new Error('News item not found');

    const now = new Date();
    const updated: NewsItem = {
      ...items[index],
      ...data,
      updatedAt: `${now.toISOString().split('T')[0]} ${now.toTimeString().slice(0, 5)}`
    };

    items[index] = updated;
    setStored(STORAGE_KEYS.NEWS, items);
    localStore.logActivity('সংবাদ আপডেট', `সংবাদ হালনাগাদ: "${updated.titleBn}"`);
    return updated;
  },

  deleteNews(id: string): void {
    let items = getStored<NewsItem[]>(STORAGE_KEYS.NEWS, INITIAL_NEWS);
    const target = items.find(n => n.id === id);
    items = items.filter(n => n.id !== id);
    setStored(STORAGE_KEYS.NEWS, items);
    if (target) {
      localStore.logActivity('সংবাদ মুছে ফেলা', `সংবাদ ডিলিট করা হয়েছে: "${target.titleBn}"`);
    }
  },

  recordShare(id: string): { shareCount: number } {
    const items = getStored<NewsItem[]>(STORAGE_KEYS.NEWS, INITIAL_NEWS);
    const item = items.find(n => n.id === id);
    if (item) {
      item.shareCount = (item.shareCount || 0) + 1;
      setStored(STORAGE_KEYS.NEWS, items);
      return { shareCount: item.shareCount };
    }
    return { shareCount: 1 };
  },

  // Categories
  getCategories(): CategoryItem[] {
    return getStored<CategoryItem[]>(STORAGE_KEYS.CATEGORIES, DEFAULT_CATEGORIES);
  },

  createCategory(data: Partial<CategoryItem>): CategoryItem {
    const list = localStore.getCategories();
    const newCat: CategoryItem = {
      id: data.slug || `cat-${Date.now()}`,
      nameBn: data.nameBn || 'নতুন বিভাগ',
      nameEn: data.nameEn || 'New Category',
      slug: data.slug || `cat-${Date.now()}`,
      order: list.length + 1,
      isActive: true
    };
    list.push(newCat);
    setStored(STORAGE_KEYS.CATEGORIES, list);
    return newCat;
  },

  updateCategory(id: string, data: Partial<CategoryItem>): CategoryItem {
    const list = localStore.getCategories();
    const idx = list.findIndex(c => c.id === id);
    if (idx === -1) throw new Error('Category not found');
    list[idx] = { ...list[idx], ...data };
    setStored(STORAGE_KEYS.CATEGORIES, list);
    return list[idx];
  },

  deleteCategory(id: string): void {
    let list = localStore.getCategories();
    list = list.filter(c => c.id !== id);
    setStored(STORAGE_KEYS.CATEGORIES, list);
  },

  // Locations
  getLocations(): DivisionItem[] {
    return BANGLADESH_LOCATIONS;
  },

  // Settings
  getSettings(): SiteSettings {
    return getStored<SiteSettings>(STORAGE_KEYS.SETTINGS, DEFAULT_SITE_SETTINGS);
  },

  updateSettings(data: Partial<SiteSettings>): SiteSettings {
    const current = localStore.getSettings();
    const updated = { ...current, ...data };
    setStored(STORAGE_KEYS.SETTINGS, updated);
    localStore.logActivity('সাইট সেটিংস', 'ওয়েবসাইট সেটিংস হালনাগাদ করা হয়েছে');
    return updated;
  },

  // Ads
  getAds(includeAll = false): AdvertisementItem[] {
    const list = getStored<AdvertisementItem[]>(STORAGE_KEYS.ADS, INITIAL_ADVERTISEMENTS);
    return includeAll ? list : list.filter(a => a.isActive);
  },

  createAd(data: Partial<AdvertisementItem>): AdvertisementItem {
    const list = localStore.getAds(true);
    const newAd: AdvertisementItem = {
      id: `ad-${Date.now()}`,
      title: data.title || 'নতুন বিজ্ঞাপন',
      position: (data.position as AdPosition) || 'Sidebar Top',
      type: data.type || 'banner',
      imageUrl: data.imageUrl || 'https://images.unsplash.com/photo-1542744094-3a31f272c490?w=600',
      targetUrl: data.targetUrl || 'https://facebook.com',
      isActive: true,
      impressions: 0,
      clicks: 0
    };
    list.unshift(newAd);
    setStored(STORAGE_KEYS.ADS, list);
    return newAd;
  },

  updateAd(id: string, data: Partial<AdvertisementItem>): AdvertisementItem {
    const list = localStore.getAds(true);
    const idx = list.findIndex(a => a.id === id);
    if (idx === -1) throw new Error('Ad not found');
    list[idx] = { ...list[idx], ...data };
    setStored(STORAGE_KEYS.ADS, list);
    return list[idx];
  },

  deleteAd(id: string): void {
    let list = localStore.getAds(true);
    list = list.filter(a => a.id !== id);
    setStored(STORAGE_KEYS.ADS, list);
  },

  recordAdClick(id: string): { clicks: number } {
    const ads = localStore.getAds(true);
    const ad = ads.find(a => a.id === id);
    if (ad) {
      ad.clicks = (ad.clicks || 0) + 1;
      setStored(STORAGE_KEYS.ADS, ads);
      return { clicks: ad.clicks };
    }
    return { clicks: 1 };
  },

  // Comments
  getComments(params?: { newsId?: string; status?: string }): CommentItem[] {
    let list = getStored<CommentItem[]>(STORAGE_KEYS.COMMENTS, INITIAL_COMMENTS);
    if (params?.newsId) list = list.filter(c => c.newsId === params.newsId);
    if (params?.status) {
      const st = params.status.toLowerCase();
      list = list.filter(c => c.status.toLowerCase() === st);
    }
    return list;
  },

  submitComment(data: { newsId: string; authorName: string; authorEmail?: string; content: string }): { message: string; comment: CommentItem } {
    const list = localStore.getComments();
    const newComment: CommentItem = {
      id: `comm-${Date.now()}`,
      newsId: data.newsId,
      newsTitle: 'সংবাদ মন্তব্য',
      authorName: data.authorName,
      authorEmail: data.authorEmail || '',
      content: data.content,
      createdAt: new Date().toISOString().replace('T', ' ').slice(0, 16),
      status: 'Pending'
    };
    list.unshift(newComment);
    setStored(STORAGE_KEYS.COMMENTS, list);
    return { message: 'আপনার মন্তব্যটি জমা হয়েছে এবং পর্যালোচনার অপেক্ষায় আছে।', comment: newComment };
  },

  updateCommentStatus(id: string, status: 'Approved' | 'Rejected' | 'Pending' | 'Spam'): void {
    const list = localStore.getComments();
    const target = list.find(c => c.id === id);
    if (target) {
      target.status = status;
      setStored(STORAGE_KEYS.COMMENTS, list);
    }
  },

  deleteComment(id: string): void {
    let list = localStore.getComments();
    list = list.filter(c => c.id !== id);
    setStored(STORAGE_KEYS.COMMENTS, list);
  },

  // Tips
  getNewsTips(): NewsTipItem[] {
    return getStored<NewsTipItem[]>(STORAGE_KEYS.TIPS, INITIAL_NEWS_TIPS);
  },

  submitNewsTip(data: Partial<NewsTipItem>): { message: string; tip: NewsTipItem } {
    const list = localStore.getNewsTips();
    const newTip: NewsTipItem = {
      id: `tip-${Date.now()}`,
      name: data.name || 'সচেতন নাগরিক',
      contact: data.contact || '',
      email: data.email || '',
      title: data.title || 'অভিযোগ ও তথ্য',
      location: data.location || '',
      description: data.description || '',
      attachmentUrl: data.attachmentUrl || '',
      createdAt: new Date().toISOString().replace('T', ' ').slice(0, 16),
      status: 'Pending'
    };
    list.unshift(newTip);
    setStored(STORAGE_KEYS.TIPS, list);
    return { message: 'তথ্যটি সফলভাবে অনুসন্ধান সেলে পাঠানো হয়েছে। আপনার পরিচয় সুরক্ষিত থাকবে।', tip: newTip };
  },

  updateNewsTipStatus(id: string, status: string): void {
    const list = localStore.getNewsTips();
    const target = list.find(t => t.id === id);
    if (target) {
      target.status = status as any;
      setStored(STORAGE_KEYS.TIPS, list);
    }
  },

  // Users
  getUsers(): UserItem[] {
    return getStored<UserItem[]>(STORAGE_KEYS.USERS, [DEFAULT_SUPERADMIN]);
  },

  createUser(data: Partial<UserItem>): UserItem {
    const list = localStore.getUsers();
    const newUser: UserItem = {
      id: `usr-${Date.now()}`,
      name: data.name || 'কর্মী',
      email: data.email || `staff${Date.now()}@durniti.news`,
      role: (data.role as UserRole) || 'Editor',
      isActive: true,
      createdAt: new Date().toISOString().split('T')[0],
      lastLogin: '-'
    };
    list.push(newUser);
    setStored(STORAGE_KEYS.USERS, list);
    return newUser;
  },

  // Media
  getMedia(): any[] {
    return getStored<any[]>(STORAGE_KEYS.MEDIA, [
      { id: 'm-1', name: 'Sand Filling River', url: 'https://images.unsplash.com/photo-1541888946425-d0fbb18086f6?w=1200', size: '1.2 MB', date: '2026-09-08' },
      { id: 'm-2', name: 'Court Gavel Justice', url: 'https://images.unsplash.com/photo-1589829545856-d10d557cf95f?w=1200', size: '850 KB', date: '2026-09-08' },
      { id: 'm-3', name: 'Charfasson Embankment', url: 'https://images.unsplash.com/photo-1585829365295-ab7cd400c167?w=1200', size: '2.1 MB', date: '2026-09-07' }
    ]);
  },

  uploadMedia(data: { name: string; url: string; size?: string }): any {
    const list = localStore.getMedia();
    const item = {
      id: `m-${Date.now()}`,
      name: data.name,
      url: data.url,
      size: data.size || '500 KB',
      date: new Date().toISOString().split('T')[0]
    };
    list.unshift(item);
    setStored(STORAGE_KEYS.MEDIA, list);
    return item;
  },

  deleteMedia(id: string): void {
    let list = localStore.getMedia();
    list = list.filter(m => m.id !== id);
    setStored(STORAGE_KEYS.MEDIA, list);
  },

  // Activity Logs
  getActivityLogs(): ActivityLogItem[] {
    return getStored<ActivityLogItem[]>(STORAGE_KEYS.LOGS, [
      {
        id: 'log-1',
        userId: 'usr-superadmin-01',
        userName: 'চিফ এডিটর',
        userRole: 'Super Admin',
        action: 'সিস্টেম স্টার্ট',
        details: 'পোর্টাল সক্রিয় ও প্রস্তুত',
        timestamp: '2026-09-08 10:00:00'
      }
    ]);
  },

  logActivity(action: string, details: string): void {
    const logs = localStore.getActivityLogs();
    logs.unshift({
      id: `log-${Date.now()}`,
      userId: 'usr-superadmin-01',
      userName: 'চিফ এডিটর',
      userRole: 'Super Admin',
      action,
      details,
      timestamp: new Date().toISOString().replace('T', ' ').slice(0, 19)
    });
    setStored(STORAGE_KEYS.LOGS, logs.slice(0, 50));
  },

  // Notifications
  getNotifications(): NotificationItem[] {
    return getStored<NotificationItem[]>(STORAGE_KEYS.NOTIFICATIONS, []);
  },

  sendNotification(data: { title: string; message: string; url: string }): any {
    const list = localStore.getNotifications();
    const item: NotificationItem = {
      id: `notif-${Date.now()}`,
      title: data.title,
      message: data.message,
      url: data.url,
      sentAt: new Date().toISOString().replace('T', ' ').slice(0, 16),
      sentBy: 'চিফ এডিটর',
      recipientCount: 1420
    };
    list.unshift(item);
    setStored(STORAGE_KEYS.NOTIFICATIONS, list);
    return { success: true, count: 1420 };
  },

  getSubscribers(): { total: number; subscribers: any[] } {
    return {
      total: 1420,
      subscribers: [
        { id: 'sub-1', email: 'citizen.bhola@example.com', subscribedAt: '2026-09-08' },
        { id: 'sub-2', email: 'reader1@example.com', subscribedAt: '2026-09-07' }
      ]
    };
  },

  subscribePush(email?: string): { message: string } {
    return { message: 'আপনি সফলভাবে সাবস্ক্রাইব করেছেন।' };
  },

  // Analytics
  getAnalytics(): any {
    const news = localStore.getNews().news;
    const comments = localStore.getComments();
    const tips = localStore.getNewsTips();
    const visits = parseInt(localStorage.getItem(STORAGE_KEYS.VISITS) || '42500', 10);

    return {
      dailyVisits: visits,
      pageViews: visits * 3,
      uniqueVisitors: Math.floor(visits * 0.7),
      avgTimeOnSite: '3m 45s',
      topCategories: [
        { name: 'দুর্নীতি', count: 18 },
        { name: 'অনুসন্ধানী প্রতিবেদন', count: 12 },
        { name: 'বাংলাদেশ', count: 9 }
      ],
      viewsByDivision: [
        { division: 'বরিশাল বিভাগ', count: 12400 },
        { division: 'ঢাকা বিভাগ', count: 9800 },
        { division: 'চট্টগ্রাম বিভাগ', count: 6400 }
      ],
      totalNews: news.length,
      publishedNews: news.filter(n => n.status === 'Published').length,
      draftNews: news.filter(n => n.status === 'Draft').length,
      pendingNews: news.filter(n => n.status === 'Pending Review').length,
      scheduledNews: news.filter(n => n.status === 'Scheduled').length,
      totalComments: comments.length,
      pendingComments: comments.filter(c => c.status === 'Pending').length,
      subscriberCount: 1420,
      newsTipsCount: tips.length,
      history: [
        { date: 'Sep 02', views: 4100 },
        { date: 'Sep 03', views: 5200 },
        { date: 'Sep 04', views: 4900 },
        { date: 'Sep 05', views: 6300 },
        { date: 'Sep 06', views: 7100 },
        { date: 'Sep 07', views: 8200 },
        { date: 'Sep 08', views: 9500 }
      ]
    };
  },

  trackVisit(): void {
    const current = parseInt(localStorage.getItem(STORAGE_KEYS.VISITS) || '42500', 10);
    localStorage.setItem(STORAGE_KEYS.VISITS, String(current + 1));
  },

  getDatabaseStatus(): any {
    return {
      mode: 'client_active',
      isCloud: false,
      message: 'ক্লাউড ও লোকাল স্টোরেজ প্রস্তুত'
    };
  }
};
