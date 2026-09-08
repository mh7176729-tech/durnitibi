import express, { Request, Response, NextFunction } from 'express';
import {
  loadDB,
  saveDB,
  logAction,
  hashPassword,
  verifyPassword,
  createToken,
  verifyToken,
  getDatabaseStatus,
  syncFromSupabaseIfAvailable
} from './db';
import { NewsItem, CategoryItem, AdvertisementItem, CommentItem, NewsTipItem, SubscriberItem, NotificationItem } from '../types';

export interface AuthenticatedRequest extends Request {
  user?: {
    id: string;
    name: string;
    email: string;
    role: string;
  };
}

export function requireAuth(allowedRoles?: string[]) {
  return (req: AuthenticatedRequest, res: Response, next: NextFunction) => {
    const authHeader = req.headers.authorization;
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      return res.status(401).json({ error: 'Authentication required' });
    }
    const token = authHeader.split(' ')[1];
    const decoded = verifyToken(token);
    if (!decoded) {
      return res.status(401).json({ error: 'Invalid or expired session token' });
    }

    const db = loadDB();
    const user = db.users.find(u => u.id === decoded.id && u.isActive);
    if (!user) {
      return res.status(403).json({ error: 'User not found or disabled' });
    }

    req.user = { id: user.id, name: user.name, email: user.email, role: user.role };

    if (allowedRoles && allowedRoles.length > 0 && !allowedRoles.includes(user.role)) {
      return res.status(403).json({ error: 'Insufficient permissions for this action' });
    }

    next();
  };
}

