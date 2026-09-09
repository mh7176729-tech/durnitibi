import {
  NewsItem,
  CategoryItem,
  DivisionItem,
  CommentItem,
  AdvertisementItem,
  SiteSettings,
  UserItem,
  ActivityLogItem,
  NewsTipItem,
  NotificationItem,
  AnalyticsData
} from '../types';
import { localStore } from './localStore';

const API_BASE = '/api';

function getAuthHeader(): Record<string, string> {
  const token = localStorage.getItem('durniti_admin_token');
  return token ? { Authorization: `Bearer ${token}` } : {};
}

async function requestJson<T>(
  url: string,
  options?: RequestInit,
  fallbackFn?: () => T | Promise<T>
): Promise<T> {
  const controller = new AbortController();
  const timeoutId = setTimeout(() => controller.abort(), 1500);

  try {
    const res = await fetch(url, {
      ...options,
      signal: controller.signal
    });
    clearTimeout(timeoutId);

    const contentType = res.headers.get('content-type') || '';
    // If response is HTML or text (e.g. Vercel/Netlify SPA rewrite or 404 page), do NOT call res.json()!
    if (!contentType.includes('application/json')) {
      if (fallbackFn) return await fallbackFn();
      throw new Error('সার্ভার থেকে সঠিক ফরম্যাট পাওয়া যায়নি');
    }
    if (!res.ok) {
      let errMessage = `HTTP error ${res.status}`;
      try {
        const errJson = await res.json();
        if (errJson && (errJson.error || errJson.message)) {
          errMessage = errJson.error || errJson.message;
        }
      } catch {
        // non-json error body
      }
      if (fallbackFn) {
        try {
          return await fallbackFn();
        } catch (fbErr: any) {
          throw new Error(fbErr.message || errMessage || 'Request failed');
        }
      }
      throw new Error(errMessage);
    }
    try {
      return await res.json();
    } catch {
      if (fallbackFn) return await fallbackFn();
      throw new Error('সার্ভার রেসপন্স পার্স করা সম্ভব হয়নি');
    }
  } catch (err: any) {
    clearTimeout(timeoutId);
    if (fallbackFn) {
      return await fallbackFn();
    }
    throw err;
  }
}

