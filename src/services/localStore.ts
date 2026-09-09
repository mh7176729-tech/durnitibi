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
    const inputEmail = (email || '').trim().toLowerCase();
    const trimmedPass = (pass || '').trim();

    if (!trimmedPass) {
      throw new Error('দয়া করে আপনার গোপন পাসওয়ার্ড লিখুন।');
    }

    const storedEmail = (localStorage.getItem(STORAGE_KEYS.ADMIN_EMAIL) || 'admin@durniti.news').toLowerCase();
    const storedPass = localStorage.getItem(STORAGE_KEYS.ADMIN_PASSWORD) || 'Admin@2026!';

    // 1. Check Super Admin login
    const isSuperAdminEmail =
      !inputEmail ||
      inputEmail === 'admin' ||
      inputEmail === 'admin@durniti.news' ||
      inputEmail === storedEmail ||
      inputEmail === 'mh7176729@gmail.com';

    if (isSuperAdminEmail && trimmedPass === storedPass.trim()) {
      const token = `durniti_adm_sess_${Date.now()}`;
      localStorage.setItem(STORAGE_KEYS.TOKEN, token);
      localStorage.setItem('durniti_admin_token', token);
      localStorage.setItem('durniti_active_user', JSON.stringify({
        ...DEFAULT_SUPERADMIN,
        email: storedEmail
      }));
      localStore.logActivity('অ্যাডমিন লগইন', `${DEFAULT_SUPERADMIN.name} সফলভাবে সিস্টেমে লগইন করেছেন`);

      return {
        token,
        user: {
          ...DEFAULT_SUPERADMIN,
          email: storedEmail
        }
      };
    }

    // 2. Check Added Staff / Editor users
    const allUsers = localStore.getUsers();
    const staffUser = allUsers.find(
      u => u.email.toLowerCase() === inputEmail || u.name.toLowerCase() === inputEmail
    );

    if (staffUser) {
      if (!staffUser.isActive) {
        throw new Error('এই অ্যাকাউন্টটি বর্তমানে নিষ্ক্রিয় রয়েছে। অনুগ্রহ করে প্রধান সম্পাদকের সাথে যোগাযোগ করুন।');
      }
      if (staffUser.password && staffUser.password.trim() === trimmedPass) {
        const token = `durniti_staff_sess_${Date.now()}`;
        localStorage.setItem(STORAGE_KEYS.TOKEN, token);
        localStorage.setItem('durniti_admin_token', token);
        localStorage.setItem('durniti_active_user', JSON.stringify(staffUser));
        localStore.logActivity('স্টাফ লগইন', `${staffUser.name} (${staffUser.role}) লগইন করেছেন`);

        return {
          token,
          user: staffUser
        };
      }
    }

    throw new Error('ভুল ইমেইল বা পাসওয়ার্ড। অনুগ্রহ করে সঠিক পাসওয়ার্ড প্রদান করুন।');
  },

  getMe(): { user: UserItem } {
    const token = localStorage.getItem(STORAGE_KEYS.TOKEN) || localStorage.getItem('durniti_admin_token');
    if (!token) {
      throw new Error('নট অথেনটিকেটেড (অনুগ্রহ করে পাসওয়ার্ড দিয়ে লগইন করুন)');
    }
    const savedActiveUser = localStorage.getItem('durniti_active_user');
    if (savedActiveUser) {
      try {
        return { user: JSON.parse(savedActiveUser) };
      } catch {}
    }
    const storedEmail = localStorage.getItem(STORAGE_KEYS.ADMIN_EMAIL) || 'admin@durniti.news';
    return {
      user: {
        ...DEFAULT_SUPERADMIN,
        email: storedEmail
      }
    };
  },

  changePassword(_currentPass?: string, newPass?: string, newEmail?: string): { message: string } {
    if (newPass) {
      if (newPass.trim().length < 4) {
        throw new Error('নতুন পাসওয়ার্ড কমপক্ষে ৪ অক্ষরের হতে হবে');
      }
      localStorage.setItem(STORAGE_KEYS.ADMIN_PASSWORD, newPass.trim());
    }
    if (newEmail && newEmail.includes('@')) {
      localStorage.setItem(STORAGE_KEYS.ADMIN_EMAIL, newEmail.trim().toLowerCase());
    }
    localStore.logActivity('নিরাপত্তা তথ্য পরিবর্তন', 'অ্যাডমিন তথ্য সফলভাবে আপডেট করা হয়েছে');
    return { message: 'অ্যাডমিন পাসওয়ার্ড সফলভাবে সংরক্ষণ করা হয়েছে!' };
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
    const foundIndex = items.findIndex(n => n.id === slug || n.slug === slug || n.titleBn === slug || n.titleEn === slug);
    if (foundIndex === -1) {
      if (items.length > 0) return items[0];
      throw new Error('News not found');
    }
    // Increment real article view count on every genuine read
    items[foundIndex].viewCount = (items[foundIndex].viewCount || 0) + 1;
    setStored(STORAGE_KEYS.NEWS, items);
    return items[foundIndex];
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
    const defaultList = [DEFAULT_SUPERADMIN];
    return getStored<UserItem[]>(STORAGE_KEYS.USERS, defaultList);
  },

  createUser(data: Partial<UserItem> & { password?: string }): UserItem {
    const list = localStore.getUsers();
    const newUser: UserItem = {
      id: `usr-${Date.now()}`,
      name: data.name?.trim() || 'এডিটর',
      email: data.email?.trim().toLowerCase() || `staff${Date.now()}@durniti.news`,
      role: (data.role as UserRole) || 'Editor',
      isActive: data.isActive !== undefined ? data.isActive : true,
      createdAt: new Date().toISOString().split('T')[0],
      lastLogin: '-',
      phone: data.phone?.trim() || '',
      password: data.password?.trim() || 'Editor@2026'
    };
    list.push(newUser);
    setStored(STORAGE_KEYS.USERS, list);
    localStore.logActivity('ইউজার তৈরি', `${newUser.name} (${newUser.role}) যুক্ত করা হয়েছে`);
    return newUser;
  },

  updateUser(id: string, data: Partial<UserItem> & { password?: string }): UserItem {
    const list = localStore.getUsers();
    const idx = list.findIndex(u => u.id === id);
    if (idx === -1) {
      throw new Error('ব্যবহারকারী পাওয়া যায়নি');
    }
    const updated = {
      ...list[idx],
      ...data,
      email: data.email ? data.email.trim().toLowerCase() : list[idx].email
    };
    if (data.password) {
      updated.password = data.password.trim();
    }
    list[idx] = updated;
    setStored(STORAGE_KEYS.USERS, list);
    localStore.logActivity('ইউজার আপডেট', `${updated.name} এর তথ্য আপডেট করা হয়েছে`);
    return updated;
  },

  deleteUser(id: string): void {
    if (id === DEFAULT_SUPERADMIN.id || id === 'usr-superadmin-01') {
      throw new Error('প্রধান সুপার অ্যাডমিন একাউন্ট মোছা যাবে না');
    }
    let list = localStore.getUsers();
    const target = list.find(u => u.id === id);
    list = list.filter(u => u.id !== id);
    setStored(STORAGE_KEYS.USERS, list);
    if (target) {
      localStore.logActivity('ইউজার অপসারণ', `${target.name} (${target.role}) অপসারণ করা হয়েছে`);
    }
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

  // 100% Real Visitor Analytics (Zero fake/simulated data)
  getAnalytics(): any {
    const news = localStore.getNews().news;
    const comments = localStore.getComments();
    const tips = localStore.getNewsTips();
    const today = new Date().toISOString().split('T')[0];

    // Clean up any legacy artificial visit keys
    if (localStorage.getItem(STORAGE_KEYS.VISITS) === '42500') {
      localStorage.removeItem(STORAGE_KEYS.VISITS);
    }

    const stats = getStored<any>('durniti_real_visitor_stats', {
      totalVisitors: 0,
      todayVisitors: 0,
      pageViews: 0,
      todayPageViews: 0,
      lastDate: today,
      history: []
    });

    const subscribers = getStored<any[]>('durniti_subscribers', []);

    // Calculate real category breakdown from actual articles
    const categoryCounts: Record<string, number> = {};
    news.forEach(n => {
      const cat = n.categoryNameBn || 'সাধারণ';
      categoryCounts[cat] = (categoryCounts[cat] || 0) + (n.viewCount || 0);
    });
    const topCategories = Object.entries(categoryCounts)
      .map(([name, count]) => ({ name, count }))
      .sort((a, b) => b.count - a.count)
      .slice(0, 5);

    return {
      isRealTrackingOnly: true,
      dailyVisits: stats.todayVisitors || 0,
      todayVisitors: stats.todayVisitors || 0,
      visitorsToday: stats.todayVisitors || 0,
      totalVisitors: stats.totalVisitors || 0,
      pageViews: stats.pageViews || 0,
      todayPageViews: stats.todayPageViews || 0,
      uniqueVisitors: stats.totalVisitors || 0,
      visitorsThisMonth: stats.totalVisitors || 0,
      monthlyVisitors: stats.totalVisitors || 0,
      weeklyVisitors: stats.totalVisitors || 0,
      avgTimeOnSite: stats.totalVisitors > 0 ? 'সক্রিয় পর্যবেক্ষণ' : '০ সে.',
      topCategories,
      viewsByDivision: [],
      totalNews: news.length,
      publishedNews: news.filter(n => n.status === 'Published' || n.status === 'published').length,
      draftNews: news.filter(n => n.status === 'Draft' || n.status === 'draft').length,
      pendingNews: news.filter(n => n.status === 'Pending Review' || n.status === 'pending').length,
      scheduledNews: news.filter(n => n.status === 'Scheduled' || n.status === 'scheduled').length,
      totalComments: comments.length,
      pendingComments: comments.filter(c => c.status === 'Pending' || c.status === 'pending').length,
      subscriberCount: subscribers.length,
      newsTipsCount: tips.length,
      history: stats.history || []
    };
  },

  trackVisit(): void {
    const today = new Date().toISOString().split('T')[0];
    const isNewSession = !sessionStorage.getItem('durniti_real_session_active');

    // Wipe legacy artificial visits
    if (localStorage.getItem(STORAGE_KEYS.VISITS) === '42500') {
      localStorage.removeItem(STORAGE_KEYS.VISITS);
    }

    let stats = getStored<any>('durniti_real_visitor_stats', {
      totalVisitors: 0,
      todayVisitors: 0,
      pageViews: 0,
      todayPageViews: 0,
      lastDate: today,
      history: []
    });

    // Check if new day
    if (stats.lastDate !== today) {
      if (stats.lastDate && (stats.todayPageViews > 0 || stats.todayVisitors > 0)) {
        stats.history = [
          ...(stats.history || []).slice(-13),
          { date: stats.lastDate, pageViews: stats.todayPageViews, visitors: stats.todayVisitors }
        ];
      }
      stats.todayVisitors = 0;
      stats.todayPageViews = 0;
      stats.lastDate = today;
    }

    // Every genuine page view increments pageViews
    stats.pageViews = (stats.pageViews || 0) + 1;
    stats.todayPageViews = (stats.todayPageViews || 0) + 1;

    // Only real new sessions count as unique visitors
    if (isNewSession) {
      try {
        sessionStorage.setItem('durniti_real_session_active', 'true');
      } catch (e) {}
      stats.totalVisitors = (stats.totalVisitors || 0) + 1;
      stats.todayVisitors = (stats.todayVisitors || 0) + 1;
    }

    setStored('durniti_real_visitor_stats', stats);
  },

  resetRealAnalytics(): void {
    const today = new Date().toISOString().split('T')[0];
    setStored('durniti_real_visitor_stats', {
      totalVisitors: 0,
      todayVisitors: 0,
      pageViews: 0,
      todayPageViews: 0,
      lastDate: today,
      history: []
    });
    localStorage.removeItem(STORAGE_KEYS.VISITS);
    try {
      sessionStorage.removeItem('durniti_real_session_active');
    } catch (e) {}
  },

  getDatabaseStatus(): any {
    return {
      mode: 'client_active',
      isCloud: false,
      message: 'ক্লাউড ও লোকাল স্টোরেজ প্রস্তুত'
    };
  }
};
