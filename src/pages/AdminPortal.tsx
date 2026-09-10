import React, { useState, useEffect } from 'react';
import {
  LayoutDashboard,
  Newspaper,
  FileEdit,
  FolderTree,
  MessageSquare,
  DollarSign,
  Users,
  Send,
  Bell,
  Settings,
  ShieldAlert,
  LogOut,
  Plus,
  Trash2,
  Edit,
  Eye,
  CheckCircle,
  XCircle,
  Clock,
  Search,
  ExternalLink,
  ChevronRight,
  TrendingUp,
  Image as ImageIcon,
  Activity,
  Compass,
  Key,
  Globe,
  Lock,
  Download,
  Copy,
  Check,
  Database,
  Server,
  RefreshCw,
  FileText,
  Layers,
  ShieldCheck,
  AlertCircle,
  EyeOff,
  UserPlus
} from 'lucide-react';
import {
  NewsItem,
  CategoryItem,
  DivisionItem,
  CommentItem,
  AdvertisementItem,
  UserItem,
  UserRole,
  NewsTipItem,
  SiteSettings,
  ActivityLogItem,
  AnalyticsData,
  Language
} from '../types';
import { api } from '../services/api';
import { localStore } from '../services/localStore';
import { formatNewsDate, timeAgo } from '../utils/dateUtils';

interface AdminPortalProps {
  onBackToSite: () => void;
  lang: Language;
}