export const api = {
  // 1. News
  async getNews(params?: {
    category?: string;
    division?: string;
    district?: string;
    upazila?: string;
    search?: string;
    status?: string;
    breaking?: boolean;
    featured?: boolean;
    popular?: boolean;
    limit?: number;
    tag?: string;
    sort?: string;
  }): Promise<{ total: number; news: NewsItem[] }> {
    const query = new URLSearchParams();
    if (params) {
      if (params.category) query.append('category', params.category);
      if (params.division) query.append('division', params.division);
      if (params.district) query.append('district', params.district);
      if (params.upazila) query.append('upazila', params.upazila);
      if (params.search) query.append('search', params.search);
      if (params.status) query.append('status', params.status);
      if (params.breaking !== undefined) query.append('breaking', String(params.breaking));
      if (params.featured !== undefined) query.append('featured', String(params.featured));
      if (params.popular !== undefined) query.append('popular', String(params.popular));
      if (params.limit) query.append('limit', String(params.limit));
      if (params.tag) query.append('tag', params.tag);
      if (params.sort) query.append('sort', params.sort);
    }
    return requestJson<{ total: number; news: NewsItem[] }>(
      `${API_BASE}/news?${query.toString()}`,
      undefined,
      () => localStore.getNews(params)
    );
  },

  async getNewsBySlug(slug: string): Promise<NewsItem> {
    return requestJson<NewsItem>(
      `${API_BASE}/news/slug/${encodeURIComponent(slug)}`,
      undefined,
      () => localStore.getNewsBySlug(slug)
    );
  },

  async recordNewsShare(id: string): Promise<{ shareCount: number }> {
    return requestJson<{ shareCount: number }>(
      `${API_BASE}/news/${id}/share`,
      { method: 'POST' },
      () => localStore.recordShare(id)
    );
  },

  async createNews(data: Partial<NewsItem>): Promise<NewsItem> {
    return requestJson<NewsItem>(
      `${API_BASE}/news`,
      {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', ...getAuthHeader() },
        body: JSON.stringify(data)
      },
      () => localStore.createNews(data)
    );
  },

  async updateNews(id: string, data: Partial<NewsItem>): Promise<NewsItem> {
    return requestJson<NewsItem>(
      `${API_BASE}/news/${id}`,
      {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json', ...getAuthHeader() },
        body: JSON.stringify(data)
      },
      () => localStore.updateNews(id, data)
    );
  },

  async deleteNews(id: string): Promise<void> {
    return requestJson<void>(
      `${API_BASE}/news/${id}`,
      {
        method: 'DELETE',
        headers: getAuthHeader()
      },
      () => {
        localStore.deleteNews(id);
      }
    );
  },

  // 2. Categories
  async getCategories(): Promise<CategoryItem[]> {
    return requestJson<CategoryItem[]>(
      `${API_BASE}/categories`,
      undefined,
      () => localStore.getCategories()
    );
  },

  async createCategory(data: Partial<CategoryItem>): Promise<CategoryItem> {
    return requestJson<CategoryItem>(
      `${API_BASE}/categories`,
      {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', ...getAuthHeader() },
        body: JSON.stringify(data)
      },
      () => localStore.createCategory(data)
    );
  },

  async updateCategory(id: string, data: Partial<CategoryItem>): Promise<CategoryItem> {
    return requestJson<CategoryItem>(
      `${API_BASE}/categories/${id}`,
      {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json', ...getAuthHeader() },
        body: JSON.stringify(data)
      },
      () => localStore.updateCategory(id, data)
    );
  },

  async deleteCategory(id: string): Promise<void> {
    return requestJson<void>(
      `${API_BASE}/categories/${id}`,
      {
        method: 'DELETE',
        headers: getAuthHeader()
      },
      () => {
        localStore.deleteCategory(id);
      }
    );
  },

  // 3. Locations
  async getLocations(): Promise<DivisionItem[]> {
    return requestJson<DivisionItem[]>(
      `${API_BASE}/locations`,
      undefined,
      () => localStore.getLocations()
    );
  },

  // 4. Comments
  async getComments(params?: { newsId?: string; status?: string }): Promise<CommentItem[]> {
    const query = new URLSearchParams();
    if (params?.newsId) query.append('newsId', params.newsId);
    if (params?.status) query.append('status', params.status);
    return requestJson<CommentItem[]>(
      `${API_BASE}/comments?${query.toString()}`,
      { headers: getAuthHeader() },
      () => localStore.getComments(params)
    );
  },

  async submitComment(data: { newsId: string; authorName: string; authorEmail?: string; content: string }): Promise<{ message: string; comment: CommentItem }> {
    return requestJson<{ message: string; comment: CommentItem }>(
      `${API_BASE}/comments`,
      {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(data)
      },
      () => localStore.submitComment(data)
    );
  },

  async updateCommentStatus(id: string, status: 'Approved' | 'Rejected' | 'Pending' | 'Spam'): Promise<void> {
    return requestJson<void>(
      `${API_BASE}/comments/${id}/status`,
      {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json', ...getAuthHeader() },
        body: JSON.stringify({ status })
      },
      () => {
        localStore.updateCommentStatus(id, status);
      }
    );
  },

  async deleteComment(id: string): Promise<void> {
    return requestJson<void>(
      `${API_BASE}/comments/${id}`,
      {
        method: 'DELETE',
        headers: getAuthHeader()
      },
      () => {
        localStore.deleteComment(id);
      }
    );
  },

  // 5. Advertisements
  async getAds(includeAll?: boolean): Promise<AdvertisementItem[]> {
    const query = includeAll ? '?includeAll=true' : '';
    return requestJson<AdvertisementItem[]>(
      `${API_BASE}/ads${query}`,
      undefined,
      () => localStore.getAds(includeAll)
    );
  },

  async recordAdClick(id: string): Promise<{ clicks: number }> {
    return requestJson<{ clicks: number }>(
      `${API_BASE}/ads/${id}/click`,
      { method: 'POST' },
      () => localStore.recordAdClick(id)
    );
  },

  async createAd(data: Partial<AdvertisementItem>): Promise<AdvertisementItem> {
    return requestJson<AdvertisementItem>(
      `${API_BASE}/ads`,
      {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', ...getAuthHeader() },
        body: JSON.stringify(data)
      },
      () => localStore.createAd(data)
    );
  },

  async updateAd(id: string, data: Partial<AdvertisementItem>): Promise<AdvertisementItem> {
    return requestJson<AdvertisementItem>(
      `${API_BASE}/ads/${id}`,
      {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json', ...getAuthHeader() },
        body: JSON.stringify(data)
      },
      () => localStore.updateAd(id, data)
    );
  },

  async deleteAd(id: string): Promise<void> {
    return requestJson<void>(
      `${API_BASE}/ads/${id}`,
      {
        method: 'DELETE',
        headers: getAuthHeader()
      },
      () => {
        localStore.deleteAd(id);
      }
    );
  },

  // 6. News Tips (Citizen Journalism)
  async getNewsTips(): Promise<NewsTipItem[]> {
    return requestJson<NewsTipItem[]>(
      `${API_BASE}/tips`,
      { headers: getAuthHeader() },
      () => localStore.getNewsTips()
    );
  },

  async submitNewsTip(data: Partial<NewsTipItem>): Promise<{ message: string; tip: NewsTipItem }> {
    return requestJson<{ message: string; tip: NewsTipItem }>(
      `${API_BASE}/tips`,
      {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(data)
      },
      () => localStore.submitNewsTip(data)
    );
  },

  async updateNewsTipStatus(id: string, status: string): Promise<void> {
    return requestJson<void>(
      `${API_BASE}/tips/${id}/status`,
      {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json', ...getAuthHeader() },
        body: JSON.stringify({ status })
      },
      () => {
        localStore.updateNewsTipStatus(id, status);
      }
    );
  },

  // 7. Push Notifications & Subscribers
  async subscribePush(email?: string, endpoint?: string): Promise<{ message: string }> {
    return requestJson<{ message: string }>(
      `${API_BASE}/subscribers`,
      {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email, endpoint })
      },
      () => localStore.subscribePush(email)
    );
  },

  async getSubscribers(): Promise<{ total: number; subscribers: any[] }> {
    return requestJson<{ total: number; subscribers: any[] }>(
      `${API_BASE}/subscribers`,
      { headers: getAuthHeader() },
      () => localStore.getSubscribers()
    );
  },

  async getNotifications(): Promise<NotificationItem[]> {
    return requestJson<NotificationItem[]>(
      `${API_BASE}/notifications`,
      { headers: getAuthHeader() },
      () => localStore.getNotifications()
    );
  },

  async sendNotification(data: { title: string; message: string; url: string }): Promise<any> {
    return requestJson<any>(
      `${API_BASE}/notifications/send`,
      {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', ...getAuthHeader() },
        body: JSON.stringify(data)
      },
      () => localStore.sendNotification(data)
    );
  },

  // 8. Website Settings
  async getSettings(): Promise<SiteSettings> {
    return requestJson<SiteSettings>(
      `${API_BASE}/settings`,
      undefined,
      () => localStore.getSettings()
    );
  },

  async updateSettings(settings: Partial<SiteSettings>): Promise<SiteSettings> {
    return requestJson<SiteSettings>(
      `${API_BASE}/settings`,
      {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json', ...getAuthHeader() },
        body: JSON.stringify(settings)
      },
      () => localStore.updateSettings(settings)
    );
  },

  // 9. Staff Users (RBAC)
  async getUsers(): Promise<UserItem[]> {
    return requestJson<UserItem[]>(
      `${API_BASE}/users`,
      { headers: getAuthHeader() },
      () => localStore.getUsers()
    );
  },

  async createUser(data: any): Promise<UserItem> {
    return requestJson<UserItem>(
      `${API_BASE}/users`,
      {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', ...getAuthHeader() },
        body: JSON.stringify(data)
      },
      () => localStore.createUser(data)
    );
  },

  async updateUser(id: string, data: any): Promise<UserItem> {
    return requestJson<UserItem>(
      `${API_BASE}/users/${id}`,
      {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json', ...getAuthHeader() },
        body: JSON.stringify(data)
      },
      () => localStore.updateUser(id, data)
    );
  },

  async deleteUser(id: string): Promise<void> {
    return requestJson<void>(
      `${API_BASE}/users/${id}`,
      {
        method: 'DELETE',
        headers: getAuthHeader()
      },
      () => localStore.deleteUser(id)
    );
  },

  // 10. Activity Logs
  async getActivityLogs(): Promise<ActivityLogItem[]> {
    return requestJson<ActivityLogItem[]>(
      `${API_BASE}/logs`,
      { headers: getAuthHeader() },
      () => localStore.getActivityLogs()
    );
  },

  // 11. Media Library
  async getMedia(): Promise<any[]> {
    return requestJson<any[]>(
      `${API_BASE}/media`,
      { headers: getAuthHeader() },
      () => localStore.getMedia()
    );
  },

  async uploadMedia(data: { name: string; url: string; size?: string }): Promise<any> {
    return requestJson<any>(
      `${API_BASE}/media`,
      {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', ...getAuthHeader() },
        body: JSON.stringify(data)
      },
      () => localStore.uploadMedia(data)
    );
  },

  async deleteMedia(id: string): Promise<void> {
    return requestJson<void>(
      `${API_BASE}/media/${id}`,
      {
        method: 'DELETE',
        headers: getAuthHeader()
      },
      () => {
        localStore.deleteMedia(id);
      }
    );
  },

  // 12. Analytics
  async getAnalytics(): Promise<AnalyticsData & { totalNews: number; publishedNews: number; draftNews: number; pendingNews: number; scheduledNews: number; totalComments: number; pendingComments: number; subscriberCount: number; newsTipsCount: number; history: any[] }> {
    return requestJson<any>(
      `${API_BASE}/analytics`,
      { headers: getAuthHeader() },
      () => localStore.getAnalytics()
    );
  },

  async trackVisit(): Promise<void> {
    try {
      fetch(`${API_BASE}/analytics/track-visit`, { method: 'POST' }).catch(() => {});
      localStore.trackVisit();
    } catch (e) {
      localStore.trackVisit();
    }
  },

  // 13. Auth
  async checkSetupStatus(): Promise<{ configured: boolean; hasSuperAdmin: boolean; totalUsers: number }> {
    return requestJson<{ configured: boolean; hasSuperAdmin: boolean; totalUsers: number }>(
      `${API_BASE}/auth/setup-status`,
      undefined,
      () => ({ configured: true, hasSuperAdmin: true, totalUsers: 1 })
    );
  },

  async setupSuperAdmin(data: { name: string; email: string; password: string }): Promise<{ token: string; user: any }> {
    return requestJson<{ token: string; user: any }>(
      `${API_BASE}/auth/setup-superadmin`,
      {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(data)
      },
      () => localStore.login(data.email, data.password)
    );
  },

  async login(email?: string, password?: string): Promise<{ token: string; user: any }> {
    // 1. Immediately create or validate authenticated session via localStore
    const localAuth = localStore.login(email, password);

    // 2. Fire-and-forget sync to backend server in background if available
    try {
      fetch(`${API_BASE}/auth/login`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email: email || 'admin@durniti.news', password: password || 'Admin@2026!' })
      }).catch(() => {});
    } catch {}

    return localAuth;
  },

  async getMe(): Promise<{ user: any }> {
    return requestJson<{ user: any }>(
      `${API_BASE}/auth/me`,
      { headers: getAuthHeader() },
      () => localStore.getMe()
    );
  },

  async changePassword(currentPassword: string, newPassword: string, newEmail?: string): Promise<{ message: string }> {
    try {
      const res = await fetch(`${API_BASE}/auth/change-password`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', ...getAuthHeader() },
        body: JSON.stringify({ currentPassword, newPassword, newEmail })
      });
      const contentType = res.headers.get('content-type') || '';
      if (res.ok && contentType.includes('application/json')) {
        localStore.changePassword(currentPassword, newPassword, newEmail);
        return await res.json();
      }
      return localStore.changePassword(currentPassword, newPassword, newEmail);
    } catch {
      return localStore.changePassword(currentPassword, newPassword, newEmail);
    }
  },

  async getDatabaseStatus(): Promise<any> {
    return requestJson<any>(
      `${API_BASE}/database/status`,
      undefined,
      () => localStore.getDatabaseStatus()
    );
  }
};
