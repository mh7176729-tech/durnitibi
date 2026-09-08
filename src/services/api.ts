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

const API_BASE = '/api';

function getAuthHeader(): Record<string, string> {
  const token = localStorage.getItem('durniti_admin_token');
  return token ? { Authorization: `Bearer ${token}` } : {};
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
    const res = await fetch(`${API_BASE}/news?${query.toString()}`);
    if (!res.ok) throw new Error('Failed to fetch news');
    return res.json();
  },

  async getNewsBySlug(slug: string): Promise<NewsItem> {
    const res = await fetch(`${API_BASE}/news/slug/${encodeURIComponent(slug)}`);
    if (!res.ok) throw new Error('News not found');
    return res.json();
  },

  async recordNewsShare(id: string): Promise<{ shareCount: number }> {
    const res = await fetch(`${API_BASE}/news/${id}/share`, { method: 'POST' });
    return res.json();
  },

  async createNews(data: Partial<NewsItem>): Promise<NewsItem> {
    const res = await fetch(`${API_BASE}/news`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json', ...getAuthHeader() },
      body: JSON.stringify(data)
    });
    if (!res.ok) {
      const err = await res.json();
      throw new Error(err.error || 'Failed to create news');
    }
    return res.json();
  },

  async updateNews(id: string, data: Partial<NewsItem>): Promise<NewsItem> {
    const res = await fetch(`${API_BASE}/news/${id}`, {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json', ...getAuthHeader() },
      body: JSON.stringify(data)
    });
    if (!res.ok) {
      const err = await res.json();
      throw new Error(err.error || 'Failed to update news');
    }
    return res.json();
  },

  async deleteNews(id: string): Promise<void> {
    const res = await fetch(`${API_BASE}/news/${id}`, {
      method: 'DELETE',
      headers: getAuthHeader()
    });
    if (!res.ok) throw new Error('Failed to delete news');
  },

  // 2. Categories
  async getCategories(): Promise<CategoryItem[]> {
    const res = await fetch(`${API_BASE}/categories`);
    if (!res.ok) throw new Error('Failed to fetch categories');
    return res.json();
  },

  async createCategory(data: Partial<CategoryItem>): Promise<CategoryItem> {
    const res = await fetch(`${API_BASE}/categories`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json', ...getAuthHeader() },
      body: JSON.stringify(data)
    });
    if (!res.ok) throw new Error('Failed to create category');
    return res.json();
  },

  async updateCategory(id: string, data: Partial<CategoryItem>): Promise<CategoryItem> {
    const res = await fetch(`${API_BASE}/categories/${id}`, {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json', ...getAuthHeader() },
      body: JSON.stringify(data)
    });
    if (!res.ok) throw new Error('Failed to update category');
    return res.json();
  },

  async deleteCategory(id: string): Promise<void> {
    const res = await fetch(`${API_BASE}/categories/${id}`, {
      method: 'DELETE',
      headers: getAuthHeader()
    });
    if (!res.ok) throw new Error('Failed to delete category');
  },

  // 3. Locations
  async getLocations(): Promise<DivisionItem[]> {
    const res = await fetch(`${API_BASE}/locations`);
    if (!res.ok) throw new Error('Failed to fetch locations');
    return res.json();
  },

  // 4. Comments
  async getComments(params?: { newsId?: string; status?: string }): Promise<CommentItem[]> {
    const query = new URLSearchParams();
    if (params?.newsId) query.append('newsId', params.newsId);
    if (params?.status) query.append('status', params.status);
    const res = await fetch(`${API_BASE}/comments?${query.toString()}`, {
      headers: getAuthHeader()
    });
    if (!res.ok) throw new Error('Failed to fetch comments');
    return res.json();
  },

  async submitComment(data: { newsId: string; authorName: string; authorEmail?: string; content: string }): Promise<{ message: string; comment: CommentItem }> {
    const res = await fetch(`${API_BASE}/comments`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(data)
    });
    if (!res.ok) throw new Error('Failed to submit comment');
    return res.json();
  },

  async updateCommentStatus(id: string, status: string): Promise<void> {
    const res = await fetch(`${API_BASE}/comments/${id}/status`, {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json', ...getAuthHeader() },
      body: JSON.stringify({ status })
    });
    if (!res.ok) throw new Error('Failed to update comment');
  },

  async deleteComment(id: string): Promise<void> {
    const res = await fetch(`${API_BASE}/comments/${id}`, {
      method: 'DELETE',
      headers: getAuthHeader()
    });
    if (!res.ok) throw new Error('Failed to delete comment');
  },

  // 5. Advertisements
  async getAds(all = false): Promise<AdvertisementItem[]> {
    const query = all ? '?all=true' : '';
    const res = await fetch(`${API_BASE}/ads${query}`, {
      headers: getAuthHeader()
    });
    if (!res.ok) throw new Error('Failed to fetch ads');
    return res.json();
  },

  async createAd(data: Partial<AdvertisementItem>): Promise<AdvertisementItem> {
    const res = await fetch(`${API_BASE}/ads`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json', ...getAuthHeader() },
      body: JSON.stringify(data)
    });
    if (!res.ok) throw new Error('Failed to create ad');
    return res.json();
  },

  async updateAd(id: string, data: Partial<AdvertisementItem>): Promise<AdvertisementItem> {
    const res = await fetch(`${API_BASE}/ads/${id}`, {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json', ...getAuthHeader() },
      body: JSON.stringify(data)
    });
    if (!res.ok) throw new Error('Failed to update ad');
    return res.json();
  },

  async recordAdClick(id: string): Promise<void> {
    await fetch(`${API_BASE}/ads/${id}/click`, { method: 'POST' });
  },

  async deleteAd(id: string): Promise<void> {
    const res = await fetch(`${API_BASE}/ads/${id}`, {
      method: 'DELETE',
      headers: getAuthHeader()
    });
    if (!res.ok) throw new Error('Failed to delete ad');
  },

  // 6. Citizen News Tips
  async submitNewsTip(data: { name: string; contact: string; email: string; title: string; location: string; description: string; attachmentUrl?: string }): Promise<{ message: string }> {
    const res = await fetch(`${API_BASE}/tips`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(data)
    });
    if (!res.ok) throw new Error('Failed to submit news tip');
    return res.json();
  },

  async getNewsTips(): Promise<NewsTipItem[]> {
    const res = await fetch(`${API_BASE}/tips`, { headers: getAuthHeader() });
    if (!res.ok) throw new Error('Failed to fetch news tips');
    return res.json();
  },

  async updateNewsTipStatus(id: string, status: string): Promise<void> {
    const res = await fetch(`${API_BASE}/tips/${id}/status`, {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json', ...getAuthHeader() },
      body: JSON.stringify({ status })
    });
    if (!res.ok) throw new Error('Failed to update news tip');
  },

  // 7. Push Notifications & Subscribers
  async subscribePush(email?: string, endpoint?: string): Promise<{ message: string }> {
    const res = await fetch(`${API_BASE}/subscribers`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ email, endpoint })
    });
    if (!res.ok) throw new Error('Failed to subscribe');
    return res.json();
  },

  async getSubscribers(): Promise<{ total: number; subscribers: any[] }> {
    const res = await fetch(`${API_BASE}/subscribers`, { headers: getAuthHeader() });
    if (!res.ok) throw new Error('Failed to fetch subscribers');
    return res.json();
  },

  async getNotifications(): Promise<NotificationItem[]> {
    const res = await fetch(`${API_BASE}/notifications`, { headers: getAuthHeader() });
    if (!res.ok) throw new Error('Failed to fetch notifications');
    return res.json();
  },

  async sendNotification(data: { title: string; message: string; url: string }): Promise<any> {
    const res = await fetch(`${API_BASE}/notifications/send`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json', ...getAuthHeader() },
      body: JSON.stringify(data)
    });
    if (!res.ok) throw new Error('Failed to send notification');
    return res.json();
  },

  // 8. Website Settings
  async getSettings(): Promise<SiteSettings> {
    const res = await fetch(`${API_BASE}/settings`);
    if (!res.ok) throw new Error('Failed to fetch settings');
    return res.json();
  },

  async updateSettings(settings: Partial<SiteSettings>): Promise<SiteSettings> {
    const res = await fetch(`${API_BASE}/settings`, {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json', ...getAuthHeader() },
      body: JSON.stringify(settings)
    });
    if (!res.ok) throw new Error('Failed to update settings');
    const data = await res.json();
    return data.settings;
  },

  // 9. Staff Users (RBAC)
  async getUsers(): Promise<UserItem[]> {
    const res = await fetch(`${API_BASE}/users`, { headers: getAuthHeader() });
    if (!res.ok) throw new Error('Failed to fetch users');
    return res.json();
  },

  async createUser(data: any): Promise<UserItem> {
    const res = await fetch(`${API_BASE}/users`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json', ...getAuthHeader() },
      body: JSON.stringify(data)
    });
    if (!res.ok) {
      const err = await res.json();
      throw new Error(err.error || 'Failed to create user');
    }
    return res.json();
  },

  async updateUser(id: string, data: any): Promise<UserItem> {
    const res = await fetch(`${API_BASE}/users/${id}`, {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json', ...getAuthHeader() },
      body: JSON.stringify(data)
    });
    if (!res.ok) {
      const err = await res.json();
      throw new Error(err.error || 'Failed to update user');
    }
    return res.json();
  },

  async deleteUser(id: string): Promise<void> {
    const res = await fetch(`${API_BASE}/users/${id}`, {
      method: 'DELETE',
      headers: getAuthHeader()
    });
    if (!res.ok) throw new Error('Failed to delete user');
  },

  // 10. Activity Logs
  async getActivityLogs(): Promise<ActivityLogItem[]> {
    const res = await fetch(`${API_BASE}/activity-logs`, { headers: getAuthHeader() });
    if (!res.ok) throw new Error('Failed to fetch activity logs');
    return res.json();
  },

  // 11. Media Library
  async getMedia(): Promise<any[]> {
    const res = await fetch(`${API_BASE}/media`, { headers: getAuthHeader() });
    if (!res.ok) throw new Error('Failed to fetch media');
    return res.json();
  },

  async uploadMedia(data: { name: string; url: string; size?: string }): Promise<any> {
    const res = await fetch(`${API_BASE}/media`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json', ...getAuthHeader() },
      body: JSON.stringify(data)
    });
    if (!res.ok) throw new Error('Failed to upload media');
    return res.json();
  },

  async deleteMedia(id: string): Promise<void> {
    const res = await fetch(`${API_BASE}/media/${id}`, {
      method: 'DELETE',
      headers: getAuthHeader()
    });
    if (!res.ok) throw new Error('Failed to delete media');
  },

  // 12. Analytics
  async getAnalytics(): Promise<AnalyticsData & { totalNews: number; publishedNews: number; draftNews: number; pendingNews: number; scheduledNews: number; totalComments: number; pendingComments: number; subscriberCount: number; newsTipsCount: number; history: any[] }> {
    const res = await fetch(`${API_BASE}/analytics`, { headers: getAuthHeader() });
    if (!res.ok) throw new Error('Failed to fetch analytics');
    return res.json();
  },

  async trackVisit(): Promise<void> {
    fetch(`${API_BASE}/analytics/track-visit`, { method: 'POST' }).catch(() => {});
  },

  // 13. Auth
  async checkSetupStatus(): Promise<{ configured: boolean; hasSuperAdmin: boolean; totalUsers: number }> {
    const res = await fetch(`${API_BASE}/auth/setup-status`);
    return res.json();
  },

  async setupSuperAdmin(data: { name: string; email: string; password: string }): Promise<{ token: string; user: any }> {
    const res = await fetch(`${API_BASE}/auth/setup-superadmin`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(data)
    });
    if (!res.ok) {
      const err = await res.json();
      throw new Error(err.error || 'Failed to setup super admin');
    }
    return res.json();
  },

  async login(email: string, password: string): Promise<{ token: string; user: any }> {
    const res = await fetch(`${API_BASE}/auth/login`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ email, password })
    });
    if (!res.ok) {
      const err = await res.json();
      throw new Error(err.error || 'Login failed');
    }
    return res.json();
  },

  async getMe(): Promise<{ user: any }> {
    const res = await fetch(`${API_BASE}/auth/me`, { headers: getAuthHeader() });
    if (!res.ok) throw new Error('Not authenticated');
    return res.json();
  },

  async changePassword(currentPassword: string, newPassword: string): Promise<{ message: string }> {
    const res = await fetch(`${API_BASE}/auth/change-password`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json', ...getAuthHeader() },
      body: JSON.stringify({ currentPassword, newPassword })
    });
    if (!res.ok) {
      const err = await res.json();
      throw new Error(err.error || 'Failed to change password');
    }
    return res.json();
  },

  async getDatabaseStatus(): Promise<any> {
    try {
      const res = await fetch(`${API_BASE}/database/status`);
      if (!res.ok) return { mode: 'local_json', isCloud: false, message: 'Local Mode' };
      return res.json();
    } catch (e) {
      return { mode: 'local_json', isCloud: false, message: 'Local Mode' };
    }
  }
};