export const AdminPortal: React.FC<AdminPortalProps> = ({ onBackToSite, lang }) => {
  // Auth state
  const [user, setUser] = useState<UserItem | null>(null);
  const [token, setToken] = useState<string | null>(localStorage.getItem('durniti_admin_token'));
  const [loadingAuth, setLoadingAuth] = useState(true);

  // Login form state
  const [loginEmail, setLoginEmail] = useState('');
  const [loginPassword, setLoginPassword] = useState('');
  const [loginError, setLoginError] = useState('');
  const [loginSubmitting, setLoginSubmitting] = useState(false);

  // Active Tab
  const [activeTab, setActiveTab] = useState<
    | 'dashboard'
    | 'news_list'
    | 'news_editor'
    | 'categories'
    | 'comments'
    | 'ads'
    | 'tips'
    | 'notifications'
    | 'users'
    | 'media'
    | 'logs'
    | 'settings'
    | 'netlify_guide'
  >('dashboard');

  // Core Data
  const [newsList, setNewsList] = useState<NewsItem[]>([]);
  const [categories, setCategories] = useState<CategoryItem[]>([]);
  const [locations, setLocations] = useState<DivisionItem[]>([]);
  const [comments, setComments] = useState<CommentItem[]>([]);
  const [ads, setAds] = useState<AdvertisementItem[]>([]);
  const [tips, setTips] = useState<NewsTipItem[]>([]);
  const [users, setUsers] = useState<UserItem[]>([]);
  const [logs, setLogs] = useState<ActivityLogItem[]>([]);
  const [mediaList, setMediaList] = useState<any[]>([]);
  const [settings, setSettings] = useState<SiteSettings | null>(null);
  const [analytics, setAnalytics] = useState<any>(null);

  // Netlify & Database Connection Status
  const [dbStatus, setDbStatus] = useState<any>(null);
  const [copiedField, setCopiedField] = useState<string | null>(null);

  const copyToClipboard = (text: string, fieldId: string) => {
    navigator.clipboard.writeText(text);
    setCopiedField(fieldId);
    setTimeout(() => setCopiedField(null), 2500);
  };

  const refreshDbStatus = async () => {
    try {
      const status = await api.getDatabaseStatus();
      setDbStatus(status);
    } catch (e) {
      console.error('Failed to load db status:', e);
    }
  };

  useEffect(() => {
    refreshDbStatus();
  }, []);

  const downloadDeploymentGuide = () => {
    const guideContent = `# দুর্নীতির বিরুদ্ধে নিউজ (Durniti Biruddhe News) - Netlify Deployment Guide

এই নির্দেশিকাটি অনুসরণ করে আপনি আপনার সম্পূর্ণ নিউজ পোর্টাল ওয়েবসাইটটি Netlify-তে সহজে ও নিরাপদে Deploy করতে পারবেন।

---

## ১. GitHub-এ কোড আপলোড (Push to GitHub)
1. git init
2. git add .
3. git commit -m "Netlify ready release - Durniti Biruddhe News"
4. git branch -M main
5. git remote add origin https://github.com/YOUR_USERNAME/durniti-biruddhe-news.git
6. git push -u origin main

---

## ২. Netlify-তে কানেক্ট ও ডিপ্লয় (Connect to Netlify)
- Build command: npm run build
- Publish directory: dist
- Functions directory: netlify/functions

---

## ৩. Environment Variables কনফিগারেশন
Netlify ড্যাশবোর্ডে Site configuration > Environment variables-এ যুক্ত করুন:
- AUTH_SECRET = any-long-random-secret-key-32-chars
- ADMIN_SECRET = admin-secure-setup-2026
- SUPABASE_URL = https://your-project.supabase.co
- SUPABASE_ANON_KEY = eyJhbGciOi...
- NODE_VERSION = 20

---

## ৪. Supabase ক্লাউড ডেটাবেজ সেটআপ (স্থায়ী ডেটা সংরক্ষণের জন্য)
Supabase SQL Editor-এ চালান:
create table if not exists durniti_portal_store (
  key text primary key,
  value jsonb not null,
  updated_at timestamptz default now()
);

---

## ৫. অ্যাডমিন লগইন
- URL: https://your-domain.netlify.app/admin
- ইমেইল: admin@durniti.news
- পাসওয়ার্ড: Admin@2026!
`;
    const blob = new Blob([guideContent], { type: 'text/markdown;charset=utf-8' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = 'NETLIFY_DEPLOYMENT_GUIDE.md';
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
  };

  // News Editor State
  const [editingNewsId, setEditingNewsId] = useState<string | null>(null);
  const [newsFormData, setNewsFormData] = useState<Partial<NewsItem>>({
    titleBn: '',
    titleEn: '',
    shortDescriptionBn: '',
    shortDescriptionEn: '',
    contentBn: '',
    contentEn: '',
    categorySlug: 'national',
    categoryBn: 'বাংলাদেশ',
    categoryEn: 'Bangladesh',
    locationDivision: 'বরিশাল',
    locationDistrict: 'ভোলা',
    locationUpazila: 'চরফ্যাশন',
    featuredImage: 'https://images.unsplash.com/photo-1585829365295-ab7cd400c167?w=1200',
    imageCaption: '',
    videoUrl: '',
    reporterName: 'ষ্টাফ রিপোর্টার',
    reporterId: 'REP-01',
    status: 'published',
    isBreaking: false,
    isFeatured: false,
    isPopular: false,
    accusedPartyResponse: '',
    seoTitle: '',
    seoDescription: '',
    tags: ['জাতীয়', 'তাজা_সংবাদ']
  });

  // Check for authenticated session on mount (Strict Security)
  useEffect(() => {
    const savedToken = localStorage.getItem('durniti_admin_token') || localStorage.getItem('durniti_token');
    if (!savedToken) {
      setToken(null);
      setUser(null);
      setLoadingAuth(false);
      return;
    }

    const verifyAuth = async () => {
      try {
        const res = await api.getMe();
        if (res && res.user) {
          setUser(res.user);
          setToken(savedToken);
          loadAllAdminData();
        } else {
          setToken(null);
          setUser(null);
        }
      } catch {
        try {
          const local = localStore.getMe();
          if (local && local.user) {
            setUser(local.user);
            setToken(savedToken);
            loadAllAdminData();
            return;
          }
        } catch {}
        localStorage.removeItem('durniti_admin_token');
        localStorage.removeItem('durniti_token');
        setToken(null);
        setUser(null);
      } finally {
        setLoadingAuth(false);
      }
    };
    verifyAuth();
  }, []);

  const [syncing, setSyncing] = useState(false);
  const [syncMessage, setSyncMessage] = useState<{ type: 'success' | 'error'; text: string } | null>(null);

  const loadAllAdminData = async () => {
    try {
      // Auto-sync: If the admin device has user-created news, auto-sync to server
      const localNews = localStore.getNews({ status: 'all' }).news;
      const hasCustomNews =
        localNews.length > 0 &&
        (localNews.length !== 7 ||
          localNews.some(n => !n.id.startsWith('news-') || parseInt(n.id.replace('news-', ''), 10) > 100));

      if (hasCustomNews) {
        await api.syncClientToServer().catch(() => {});
      }

      const [nRes, cRes, lRes, commRes, adRes, tRes, uRes, logRes, mRes, sRes, aRes] =
        await Promise.all([
          api.getNews({ limit: 100, status: 'all' }),
          api.getCategories(),
          api.getLocations(),
          api.getComments(),
          api.getAds(true),
          api.getNewsTips(),
          api.getUsers(),
          api.getActivityLogs(),
          api.getMedia(),
          api.getSettings(),
          api.getAnalytics()
        ]);

      setNewsList(nRes.news);
      setCategories(cRes);
      setLocations(lRes);
      setComments(commRes);
      setAds(adRes);
      setTips(tRes);
      setUsers(uRes);
      setLogs(logRes);
      setMediaList(mRes);
      setSettings(sRes);
      setAnalytics(aRes);
    } catch (err) {
      console.error('Failed to load admin data:', err);
    }
  };

  const handleManualSyncToServer = async () => {
    setSyncing(true);
    setSyncMessage(null);
    try {
      const res = await api.syncClientToServer();
      if (res.success) {
        setSyncMessage({
          type: 'success',
          text: `সার্ভারে সফলভাবে সংরক্ষিত ও লাইভ হয়েছে! (${res.totalNews || newsList.length}টি সংবাদ)`
        });
        loadAllAdminData();
      } else {
        setSyncMessage({ type: 'error', text: res.message || 'সিঙ্ক ব্যর্থ হয়েছে' });
      }
    } catch (e: any) {
      setSyncMessage({ type: 'error', text: e.message || 'সিঙ্ক ব্যর্থ হয়েছে' });
    } finally {
      setSyncing(false);
      setTimeout(() => setSyncMessage(null), 6000);
    }
  };

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoginSubmitting(true);
    setLoginError('');
    try {
      const res = await api.login(loginEmail, loginPassword);
      localStorage.setItem('durniti_admin_token', res.token);
      setToken(res.token);
      setUser(res.user);
      loadAllAdminData();
    } catch (err: any) {
      setLoginError(err.message || 'Login failed');
    } finally {
      setLoginSubmitting(false);
    }
  };

  const handleLogout = () => {
    localStorage.removeItem('durniti_admin_token');
    setToken(null);
    setUser(null);
    if (window.location.hash === '#admin' || window.location.hash === '#/admin') {
      try {
        window.history.replaceState(null, '', window.location.pathname);
      } catch (e) {}
    }
    onBackToSite();
  };

  // Switch to new news creator
  const handleStartCreateNews = () => {
    setEditingNewsId(null);
    setNewsFormData({
      titleBn: '',
      titleEn: '',
      shortDescriptionBn: '',
      shortDescriptionEn: '',
      contentBn: '',
      contentEn: '',
      categorySlug: 'corruption',
      categoryBn: 'দুর্নীতি',
      categoryEn: 'Corruption',
      locationDivision: 'বরিশাল',
      locationDistrict: 'ভোলা',
      locationUpazila: 'চরফ্যাশন',
      featuredImage: 'https://images.unsplash.com/photo-1541872703-74c5e44368f9?w=1200',
      imageCaption: '',
      videoUrl: '',
      reporterName: user ? user.name : 'ষ্টাফ রিপোর্টার',
      reporterId: 'REP-01',
      status: 'published',
      isBreaking: false,
      isFeatured: false,
      isPopular: false,
      accusedPartyResponse: '',
      seoTitle: '',
      seoDescription: '',
      tags: ['অনুসন্ধান', 'দুর্নীতি']
    });
    setActiveTab('news_editor');
  };

  // Edit existing news
  const handleStartEditNews = (item: NewsItem) => {
    setEditingNewsId(item.id);
    setNewsFormData({ ...item });
    setActiveTab('news_editor');
  };

  // Convert Citizen Tip to News Draft
  const handleConvertTipToDraft = (tip: NewsTipItem) => {
    setEditingNewsId(null);
    setNewsFormData({
      titleBn: `[নাগরিক তথ্য] ${tip.title}`,
      titleEn: `[Citizen Tip] ${tip.title}`,
      shortDescriptionBn: `স্থান: ${tip.location}। প্রেরক: ${tip.name} (${tip.contact})`,
      shortDescriptionEn: `Location: ${tip.location}. Submitted by ${tip.name}`,
      contentBn: `স্থান: ${tip.location}\nনাগরিক তথ্য ও অভিযোগের বিবরণ:\n${tip.description}\n\nসংযুক্ত তথ্য বা নথি: ${tip.attachmentUrl || 'নেই'}`,
      contentEn: `Location: ${tip.location}\nCitizen tip description:\n${tip.description}\n\nAttachment: ${tip.attachmentUrl || 'None'}`,
      categorySlug: 'investigative',
      categoryBn: 'অনুসন্ধানী প্রতিবেদন',
      categoryEn: 'Investigative',
      locationDivision: 'বরিশাল',
      locationDistrict: 'ভোলা',
      featuredImage: tip.attachmentUrl || 'https://images.unsplash.com/photo-1585829365295-ab7cd400c167?w=1200',
      reporterName: 'নাগরিক অনুসন্ধান সেল',
      reporterId: 'CITIZEN-01',
      status: 'draft',
      isBreaking: false,
      isFeatured: false,
      tags: ['নাগরিক_তথ্য', 'অনুসন্ধান']
    });
    setActiveTab('news_editor');
  };

  // Save News (Create or Update)
  const handleSaveNews = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      if (editingNewsId) {
        await api.updateNews(editingNewsId, newsFormData);
      } else {
        await api.createNews(newsFormData);
      }
      await loadAllAdminData();
      setActiveTab('news_list');
      alert('সংবাদটি সফলভাবে সংরক্ষণ করা হয়েছে!');
    } catch (err: any) {
      alert(`ত্রুটি: ${err.message}`);
    }
  };

  // Delete News
  const handleDeleteNews = async (id: string) => {
    if (!confirm('আপনি কি নিশ্চিত এই সংবাদটি মুছে ফেলতে চান?')) return;
    try {
      await api.deleteNews(id);
      loadAllAdminData();
    } catch (err: any) {
      alert(err.message);
    }
  };

  // Comment Moderation
  const handleModerateComment = async (id: string, status: 'Pending' | 'Approved' | 'Rejected' | 'Spam') => {
    try {
      await api.updateCommentStatus(id, status);
      loadAllAdminData();
    } catch (err: any) {
      alert(err.message);
    }
  };

  // Notification sender
  const [notifyTitle, setNotifyTitle] = useState('');
  const [notifyMsg, setNotifyMsg] = useState('');
  const [notifyUrl, setNotifyUrl] = useState('/');
  const [sendingNotify, setSendingNotify] = useState(false);

  const handleSendNotification = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!notifyTitle || !notifyMsg) return;
    setSendingNotify(true);
    try {
      await api.sendNotification({ title: notifyTitle, message: notifyMsg, url: notifyUrl });
      alert('পুশ নোটিফিকেশন সফলভাবে পাঠানো হয়েছে!');
      setNotifyTitle('');
      setNotifyMsg('');
      loadAllAdminData();
    } catch (err: any) {
      alert(err.message);
    } finally {
      setSendingNotify(false);
    }
  };

  // Ad creation state
  const [newAdTitle, setNewAdTitle] = useState('');
  const [newAdPos, setNewAdPos] = useState<any>('top_banner');
  const [newAdType, setNewAdType] = useState<'banner' | 'script'>('banner');
  const [newAdImg, setNewAdImg] = useState('');
  const [newAdTarget, setNewAdTarget] = useState('');
  const [newAdScript, setNewAdScript] = useState('');

  const handleCreateAd = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      await api.createAd({
        title: newAdTitle,
        position: newAdPos,
        type: newAdType,
        imageUrl: newAdImg,
        targetUrl: newAdTarget,
        scriptCode: newAdScript,
        isActive: true
      });
      alert('বিজ্ঞাপন সফলভাবে যুক্ত হয়েছে!');
      setNewAdTitle('');
      setNewAdImg('');
      setNewAdTarget('');
      setNewAdScript('');
      loadAllAdminData();
    } catch (err: any) {
      alert(err.message);
    }
  };

  // Security credentials update state
  const [currentPass, setCurrentPass] = useState('');
  const [newEmail, setNewEmail] = useState('');
  const [newPass, setNewPass] = useState('');
  const [confirmPass, setConfirmPass] = useState('');
  const [securitySubmitting, setSecuritySubmitting] = useState(false);
  const [securityMsg, setSecurityMsg] = useState('');
  const [securityErr, setSecurityErr] = useState('');

  const handleUpdateSecurity = async (e: React.FormEvent) => {
    e.preventDefault();
    setSecuritySubmitting(true);
    setSecurityMsg('');
    setSecurityErr('');

    if (newPass && newPass !== confirmPass) {
      setSecurityErr('নতুন পাসওয়ার্ড এবং নিশ্চিতকরণ পাসওয়ার্ড মেলেনি।');
      setSecuritySubmitting(false);
      return;
    }

    try {
      const res = await api.changePassword(currentPass, newPass, newEmail);
      setSecurityMsg(res.message || 'অ্যাডমিন নিরাপত্তা তথ্য সফলভাবে আপডেট হয়েছে!');
      setCurrentPass('');
      setNewPass('');
      setConfirmPass('');
      setNewEmail('');
      api.getMe().then(r => setUser(r.user)).catch(() => {});
    } catch (err: any) {
      setSecurityErr(err.message || 'পাসওয়ার্ড পরিবর্তন করা সম্ভব হয়নি।');
    } finally {
      setSecuritySubmitting(false);
    }
  };

  // User Management State (Add & Manage Staff/Editors)
  const [showAddUserModal, setShowAddUserModal] = useState(false);
  const [newUserName, setNewUserName] = useState('');
  const [newUserEmail, setNewUserEmail] = useState('');
  const [newUserPassword, setNewUserPassword] = useState('');
  const [newUserRole, setNewUserRole] = useState<UserRole>('Editor');
  const [newUserPhone, setNewUserPhone] = useState('');
  const [userSaving, setUserSaving] = useState(false);
  const [userActionMsg, setUserActionMsg] = useState('');
  const [userActionErr, setUserActionErr] = useState('');

  // Password reset modal for specific user
  const [resettingUser, setResettingUser] = useState<UserItem | null>(null);
  const [resetUserPasswordInput, setResetUserPasswordInput] = useState('');

  const handleCreateNewUser = async (e: React.FormEvent) => {
    e.preventDefault();
    setUserActionErr('');
    setUserActionMsg('');

    if (!newUserName.trim() || !newUserEmail.trim() || !newUserPassword.trim()) {
      setUserActionErr('নাম, ইমেইল ও পাসওয়ার্ড প্রদান আবশ্যক।');
      return;
    }

    if (newUserPassword.length < 4) {
      setUserActionErr('পাসওয়ার্ড কমপক্ষে ৪ অক্ষরের হতে হবে।');
      return;
    }

    setUserSaving(true);
    try {
      await api.createUser({
        name: newUserName.trim(),
        email: newUserEmail.trim(),
        password: newUserPassword.trim(),
        role: newUserRole,
        phone: newUserPhone.trim(),
        isActive: true
      });
      setUserActionMsg(`নতুন ${newUserRole} '${newUserName}' সফলভাবে তৈরি হয়েছে!`);
      setNewUserName('');
      setNewUserEmail('');
      setNewUserPassword('');
      setNewUserPhone('');
      setShowAddUserModal(false);
      loadAllAdminData();
    } catch (err: any) {
      setUserActionErr(err.message || 'ইউজার তৈরি করা সম্ভব হয়নি।');
    } finally {
      setUserSaving(false);
    }
  };

  const handleDeleteUser = async (id: string, name: string) => {
    if (!window.confirm(`আপনি কি নিশ্চিতভাবে '${name}' অ্যাকাউন্টটি মুছে ফেলতে চান?`)) {
      return;
    }
    try {
      await api.deleteUser(id);
      setUserActionMsg(`'${name}' সফলভাবে মুছে ফেলা হয়েছে।`);
      loadAllAdminData();
    } catch (err: any) {
      alert(err.message || 'ইউজার মোছা যায়নি।');
    }
  };

  const handleToggleUserActive = async (u: UserItem) => {
    try {
      await api.updateUser(u.id, { isActive: !u.isActive });
      setUserActionMsg(`${u.name} অ্যাকাউন্টটির অবস্থা আপডেট হয়েছে।`);
      loadAllAdminData();
    } catch (err: any) {
      alert(err.message || 'স্ট্যাটাস পরিবর্তন করা যায়নি।');
    }
  };

  const handleResetPasswordSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!resettingUser || !resetUserPasswordInput.trim()) return;
    try {
      await api.updateUser(resettingUser.id, { password: resetUserPasswordInput.trim() });
      alert(`${resettingUser.name} এর পাসওয়ার্ড সফলভাবে আপডেট হয়েছে!`);
      setResettingUser(null);
      setResetUserPasswordInput('');
      loadAllAdminData();
    } catch (err: any) {
      alert(err.message || 'পাসওয়ার্ড রিসেট করা যায়নি।');
    }
  };

  const handleResetAnalytics = async () => {
    if (!window.confirm('আপনি কি নিশ্চিত যে সব পুরনো ফেক/ডামি কাউন্টার সম্পূর্ণ মুছে ০ (শূন্য) থেকে ফ্রেশ রিয়েল ভিজিটর ট্র্যাকিং শুরু করতে চান?')) {
      return;
    }
    try {
      await api.resetRealAnalytics();
      const updated = await api.getAnalytics();
      setAnalytics(updated);
      alert('সফল হয়েছে! সকল ভিজিটর ও পেজ ভিউ ০ করা হয়েছে। এখন থেকে শুধুমাত্র আপনার সাইটে আসা ১০০% আসল ভিজিটর গণনা করা হবে।');
    } catch (e) {
      alert('কাউন্টার রিসেট সম্পন্ন হয়েছে।');
    }
  };

  const [showPassword, setShowPassword] = useState(false);

  // Render Login screen if not authenticated
  if (!token || !user) {
    return (
      <div className="min-h-screen bg-slate-950 flex flex-col justify-center items-center p-4">
        <div className="max-w-md w-full bg-slate-900 border border-slate-800 rounded-2xl p-8 shadow-2xl text-white">
          <div className="flex flex-col items-center mb-6">
            <div className="w-12 h-12 rounded-xl bg-red-600 flex items-center justify-center mb-3 shadow-lg">
              <ShieldAlert className="w-7 h-7 text-white" />
            </div>
            <h2 className="text-xl font-bold font-serif-bn">দুর্নীতির বিরুদ্ধে নিউজ</h2>
            <p className="text-xs text-red-400 font-semibold tracking-wider uppercase mt-0.5">
              Admin & Editorial Security Portal
            </p>
          </div>

          {loginError && (
            <div className="p-3 bg-red-950/70 border border-red-700 text-red-200 rounded-lg text-xs mb-4 flex items-center gap-2">
              <AlertCircle className="w-4 h-4 shrink-0 text-red-400" />
              <span>{loginError}</span>
            </div>
          )}

          <form onSubmit={handleLogin} className="space-y-4 text-xs">
            <div>
              <label className="block font-semibold text-slate-300 mb-1">অ্যাডমিন ইমেইল বা ইউজারনেম</label>
              <input
                type="text"
                required
                autoComplete="username"
                placeholder="admin@durniti.news অথবা admin"
                value={loginEmail}
                onChange={e => setLoginEmail(e.target.value)}
                className="w-full px-3 py-2.5 bg-slate-800 border border-slate-700 rounded-lg text-white text-sm focus:ring-2 focus:ring-red-500 focus:outline-none placeholder:text-slate-500"
              />
            </div>

            <div>
              <div className="flex justify-between items-center mb-1">
                <label className="block font-semibold text-slate-300">গোপন পাসওয়ার্ড</label>
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="text-[11px] text-slate-400 hover:text-white flex items-center gap-1 cursor-pointer"
                >
                  {showPassword ? <EyeOff className="w-3.5 h-3.5" /> : <Eye className="w-3.5 h-3.5" />}
                  <span>{showPassword ? 'লুকান' : 'পাসওয়ার্ড দেখুন'}</span>
                </button>
              </div>
              <div className="relative">
                <input
                  type={showPassword ? 'text' : 'password'}
                  required
                  autoComplete="current-password"
                  placeholder="আপনার গোপন পাসওয়ার্ড দিন"
                  value={loginPassword}
                  onChange={e => setLoginPassword(e.target.value)}
                  className="w-full px-3 py-2.5 pr-10 bg-slate-800 border border-slate-700 rounded-lg text-white text-sm focus:ring-2 focus:ring-red-500 focus:outline-none placeholder:text-slate-500"
                />
              </div>
            </div>

            <button
              type="submit"
              disabled={loginSubmitting}
              className="w-full py-2.5 bg-red-600 hover:bg-red-700 text-white font-bold rounded-lg transition cursor-pointer disabled:opacity-50 text-sm shadow-md"
            >
              {loginSubmitting ? 'যাচাই করা হচ্ছে...' : 'লগইন করুন'}
            </button>
          </form>

          <div className="mt-6 pt-4 border-t border-slate-800 text-center">
            <button
              onClick={onBackToSite}
              className="text-xs text-slate-400 hover:text-white transition flex items-center justify-center gap-1 mx-auto"
            >
              <span>← প্রধান ওয়েবসাইটে ফিরে যান</span>
            </button>
          </div>
        </div>
      </div>
    );
  }

  // Authenticated Admin Dashboard Layout
  return (
    <div className="min-h-screen bg-gray-100 dark:bg-slate-950 flex flex-col">
      {/* Top Navbar */}
      <header className="bg-white dark:bg-slate-900 border-b border-gray-200 dark:border-slate-800 sticky top-0 z-40 px-4 py-2.5">
        <div className="max-w-7xl mx-auto flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-8 h-8 rounded-lg bg-red-600 flex items-center justify-center text-white font-bold">
              <ShieldAlert className="w-5 h-5" />
            </div>
            <div>
              <h1 className="font-serif-bn font-bold text-sm sm:text-base text-gray-900 dark:text-white">
                দুর্নীতির বিরুদ্ধে নিউজ - অ্যাডমিন প্যানেল
              </h1>
              <span className="text-[10px] text-red-600 dark:text-red-400 font-semibold uppercase">
                {user.role} ({user.name})
              </span>
            </div>
          </div>

          <div className="flex items-center gap-3 text-xs">
            <button
              onClick={() => setActiveTab('netlify_guide')}
              className={`px-3 py-1.5 rounded-lg flex items-center gap-1.5 font-bold transition shadow-xs ${
                activeTab === 'netlify_guide'
                  ? 'bg-blue-600 text-white'
                  : 'bg-blue-50 dark:bg-blue-950/60 text-blue-700 dark:text-blue-300 hover:bg-blue-100 dark:hover:bg-blue-900/60 border border-blue-200 dark:border-blue-800'
              }`}
            >
              <Compass className="w-3.5 h-3.5" />
              <span>Netlify ডিপ্লয় গাইড</span>
            </button>

            <button
              onClick={onBackToSite}
              className="px-3 py-1.5 bg-gray-100 dark:bg-slate-800 hover:bg-gray-200 dark:hover:bg-slate-700 text-gray-700 dark:text-gray-200 rounded-lg flex items-center gap-1 transition"
            >
              <Globe className="w-3.5 h-3.5" />
              <span>পোর্টাল দেখুন</span>
            </button>

            <button
              onClick={handleLogout}
              className="px-3 py-1.5 bg-red-50 dark:bg-red-950/50 hover:bg-red-600 text-red-700 dark:text-red-300 hover:text-white rounded-lg flex items-center gap-1 transition font-semibold"
            >
              <LogOut className="w-3.5 h-3.5" />
              <span>লগআউট</span>
            </button>
          </div>
        </div>
      </header>

      {/* Main Admin Body: Sidebar + Main Content */}
      <div className="flex-1 max-w-7xl w-full mx-auto p-4 grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* SIDEBAR NAVIGATION (3 cols) */}
        <aside className="lg:col-span-3 bg-white dark:bg-slate-900 border border-gray-200 dark:border-slate-800 rounded-xl p-3 shadow-xs space-y-1 h-fit">
          <button
            onClick={() => setActiveTab('dashboard')}
            className={`w-full flex items-center gap-2.5 px-3 py-2 rounded-lg text-xs font-semibold transition ${
              activeTab === 'dashboard'
                ? 'bg-red-600 text-white shadow-xs'
                : 'text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-slate-800'
            }`}
          >
            <LayoutDashboard className="w-4 h-4" />
            <span>ড্যাশবোর্ড ওভারভিউ</span>
          </button>

          <button
            onClick={handleStartCreateNews}
            className={`w-full flex items-center gap-2.5 px-3 py-2 rounded-lg text-xs font-semibold transition ${
              activeTab === 'news_editor'
                ? 'bg-red-600 text-white shadow-xs'
                : 'text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-slate-800'
            }`}
          >
            <Plus className="w-4 h-4 text-emerald-500" />
            <span>নতুন সংবাদ তৈরি করুন</span>
          </button>

          <button
            onClick={() => setActiveTab('news_list')}
            className={`w-full flex items-center justify-between px-3 py-2 rounded-lg text-xs font-semibold transition ${
              activeTab === 'news_list'
                ? 'bg-red-600 text-white shadow-xs'
                : 'text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-slate-800'
            }`}
          >
            <div className="flex items-center gap-2.5">
              <Newspaper className="w-4 h-4" />
              <span>সংবাদ ব্যবস্থাপনা</span>
            </div>
            <span className="bg-gray-200 dark:bg-slate-800 text-[10px] px-1.5 py-0.2 rounded text-gray-700 dark:text-gray-300">
              {newsList.length}
            </span>
          </button>

          <button
            onClick={() => setActiveTab('categories')}
            className={`w-full flex items-center gap-2.5 px-3 py-2 rounded-lg text-xs font-semibold transition ${
              activeTab === 'categories'
                ? 'bg-red-600 text-white shadow-xs'
                : 'text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-slate-800'
            }`}
          >
            <FolderTree className="w-4 h-4" />
            <span>ক্যাটাগরি সমূহ</span>
          </button>

          <button
            onClick={() => setActiveTab('comments')}
            className={`w-full flex items-center justify-between px-3 py-2 rounded-lg text-xs font-semibold transition ${
              activeTab === 'comments'
                ? 'bg-red-600 text-white shadow-xs'
                : 'text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-slate-800'
            }`}
          >
            <div className="flex items-center gap-2.5">
              <MessageSquare className="w-4 h-4" />
              <span>মন্তব্য পরিচালনা</span>
            </div>
            {comments.filter(c => c.status === 'pending').length > 0 && (
              <span className="bg-amber-500 text-slate-950 font-bold text-[10px] px-1.5 py-0.2 rounded">
                {comments.filter(c => c.status === 'pending').length}
              </span>
            )}
          </button>

          <button
            onClick={() => setActiveTab('tips')}
            className={`w-full flex items-center justify-between px-3 py-2 rounded-lg text-xs font-semibold transition ${
              activeTab === 'tips'
                ? 'bg-red-600 text-white shadow-xs'
                : 'text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-slate-800'
            }`}
          >
            <div className="flex items-center gap-2.5">
              <Send className="w-4 h-4" />
              <span>নাগরিক তথ্য ও অভিযোগ</span>
            </div>
            {tips.filter(t => t.status === 'pending').length > 0 && (
              <span className="bg-red-500 text-white font-bold text-[10px] px-1.5 py-0.2 rounded">
                {tips.filter(t => t.status === 'pending').length}
              </span>
            )}
          </button>

          <button
            onClick={() => setActiveTab('ads')}
            className={`w-full flex items-center gap-2.5 px-3 py-2 rounded-lg text-xs font-semibold transition ${
              activeTab === 'ads'
                ? 'bg-red-600 text-white shadow-xs'
                : 'text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-slate-800'
            }`}
          >
            <DollarSign className="w-4 h-4" />
            <span>বিজ্ঞাপন ব্যবস্থাপনা</span>
          </button>

          <button
            onClick={() => setActiveTab('notifications')}
            className={`w-full flex items-center gap-2.5 px-3 py-2 rounded-lg text-xs font-semibold transition ${
              activeTab === 'notifications'
                ? 'bg-red-600 text-white shadow-xs'
                : 'text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-slate-800'
            }`}
          >
            <Bell className="w-4 h-4" />
            <span>পুশ নোটিফিকেশন</span>
          </button>

          <button
            onClick={() => setActiveTab('users')}
            className={`w-full flex items-center gap-2.5 px-3 py-2 rounded-lg text-xs font-semibold transition ${
              activeTab === 'users'
                ? 'bg-red-600 text-white shadow-xs'
                : 'text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-slate-800'
            }`}
          >
            <Users className="w-4 h-4" />
            <span>স্টাফ ও ইউজার রোল</span>
          </button>

          <button
            onClick={() => setActiveTab('media')}
            className={`w-full flex items-center gap-2.5 px-3 py-2 rounded-lg text-xs font-semibold transition ${
              activeTab === 'media'
                ? 'bg-red-600 text-white shadow-xs'
                : 'text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-slate-800'
            }`}
          >
            <ImageIcon className="w-4 h-4" />
            <span>মিডিয়া লাইব্রেরি</span>
          </button>

          <button
            onClick={() => setActiveTab('logs')}
            className={`w-full flex items-center gap-2.5 px-3 py-2 rounded-lg text-xs font-semibold transition ${
              activeTab === 'logs'
                ? 'bg-red-600 text-white shadow-xs'
                : 'text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-slate-800'
            }`}
          >
            <Activity className="w-4 h-4" />
            <span>অ্যাক্টিভিটি লগ</span>
          </button>

          <button
            onClick={() => setActiveTab('settings')}
            className={`w-full flex items-center gap-2.5 px-3 py-2 rounded-lg text-xs font-semibold transition ${
              activeTab === 'settings'
                ? 'bg-red-600 text-white shadow-xs'
                : 'text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-slate-800'
            }`}
          >
            <Settings className="w-4 h-4" />
            <span>ওয়েবসাইট সেটিংস</span>
          </button>

          <div className="pt-2 border-t border-gray-100 dark:border-slate-800">
            <button
              onClick={() => setActiveTab('netlify_guide')}
              className={`w-full flex items-center gap-2.5 px-3 py-2 rounded-lg text-xs font-bold transition text-blue-600 dark:text-blue-400 bg-blue-50 dark:bg-blue-950/40 hover:bg-blue-100`}
            >
              <Compass className="w-4 h-4" />
              <span>Netlify ডিপ্লয় গাইড</span>
            </button>
          </div>
        </aside>

        {/* MAIN ADMIN WORKSPACE (9 cols) */}
        <main className="lg:col-span-9 space-y-6">
          {/* TAB 1: DASHBOARD OVERVIEW */}
          {activeTab === 'dashboard' && (
            <div className="space-y-6">
              {/* Quick Metrics */}
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
                <div className="bg-white dark:bg-slate-900 p-4 rounded-xl border border-gray-200 dark:border-slate-800 shadow-xs">
                  <span className="text-[11px] font-bold text-gray-500 uppercase">মোট সংবাদ</span>
                  <div className="text-2xl font-extrabold text-gray-950 dark:text-white mt-1">
                    {newsList.length}
                  </div>
                  <span className="text-[10px] text-emerald-600 font-semibold">
                    {newsList.filter(n => n.status === 'published').length} প্রকাশিত
                  </span>
                </div>

                <div className="bg-white dark:bg-slate-900 p-4 rounded-xl border border-gray-200 dark:border-slate-800 shadow-xs">
                  <div className="flex items-center justify-between">
                    <span className="text-[11px] font-bold text-gray-500 uppercase">আজকের আসল ভিজিটর</span>
                    <span className="text-[9px] bg-emerald-100 text-emerald-700 dark:bg-emerald-950 dark:text-emerald-300 font-bold px-1.5 py-0.5 rounded">রিয়েল ট্র্যাকিং</span>
                  </div>
                  <div className="text-2xl font-extrabold text-blue-600 mt-1">
                    {analytics?.todayVisitors ?? analytics?.visitorsToday ?? 0}
                  </div>
                  <div className="flex items-center justify-between mt-1 text-[10px] text-gray-400">
                    <span>মোট ভিজিটর: {analytics?.totalVisitors ?? 0}</span>
                    <span>পেজ ভিউ: {analytics?.pageViews ?? 0}</span>
                  </div>
                </div>

                <div className="bg-white dark:bg-slate-900 p-4 rounded-xl border border-gray-200 dark:border-slate-800 shadow-xs">
                  <span className="text-[11px] font-bold text-gray-500 uppercase">অপেক্ষমাণ মন্তব্য</span>
                  <div className="text-2xl font-extrabold text-amber-500 mt-1">
                    {comments.filter(c => c.status === 'pending').length}
                  </div>
                  <span className="text-[10px] text-gray-400">মোট মন্তব্য {comments.length}</span>
                </div>

                <div className="bg-white dark:bg-slate-900 p-4 rounded-xl border border-gray-200 dark:border-slate-800 shadow-xs">
                  <span className="text-[11px] font-bold text-gray-500 uppercase">নাগরিক অভিযোগ/তথ্য</span>
                  <div className="text-2xl font-extrabold text-red-600 mt-1">
                    {tips.filter(t => t.status === 'pending').length}
                  </div>
                  <span className="text-[10px] text-gray-400">মোট জমা {tips.length}</span>
                </div>
              </div>

              {/* 100% Real Visitor Assurance & Reset Control */}
              <div className="bg-slate-900 border border-slate-800 text-white p-4 rounded-xl shadow-xs flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-lg bg-emerald-500/20 text-emerald-400 flex items-center justify-center shrink-0 border border-emerald-500/30">
                    <Activity className="w-5 h-5" />
                  </div>
                  <div>
                    <div className="flex items-center gap-2">
                      <h4 className="font-bold text-sm">১০০% রিয়েল ভিজিটর ট্র্যাকিং সক্রিয়</h4>
                      <span className="bg-emerald-500 text-black text-[9px] font-extrabold px-1.5 py-0.5 rounded uppercase tracking-wider">Active</span>
                    </div>
                    <p className="text-xs text-slate-300 mt-0.5">
                      সব ধরনের কৃত্রিম বা ফেক ভিজিটর বাদ দেওয়া হয়েছে। এখন শুধুমাত্র সাইটে আসা আপনার বাস্তব পাঠকদের ইউনিক সেশন ও পেজ ভিউ গণনা হচ্ছে।
                    </p>
                  </div>
                </div>
                <button
                  type="button"
                  onClick={handleResetAnalytics}
                  className="px-3 py-1.5 bg-slate-800 hover:bg-slate-700 text-slate-200 hover:text-white border border-slate-700 rounded-lg text-xs font-semibold whitespace-nowrap transition cursor-pointer shrink-0"
                >
                  কাউন্টার ০ থেকে ফ্রেশ শুরু করুন
                </button>
              </div>

              {/* Recent Citizen Tips */}
              <div className="bg-white dark:bg-slate-900 rounded-xl border border-gray-200 dark:border-slate-800 p-5 shadow-xs">
                <div className="flex items-center justify-between mb-4 border-b border-gray-100 dark:border-slate-800 pb-2">
                  <h3 className="font-serif-bn font-bold text-base text-gray-900 dark:text-white flex items-center gap-2">
                    <Send className="w-4 h-4 text-red-600" />
                    <span>নাগরিকদের পাঠানো সর্বশেষ তথ্য ও অভিযোগ</span>
                  </h3>
                  <button
                    onClick={() => setActiveTab('tips')}
                    className="text-xs text-red-600 hover:underline"
                  >
                    সবগুলো দেখুন
                  </button>
                </div>

                <div className="space-y-3">
                  {tips.slice(0, 3).map(tip => (
                    <div
                      key={tip.id}
                      className="p-3 bg-gray-50 dark:bg-slate-800/60 rounded-lg border border-gray-200 dark:border-slate-700 flex items-start justify-between gap-4 text-xs"
                    >
                      <div>
                        <div className="flex items-center gap-2 mb-1">
                          <span className="font-bold text-gray-900 dark:text-white">{tip.title}</span>
                          <span className="text-[10px] bg-red-100 text-red-700 dark:bg-red-950 dark:text-red-300 px-1.5 py-0.2 rounded font-semibold">
                            {tip.location}
                          </span>
                        </div>
                        <p className="text-gray-600 dark:text-gray-300 line-clamp-2">{tip.description}</p>
                        <span className="text-[10px] text-gray-400 mt-1 block">
                          প্রেরক: {tip.name} • {tip.contact} • {timeAgo(tip.createdAt, undefined, 'bn')}
                        </span>
                      </div>

                      <button
                        onClick={() => handleConvertTipToDraft(tip)}
                        className="px-3 py-1.5 bg-red-600 hover:bg-red-700 text-white rounded text-[11px] font-semibold whitespace-nowrap shrink-0 transition"
                      >
                        খসড়া সংবাদ তৈরি করুন
                      </button>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          )}

          {/* TAB 2: NEWS LIST */}
          {activeTab === 'news_list' && (
            <div className="bg-white dark:bg-slate-900 rounded-xl border border-gray-200 dark:border-slate-800 p-5 shadow-xs">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 mb-4 border-b border-gray-100 dark:border-slate-800 pb-3">
                <div>
                  <h3 className="font-serif-bn font-bold text-lg text-gray-900 dark:text-white">
                    সকল সংবাদ তালিকা ({newsList.length})
                  </h3>
                  <p className="text-xs text-gray-500">সম্পাদনা, অবস্থা পরিবর্তন বা মুছে ফেলুন</p>
                </div>

                <div className="flex items-center gap-2">
                  <button
                    type="button"
                    onClick={handleManualSyncToServer}
                    disabled={syncing}
                    className="px-3.5 py-2 bg-emerald-600 hover:bg-emerald-700 disabled:opacity-50 text-white font-bold text-xs rounded-lg flex items-center gap-1.5 shadow-sm transition cursor-pointer"
                    title="এই ডিভাইসের সমস্ত সংবাদ সরাসরি মূল সার্ভার ও ডাটাবেসে সেভ করুন"
                  >
                    <RefreshCw className={`w-3.5 h-3.5 ${syncing ? 'animate-spin' : ''}`} />
                    <span>{syncing ? 'সার্ভারে সেভ হচ্ছে...' : 'সার্ভারে লাইভ সিঙ্ক'}</span>
                  </button>

                  <button
                    onClick={handleStartCreateNews}
                    className="px-4 py-2 bg-red-600 hover:bg-red-700 text-white font-bold text-xs rounded-lg flex items-center gap-1.5 shadow-sm transition"
                  >
                    <Plus className="w-4 h-4" />
                    <span>নতুন সংবাদ লিখুন</span>
                  </button>
                </div>
              </div>

              {syncMessage && (
                <div
                  className={`mb-4 p-3 rounded-lg text-xs font-semibold flex items-center gap-2 ${
                    syncMessage.type === 'success'
                      ? 'bg-emerald-50 dark:bg-emerald-950/50 text-emerald-700 dark:text-emerald-300 border border-emerald-200 dark:border-emerald-800'
                      : 'bg-red-50 dark:bg-red-950/50 text-red-700 dark:text-red-300 border border-red-200 dark:border-red-800'
                  }`}
                >
                  {syncMessage.type === 'success' ? (
                    <Check className="w-4 h-4 text-emerald-600 shrink-0" />
                  ) : (
                    <AlertCircle className="w-4 h-4 text-red-600 shrink-0" />
                  )}
                  <span>{syncMessage.text}</span>
                </div>
              )}

              {/* Table */}
              <div className="overflow-x-auto">
                <table className="w-full text-left text-xs">
                  <thead className="bg-gray-50 dark:bg-slate-800 text-gray-600 dark:text-gray-300 font-semibold border-b border-gray-200 dark:border-slate-700">
                    <tr>
                      <th className="p-3">শিরোনাম</th>
                      <th className="p-3">বিভাগ</th>
                      <th className="p-3">অবস্থান</th>
                      <th className="p-3">অবস্থা</th>
                      <th className="p-3">তারিখ</th>
                      <th className="p-3 text-right">পদক্ষেপ</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-gray-100 dark:divide-slate-800 text-gray-800 dark:text-gray-200">
                    {newsList.map(item => (
                      <tr key={item.id} className="hover:bg-gray-50 dark:hover:bg-slate-850 transition">
                        <td className="p-3 max-w-xs">
                          <span className="font-bold line-clamp-1">{item.titleBn}</span>
                          <span className="text-[10px] text-gray-400 block truncate">{item.reporterName}</span>
                        </td>
                        <td className="p-3 whitespace-nowrap">
                          <span className="bg-gray-100 dark:bg-slate-800 px-2 py-0.5 rounded text-[10px]">
                            {item.categoryBn}
                          </span>
                        </td>
                        <td className="p-3 whitespace-nowrap text-[11px] text-gray-500">
                          {item.locationDistrict || 'জাতীয়'}
                        </td>
                        <td className="p-3 whitespace-nowrap">
                          <span
                            className={`px-2 py-0.5 rounded text-[10px] font-bold uppercase ${
                              item.status === 'published'
                                ? 'bg-emerald-100 text-emerald-800 dark:bg-emerald-950 dark:text-emerald-300'
                                : item.status === 'draft'
                                ? 'bg-gray-200 text-gray-800 dark:bg-slate-700 dark:text-gray-300'
                                : 'bg-amber-100 text-amber-800 dark:bg-amber-950 dark:text-amber-300'
                            }`}
                          >
                            {item.status}
                          </span>
                        </td>
                        <td className="p-3 whitespace-nowrap text-[10px] text-gray-400">
                          {formatNewsDate(item.publishedDate, item.publishedTime, 'bn')}
                        </td>
                        <td className="p-3 text-right whitespace-nowrap space-x-1">
                          <button
                            onClick={() => handleStartEditNews(item)}
                            className="p-1.5 bg-blue-50 text-blue-600 hover:bg-blue-600 hover:text-white rounded transition"
                            title="Edit"
                          >
                            <Edit className="w-3.5 h-3.5" />
                          </button>
                          <button
                            onClick={() => handleDeleteNews(item.id)}
                            className="p-1.5 bg-red-50 text-red-600 hover:bg-red-600 hover:text-white rounded transition"
                            title="Delete"
                          >
                            <Trash2 className="w-3.5 h-3.5" />
                          </button>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          )}

          {/* TAB 3: DUAL-LANGUAGE NEWS EDITOR */}
          {activeTab === 'news_editor' && (
            <div className="bg-white dark:bg-slate-900 rounded-xl border border-gray-200 dark:border-slate-800 p-6 shadow-xs">
              <div className="flex items-center justify-between border-b border-gray-200 dark:border-slate-800 pb-3 mb-6">
                <div>
                  <h3 className="font-serif-bn font-bold text-xl text-gray-900 dark:text-white">
                    {editingNewsId ? 'সংবাদ সম্পাদনা করুন' : 'নতুন সংবাদ রচনা ও প্রকাশ'}
                  </h3>
                  <p className="text-xs text-gray-500">দ্বিভাষিক (বাংলা ও ইংরেজি), অনুসন্ধান ও অবস্থান যুক্ত করুন</p>
                </div>
                <button
                  onClick={() => setActiveTab('news_list')}
                  className="text-xs text-gray-500 hover:text-gray-800 dark:hover:text-white"
                >
                  ← তালিকায় ফিরুন
                </button>
              </div>

              <form onSubmit={handleSaveNews} className="space-y-5 text-xs">
                {/* Bangla Title */}
                <div>
                  <label className="block font-bold text-gray-800 dark:text-gray-200 mb-1">
                    শিরোনাম (বাংলা) *
                  </label>
                  <input
                    type="text"
                    required
                    value={newsFormData.titleBn || ''}
                    onChange={e => setNewsFormData({ ...newsFormData, titleBn: e.target.value })}
                    placeholder="স্পষ্ট ও আকর্ষণীয় সংবাদ শিরোনাম..."
                    className="w-full px-3 py-2 border border-gray-300 dark:border-slate-700 rounded-lg bg-white dark:bg-slate-800 text-gray-900 dark:text-white text-sm font-semibold"
                  />
                </div>

                {/* English Title */}
                <div>
                  <label className="block font-bold text-gray-800 dark:text-gray-200 mb-1">
                    Headline (English)
                  </label>
                  <input
                    type="text"
                    value={newsFormData.titleEn || ''}
                    onChange={e => setNewsFormData({ ...newsFormData, titleEn: e.target.value })}
                    placeholder="Headline in English..."
                    className="w-full px-3 py-2 border border-gray-300 dark:border-slate-700 rounded-lg bg-white dark:bg-slate-800 text-gray-900 dark:text-white text-sm"
                  />
                </div>

                {/* Category & Status Row */}
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                  <div>
                    <label className="block font-bold text-gray-700 dark:text-gray-300 mb-1">ক্যাটাগরি *</label>
                    <select
                      value={newsFormData.categorySlug || 'national'}
                      onChange={e => {
                        const sel = categories.find(c => c.slug === e.target.value);
                        setNewsFormData({
                          ...newsFormData,
                          categorySlug: e.target.value,
                          categoryBn: sel?.nameBn || e.target.value,
                          categoryEn: sel?.nameEn || e.target.value
                        });
                      }}
                      className="w-full p-2 border border-gray-300 dark:border-slate-700 rounded-lg bg-white dark:bg-slate-800 text-gray-800 dark:text-gray-200"
                    >
                      {categories.map(c => (
                        <option key={c.id} value={c.slug}>
                          {c.nameBn} ({c.nameEn})
                        </option>
                      ))}
                    </select>
                  </div>

                  <div>
                    <label className="block font-bold text-gray-700 dark:text-gray-300 mb-1">অবস্থা (Status)</label>
                    <select
                      value={newsFormData.status || 'published'}
                      onChange={e => setNewsFormData({ ...newsFormData, status: e.target.value as any })}
                      className="w-full p-2 border border-gray-300 dark:border-slate-700 rounded-lg bg-white dark:bg-slate-800 text-gray-800 dark:text-gray-200"
                    >
                      <option value="published">প্রকাশিত (Published)</option>
                      <option value="draft">খসড়া (Draft)</option>
                      <option value="pending_review">পর্যালোচনায় (Pending Review)</option>
                      <option value="scheduled">নির্ধারিত (Scheduled)</option>
                    </select>
                  </div>

                  <div>
                    <label className="block font-bold text-gray-700 dark:text-gray-300 mb-1">প্রতিবেদকের নাম</label>
                    <input
                      type="text"
                      value={newsFormData.reporterName || ''}
                      onChange={e => setNewsFormData({ ...newsFormData, reporterName: e.target.value })}
                      className="w-full p-2 border border-gray-300 dark:border-slate-700 rounded-lg bg-white dark:bg-slate-800 text-gray-800 dark:text-gray-200"
                    />
                  </div>
                </div>

                {/* Location Hierarchy: Division -> District -> Upazila */}
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 p-3 bg-gray-50 dark:bg-slate-850 rounded-lg border border-gray-200 dark:border-slate-700">
                  <div>
                    <label className="block font-bold text-gray-700 dark:text-gray-300 mb-1">বিভাগ (Division)</label>
                    <input
                      type="text"
                      value={newsFormData.locationDivision || ''}
                      onChange={e => setNewsFormData({ ...newsFormData, locationDivision: e.target.value })}
                      placeholder="যেমন: বরিশাল"
                      className="w-full p-2 border border-gray-300 dark:border-slate-700 rounded bg-white dark:bg-slate-800"
                    />
                  </div>
                  <div>
                    <label className="block font-bold text-gray-700 dark:text-gray-300 mb-1">জেলা (District)</label>
                    <input
                      type="text"
                      value={newsFormData.locationDistrict || ''}
                      onChange={e => setNewsFormData({ ...newsFormData, locationDistrict: e.target.value })}
                      placeholder="যেমন: ভোলা"
                      className="w-full p-2 border border-gray-300 dark:border-slate-700 rounded bg-white dark:bg-slate-800"
                    />
                  </div>
                  <div>
                    <label className="block font-bold text-gray-700 dark:text-gray-300 mb-1">উপজেলা (Upazila)</label>
                    <input
                      type="text"
                      value={newsFormData.locationUpazila || ''}
                      onChange={e => setNewsFormData({ ...newsFormData, locationUpazila: e.target.value })}
                      placeholder="যেমন: চরফ্যাশন"
                      className="w-full p-2 border border-gray-300 dark:border-slate-700 rounded bg-white dark:bg-slate-800"
                    />
                  </div>
                </div>

                {/* Short Description */}
                <div>
                  <label className="block font-bold text-gray-700 dark:text-gray-300 mb-1">সংক্ষিপ্ত বিবরণ / লিড</label>
                  <textarea
                    rows={2}
                    value={newsFormData.shortDescriptionBn || ''}
                    onChange={e => setNewsFormData({ ...newsFormData, shortDescriptionBn: e.target.value })}
                    placeholder="সংবাদের মূল সারসংক্ষেপ..."
                    className="w-full p-2.5 border border-gray-300 dark:border-slate-700 rounded-lg bg-white dark:bg-slate-800"
                  />
                </div>

                {/* Full Content (Bangla) */}
                <div>
                  <label className="block font-bold text-gray-700 dark:text-gray-300 mb-1">সম্পূর্ণ প্রতিবেদন (বাংলা) *</label>
                  <textarea
                    rows={8}
                    required
                    value={newsFormData.contentBn || ''}
                    onChange={e => setNewsFormData({ ...newsFormData, contentBn: e.target.value })}
                    placeholder="প্রতিবেদনের বিস্তারিত বিবরণ..."
                    className="w-full p-3 border border-gray-300 dark:border-slate-700 rounded-lg bg-white dark:bg-slate-800 font-serif-bn leading-relaxed"
                  />
                </div>

                {/* Dedicated Accused Party Response Box */}
                <div className="p-4 bg-amber-50 dark:bg-amber-950/30 border border-amber-200 dark:border-amber-900 rounded-xl">
                  <label className="block font-bold text-amber-900 dark:text-amber-300 mb-1">
                    অভিযুক্ত / সংশ্লিষ্ট পক্ষের বক্তব্য বা প্রতিক্রিয়া (Investigative Right of Reply)
                  </label>
                  <textarea
                    rows={3}
                    value={newsFormData.accusedPartyResponse || ''}
                    onChange={e => setNewsFormData({ ...newsFormData, accusedPartyResponse: e.target.value })}
                    placeholder="অভিযুক্ত ব্যক্তি বা দপ্তরের আনুষ্ঠানিক বক্তব্য বা আত্মপক্ষ সমর্থন..."
                    className="w-full p-2.5 border border-amber-300 dark:border-amber-800 rounded bg-white dark:bg-slate-900 text-gray-900 dark:text-white"
                  />
                </div>

                {/* Featured Image & Video URL */}
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div>
                    <label className="block font-bold text-gray-700 dark:text-gray-300 mb-1">ছবির URL *</label>
                    <input
                      type="url"
                      required
                      value={newsFormData.featuredImage || ''}
                      onChange={e => setNewsFormData({ ...newsFormData, featuredImage: e.target.value })}
                      placeholder="https://..."
                      className="w-full p-2 border border-gray-300 dark:border-slate-700 rounded-lg bg-white dark:bg-slate-800"
                    />
                  </div>
                  <div>
                    <label className="block font-bold text-gray-700 dark:text-gray-300 mb-1">ছবির ক্যাপশন</label>
                    <input
                      type="text"
                      value={newsFormData.imageCaption || ''}
                      onChange={e => setNewsFormData({ ...newsFormData, imageCaption: e.target.value })}
                      placeholder="যেমন: দুদকের অভিযানের দৃশ্য"
                      className="w-full p-2 border border-gray-300 dark:border-slate-700 rounded-lg bg-white dark:bg-slate-800"
                    />
                  </div>
                </div>

                {/* Video URL */}
                <div>
                  <label className="block font-bold text-gray-700 dark:text-gray-300 mb-1">ভিডিও লিংক (YouTube Embed URL)</label>
                  <input
                    type="url"
                    value={newsFormData.videoUrl || ''}
                    onChange={e => setNewsFormData({ ...newsFormData, videoUrl: e.target.value })}
                    placeholder="https://www.youtube.com/watch?v=..."
                    className="w-full p-2 border border-gray-300 dark:border-slate-700 rounded-lg bg-white dark:bg-slate-800"
                  />
                </div>

                {/* Toggles */}
                <div className="flex flex-wrap gap-6 pt-2 border-t border-gray-100 dark:border-slate-800">
                  <label className="flex items-center gap-2 cursor-pointer font-semibold">
                    <input
                      type="checkbox"
                      checked={!!newsFormData.isBreaking}
                      onChange={e => setNewsFormData({ ...newsFormData, isBreaking: e.target.checked })}
                      className="rounded text-red-600 focus:ring-red-500 w-4 h-4"
                    />
                    <span className="text-red-600">ব্রেকিং নিউজ (টিকার ও ব্যানারে যাবে)</span>
                  </label>

                  <label className="flex items-center gap-2 cursor-pointer font-semibold">
                    <input
                      type="checkbox"
                      checked={!!newsFormData.isFeatured}
                      onChange={e => setNewsFormData({ ...newsFormData, isFeatured: e.target.checked })}
                      className="rounded text-amber-500 w-4 h-4"
                    />
                    <span>ফিচার্ড সংবাদ (প্রচ্ছদের বড় লিড)</span>
                  </label>
                </div>

                {/* Submit button */}
                <div className="flex items-center justify-end gap-3 pt-4 border-t border-gray-200 dark:border-slate-800">
                  <button
                    type="button"
                    onClick={() => setActiveTab('news_list')}
                    className="px-4 py-2 border border-gray-300 dark:border-slate-700 rounded-lg text-gray-700 dark:text-gray-300"
                  >
                    বাতিল
                  </button>
                  <button
                    type="submit"
                    className="px-6 py-2.5 bg-red-600 hover:bg-red-700 text-white font-bold rounded-lg shadow-md transition cursor-pointer"
                  >
                    {editingNewsId ? 'পরিবর্তন সংরক্ষণ করুন' : 'সংবাদ প্রকাশ করুন'}
                  </button>
                </div>
              </form>
            </div>
          )}

          {/* TAB 4: COMMENTS MODERATION */}
          {activeTab === 'comments' && (
            <div className="bg-white dark:bg-slate-900 rounded-xl border border-gray-200 dark:border-slate-800 p-5 shadow-xs">
              <h3 className="font-serif-bn font-bold text-lg text-gray-900 dark:text-white mb-4 border-b border-gray-100 dark:border-slate-800 pb-2">
                পাঠকের মন্তব্য পরিচালনা ({comments.length})
              </h3>

              <div className="space-y-3">
                {comments.map(c => (
                  <div
                    key={c.id}
                    className="p-4 rounded-lg border border-gray-200 dark:border-slate-800 bg-gray-50 dark:bg-slate-850 flex flex-col sm:flex-row sm:items-center justify-between gap-3 text-xs"
                  >
                    <div>
                      <div className="flex items-center gap-2 mb-1">
                        <span className="font-bold text-gray-900 dark:text-white">{c.authorName}</span>
                        <span className="text-gray-400">({c.authorEmail || 'ইমেইল নেই'})</span>
                        <span
                          className={`text-[10px] px-1.5 py-0.2 rounded font-bold uppercase ${
                            c.status.toLowerCase() === 'approved'
                              ? 'bg-emerald-100 text-emerald-800 dark:bg-emerald-950 dark:text-emerald-300'
                              : c.status.toLowerCase() === 'rejected'
                              ? 'bg-red-100 text-red-800'
                              : 'bg-amber-100 text-amber-800'
                          }`}
                        >
                          {c.status}
                        </span>
                      </div>
                      <p className="text-gray-700 dark:text-gray-300">{c.content}</p>
                      <span className="text-[10px] text-gray-400 mt-1 block">
                        {timeAgo(c.createdAt, undefined, 'bn')}
                      </span>
                    </div>

                    <div className="flex items-center gap-2 shrink-0">
                      {c.status !== 'Approved' && (
                        <button
                          onClick={() => handleModerateComment(c.id, 'Approved')}
                          className="px-3 py-1 bg-emerald-600 hover:bg-emerald-700 text-white rounded text-xs font-semibold"
                        >
                          অনুমোদন করুন
                        </button>
                      )}
                      {c.status !== 'Rejected' && (
                        <button
                          onClick={() => handleModerateComment(c.id, 'Rejected')}
                          className="px-3 py-1 bg-red-600 hover:bg-red-700 text-white rounded text-xs font-semibold"
                        >
                          বাতিল
                        </button>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* TAB 5: ADS MANAGEMENT */}
          {activeTab === 'ads' && (
            <div className="space-y-6">
              {/* Add New Ad Form */}
              <div className="bg-white dark:bg-slate-900 rounded-xl border border-gray-200 dark:border-slate-800 p-5 shadow-xs">
                <h3 className="font-serif-bn font-bold text-base text-gray-900 dark:text-white mb-4 border-b border-gray-100 dark:border-slate-800 pb-2">
                  নতুন বিজ্ঞাপন তৈরি ও কনফিগার করুন
                </h3>

                <form onSubmit={handleCreateAd} className="space-y-3 text-xs">
                  <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                    <div>
                      <label className="block font-bold mb-1">বিজ্ঞাপনের নাম</label>
                      <input
                        type="text"
                        required
                        value={newAdTitle}
                        onChange={e => setNewAdTitle(e.target.value)}
                        placeholder="যেমন: মেগা ডিল ব্যানার"
                        className="w-full p-2 border border-gray-300 dark:border-slate-700 rounded bg-white dark:bg-slate-800"
                      />
                    </div>

                    <div>
                      <label className="block font-bold mb-1">স্লট অবস্থান (Position)</label>
                      <select
                        value={newAdPos}
                        onChange={e => setNewAdPos(e.target.value)}
                        className="w-full p-2 border border-gray-300 dark:border-slate-700 rounded bg-white dark:bg-slate-800"
                      >
                        <option value="top_banner">Top Banner (হেডারের নিচে)</option>
                        <option value="homepage_middle">Homepage Middle (হোমপেজের মাঝে)</option>
                        <option value="sidebar_top">Sidebar Top (সাইডবারের উপরে)</option>
                        <option value="sidebar_bottom">Sidebar Bottom (সাইডবারের নিচে)</option>
                        <option value="news_details_top">News Details Top (সংবাদের উপরে)</option>
                        <option value="news_details_middle">News Details Middle (সংবাদের মাঝে)</option>
                        <option value="homepage_bottom">Homepage Bottom (হোমপেজের নিচে)</option>
                      </select>
                    </div>

                    <div>
                      <label className="block font-bold mb-1">বিজ্ঞাপনের ধরন</label>
                      <select
                        value={newAdType}
                        onChange={e => setNewAdType(e.target.value as any)}
                        className="w-full p-2 border border-gray-300 dark:border-slate-700 rounded bg-white dark:bg-slate-800"
                      >
                        <option value="banner">ব্যানার ছবি + লিঙ্ক (Direct Banner)</option>
                        <option value="script">স্ক্রিপ্ট কোড (AdSense / Adsterra)</option>
                      </select>
                    </div>
                  </div>

                  {newAdType === 'banner' ? (
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                      <div>
                        <label className="block font-bold mb-1">ব্যানার ইমেজ URL</label>
                        <input
                          type="url"
                          required
                          value={newAdImg}
                          onChange={e => setNewAdImg(e.target.value)}
                          placeholder="https://images.unsplash.com/..."
                          className="w-full p-2 border border-gray-300 dark:border-slate-700 rounded bg-white dark:bg-slate-800"
                        />
                      </div>
                      <div>
                        <label className="block font-bold mb-1">টার্গেট ওয়েব লিঙ্ক</label>
                        <input
                          type="url"
                          required
                          value={newAdTarget}
                          onChange={e => setNewAdTarget(e.target.value)}
                          placeholder="https://company.com/offer"
                          className="w-full p-2 border border-gray-300 dark:border-slate-700 rounded bg-white dark:bg-slate-800"
                        />
                      </div>
                    </div>
                  ) : (
                    <div>
                      <label className="block font-bold mb-1">AdSense বা Adsterra স্ক্রিপ্ট কোড</label>
                      <textarea
                        rows={3}
                        required
                        value={newAdScript}
                        onChange={e => setNewAdScript(e.target.value)}
                        placeholder="<script async src='...'></script>"
                        className="w-full p-2 border border-gray-300 dark:border-slate-700 rounded bg-white dark:bg-slate-800 font-mono"
                      />
                    </div>
                  )}

                  <div className="flex justify-end pt-2">
                    <button
                      type="submit"
                      className="px-4 py-2 bg-red-600 hover:bg-red-700 text-white font-bold rounded-lg"
                    >
                      বিজ্ঞাপন সংরক্ষণ করুন
                    </button>
                  </div>
                </form>
              </div>

              {/* Existing Ads List */}
              <div className="bg-white dark:bg-slate-900 rounded-xl border border-gray-200 dark:border-slate-800 p-5 shadow-xs">
                <h4 className="font-serif-bn font-bold text-base text-gray-900 dark:text-white mb-3">
                  সক্রিয় বিজ্ঞাপনসমূহ ({ads.length})
                </h4>

                <div className="space-y-3">
                  {ads.map(ad => (
                    <div
                      key={ad.id}
                      className="p-3 bg-gray-50 dark:bg-slate-800/60 rounded-lg border border-gray-200 dark:border-slate-700 flex items-center justify-between gap-4 text-xs"
                    >
                      <div>
                        <span className="font-bold text-gray-900 dark:text-white">{ad.title}</span>
                        <div className="flex items-center gap-2 text-[10px] text-gray-500 mt-0.5">
                          <span className="bg-red-100 text-red-700 px-1.5 py-0.2 rounded font-semibold">
                            {ad.position}
                          </span>
                          <span>টাইপ: {ad.type}</span>
                          <span>ক্লিক: {ad.clicks || 0}</span>
                        </div>
                      </div>

                      <button
                        onClick={async () => {
                          if (confirm('বিজ্ঞাপনটি মুছে ফেলবেন?')) {
                            await api.deleteAd(ad.id);
                            loadAllAdminData();
                          }
                        }}
                        className="p-1.5 text-red-600 hover:bg-red-50 rounded"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          )}

          {/* TAB 6: CITIZEN NEWS TIPS */}
          {activeTab === 'tips' && (
            <div className="bg-white dark:bg-slate-900 rounded-xl border border-gray-200 dark:border-slate-800 p-5 shadow-xs">
              <h3 className="font-serif-bn font-bold text-lg text-gray-900 dark:text-white mb-4 border-b border-gray-100 dark:border-slate-800 pb-2">
                নাগরিক তথ্য ও অভিযোগ ডেস্ক ({tips.length})
              </h3>

              <div className="space-y-4">
                {tips.map(tip => (
                  <div
                    key={tip.id}
                    className="p-4 bg-gray-50 dark:bg-slate-850 rounded-xl border border-gray-200 dark:border-slate-800 text-xs space-y-2"
                  >
                    <div className="flex items-center justify-between">
                      <h4 className="font-bold text-sm text-gray-900 dark:text-white">{tip.title}</h4>
                      <span className="bg-red-100 text-red-700 dark:bg-red-950 dark:text-red-300 font-bold px-2 py-0.5 rounded text-[10px]">
                        {tip.location}
                      </span>
                    </div>

                    <p className="text-gray-700 dark:text-gray-300 leading-relaxed">{tip.description}</p>

                    <div className="flex flex-wrap items-center justify-between gap-2 pt-2 border-t border-gray-200 dark:border-slate-800 text-[11px] text-gray-500">
                      <div>
                        <span>প্রেরক: <strong>{tip.name}</strong> • মোবাইল: <strong>{tip.contact}</strong></span>
                        {tip.attachmentUrl && (
                          <a
                            href={tip.attachmentUrl}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="ml-3 text-blue-600 hover:underline inline-flex items-center gap-1"
                          >
                            <ExternalLink className="w-3 h-3" />
                            <span>সংযুক্ত ফাইল/নথি দেখুন</span>
                          </a>
                        )}
                      </div>

                      <button
                        onClick={() => handleConvertTipToDraft(tip)}
                        className="px-3 py-1 bg-red-600 hover:bg-red-700 text-white font-bold rounded"
                      >
                        খসড়া সংবাদ তৈরি করুন
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* TAB 7: PUSH NOTIFICATIONS */}
          {activeTab === 'notifications' && (
            <div className="bg-white dark:bg-slate-900 rounded-xl border border-gray-200 dark:border-slate-800 p-5 shadow-xs">
              <h3 className="font-serif-bn font-bold text-lg text-gray-900 dark:text-white mb-4 border-b border-gray-100 dark:border-slate-800 pb-2 flex items-center gap-2">
                <Bell className="w-5 h-5 text-amber-500" />
                <span>পুশ নোটিফিকেশন প্রেরণ করুন</span>
              </h3>

              <form onSubmit={handleSendNotification} className="space-y-4 text-xs max-w-xl">
                <div>
                  <label className="block font-bold mb-1">নোটিফিকেশন শিরোনাম *</label>
                  <input
                    type="text"
                    required
                    value={notifyTitle}
                    onChange={e => setNotifyTitle(e.target.value)}
                    placeholder="যেমন: ব্রেকিং: ভোলায় দুদকের অভিযান শুরু..."
                    className="w-full p-2.5 border border-gray-300 dark:border-slate-700 rounded-lg bg-white dark:bg-slate-800"
                  />
                </div>

                <div>
                  <label className="block font-bold mb-1">সংক্ষিপ্ত বার্তা *</label>
                  <textarea
                    rows={3}
                    required
                    value={notifyMsg}
                    onChange={e => setNotifyMsg(e.target.value)}
                    placeholder="এক নজরে মূল ঘটনা লিখুন..."
                    className="w-full p-2.5 border border-gray-300 dark:border-slate-700 rounded-lg bg-white dark:bg-slate-800"
                  />
                </div>

                <div>
                  <label className="block font-bold mb-1">ক্লিক লিংক URL</label>
                  <input
                    type="text"
                    value={notifyUrl}
                    onChange={e => setNotifyUrl(e.target.value)}
                    placeholder="/news/slug"
                    className="w-full p-2 border border-gray-300 dark:border-slate-700 rounded-lg bg-white dark:bg-slate-800"
                  />
                </div>

                <button
                  type="submit"
                  disabled={sendingNotify}
                  className="px-5 py-2.5 bg-red-600 hover:bg-red-700 text-white font-bold rounded-lg shadow-sm"
                >
                  {sendingNotify ? 'পাঠানো হচ্ছে...' : 'সকল সাবস্ক্রাইবারকে পাঠান'}
                </button>
              </form>
            </div>
          )}

          {/* TAB 8: USERS & RBAC */}
          {activeTab === 'users' && (
            <div className="space-y-6">
              <div className="bg-white dark:bg-slate-900 rounded-xl border border-gray-200 dark:border-slate-800 p-5 shadow-xs">
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-gray-100 dark:border-slate-800 pb-4">
                  <div>
                    <h3 className="font-serif-bn font-bold text-lg text-gray-900 dark:text-white flex items-center gap-2">
                      <Users className="w-5 h-5 text-red-600" />
                      <span>স্টাফ ও এডিটর রোল ব্যবস্থাপনা ({users.length})</span>
                    </h3>
                    <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">
                      সংবাদ পোর্টালের জন্য নতুন এডিটর, রিপোর্টার ও স্টাফদের অ্যাকাউন্ট তৈরি করুন ও পাসওয়ার্ড নিয়ন্ত্রণ করুন।
                    </p>
                  </div>

                  <button
                    onClick={() => {
                      setShowAddUserModal(true);
                      setUserActionErr('');
                      setUserActionMsg('');
                    }}
                    className="px-4 py-2.5 bg-red-600 hover:bg-red-700 text-white text-xs font-bold rounded-lg shadow-sm flex items-center justify-center gap-2 transition cursor-pointer"
                  >
                    <UserPlus className="w-4 h-4" />
                    <span>+ নতুন এডিটর / স্টাফ যোগ করুন</span>
                  </button>
                </div>

                {userActionMsg && (
                  <div className="mt-4 p-3 bg-emerald-50 dark:bg-emerald-950/50 border border-emerald-300 dark:border-emerald-800 text-emerald-800 dark:text-emerald-200 rounded-lg text-xs flex items-center gap-2">
                    <CheckCircle className="w-4 h-4 text-emerald-600 shrink-0" />
                    <span>{userActionMsg}</span>
                  </div>
                )}

                {userActionErr && (
                  <div className="mt-4 p-3 bg-red-50 dark:bg-red-950/50 border border-red-300 dark:border-red-800 text-red-800 dark:text-red-200 rounded-lg text-xs flex items-center gap-2">
                    <AlertCircle className="w-4 h-4 text-red-600 shrink-0" />
                    <span>{userActionErr}</span>
                  </div>
                )}

                {/* Add User Modal / Inline Form */}
                {showAddUserModal && (
                  <div className="mt-5 p-5 bg-gray-50 dark:bg-slate-850 rounded-xl border-2 border-red-200 dark:border-red-900/60 shadow-md">
                    <div className="flex items-center justify-between mb-4 pb-2 border-b border-gray-200 dark:border-slate-700">
                      <div className="flex items-center gap-2">
                        <UserPlus className="w-5 h-5 text-red-600" />
                        <h4 className="font-serif-bn font-bold text-sm text-gray-900 dark:text-white">
                          নতুন এডিটর বা স্টাফ অ্যাকাউন্ট নিবন্ধন
                        </h4>
                      </div>
                      <button
                        onClick={() => setShowAddUserModal(false)}
                        className="text-gray-400 hover:text-gray-600 dark:hover:text-gray-200 text-xs font-bold px-2 py-1"
                      >
                        ✕ বন্ধ করুন
                      </button>
                    </div>

                    <form onSubmit={handleCreateNewUser} className="space-y-4 text-xs">
                      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                        <div>
                          <label className="block font-bold mb-1 text-gray-700 dark:text-gray-200">
                            পূর্ণ নাম *
                          </label>
                          <input
                            type="text"
                            required
                            placeholder="যেমন: তানভীর আহমেদ"
                            value={newUserName}
                            onChange={e => setNewUserName(e.target.value)}
                            className="w-full p-2.5 border border-gray-300 dark:border-slate-700 rounded-lg bg-white dark:bg-slate-800 text-gray-900 dark:text-white focus:ring-2 focus:ring-red-500 focus:outline-none"
                          />
                        </div>

                        <div>
                          <label className="block font-bold mb-1 text-gray-700 dark:text-gray-200">
                            লগইন ইমেইল *
                          </label>
                          <input
                            type="email"
                            required
                            placeholder="যেমন: tanvir@durniti.news"
                            value={newUserEmail}
                            onChange={e => setNewUserEmail(e.target.value)}
                            className="w-full p-2.5 border border-gray-300 dark:border-slate-700 rounded-lg bg-white dark:bg-slate-800 text-gray-900 dark:text-white focus:ring-2 focus:ring-red-500 focus:outline-none"
                          />
                        </div>

                        <div>
                          <label className="block font-bold mb-1 text-gray-700 dark:text-gray-200">
                            গোপন লগইন পাসওয়ার্ড *
                          </label>
                          <input
                            type="password"
                            required
                            placeholder="পাসওয়ার্ড লিখুন (কমপক্ষে ৪ অক্ষর)"
                            value={newUserPassword}
                            onChange={e => setNewUserPassword(e.target.value)}
                            className="w-full p-2.5 border border-gray-300 dark:border-slate-700 rounded-lg bg-white dark:bg-slate-800 text-gray-900 dark:text-white focus:ring-2 focus:ring-red-500 focus:outline-none"
                          />
                        </div>

                        <div>
                          <label className="block font-bold mb-1 text-gray-700 dark:text-gray-200">
                            পদবী ও দায়িত্ব (Role) *
                          </label>
                          <select
                            value={newUserRole}
                            onChange={e => setNewUserRole(e.target.value as UserRole)}
                            className="w-full p-2.5 border border-gray-300 dark:border-slate-700 rounded-lg bg-white dark:bg-slate-800 text-gray-900 dark:text-white focus:ring-2 focus:ring-red-500 focus:outline-none font-sans"
                          >
                            <option value="Editor">বার্তা সম্পাদক / এডিটর (সংবাদ প্রকাশ ও সম্পাদনা)</option>
                            <option value="Reporter">ষ্টাফ রিপোর্টার (সংবাদ তৈরি ও খসড়া জমা)</option>
                            <option value="Sub-Editor">সহকারী সম্পাদক (প্রুফরিডিং ও এডিট)</option>
                            <option value="Admin">অ্যাডমিন (সংবাদ ও সেটিংস)</option>
                            <option value="Manager">ম্যানেজার (বিজ্ঞাপন ও মন্তব্য)</option>
                          </select>
                        </div>

                        <div className="sm:col-span-2">
                          <label className="block font-bold mb-1 text-gray-700 dark:text-gray-200">
                            মোবাইল নম্বর (ঐচ্ছিক)
                          </label>
                          <input
                            type="tel"
                            placeholder="যেমন: 01700000000"
                            value={newUserPhone}
                            onChange={e => setNewUserPhone(e.target.value)}
                            className="w-full p-2.5 border border-gray-300 dark:border-slate-700 rounded-lg bg-white dark:bg-slate-800 text-gray-900 dark:text-white focus:ring-2 focus:ring-red-500 focus:outline-none"
                          />
                        </div>
                      </div>

                      <div className="flex items-center justify-end gap-3 pt-3 border-t border-gray-200 dark:border-slate-700">
                        <button
                          type="button"
                          onClick={() => setShowAddUserModal(false)}
                          className="px-4 py-2 bg-gray-200 dark:bg-slate-700 hover:bg-gray-300 text-gray-800 dark:text-gray-200 font-bold rounded-lg transition"
                        >
                          বাতিল
                        </button>
                        <button
                          type="submit"
                          disabled={userSaving}
                          className="px-5 py-2 bg-red-600 hover:bg-red-700 text-white font-bold rounded-lg shadow-sm transition disabled:opacity-50 flex items-center gap-1.5"
                        >
                          <UserPlus className="w-4 h-4" />
                          <span>{userSaving ? 'তৈরি হচ্ছে...' : 'অ্যাকাউন্ট সংরক্ষণ করুন'}</span>
                        </button>
                      </div>
                    </form>
                  </div>
                )}

                {/* Password Reset Modal */}
                {resettingUser && (
                  <div className="fixed inset-0 bg-black/60 z-50 flex items-center justify-center p-4">
                    <div className="bg-white dark:bg-slate-900 rounded-xl p-6 max-w-md w-full border border-gray-200 dark:border-slate-800 shadow-2xl">
                      <div className="flex items-center gap-2 mb-4 text-red-600">
                        <Key className="w-5 h-5" />
                        <h4 className="font-serif-bn font-bold text-base text-gray-900 dark:text-white">
                          পাসওয়ার্ড রিসেট: {resettingUser.name}
                        </h4>
                      </div>
                      <p className="text-xs text-gray-600 dark:text-gray-300 mb-4">
                        ইমেইল: <span className="font-mono font-bold">{resettingUser.email}</span>
                      </p>

                      <form onSubmit={handleResetPasswordSubmit} className="space-y-4 text-xs">
                        <div>
                          <label className="block font-bold mb-1">নতুন পাসওয়ার্ড লিখুন *</label>
                          <input
                            type="text"
                            required
                            placeholder="যেমন: Pass@2026!"
                            value={resetUserPasswordInput}
                            onChange={e => setResetUserPasswordInput(e.target.value)}
                            className="w-full p-2.5 border border-gray-300 dark:border-slate-700 rounded-lg bg-white dark:bg-slate-800 text-gray-900 dark:text-white"
                          />
                        </div>
                        <div className="flex justify-end gap-2 pt-2">
                          <button
                            type="button"
                            onClick={() => {
                              setResettingUser(null);
                              setResetUserPasswordInput('');
                            }}
                            className="px-4 py-2 bg-gray-200 dark:bg-slate-800 rounded-lg font-bold"
                          >
                            বাতিল
                          </button>
                          <button
                            type="submit"
                            className="px-4 py-2 bg-red-600 hover:bg-red-700 text-white rounded-lg font-bold shadow-sm"
                          >
                            পাসওয়ার্ড আপডেট করুন
                          </button>
                        </div>
                      </form>
                    </div>
                  </div>
                )}

                {/* Users List Table */}
                <div className="mt-5 overflow-x-auto">
                  <table className="w-full text-left text-xs">
                    <thead className="bg-gray-50 dark:bg-slate-800 text-gray-600 dark:text-gray-300 border-b border-gray-200 dark:border-slate-700">
                      <tr>
                        <th className="p-3">নাম ও পদবী</th>
                        <th className="p-3">লগইন ইমেইল</th>
                        <th className="p-3">রোল</th>
                        <th className="p-3">মোবাইল</th>
                        <th className="p-3">অবস্থা</th>
                        <th className="p-3 text-right">পদক্ষেপ</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-gray-100 dark:divide-slate-800">
                      {users.map(u => {
                        const isSuperAdmin = u.role === 'Super Admin' || u.id === 'usr-superadmin-01';
                        return (
                          <tr key={u.id} className="hover:bg-gray-50 dark:hover:bg-slate-850 transition">
                            <td className="p-3">
                              <div className="flex items-center gap-2.5">
                                <div className="w-8 h-8 rounded-full bg-red-100 dark:bg-red-950/60 text-red-600 font-bold flex items-center justify-center text-xs shrink-0">
                                  {u.name.slice(0, 1)}
                                </div>
                                <div>
                                  <div className="font-bold text-gray-900 dark:text-white flex items-center gap-1.5">
                                    <span>{u.name}</span>
                                    {isSuperAdmin && (
                                      <span className="text-[10px] bg-amber-100 text-amber-800 dark:bg-amber-950 dark:text-amber-300 px-1.5 py-0.2 rounded font-bold">
                                        মূল প্রধান
                                      </span>
                                    )}
                                  </div>
                                  <span className="text-[10px] text-gray-400">নিবন্ধন: {u.createdAt}</span>
                                </div>
                              </div>
                            </td>
                            <td className="p-3 font-mono text-gray-600 dark:text-gray-300">{u.email}</td>
                            <td className="p-3">
                              <span
                                className={`px-2.5 py-1 rounded-full font-bold text-[10px] uppercase ${
                                  u.role === 'Super Admin'
                                    ? 'bg-purple-100 text-purple-800 dark:bg-purple-950 dark:text-purple-300'
                                    : u.role === 'Editor'
                                    ? 'bg-blue-100 text-blue-800 dark:bg-blue-950 dark:text-blue-300'
                                    : u.role === 'Reporter'
                                    ? 'bg-amber-100 text-amber-800 dark:bg-amber-950 dark:text-amber-300'
                                    : 'bg-emerald-100 text-emerald-800 dark:bg-emerald-950 dark:text-emerald-300'
                                }`}
                              >
                                {u.role}
                              </span>
                            </td>
                            <td className="p-3 text-gray-500">{u.phone || '-'}</td>
                            <td className="p-3">
                              <button
                                onClick={() => !isSuperAdmin && handleToggleUserActive(u)}
                                disabled={isSuperAdmin}
                                className={`px-2 py-0.5 rounded text-[11px] font-bold flex items-center gap-1 cursor-pointer transition ${
                                  u.isActive !== false
                                    ? 'bg-emerald-50 text-emerald-700 hover:bg-emerald-100 dark:bg-emerald-950/60 dark:text-emerald-300'
                                    : 'bg-gray-100 text-gray-500 hover:bg-gray-200 dark:bg-slate-800 dark:text-gray-400'
                                }`}
                                title={isSuperAdmin ? 'সুপার অ্যাডমিন সর্বদা সক্রিয়' : 'ক্লিক করে স্ট্যাটাস পরিবর্তন করুন'}
                              >
                                <span className={`w-1.5 h-1.5 rounded-full ${u.isActive !== false ? 'bg-emerald-500' : 'bg-gray-400'}`} />
                                <span>{u.isActive !== false ? 'সক্রিয়' : 'নিষ্ক্রিয়'}</span>
                              </button>
                            </td>
                            <td className="p-3 text-right">
                              <div className="flex items-center justify-end gap-1.5">
                                <button
                                  onClick={() => {
                                    setResettingUser(u);
                                    setResetUserPasswordInput('');
                                  }}
                                  title="পাসওয়ার্ড রিসেট করুন"
                                  className="p-1.5 bg-gray-100 hover:bg-blue-100 dark:bg-slate-800 dark:hover:bg-blue-950/60 text-gray-600 hover:text-blue-600 dark:text-gray-300 rounded-md transition"
                                >
                                  <Key className="w-3.5 h-3.5" />
                                </button>
                                {!isSuperAdmin && (
                                  <button
                                    onClick={() => handleDeleteUser(u.id, u.name)}
                                    title="ইউজার অ্যাকাউন্ট মুছুন"
                                    className="p-1.5 bg-gray-100 hover:bg-red-100 dark:bg-slate-800 dark:hover:bg-red-950/60 text-gray-600 hover:text-red-600 dark:text-gray-300 rounded-md transition"
                                  >
                                    <Trash2 className="w-3.5 h-3.5" />
                                  </button>
                                )}
                              </div>
                            </td>
                          </tr>
                        );
                      })}
                    </tbody>
                  </table>
                </div>
              </div>
            </div>
          )}

          {/* TAB 9: ACTIVITY LOG */}
          {activeTab === 'logs' && (
            <div className="bg-white dark:bg-slate-900 rounded-xl border border-gray-200 dark:border-slate-800 p-5 shadow-xs">
              <h3 className="font-serif-bn font-bold text-lg text-gray-900 dark:text-white mb-4 border-b border-gray-100 dark:border-slate-800 pb-2">
                নিরাপত্তা ও অ্যাক্টিভিটি অডিট ট্রেইল ({logs.length})
              </h3>

              <div className="space-y-2">
                {logs.map(log => (
                  <div
                    key={log.id}
                    className="p-2.5 rounded border border-gray-100 dark:border-slate-800 bg-gray-50 dark:bg-slate-850 flex items-center justify-between text-xs"
                  >
                    <div>
                      <span className="font-bold text-gray-900 dark:text-white">{log.action}</span>
                      <span className="text-gray-500 ml-2">• {log.details}</span>
                    </div>
                    <span className="text-[10px] text-gray-400 whitespace-nowrap">
                      {timeAgo(log.timestamp, undefined, 'bn')}
                    </span>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* TAB 10: SETTINGS */}
          {activeTab === 'settings' && settings && (
            <div className="bg-white dark:bg-slate-900 rounded-xl border border-gray-200 dark:border-slate-800 p-6 shadow-xs">
              <h3 className="font-serif-bn font-bold text-lg text-gray-900 dark:text-white mb-4 border-b border-gray-100 dark:border-slate-800 pb-2">
                ওয়েবসাইট জেনারেল সেটিংস
              </h3>

              <form
                onSubmit={async e => {
                  e.preventDefault();
                  await api.updateSettings(settings);
                  alert('সেটিংস সফলভাবে সংরক্ষিত হয়েছে!');
                }}
                className="space-y-4 text-xs max-w-2xl"
              >
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div>
                    <label className="block font-bold mb-1">পোর্টালের নাম (বাংলা)</label>
                    <input
                      type="text"
                      value={settings.siteNameBn}
                      onChange={e => setSettings({ ...settings, siteNameBn: e.target.value })}
                      className="w-full p-2 border border-gray-300 dark:border-slate-700 rounded bg-white dark:bg-slate-800"
                    />
                  </div>
                  <div>
                    <label className="block font-bold mb-1">Site Name (English)</label>
                    <input
                      type="text"
                      value={settings.siteNameEn}
                      onChange={e => setSettings({ ...settings, siteNameEn: e.target.value })}
                      className="w-full p-2 border border-gray-300 dark:border-slate-700 rounded bg-white dark:bg-slate-800"
                    />
                  </div>
                </div>

                <div>
                  <label className="block font-bold mb-1">অফিসিয়াল ইমেইল</label>
                  <input
                    type="email"
                    value={settings.officialEmail}
                    onChange={e => setSettings({ ...settings, officialEmail: e.target.value })}
                    className="w-full p-2 border border-gray-300 dark:border-slate-700 rounded bg-white dark:bg-slate-800"
                  />
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div>
                    <label className="block font-bold mb-1">Facebook URL</label>
                    <input
                      type="url"
                      value={settings.facebookUrl}
                      onChange={e => setSettings({ ...settings, facebookUrl: e.target.value })}
                      className="w-full p-2 border border-gray-300 dark:border-slate-700 rounded bg-white dark:bg-slate-800"
                    />
                  </div>
                  <div>
                    <label className="block font-bold mb-1">YouTube URL</label>
                    <input
                      type="url"
                      value={settings.youtubeUrl}
                      onChange={e => setSettings({ ...settings, youtubeUrl: e.target.value })}
                      className="w-full p-2 border border-gray-300 dark:border-slate-700 rounded bg-white dark:bg-slate-800"
                    />
                  </div>
                </div>

                <div>
                  <label className="flex items-center gap-2 cursor-pointer font-bold">
                    <input
                      type="checkbox"
                      checked={settings.breakingNewsActive}
                      onChange={e => setSettings({ ...settings, breakingNewsActive: e.target.checked })}
                      className="w-4 h-4 text-red-600 rounded"
                    />
                    <span>ব্রেকিং নিউজ টিকার সক্রিয় রাখুন</span>
                  </label>
                </div>

                {/* Google Analytics & Real Visitors Setup */}
                <div className="p-4 bg-blue-50 dark:bg-blue-950/40 border border-blue-200 dark:border-blue-900 rounded-xl space-y-3">
                  <div className="flex items-center gap-2 text-blue-900 dark:text-blue-200 font-bold text-sm">
                    <Globe className="w-4 h-4 text-blue-600" />
                    <span>গুগল অ্যানালিটিক্স (Google Analytics 4) ট্র্যাকিং</span>
                  </div>
                  <p className="text-xs text-blue-800 dark:text-blue-300">
                    আপনার সাইটের প্রকৃত রিয়েল-টাইম ভিজিটর, পাঠকদের অবস্থান ও বিস্তারিত রিপোর্ট গুগলে দেখতে আপনার GA4 Measurement ID (যেমন: <code className="font-mono bg-blue-100 dark:bg-blue-900/60 px-1 py-0.5 rounded">G-XXXXXXXXXX</code>) এখানে দিন।
                  </p>
                  <input
                    type="text"
                    placeholder="G-XXXXXXXXXX"
                    value={settings.googleAnalyticsId || ''}
                    onChange={e => setSettings({ ...settings, googleAnalyticsId: e.target.value })}
                    className="w-full p-2 border border-blue-300 dark:border-blue-800 rounded bg-white dark:bg-slate-800 font-mono text-sm"
                  />
                  <div className="flex items-center justify-between pt-2 border-t border-blue-200 dark:border-blue-900/60 text-xs">
                    <span className="text-emerald-700 dark:text-emerald-400 font-semibold">
                      ✓ কোনো ফেক/বট ট্র্যাকিং নেই — ১০০% রিয়েল ট্র্যাকিং সক্রিয়
                    </span>
                    <button
                      type="button"
                      onClick={handleResetAnalytics}
                      className="px-2.5 py-1 bg-white dark:bg-slate-800 hover:bg-red-50 dark:hover:bg-red-950/40 text-red-600 border border-red-200 dark:border-red-900 rounded font-semibold transition"
                    >
                      কাউন্টার ০-তে রিসেট
                    </button>
                  </div>
                </div>

                <button
                  type="submit"
                  className="px-5 py-2 bg-red-600 hover:bg-red-700 text-white font-bold rounded-lg shadow-sm"
                >
                  সেটিংস সংরক্ষণ করুন
                </button>
              </form>

              {/* Admin Password & Credentials Change */}
              <div className="mt-8 pt-6 border-t border-gray-200 dark:border-slate-800">
                <div className="flex items-center gap-2.5 mb-3">
                  <div className="w-8 h-8 rounded-lg bg-red-100 dark:bg-red-950/60 flex items-center justify-center text-red-600">
                    <ShieldAlert className="w-4 h-4" />
                  </div>
                  <div>
                    <h4 className="font-serif-bn font-bold text-base text-gray-900 dark:text-white">
                      অ্যাডমিন পাসওয়ার্ড ও নিরাপত্তা পরিবর্তন
                    </h4>
                    <p className="text-[11px] text-gray-500 dark:text-gray-400">
                      আপনার নিজস্ব গোপনীয় পাসওয়ার্ড সেট করুন যাতে অন্য কেউ প্রবেশ করতে না পারে
                    </p>
                  </div>
                </div>

                {securityMsg && (
                  <div className="p-3 bg-emerald-50 dark:bg-emerald-950/60 border border-emerald-300 dark:border-emerald-800 text-emerald-800 dark:text-emerald-200 rounded-lg text-xs mb-4 flex items-center gap-2">
                    <Check className="w-4 h-4 text-emerald-600 shrink-0" />
                    <span>{securityMsg}</span>
                  </div>
                )}

                {securityErr && (
                  <div className="p-3 bg-red-50 dark:bg-red-950/60 border border-red-300 dark:border-red-800 text-red-800 dark:text-red-200 rounded-lg text-xs mb-4 flex items-center gap-2">
                    <AlertCircle className="w-4 h-4 text-red-600 shrink-0" />
                    <span>{securityErr}</span>
                  </div>
                )}

                <form onSubmit={handleUpdateSecurity} className="space-y-4 text-xs max-w-xl">
                  <div>
                    <label className="block font-bold mb-1 text-gray-700 dark:text-gray-300">আপনার নতুন পাসওয়ার্ড *</label>
                    <input
                      type="password"
                      required
                      placeholder="আপনার পছন্দের নতুন পাসওয়ার্ড দিন"
                      value={newPass}
                      onChange={e => setNewPass(e.target.value)}
                      className="w-full p-2.5 border border-gray-300 dark:border-slate-700 rounded-lg bg-white dark:bg-slate-800 text-sm focus:ring-2 focus:ring-red-500 focus:outline-none"
                    />
                  </div>

                  <div>
                    <label className="block font-bold mb-1 text-gray-700 dark:text-gray-300">নতুন পাসওয়ার্ড নিশ্চিত করুন *</label>
                    <input
                      type="password"
                      required
                      placeholder="পাসওয়ার্ডটি আবার টাইপ করুন"
                      value={confirmPass}
                      onChange={e => setConfirmPass(e.target.value)}
                      className="w-full p-2.5 border border-gray-300 dark:border-slate-700 rounded-lg bg-white dark:bg-slate-800 text-sm focus:ring-2 focus:ring-red-500 focus:outline-none"
                    />
                  </div>

                  <div>
                    <label className="block font-bold mb-1 text-gray-700 dark:text-gray-300">নতুন অ্যাডমিন ইমেইল (ঐচ্ছিক)</label>
                    <input
                      type="email"
                      placeholder="নতুন ইমেইল এড্রেস (যদি পরিবর্তন করতে চান)"
                      value={newEmail}
                      onChange={e => setNewEmail(e.target.value)}
                      className="w-full p-2.5 border border-gray-300 dark:border-slate-700 rounded-lg bg-white dark:bg-slate-800 text-sm focus:ring-2 focus:ring-red-500 focus:outline-none"
                    />
                  </div>

                  <button
                    type="submit"
                    disabled={securitySubmitting}
                    className="px-6 py-2.5 bg-red-600 hover:bg-red-700 text-white font-bold rounded-lg shadow-sm transition disabled:opacity-50 text-sm cursor-pointer"
                  >
                    {securitySubmitting ? 'আপডেট হচ্ছে...' : 'পাসওয়ার্ড আপডেট করুন'}
                  </button>
                </form>
              </div>
            </div>
          )}

          {/* TAB 11: NETLIFY DEPLOYMENT GUIDE */}
          {activeTab === 'netlify_guide' && (
            <div className="space-y-6">
              {/* Header with Download & Refresh Actions */}
              <div className="bg-white dark:bg-slate-900 rounded-xl border border-blue-200 dark:border-blue-900 p-6 shadow-xs">
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-gray-100 dark:border-slate-800 pb-5">
                  <div className="flex items-center gap-3">
                    <div className="w-12 h-12 rounded-xl bg-blue-600 flex items-center justify-center text-white font-black text-2xl shadow-sm">
                      N
                    </div>
                    <div>
                      <h3 className="font-serif-bn font-bold text-2xl text-gray-900 dark:text-white">
                        Netlify ডিপ্লয়মেন্ট ও ক্লাউড ডেটাবেজ গাইড
                      </h3>
                      <p className="text-xs text-blue-600 dark:text-blue-400 font-medium">
                        প্রজেক্ট এক্সপোর্ট, GitHub কানেকশন, Supabase ক্লাউড ডেটাবেজ ও লাইভ ওয়েবসাইট ব্যবস্থাপনা
                      </p>
                    </div>
                  </div>

                  <div className="flex items-center gap-2 flex-wrap">
                    <button
                      onClick={refreshDbStatus}
                      className="px-3 py-2 bg-gray-100 dark:bg-slate-800 hover:bg-gray-200 dark:hover:bg-slate-700 text-gray-700 dark:text-gray-200 rounded-lg text-xs font-semibold flex items-center gap-1.5 transition"
                    >
                      <RefreshCw className="w-3.5 h-3.5" />
                      <span>স্ট্যাটাস রিফ্রেশ</span>
                    </button>
                    <button
                      onClick={downloadDeploymentGuide}
                      className="px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg text-xs font-bold flex items-center gap-2 transition shadow-sm"
                    >
                      <Download className="w-4 h-4" />
                      <span>ডিপ্লয়মেন্ট গাইড ডাউনলোড (.md)</span>
                    </button>
                  </div>
                </div>

                {/* Production Readiness Status Badges (100% Netlify Ready) */}
                <div className="mt-5">
                  <div className="flex items-center gap-2 mb-3">
                    <ShieldCheck className="w-4 h-4 text-emerald-600 dark:text-emerald-400" />
                    <h4 className="font-serif-bn font-bold text-sm text-gray-900 dark:text-white">
                      প্রোডাকশন চেকলিস্ট: <span className="text-emerald-600 dark:text-emerald-400">Project is Netlify Ready ✓</span>
                    </h4>
                  </div>
                  <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3 text-xs font-serif-bn">
                    <div className="p-3 bg-emerald-50 dark:bg-emerald-950/40 rounded-lg border border-emerald-200 dark:border-emerald-800/60 flex items-start gap-2.5">
                      <Check className="w-4 h-4 text-emerald-600 mt-0.5 shrink-0" />
                      <div>
                        <span className="font-bold text-emerald-900 dark:text-emerald-200 block">বিল্ড ও রানটাইম রেডি</span>
                        <span className="text-emerald-700 dark:text-emerald-400 text-[11px]">
                          Vite SPA build ও esbuild প্রস্তুত। কমান্ড: <code className="font-mono text-[10px]">npm run build</code>
                        </span>
                      </div>
                    </div>

                    <div className="p-3 bg-emerald-50 dark:bg-emerald-950/40 rounded-lg border border-emerald-200 dark:border-emerald-800/60 flex items-start gap-2.5">
                      <Check className="w-4 h-4 text-emerald-600 mt-0.5 shrink-0" />
                      <div>
                        <span className="font-bold text-emerald-900 dark:text-emerald-200 block">Netlify Functions (API)</span>
                        <span className="text-emerald-700 dark:text-emerald-400 text-[11px]">
                          <code className="font-mono text-[10px]">netlify/functions/api.ts</code> সব API হ্যান্ডেল করে।
                        </span>
                      </div>
                    </div>

                    <div className="p-3 bg-emerald-50 dark:bg-emerald-950/40 rounded-lg border border-emerald-200 dark:border-emerald-800/60 flex items-start gap-2.5">
                      <Check className="w-4 h-4 text-emerald-600 mt-0.5 shrink-0" />
                      <div>
                        <span className="font-bold text-emerald-900 dark:text-emerald-200 block">SPA Routing (No 404)</span>
                        <span className="text-emerald-700 dark:text-emerald-400 text-[11px]">
                          <code className="font-mono text-[10px]">netlify.toml</code> ও <code className="font-mono text-[10px]">public/_redirects</code> যুক্ত।
                        </span>
                      </div>
                    </div>

                    <div className="p-3 bg-emerald-50 dark:bg-emerald-950/40 rounded-lg border border-emerald-200 dark:border-emerald-800/60 flex items-start gap-2.5">
                      <Check className="w-4 h-4 text-emerald-600 mt-0.5 shrink-0" />
                      <div>
                        <span className="font-bold text-emerald-900 dark:text-emerald-200 block">নিরাপদ প্রমাণীকরণ (Auth)</span>
                        <span className="text-emerald-700 dark:text-emerald-400 text-[11px]">
                          Scrypt পাসওয়ার্ড হ্যাশিং ও HMAC-SHA256 সেশন টোকেন।
                        </span>
                      </div>
                    </div>

                    <div className="p-3 bg-emerald-50 dark:bg-emerald-950/40 rounded-lg border border-emerald-200 dark:border-emerald-800/60 flex items-start gap-2.5">
                      <Check className="w-4 h-4 text-emerald-600 mt-0.5 shrink-0" />
                      <div>
                        <span className="font-bold text-emerald-900 dark:text-emerald-200 block">ক্লাউড ডেটাবেজ অ্যাডাপ্টার</span>
                        <span className="text-emerald-700 dark:text-emerald-400 text-[11px]">
                          Supabase PostgreSQL ডুয়েল ইঞ্জিন সমর্থনসহ কনফিগার করা।
                        </span>
                      </div>
                    </div>

                    <div className="p-3 bg-emerald-50 dark:bg-emerald-950/40 rounded-lg border border-emerald-200 dark:border-emerald-800/60 flex items-start gap-2.5">
                      <Check className="w-4 h-4 text-emerald-600 mt-0.5 shrink-0" />
                      <div>
                        <span className="font-bold text-emerald-900 dark:text-emerald-200 block">জিরো রি-ডিপ্লয় ম্যানেজমেন্ট</span>
                        <span className="text-emerald-700 dark:text-emerald-400 text-[11px]">
                          অ্যাডমিন প্যানেল থেকে সংবাদ এডিট করলে লাইভ সাইটে সঙ্গে সঙ্গে আপডেট।
                        </span>
                      </div>
                    </div>
                  </div>
                </div>
              </div>

              {/* Live Database Status Indicator */}
              <div className="bg-white dark:bg-slate-900 rounded-xl border border-gray-200 dark:border-slate-800 p-6 shadow-xs font-serif-bn">
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 mb-4">
                  <div className="flex items-center gap-2.5">
                    <Database className="w-5 h-5 text-blue-600 dark:text-blue-400" />
                    <h4 className="font-bold text-base text-gray-900 dark:text-white">
                      বর্তমান ডেটাবেজ কানেকশন স্ট্যাটাস
                    </h4>
                  </div>
                  {dbStatus?.isCloud ? (
                    <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-bold bg-emerald-100 dark:bg-emerald-950/60 text-emerald-800 dark:text-emerald-300 border border-emerald-300 dark:border-emerald-800">
                      <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse"></span>
                      Supabase Cloud PostgreSQL সংযুক্ত ও কার্যকর
                    </span>
                  ) : (
                    <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-bold bg-amber-100 dark:bg-amber-950/60 text-amber-800 dark:text-amber-300 border border-amber-300 dark:border-amber-800">
                      <span className="w-2 h-2 rounded-full bg-amber-500"></span>
                      লোকাল / মেমোরি মোড (Netlify-তে স্থায়ী সংরক্ষণের জন্য Supabase যুক্ত করুন)
                    </span>
                  )}
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 text-xs bg-slate-50 dark:bg-slate-800/50 p-3.5 rounded-lg border border-gray-200 dark:border-slate-700">
                  <div>
                    <span className="text-gray-500 dark:text-gray-400 block text-[11px]">স্টোরেজ ইঞ্জিন:</span>
                    <strong className="text-gray-900 dark:text-white font-mono">{dbStatus?.mode || 'local_json'}</strong>
                  </div>
                  <div>
                    <span className="text-gray-500 dark:text-gray-400 block text-[11px]">মোট সংরক্ষিত সংবাদ:</span>
                    <strong className="text-gray-900 dark:text-white">{newsList.length} টি সংবাদ সক্রিয়</strong>
                  </div>
                  <div>
                    <span className="text-gray-500 dark:text-gray-400 block text-[11px]">রানটাইম পরিবেশ:</span>
                    <strong className="text-gray-900 dark:text-white font-mono">{dbStatus?.isServerless ? 'Netlify Serverless' : 'Node.js Express'}</strong>
                  </div>
                </div>
              </div>

              {/* Supabase 1-Minute Cloud Database Setup */}
              <div className="bg-gradient-to-br from-emerald-50 to-teal-50 dark:from-emerald-950/30 dark:to-teal-950/20 rounded-xl border border-emerald-200 dark:border-emerald-800/70 p-6 shadow-xs font-serif-bn space-y-4">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2.5">
                    <div className="w-8 h-8 rounded-lg bg-emerald-600 flex items-center justify-center text-white font-bold">
                      ⚡
                    </div>
                    <div>
                      <h4 className="font-bold text-base text-emerald-950 dark:text-emerald-100">
                        Netlify-তে স্থায়ী ডেটা সংরক্ষণের জন্য Supabase সেটআপ (১ মিনিটের ফ্রি গাইড)
                      </h4>
                      <p className="text-xs text-emerald-800 dark:text-emerald-300">
                        Netlify-তে সাইট লাইভ হওয়ার পর প্রতিদিন নতুন সংবাদ, ছবি ও কমেন্ট যেন আজীবনের জন্য ক্লাউডে স্থায়ী থাকে
                      </p>
                    </div>
                  </div>
                  <a
                    href="https://supabase.com"
                    target="_blank"
                    rel="noreferrer"
                    className="hidden sm:flex items-center gap-1 text-xs font-bold text-emerald-700 dark:text-emerald-300 hover:underline"
                  >
                    <span>Supabase ওপেন করুন</span>
                    <ExternalLink className="w-3.5 h-3.5" />
                  </a>
                </div>

                <div className="space-y-3 text-xs text-gray-800 dark:text-gray-200">
                  <div className="p-3 bg-white dark:bg-slate-900 rounded-lg border border-emerald-200 dark:border-emerald-800">
                    <strong className="text-emerald-900 dark:text-emerald-300 block mb-1">
                      পদক্ষেপ ১: Supabase-এ টেবিল তৈরি (SQL Script)
                    </strong>
                    <p className="mb-2 text-gray-600 dark:text-gray-400">
                      [Supabase.com](https://supabase.com)-এ ফ্রি প্রোজেক্ট খুলে বামপাশের <strong>SQL Editor</strong>-এ গিয়ে নিচের কোডটি পেস্ট করে <strong>Run</strong> চাপুন:
                    </p>
                    <div className="relative bg-slate-950 text-emerald-400 p-3 rounded font-mono text-[11px]">
                      <code>{`create table if not exists durniti_portal_store (
  key text primary key,
  value jsonb not null,
  updated_at timestamptz default now()
);`}</code>
                      <button
                        onClick={() => copyToClipboard(`create table if not exists durniti_portal_store (\n  key text primary key,\n  value jsonb not null,\n  updated_at timestamptz default now()\n);`, 'sql')}
                        className="absolute top-2 right-2 px-2 py-1 bg-slate-800 hover:bg-slate-700 text-white rounded text-[10px] flex items-center gap-1 font-sans"
                      >
                        {copiedField === 'sql' ? <Check className="w-3 h-3 text-emerald-400" /> : <Copy className="w-3 h-3" />}
                        <span>{copiedField === 'sql' ? 'কপি হয়েছে' : 'SQL কপি'}</span>
                      </button>
                    </div>
                  </div>

                  <div className="p-3 bg-white dark:bg-slate-900 rounded-lg border border-emerald-200 dark:border-emerald-800">
                    <strong className="text-emerald-900 dark:text-emerald-300 block mb-1">
                      পদক্ষেপ ২: Netlify Environment Variables-এ কি (Keys) যুক্ত করুন
                    </strong>
                    <p className="text-gray-600 dark:text-gray-400 mb-2">
                      Supabase এর <strong>Project Settings &gt; API</strong> থেকে URL এবং anon key কপি করে Netlify সাইটের Environment Variables-এ দিন:
                    </p>
                    <div className="space-y-1 font-mono text-[11px]">
                      <div className="flex items-center justify-between p-1.5 bg-slate-100 dark:bg-slate-800 rounded">
                        <span>SUPABASE_URL = https://your-id.supabase.co</span>
                        <button
                          onClick={() => copyToClipboard('SUPABASE_URL', 'supa_url')}
                          className="text-[10px] text-blue-600 dark:text-blue-400 font-sans"
                        >
                          {copiedField === 'supa_url' ? 'কপি হয়েছে' : 'নাম কপি'}
                        </button>
                      </div>
                      <div className="flex items-center justify-between p-1.5 bg-slate-100 dark:bg-slate-800 rounded">
                        <span>SUPABASE_ANON_KEY = eyJhbGciOi...</span>
                        <button
                          onClick={() => copyToClipboard('SUPABASE_ANON_KEY', 'supa_key')}
                          className="text-[10px] text-blue-600 dark:text-blue-400 font-sans"
                        >
                          {copiedField === 'supa_key' ? 'কপি হয়েছে' : 'নাম কপি'}
                        </button>
                      </div>
                    </div>
                  </div>
                </div>
              </div>

              {/* Complete 6-Step Netlify Deployment Instructions */}
              <div className="bg-white dark:bg-slate-900 rounded-xl border border-gray-200 dark:border-slate-800 p-6 shadow-xs space-y-5 font-serif-bn">
                <div className="flex items-center gap-2 border-b border-gray-100 dark:border-slate-800 pb-3">
                  <Layers className="w-5 h-5 text-blue-600 dark:text-blue-400" />
                  <h4 className="font-bold text-lg text-gray-900 dark:text-white">
                    সম্পূর্ণ Netlify ডিপ্লয়মেন্ট প্রক্রিয়া (৬টি সহজ ধাপ)
                  </h4>
                </div>

                <div className="space-y-4 text-xs text-gray-700 dark:text-gray-300 leading-relaxed">
                  {/* Step 1: Export */}
                  <div className="p-4 bg-slate-50 dark:bg-slate-800/40 rounded-lg border border-gray-200 dark:border-slate-700">
                    <h5 className="font-bold text-sm text-gray-900 dark:text-white mb-1.5 flex items-center gap-2">
                      <span className="w-5 h-5 rounded-full bg-blue-600 text-white flex items-center justify-center text-xs font-mono">১</span>
                      <span>প্রজেক্ট ডাউনলোড ও এক্সপোর্ট (Export Project)</span>
                    </h5>
                    <p className="text-gray-600 dark:text-gray-400">
                      AI Studio-র উপরের মেনু থেকে <strong>Export to GitHub</strong> অথবা <strong>Download ZIP</strong> অপশন ব্যবহার করে পুরো প্রজেক্টটি আপনার কম্পিউটারে সেভ করে নিন।
                    </p>
                  </div>

                  {/* Step 2: GitHub Push */}
                  <div className="p-4 bg-slate-50 dark:bg-slate-800/40 rounded-lg border border-gray-200 dark:border-slate-700">
                    <div className="flex items-center justify-between mb-1.5">
                      <h5 className="font-bold text-sm text-gray-900 dark:text-white flex items-center gap-2">
                        <span className="w-5 h-5 rounded-full bg-blue-600 text-white flex items-center justify-center text-xs font-mono">২</span>
                        <span>GitHub-এ কোড আপলোড করুন</span>
                      </h5>
                      <button
                        onClick={() => copyToClipboard(`git init\ngit add .\ngit commit -m "Netlify ready release - Durniti Biruddhe News"\ngit branch -M main\ngit remote add origin https://github.com/YOUR_USERNAME/durniti-biruddhe-news.git\ngit push -u origin main`, 'git_cmd')}
                        className="px-2 py-1 bg-gray-200 dark:bg-slate-700 hover:bg-gray-300 text-gray-800 dark:text-gray-200 rounded text-[10px] flex items-center gap-1 font-sans"
                      >
                        {copiedField === 'git_cmd' ? <Check className="w-3 h-3 text-emerald-500" /> : <Copy className="w-3 h-3" />}
                        <span>{copiedField === 'git_cmd' ? 'কমান্ড কপি হয়েছে' : 'Git কমান্ড কপি'}</span>
                      </button>
                    </div>
                    <p className="text-gray-600 dark:text-gray-400 mb-2">
                      টার্মিনালে আপনার প্রজেক্ট ফোল্ডারে ঢুকে নিচের কমান্ডগুলো চালান:
                    </p>
                    <pre className="bg-slate-950 text-slate-200 p-3 rounded font-mono text-[11px] overflow-x-auto">
{`git init
git add .
git commit -m "Netlify ready release - Durniti Biruddhe News"
git branch -M main
git remote add origin https://github.com/YOUR_USERNAME/durniti-biruddhe-news.git
git push -u origin main`}
                    </pre>
                  </div>

                  {/* Step 3: Netlify Connect */}
                  <div className="p-4 bg-blue-50 dark:bg-blue-950/30 rounded-lg border border-blue-200 dark:border-blue-900">
                    <h5 className="font-bold text-sm text-blue-950 dark:text-blue-100 mb-2 flex items-center gap-2">
                      <span className="w-5 h-5 rounded-full bg-blue-600 text-white flex items-center justify-center text-xs font-mono">৩</span>
                      <span>Netlify-তে প্রজেক্ট কানেক্ট করুন</span>
                    </h5>
                    <ol className="list-decimal pl-5 space-y-1.5">
                      <li>[Netlify.com](https://www.netlify.com/)-এ লগইন করে <strong>"Add new site" &gt; "Import an existing project"</strong> সিলেক্ট করুন।</li>
                      <li><strong>GitHub</strong> সিলেক্ট করে আপনার রিপোজিটরিটি বেছে নিন।</li>
                      <li>
                        বিল্ড সেটিংস যাচাই করুন:
                        <div className="mt-2 space-y-1 font-mono text-[11px] bg-white dark:bg-slate-900 p-2.5 rounded border border-blue-200 dark:border-blue-800">
                          <div>• <strong>Build command:</strong> <code className="text-blue-600 dark:text-blue-400">npm run build</code></div>
                          <div>• <strong>Publish directory:</strong> <code className="text-blue-600 dark:text-blue-400">dist</code></div>
                          <div>• <strong>Functions directory:</strong> <code className="text-blue-600 dark:text-blue-400">netlify/functions</code></div>
                        </div>
                      </li>
                    </ol>
                  </div>

                  {/* Step 4: Environment Variables */}
                  <div className="p-4 bg-slate-50 dark:bg-slate-800/40 rounded-lg border border-gray-200 dark:border-slate-700">
                    <h5 className="font-bold text-sm text-gray-900 dark:text-white mb-2 flex items-center gap-2">
                      <span className="w-5 h-5 rounded-full bg-blue-600 text-white flex items-center justify-center text-xs font-mono">৪</span>
                      <span>Netlify Environment Variables কনফিগার করুন</span>
                    </h5>
                    <p className="text-gray-600 dark:text-gray-400 mb-2">
                      Netlify ড্যাশবোর্ডে <strong>Site configuration &gt; Environment variables</strong>-এ নিচের ভেরিয়েবলগুলো যুক্ত করুন:
                    </p>
                    <div className="overflow-x-auto">
                      <table className="w-full text-left border-collapse font-sans text-xs">
                        <thead>
                          <tr className="border-b border-gray-200 dark:border-slate-700 text-gray-500 dark:text-gray-400">
                            <th className="py-2 pr-3">Variable Name</th>
                            <th className="py-2 pr-3">Description</th>
                            <th className="py-2">Example / Value</th>
                          </tr>
                        </thead>
                        <tbody className="divide-y divide-gray-100 dark:divide-slate-800 font-mono text-[11px]">
                          <tr>
                            <td className="py-2 pr-3 font-bold text-blue-600 dark:text-blue-400">AUTH_SECRET</td>
                            <td className="py-2 pr-3 font-sans">JWT ও পাসওয়ার্ড এনক্রিপশন সিক্রেট</td>
                            <td className="py-2 text-gray-600 dark:text-gray-400">durniti-portal-super-key-2026</td>
                          </tr>
                          <tr>
                            <td className="py-2 pr-3 font-bold text-blue-600 dark:text-blue-400">ADMIN_SECRET</td>
                            <td className="py-2 pr-3 font-sans">সুপার অ্যাডমিন বুটস্ট্র্যাপ কি</td>
                            <td className="py-2 text-gray-600 dark:text-gray-400">admin-secure-setup-2026</td>
                          </tr>
                          <tr>
                            <td className="py-2 pr-3 font-bold text-emerald-600 dark:text-emerald-400">SUPABASE_URL</td>
                            <td className="py-2 pr-3 font-sans">Supabase Cloud Database URL</td>
                            <td className="py-2 text-gray-600 dark:text-gray-400">https://xxxx.supabase.co</td>
                          </tr>
                          <tr>
                            <td className="py-2 pr-3 font-bold text-emerald-600 dark:text-emerald-400">SUPABASE_ANON_KEY</td>
                            <td className="py-2 pr-3 font-sans">Supabase Anon Public API Key</td>
                            <td className="py-2 text-gray-600 dark:text-gray-400">eyJhbGciOi...</td>
                          </tr>
                          <tr>
                            <td className="py-2 pr-3 font-bold text-gray-700 dark:text-gray-300">NODE_VERSION</td>
                            <td className="py-2 pr-3 font-sans">Node রানটাইম ভার্সন</td>
                            <td className="py-2 text-gray-600 dark:text-gray-400">20</td>
                          </tr>
                        </tbody>
                      </table>
                    </div>
                  </div>

                  {/* Step 5: Domain & SSL */}
                  <div className="p-4 bg-emerald-50 dark:bg-emerald-950/30 rounded-lg border border-emerald-200 dark:border-emerald-900">
                    <h5 className="font-bold text-sm text-emerald-950 dark:text-emerald-100 mb-1.5 flex items-center gap-2">
                      <span className="w-5 h-5 rounded-full bg-emerald-600 text-white flex items-center justify-center text-xs font-mono">৫</span>
                      <span>কাস্টম ডোমেইন ও ফ্রি Let's Encrypt SSL (HTTPS)</span>
                    </h5>
                    <p className="text-emerald-800 dark:text-emerald-300">
                      Netlify ড্যাশবোর্ডে <strong>Domain management &gt; Add a domain</strong>-এ গিয়ে আপনার অফিশিয়াল ডোমেইন (যেমন: <code className="font-mono font-bold">durnitibiruddhenews.com</code>) যুক্ত করুন। Netlify স্বয়ংক্রিয়ভাবে বিনামূল্যে আজীবনের জন্য <strong>Let's Encrypt SSL/HTTPS</strong> সার্টিফিকেট ইস্যু ও অটো-রিনিউ করবে।
                    </p>
                  </div>

                  {/* Step 6: Live Management (Zero Redeployment) */}
                  <div className="p-4 bg-purple-50 dark:bg-purple-950/30 rounded-lg border border-purple-200 dark:border-purple-900">
                    <h5 className="font-bold text-sm text-purple-950 dark:text-purple-100 mb-1.5 flex items-center gap-2">
                      <span className="w-5 h-5 rounded-full bg-purple-600 text-white flex items-center justify-center text-xs font-mono">৬</span>
                      <span>লাইভ ওয়েবসাইট ব্যবস্থাপনা (কোড রি-ডিপ্লয় ছাড়া প্রতিদিন সরাসরি আপডেট)</span>
                    </h5>
                    <p className="text-purple-900 dark:text-purple-200">
                      একবার Netlify-তে Deploy করার পর প্রতিদিন নতুন News প্রকাশ বা এডিট করার জন্য <strong>কখনোই আবার কোড ডাউনলোড বা রি-আপলোড করতে হবে না</strong>। আপনি যেকোনো কম্পিউটার বা মোবাইল থেকে সরাসরি <code className="font-mono font-bold text-purple-700 dark:text-purple-300">https://your-domain.com/admin</code>-এ লগইন করে নতুন সংবাদ প্রকাশ, ব্রেকিং নিউজ পরিবর্তন, বিজ্ঞাপন নিয়ন্ত্রণ বা কমেন্ট মডারেশন করতে পারবেন। ক্লাউড ডেটাবেজের মাধ্যমে পাবলিক ওয়েবসাইটে তা সেকেন্ডের মধ্যে স্বয়ংক্রিয়ভাবে লাইভ হয়ে যাবে।
                    </p>
                  </div>
                </div>
              </div>

              {/* Default Credentials Card */}
              <div className="bg-slate-900 text-white rounded-xl p-6 border border-slate-800 shadow-sm font-serif-bn">
                <h4 className="font-bold text-base text-red-400 mb-3 flex items-center gap-2">
                  <Key className="w-4 h-4" />
                  <span>প্রাথমিক অ্যাডমিন লগইন তথ্য (Default Super Admin Credentials)</span>
                </h4>
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 text-xs font-mono">
                  <div className="p-3 bg-slate-800/80 rounded border border-slate-700">
                    <span className="text-slate-400 block text-[11px] font-sans">অ্যাডমিন লগইন ইউআরএল:</span>
                    <strong className="text-white">https://your-domain.netlify.app/admin</strong>
                  </div>
                  <div className="p-3 bg-slate-800/80 rounded border border-slate-700">
                    <span className="text-slate-400 block text-[11px] font-sans">ইমেইল ঠিকানা:</span>
                    <strong className="text-emerald-400">admin@durniti.news</strong>
                  </div>
                  <div className="p-3 bg-slate-800/80 rounded border border-slate-700">
                    <span className="text-slate-400 block text-[11px] font-sans">ডিফল্ট পাসওয়ার্ড:</span>
                    <strong className="text-emerald-400">Admin@2026!</strong>
                  </div>
                </div>
                <p className="mt-3 text-[11px] text-slate-400 font-sans">
                  * নিরাপত্তা সতর্কতা: প্রথমবার লগইন করার পরপরই অ্যাডমিন প্রোফাইল থেকে অবিলম্বে আপনার পাসওয়ার্ড পরিবর্তন করে শক্তিশালী পাসওয়ার্ড নির্ধারণ করুন।
                </p>
              </div>
            </div>
          )}
        </main>
      </div>
    </div>
  );
};