export function createApiApp() {
  const app = express();

  // Strip Netlify Functions prefix if invoked via /.netlify/functions/api/...
  app.use((req, res, next) => {
    if (req.url.startsWith('/.netlify/functions/api')) {
      req.url = req.url.replace('/.netlify/functions/api', '/api');
    }
    next();
  });

  // Body Parsing middleware
  app.use(express.json({ limit: '10mb' }));
  app.use(express.urlencoded({ extended: true, limit: '10mb' }));

  // Kick off background cloud DB sync if configured
  syncFromSupabaseIfAvailable().catch(e => console.error('[API] Initial Supabase sync check:', e));

  // Auto-publish scheduled news check helper
  const checkScheduledNews = () => {
    const db = loadDB();
    const now = new Date();
    const currentDate = now.toISOString().slice(0, 10);
    const currentTime = now.toTimeString().slice(0, 5);

    let updated = false;
    db.news.forEach(item => {
      if (item.status === 'Scheduled') {
        if (item.publishDate < currentDate || (item.publishDate === currentDate && item.publishTime <= currentTime)) {
          item.status = 'Published';
          updated = true;
          logAction('system', 'System Cron', 'Automated', 'Auto-Published Scheduled News', `News "${item.titleBn}" auto-published.`);
        }
      }
    });
    if (updated) saveDB(db);
  };

  // Run scheduled news check periodically (in long-running Node) or on requests (in serverless)
  try {
    setInterval(checkScheduledNews, 60000);
  } catch (e) {
    // Ignored in restricted environments
  }

  // -------------------------------------------------------------
  // API ROUTES
  // -------------------------------------------------------------

  // Health check & Serverless Info
  app.get(['/api/health', '/health'], (req, res) => {
    res.json({
      status: 'ok',
      portal: 'দুর্নীতির বিরুদ্ধে নিউজ (Durniti Biruddhe News)',
      runtime: process.env.NETLIFY ? 'Netlify Functions (Serverless)' : 'Node.js Express',
      timestamp: new Date().toISOString()
    });
  });

  // Database Connection Status check (Supabase / Local)
  app.get(['/api/database/status', '/database/status'], (req, res) => {
    const status = getDatabaseStatus();
    res.json(status);
  });

  // 1. AUTHENTICATION & SETUP
  app.get('/api/auth/setup-status', (req, res) => {
    const db = loadDB();
    const hasSuperAdmin = db.users.some(u => u.role === 'Super Admin' && u.isActive);
    res.json({
      configured: true,
      hasSuperAdmin,
      totalUsers: db.users.length
    });
  });

  app.post('/api/auth/setup-superadmin', (req, res) => {
    const db = loadDB();
    const { name, email, password } = req.body;
    if (!name || !email || !password) {
      return res.status(400).json({ error: 'Name, email, and password are required' });
    }

    const existingUser = db.users.find(u => u.email.toLowerCase() === email.toLowerCase());
    if (existingUser) {
      return res.status(400).json({ error: 'User with this email already exists' });
    }

    const newUser = {
      id: `user-${Date.now()}`,
      name,
      email: email.toLowerCase(),
      role: 'Super Admin' as const,
      isActive: true,
      createdAt: new Date().toISOString(),
      passwordHash: hashPassword(password)
    };

    db.users.push(newUser);
    logAction(newUser.id, newUser.name, 'Super Admin', 'Super Admin Account Created', `Created Super Admin account for ${email}`);
    saveDB(db);

    const token = createToken({ id: newUser.id, name: newUser.name, email: newUser.email, role: newUser.role });
    res.json({
      success: true,
      token,
      user: { id: newUser.id, name: newUser.name, email: newUser.email, role: newUser.role }
    });
  });

  app.post('/api/auth/login', (req, res) => {
    const db = loadDB();
    const { email, password } = req.body;
    if (!email || !password) {
      return res.status(400).json({ error: 'Email and password are required' });
    }

    const user = db.users.find(u => u.email.toLowerCase() === email.toLowerCase().trim());
    if (!user) {
      return res.status(401).json({ error: 'ভুল ইমেইল বা পাসওয়ার্ড (Invalid credentials)' });
    }

    if (!user.isActive) {
      return res.status(403).json({ error: 'আপনার অ্যাকাউন্টটি নিষ্ক্রিয় করা আছে (Account disabled)' });
    }

    if (!verifyPassword(password, user.passwordHash)) {
      return res.status(401).json({ error: 'ভুল ইমেইল বা পাসওয়ার্ড (Invalid credentials)' });
    }

    user.lastLogin = new Date().toISOString();
    logAction(user.id, user.name, user.role, 'User Login', `Staff logged in from IP: ${req.ip || 'web'}`);
    saveDB(db);

    const token = createToken({ id: user.id, name: user.name, email: user.email, role: user.role });
    res.json({
      success: true,
      token,
      user: { id: user.id, name: user.name, email: user.email, role: user.role }
    });
  });

  app.get('/api/auth/me', requireAuth(), (req: AuthenticatedRequest, res) => {
    res.json({ user: req.user });
  });

  app.post('/api/auth/change-password', requireAuth(), (req: AuthenticatedRequest, res) => {
    const db = loadDB();
    const { currentPassword, newPassword } = req.body;
    if (!currentPassword || !newPassword) {
      return res.status(400).json({ error: 'Current and new password are required' });
    }

    const user = db.users.find(u => u.id === req.user!.id);
    if (!user || !verifyPassword(currentPassword, user.passwordHash)) {
      return res.status(400).json({ error: 'বর্তমান পাসওয়ার্ড সঠিক নয় (Incorrect current password)' });
    }

    if (newPassword.length < 6) {
      return res.status(400).json({ error: 'পাসওয়ার্ড কমপক্ষে ৬ অক্ষরের হতে হবে' });
    }

    user.passwordHash = hashPassword(newPassword);
    logAction(user.id, user.name, user.role, 'Password Changed', 'User updated account password');
    saveDB(db);
    res.json({ success: true, message: 'পাসওয়ার্ড সফলভাবে পরিবর্তন হয়েছে' });
  });

  // 2. NEWS ENDPOINTS (Public & Admin)
  app.get('/api/news', (req, res) => {
    checkScheduledNews();
    const db = loadDB();
    const {
      category,
      division,
      district,
      upazila,
      search,
      status,
      breaking,
      featured,
      popular,
      limit,
      tag,
      sort
    } = req.query;

    let items = [...db.news];

    // Status filter: Public by default only sees 'Published'
    if (status) {
      items = items.filter(n => n.status === status);
    } else {
      items = items.filter(n => n.status === 'Published');
    }

    if (category) {
      items = items.filter(n => n.categoryId === category || n.categoryNameEn.toLowerCase() === (category as string).toLowerCase());
    }

    if (division) {
      items = items.filter(n => n.division === division);
    }

    if (district) {
      items = items.filter(n => n.district === district);
    }

    if (upazila) {
      items = items.filter(n => n.upazila === upazila);
    }

    if (tag) {
      items = items.filter(n => n.tags && n.tags.includes(tag as string));
    }

    if (breaking === 'true') {
      items = items.filter(n => n.isBreaking);
    }

    if (featured === 'true') {
      items = items.filter(n => n.isFeatured);
    }

    if (popular === 'true') {
      items = items.filter(n => n.isPopular);
    }

    if (search) {
      const q = (search as string).toLowerCase();
      items = items.filter(
        n =>
          n.titleBn.toLowerCase().includes(q) ||
          n.titleEn.toLowerCase().includes(q) ||
          n.shortDescBn.toLowerCase().includes(q) ||
          n.shortDescEn.toLowerCase().includes(q) ||
          (n.tags && n.tags.some(t => t.toLowerCase().includes(q))) ||
          (n.division && n.division.toLowerCase().includes(q)) ||
          (n.district && n.district.toLowerCase().includes(q)) ||
          (n.upazila && n.upazila.toLowerCase().includes(q))
      );
    }

    // Sorting
    if (sort === 'views') {
      items.sort((a, b) => b.viewCount - a.viewCount);
    } else {
      // Default: publishDate & publishTime descending
      items.sort((a, b) => {
        const dtA = `${a.publishDate} ${a.publishTime || '00:00'}`;
        const dtB = `${b.publishDate} ${b.publishTime || '00:00'}`;
        return dtB.localeCompare(dtA);
      });
    }

    if (limit) {
      items = items.slice(0, parseInt(limit as string, 10));
    }

    res.json({ total: items.length, news: items });
  });

  app.get('/api/news/slug/:slug', (req, res) => {
    const db = loadDB();
    const item = db.news.find(n => n.slug === req.params.slug || n.id === req.params.slug);
    if (!item) {
      return res.status(404).json({ error: 'সংবাদটি পাওয়া যায়নি (News not found)' });
    }
    // Auto-increment view count
    item.viewCount = (item.viewCount || 0) + 1;
    db.analytics.pageViews += 1;
    saveDB(db);
    res.json(item);
  });

  app.get('/api/news/:id', (req, res) => {
    const db = loadDB();
    const item = db.news.find(n => n.id === req.params.id);
    if (!item) {
      return res.status(404).json({ error: 'সংবাদটি পাওয়া যায়নি (News not found)' });
    }
    res.json(item);
  });

  app.post('/api/news/:id/share', (req, res) => {
    const db = loadDB();
    const item = db.news.find(n => n.id === req.params.id);
    if (item) {
      item.shareCount = (item.shareCount || 0) + 1;
      saveDB(db);
    }
    res.json({ success: true, shareCount: item?.shareCount || 0 });
  });

  // Admin News CRUD
  app.post('/api/news', requireAuth(['Super Admin', 'Admin', 'Editor']), (req: AuthenticatedRequest, res) => {
    const db = loadDB();
    const data = req.body;
    if (!data.titleBn && !data.titleEn) {
      return res.status(400).json({ error: 'Title is required' });
    }

    let targetStatus = data.status || 'Draft';
    if (req.user?.role === 'Editor' && targetStatus === 'Published') {
      targetStatus = 'Pending Review';
    }

    const slug = data.slug
      ? data.slug.toLowerCase().replace(/[^a-z0-9\u0980-\u09FF-]+/g, '-').replace(/^-+|-+$/g, '')
      : `news-${Date.now()}`;

    const newArticle: NewsItem = {
      id: `news-${Date.now()}`,
      titleBn: data.titleBn || '',
      titleEn: data.titleEn || data.titleBn,
      shortDescBn: data.shortDescBn || '',
      shortDescEn: data.shortDescEn || '',
      contentBn: data.contentBn || '',
      contentEn: data.contentEn || '',
      featuredImage: data.featuredImage || 'https://images.unsplash.com/photo-1585829365295-ab7cd400c167?auto=format&fit=crop&w=1200&q=80',
      additionalImages: data.additionalImages || [],
      videoUrl: data.videoUrl || '',
      categoryId: data.categoryId || 'others',
      categoryNameBn: data.categoryNameBn || 'অন্যান্য',
      categoryNameEn: data.categoryNameEn || 'Others',
      country: data.country || 'Bangladesh',
      division: data.division,
      district: data.district,
      upazila: data.upazila,
      reporterName: data.reporterName || req.user?.name || 'নিজস্ব প্রতিবেদক',
      reporterId: data.reporterId || `REP-${Math.floor(100 + Math.random() * 900)}`,
      source: data.source || 'দুর্নীতির বিরুদ্ধে নিউজ',
      tags: data.tags || [],
      publishDate: data.publishDate || new Date().toISOString().slice(0, 10),
      publishTime: data.publishTime || new Date().toTimeString().slice(0, 5),
      isBreaking: Boolean(data.isBreaking),
      isFeatured: Boolean(data.isFeatured),
      isPopular: Boolean(data.isPopular),
      seoTitle: data.seoTitle,
      seoDescription: data.seoDescription,
      seoKeywords: data.seoKeywords,
      slug,
      status: targetStatus,
      viewCount: 0,
      shareCount: 0,
      accusedStatement: data.accusedStatement || '',
      isFactChecked: Boolean(data.isFactChecked)
    };

    db.news.unshift(newArticle);
    logAction(req.user!.id, req.user!.name, req.user!.role, 'News Created', `Created news: "${newArticle.titleBn || newArticle.titleEn}" (${targetStatus})`);
    saveDB(db);

    res.status(201).json(newArticle);
  });

  app.put('/api/news/:id', requireAuth(['Super Admin', 'Admin', 'Editor', 'Manager']), (req: AuthenticatedRequest, res) => {
    const db = loadDB();
    const index = db.news.findIndex(n => n.id === req.params.id);
    if (index === -1) {
      return res.status(404).json({ error: 'News article not found' });
    }

    const current = db.news[index];
    const data = req.body;

    let targetStatus = data.status !== undefined ? data.status : current.status;
    if (req.user?.role === 'Editor' && targetStatus === 'Published' && current.status !== 'Published') {
      targetStatus = 'Pending Review';
    }

    const updated: NewsItem = {
      ...current,
      ...data,
      status: targetStatus,
      updatedAt: new Date().toISOString().slice(0, 16).replace('T', ' ')
    };

    db.news[index] = updated;
    logAction(req.user!.id, req.user!.name, req.user!.role, 'News Updated', `Updated article: "${updated.titleBn || updated.titleEn}"`);
    saveDB(db);

    res.json(updated);
  });

  app.delete('/api/news/:id', requireAuth(['Super Admin', 'Admin']), (req: AuthenticatedRequest, res) => {
    const db = loadDB();
    const index = db.news.findIndex(n => n.id === req.params.id);
    if (index === -1) {
      return res.status(404).json({ error: 'News not found' });
    }
    const title = db.news[index].titleBn || db.news[index].titleEn;
    db.news.splice(index, 1);
    logAction(req.user!.id, req.user!.name, req.user!.role, 'News Deleted', `Deleted article: "${title}"`);
    saveDB(db);
    res.json({ success: true, message: 'Article deleted successfully' });
  });

  // 3. CATEGORIES
  app.get('/api/categories', (req, res) => {
    const db = loadDB();
    const sorted = [...db.categories].sort((a, b) => a.order - b.order);
    res.json(sorted);
  });

  app.post('/api/categories', requireAuth(['Super Admin', 'Admin']), (req: AuthenticatedRequest, res) => {
    const db = loadDB();
    const { nameBn, nameEn, slug, order } = req.body;
    if (!nameBn || !nameEn) {
      return res.status(400).json({ error: 'Bangla and English names are required' });
    }
    const newCat: CategoryItem = {
      id: `cat-${Date.now()}`,
      nameBn,
      nameEn,
      slug: slug || nameEn.toLowerCase().replace(/\s+/g, '-'),
      order: Number(order) || db.categories.length + 1,
      isActive: true
    };
    db.categories.push(newCat);
    logAction(req.user!.id, req.user!.name, req.user!.role, 'Category Added', `Created category: ${nameBn}`);
    saveDB(db);
    res.status(201).json(newCat);
  });

  app.put('/api/categories/:id', requireAuth(['Super Admin', 'Admin']), (req: AuthenticatedRequest, res) => {
    const db = loadDB();
    const index = db.categories.findIndex(c => c.id === req.params.id);
    if (index === -1) return res.status(404).json({ error: 'Category not found' });
    db.categories[index] = { ...db.categories[index], ...req.body };
    logAction(req.user!.id, req.user!.name, req.user!.role, 'Category Updated', `Updated category: ${db.categories[index].nameBn}`);
    saveDB(db);
    res.json(db.categories[index]);
  });

  app.delete('/api/categories/:id', requireAuth(['Super Admin', 'Admin']), (req: AuthenticatedRequest, res) => {
    const db = loadDB();
    const index = db.categories.findIndex(c => c.id === req.params.id);
    if (index === -1) return res.status(404).json({ error: 'Category not found' });
    const name = db.categories[index].nameBn;
    db.categories.splice(index, 1);
    logAction(req.user!.id, req.user!.name, req.user!.role, 'Category Deleted', `Deleted category: ${name}`);
    saveDB(db);
    res.json({ success: true });
  });

  // 4. LOCATIONS
  app.get('/api/locations', (req, res) => {
    const db = loadDB();
    res.json(db.locations);
  });

  // 5. COMMENTS
  app.get('/api/comments', (req, res) => {
    const db = loadDB();
    const { newsId, status } = req.query;
    let list = [...db.comments];
    if (newsId) {
      list = list.filter(c => c.newsId === newsId);
    }
    if (status) {
      list = list.filter(c => c.status === status);
    } else if (!req.headers.authorization) {
      // Unauthenticated public only sees Approved comments
      list = list.filter(c => c.status === 'Approved');
    }
    res.json(list.reverse());
  });

  app.post('/api/comments', (req, res) => {
    const db = loadDB();
    const { newsId, authorName, authorEmail, content } = req.body;
    if (!newsId || !authorName || !content) {
      return res.status(400).json({ error: 'Name and comment are required' });
    }

    const newsItem = db.news.find(n => n.id === newsId);
    const newComment: CommentItem = {
      id: `comm-${Date.now()}`,
      newsId,
      newsTitle: newsItem?.titleBn || 'News',
      authorName: authorName.trim(),
      authorEmail: (authorEmail || '').trim(),
      content: content.trim(),
      createdAt: new Date().toISOString().slice(0, 16).replace('T', ' '),
      status: db.settings.commentModeration ? 'Pending' : 'Approved'
    };

    db.comments.push(newComment);
    saveDB(db);
    res.status(201).json({
      success: true,
      comment: newComment,
      message: db.settings.commentModeration
        ? 'আপনার মন্তব্যটি পর্যালোচনার জন্য জমা হয়েছে। অনুমোদিত হলে প্রদর্শিত হবে।'
        : 'আপনার মন্তব্য সফলভাবে যুক্ত হয়েছে।'
    });
  });

  app.put('/api/comments/:id/status', requireAuth(['Super Admin', 'Admin', 'Editor', 'Manager']), (req: AuthenticatedRequest, res) => {
    const db = loadDB();
    const { status } = req.body;
    const comment = db.comments.find(c => c.id === req.params.id);
    if (!comment) return res.status(404).json({ error: 'Comment not found' });
    comment.status = status;
    logAction(req.user!.id, req.user!.name, req.user!.role, 'Comment Moderation', `${status} comment from ${comment.authorName}`);
    saveDB(db);
    res.json({ success: true, comment });
  });

  app.delete('/api/comments/:id', requireAuth(['Super Admin', 'Admin', 'Manager']), (req: AuthenticatedRequest, res) => {
    const db = loadDB();
    const index = db.comments.findIndex(c => c.id === req.params.id);
    if (index === -1) return res.status(404).json({ error: 'Comment not found' });
    db.comments.splice(index, 1);
    saveDB(db);
    res.json({ success: true });
  });

  // 6. ADVERTISEMENTS
  app.get('/api/ads', (req, res) => {
    const db = loadDB();
    const { all } = req.query;
    if (all === 'true' && req.headers.authorization) {
      return res.json(db.advertisements);
    }
    const active = db.advertisements.filter(a => a.isActive);
    res.json(active);
  });

  app.post('/api/ads', requireAuth(['Super Admin', 'Admin', 'Manager']), (req: AuthenticatedRequest, res) => {
    const db = loadDB();
    const data = req.body;
    if (!data.title || !data.position) {
      return res.status(400).json({ error: 'Title and position are required' });
    }
    const newAd: AdvertisementItem = {
      id: `ad-${Date.now()}`,
      title: data.title,
      position: data.position,
      type: data.type || 'banner',
      imageUrl: data.imageUrl,
      targetUrl: data.targetUrl,
      scriptCode: data.scriptCode,
      startDate: data.startDate,
      endDate: data.endDate,
      isActive: data.isActive !== undefined ? data.isActive : true,
      impressions: 0,
      clicks: 0
    };
    db.advertisements.push(newAd);
    logAction(req.user!.id, req.user!.name, req.user!.role, 'Ad Created', `Created ad: ${newAd.title} at ${newAd.position}`);
    saveDB(db);
    res.status(201).json(newAd);
  });

  app.put('/api/ads/:id', requireAuth(['Super Admin', 'Admin', 'Manager']), (req: AuthenticatedRequest, res) => {
    const db = loadDB();
    const index = db.advertisements.findIndex(a => a.id === req.params.id);
    if (index === -1) return res.status(404).json({ error: 'Ad not found' });
    db.advertisements[index] = { ...db.advertisements[index], ...req.body };
    saveDB(db);
    res.json(db.advertisements[index]);
  });

  app.post('/api/ads/:id/click', (req, res) => {
    const db = loadDB();
    const ad = db.advertisements.find(a => a.id === req.params.id);
    if (ad) {
      ad.clicks = (ad.clicks || 0) + 1;
      saveDB(db);
    }
    res.json({ success: true });
  });

  app.delete('/api/ads/:id', requireAuth(['Super Admin', 'Admin']), (req: AuthenticatedRequest, res) => {
    const db = loadDB();
    const index = db.advertisements.findIndex(a => a.id === req.params.id);
    if (index === -1) return res.status(404).json({ error: 'Ad not found' });
    db.advertisements.splice(index, 1);
    saveDB(db);
    res.json({ success: true });
  });

  // 7. SUBSCRIBERS & WEB PUSH NOTIFICATIONS
  app.get('/api/subscribers', requireAuth(['Super Admin', 'Admin']), (req, res) => {
    const db = loadDB();
    res.json({ total: db.subscribers.length, subscribers: db.subscribers });
  });

  app.post('/api/subscribers', (req, res) => {
    const db = loadDB();
    const { email, endpoint } = req.body;
    if (!email && !endpoint) {
      return res.status(400).json({ error: 'Email or browser push subscription token required' });
    }

    const existing = db.subscribers.find(s => (email && s.email === email) || (endpoint && s.endpoint === endpoint));
    if (existing) {
      return res.json({ success: true, message: 'ইতিমধ্যে সাবস্ক্রাইব করা আছে (Already subscribed)' });
    }

    const newSub: SubscriberItem = {
      id: `sub-${Date.now()}`,
      email,
      endpoint,
      subscribedAt: new Date().toISOString().slice(0, 16).replace('T', ' ')
    };
    db.subscribers.push(newSub);
    saveDB(db);
    res.status(201).json({ success: true, message: 'সফলভাবে সাবস্ক্রাইব করা হয়েছে! (Subscribed successfully)' });
  });

  app.get('/api/notifications', requireAuth(['Super Admin', 'Admin', 'Editor']), (req, res) => {
    const db = loadDB();
    res.json(db.notifications);
  });

  app.post('/api/notifications/send', requireAuth(['Super Admin', 'Admin']), (req: AuthenticatedRequest, res) => {
    const db = loadDB();
    const { title, message, url } = req.body;
    if (!title || !message) {
      return res.status(400).json({ error: 'Title and message are required' });
    }

    const notification: NotificationItem = {
      id: `notif-${Date.now()}`,
      title,
      message,
      url: url || '/',
      sentAt: new Date().toISOString().slice(0, 16).replace('T', ' '),
      sentBy: req.user!.name,
      recipientCount: db.subscribers.length
    };

    db.notifications.unshift(notification);
    logAction(req.user!.id, req.user!.name, req.user!.role, 'Push Notification Sent', `Sent notification: "${title}" to ${db.subscribers.length} subscribers.`);
    saveDB(db);

    res.json({ success: true, notification, recipientCount: db.subscribers.length });
  });

  // 8. CITIZEN JOURNALISM NEWS TIPS
  app.get('/api/tips', requireAuth(['Super Admin', 'Admin', 'Editor', 'Manager']), (req, res) => {
    const db = loadDB();
    res.json(db.newsTips);
  });

  app.post('/api/tips', (req, res) => {
    const db = loadDB();
    const { name, contact, email, title, location, description, attachmentUrl } = req.body;
    if (!title || !description || (!contact && !email)) {
      return res.status(400).json({ error: 'Title, description and contact details are required' });
    }

    const tip: NewsTipItem = {
      id: `tip-${Date.now()}`,
      name: name || 'গোপনীয় নাগরিক',
      contact: contact || '',
      email: email || '',
      title: title.trim(),
      location: location || 'অনির্ধারিত',
      description: description.trim(),
      attachmentUrl,
      createdAt: new Date().toISOString().slice(0, 16).replace('T', ' '),
      status: 'Pending'
    };

    db.newsTips.unshift(tip);
    saveDB(db);
    res.status(201).json({
      success: true,
      message: 'আপনার সংবাদ ও তথ্য নিরাপদে জমা হয়েছে। আমাদের অনুসন্ধানী দল দ্রুত যাচাই করবে।'
    });
  });

  app.put('/api/tips/:id/status', requireAuth(['Super Admin', 'Admin', 'Editor']), (req: AuthenticatedRequest, res) => {
    const db = loadDB();
    const { status } = req.body;
    const tip = db.newsTips.find(t => t.id === req.params.id);
    if (!tip) return res.status(404).json({ error: 'News tip not found' });
    tip.status = status;
    logAction(req.user!.id, req.user!.name, req.user!.role, 'News Tip Status Changed', `Marked tip "${tip.title}" as ${status}`);
    saveDB(db);
    res.json({ success: true, tip });
  });

  // 9. WEBSITE SETTINGS
  app.get('/api/settings', (req, res) => {
    const db = loadDB();
    res.json(db.settings);
  });

  app.put('/api/settings', requireAuth(['Super Admin']), (req: AuthenticatedRequest, res) => {
    const db = loadDB();
    db.settings = { ...db.settings, ...req.body };
    logAction(req.user!.id, req.user!.name, req.user!.role, 'Settings Updated', 'General website settings updated');
    saveDB(db);
    res.json({ success: true, settings: db.settings });
  });

  // 10. MEDIA LIBRARY
  app.get('/api/media', requireAuth(['Super Admin', 'Admin', 'Editor', 'Manager']), (req, res) => {
    const db = loadDB();
    res.json(db.media);
  });

  app.post('/api/media', requireAuth(['Super Admin', 'Admin', 'Editor', 'Manager']), (req: AuthenticatedRequest, res) => {
    const db = loadDB();
    const { name, url, size } = req.body;
    if (!url) return res.status(400).json({ error: 'Media URL or Data is required' });

    const mediaItem = {
      id: `med-${Date.now()}`,
      name: name || 'uploaded-photo.jpg',
      url,
      size: size || '500 KB',
      createdAt: new Date().toISOString().slice(0, 10)
    };
    db.media.unshift(mediaItem);
    logAction(req.user!.id, req.user!.name, req.user!.role, 'Media Uploaded', `Uploaded: ${mediaItem.name}`);
    saveDB(db);
    res.status(201).json(mediaItem);
  });

  app.delete('/api/media/:id', requireAuth(['Super Admin', 'Admin']), (req: AuthenticatedRequest, res) => {
    const db = loadDB();
    const idx = db.media.findIndex(m => m.id === req.params.id);
    if (idx === -1) return res.status(404).json({ error: 'Media item not found' });
    db.media.splice(idx, 1);
    saveDB(db);
    res.json({ success: true });
  });

  // 11. USER MANAGEMENT (RBAC)
  app.get('/api/users', requireAuth(['Super Admin', 'Admin']), (req, res) => {
    const db = loadDB();
    const safeUsers = db.users.map(({ passwordHash, ...safe }) => safe);
    res.json(safeUsers);
  });

  app.post('/api/users', requireAuth(['Super Admin', 'Admin']), (req: AuthenticatedRequest, res) => {
    const db = loadDB();
    const { name, email, password, role } = req.body;
    if (!name || !email || !password || !role) {
      return res.status(400).json({ error: 'All fields are required' });
    }

    if (req.user?.role !== 'Super Admin' && role === 'Super Admin') {
      return res.status(403).json({ error: 'Only Super Admin can create another Super Admin' });
    }

    const existing = db.users.find(u => u.email.toLowerCase() === email.toLowerCase());
    if (existing) {
      return res.status(400).json({ error: 'User with this email already exists' });
    }

    const newUser = {
      id: `user-${Date.now()}`,
      name,
      email: email.toLowerCase(),
      role,
      isActive: true,
      createdAt: new Date().toISOString(),
      passwordHash: hashPassword(password)
    };

    db.users.push(newUser);
    logAction(req.user!.id, req.user!.name, req.user!.role, 'Staff Created', `Created staff: ${name} (${role})`);
    saveDB(db);

    const { passwordHash, ...safeUser } = newUser;
    res.status(201).json(safeUser);
  });

  app.put('/api/users/:id', requireAuth(['Super Admin', 'Admin']), (req: AuthenticatedRequest, res) => {
    const db = loadDB();
    const user = db.users.find(u => u.id === req.params.id);
    if (!user) return res.status(404).json({ error: 'User not found' });

    const { name, role, isActive, password } = req.body;

    if (req.user?.role !== 'Super Admin' && (role === 'Super Admin' || user.role === 'Super Admin')) {
      return res.status(403).json({ error: 'Only Super Admin can modify Super Admin accounts' });
    }

    if (name) user.name = name;
    if (role) user.role = role;
    if (isActive !== undefined) user.isActive = Boolean(isActive);
    if (password && password.length >= 6) {
      user.passwordHash = hashPassword(password);
    }

    logAction(req.user!.id, req.user!.name, req.user!.role, 'Staff Updated', `Updated staff details: ${user.name}`);
    saveDB(db);

    const { passwordHash, ...safeUser } = user;
    res.json(safeUser);
  });

  app.delete('/api/users/:id', requireAuth(['Super Admin']), (req: AuthenticatedRequest, res) => {
    const db = loadDB();
    if (req.params.id === req.user?.id) {
      return res.status(400).json({ error: 'You cannot delete your own account' });
    }
    const idx = db.users.findIndex(u => u.id === req.params.id);
    if (idx === -1) return res.status(404).json({ error: 'User not found' });

    const name = db.users[idx].name;
    db.users.splice(idx, 1);
    logAction(req.user!.id, req.user!.name, req.user!.role, 'Staff Deleted', `Deleted staff member: ${name}`);
    saveDB(db);

    res.json({ success: true });
  });

  // 12. ACTIVITY LOGS
  app.get('/api/activity-logs', requireAuth(['Super Admin', 'Admin']), (req, res) => {
    const db = loadDB();
    res.json(db.activityLogs);
  });

  // 13. ANALYTICS
  app.get('/api/analytics', requireAuth(['Super Admin', 'Admin', 'Manager']), (req, res) => {
    const db = loadDB();
    const totalNews = db.news.length;
    const publishedNews = db.news.filter(n => n.status === 'Published').length;
    const draftNews = db.news.filter(n => n.status === 'Draft').length;
    const pendingNews = db.news.filter(n => n.status === 'Pending Review').length;
    const scheduledNews = db.news.filter(n => n.status === 'Scheduled').length;

    const totalComments = db.comments.length;
    const pendingComments = db.comments.filter(c => c.status === 'Pending').length;

    // Category view distribution
    const categoryViews: Record<string, number> = {};
    db.news.forEach(n => {
      categoryViews[n.categoryNameBn] = (categoryViews[n.categoryNameBn] || 0) + (n.viewCount || 0);
    });
    const topCategories = Object.entries(categoryViews)
      .map(([category, views]) => ({ category, views }))
      .sort((a, b) => b.views - a.views)
      .slice(0, 6);

    res.json({
      totalNews,
      publishedNews,
      draftNews,
      pendingNews,
      scheduledNews,
      totalComments,
      pendingComments,
      totalVisitors: db.analytics.totalVisitors,
      todayVisitors: db.analytics.todayVisitors,
      weeklyVisitors: db.analytics.weeklyVisitors,
      monthlyVisitors: db.analytics.monthlyVisitors,
      pageViews: db.analytics.pageViews,
      subscriberCount: db.subscribers.length,
      newsTipsCount: db.newsTips.length,
      history: db.analytics.history,
      topCategories,
      deviceBreakdown: { desktop: 58, mobile: 37, tablet: 5 }
    });
  });

  app.post('/api/analytics/track-visit', (req, res) => {
    const db = loadDB();
    db.analytics.totalVisitors += 1;
    db.analytics.todayVisitors += 1;
    db.analytics.pageViews += 1;
    saveDB(db);
    res.json({ success: true });
  });

  return app;
}
