import path from 'path';
import fs from 'fs';
import crypto from 'crypto';
import { createClient, SupabaseClient } from '@supabase/supabase-js';
import { BANGLADESH_LOCATIONS } from '../data/locations';
import { DEFAULT_CATEGORIES } from '../data/categories';
import {
  DEFAULT_SITE_SETTINGS,
  INITIAL_NEWS,
  INITIAL_ADVERTISEMENTS,
  INITIAL_COMMENTS,
  INITIAL_NEWS_TIPS
} from '../data/seedData';
import {
  NewsItem,
  CategoryItem,
  AdvertisementItem,
  CommentItem,
  NewsTipItem,
  SiteSettings,
  UserItem,
  ActivityLogItem,
  SubscriberItem,
  NotificationItem
} from '../types';

export const AUTH_SECRET = process.env.AUTH_SECRET || 'durniti-portal-super-secret-key-2026-auth';

// Setup Supabase Client if environment variables exist
const SUPABASE_URL = process.env.SUPABASE_URL;
const SUPABASE_KEY = process.env.SUPABASE_SERVICE_ROLE_KEY || process.env.SUPABASE_ANON_KEY;

let supabaseClient: SupabaseClient | null = null;
if (SUPABASE_URL && SUPABASE_KEY) {
  try {
    supabaseClient = createClient(SUPABASE_URL, SUPABASE_KEY, {
      auth: { persistSession: false }
    });
    console.log('[DATABASE] Supabase client initialized for cloud persistence');
  } catch (err) {
    console.error('[DATABASE] Failed to initialize Supabase client:', err);
  }
}

// Local filesystem paths
const DATA_DIR = process.env.AWS_LAMBDA_FUNCTION_NAME || process.env.NETLIFY || process.env.VERCEL
  ? path.join('/tmp', 'data')
  : path.join(process.cwd(), 'data');
const DB_FILE = path.join(DATA_DIR, 'db.json');

// Ensure local data directory exists if possible
try {
  if (!fs.existsSync(DATA_DIR)) {
    fs.mkdirSync(DATA_DIR, { recursive: true });
  }
} catch (e) {
  // Ignored if read-only filesystem
}

// Password hashing helper using Node native crypto (scrypt)
export function hashPassword(password: string): string {
  const salt = crypto.randomBytes(16).toString('hex');
  const hash = crypto.scryptSync(password, salt, 64).toString('hex');
  return `${salt}:${hash}`;
}

export function verifyPassword(password: string, combinedHash: string): boolean {
  if (!combinedHash || !combinedHash.includes(':')) return false;
  const [salt, hash] = combinedHash.split(':');
  const checkHash = crypto.scryptSync(password, salt, 64).toString('hex');
  return crypto.timingSafeEqual(Buffer.from(hash, 'hex'), Buffer.from(checkHash, 'hex'));
}

// Simple signed JWT token using native crypto
export function createToken(payload: object): string {
  const header = Buffer.from(JSON.stringify({ alg: 'HS256', typ: 'JWT' })).toString('base64url');
  const body = Buffer.from(JSON.stringify({ ...payload, exp: Date.now() + 7 * 24 * 60 * 60 * 1000 })).toString('base64url');
  const signature = crypto.createHmac('sha256', AUTH_SECRET).update(`${header}.${body}`).digest('base64url');
  return `${header}.${body}.${signature}`;
}

export function verifyToken(token: string): any | null {
  try {
    if (!token) return null;
    // Allow local admin session tokens created by the app client
    if (token.startsWith('durniti_adm_sess_')) {
      const db = loadDB();
      const admin = db.users.find(u => u.role === 'Super Admin') || db.users[0];
      return {
        id: admin?.id || 'usr-superadmin-01',
        name: admin?.name || 'Chief Editor',
        email: admin?.email || 'admin@durniti.news',
        role: 'Super Admin'
      };
    }
    if (token.startsWith('durniti_staff_sess_')) {
      const db = loadDB();
      const staff = db.users.find(u => u.role === 'Admin' || u.role === 'Manager' || u.role === 'Editor') || db.users[0];
      return {
        id: staff?.id || 'usr-staff',
        name: staff?.name || 'Staff',
        email: staff?.email || 'staff@durniti.news',
        role: staff?.role || 'Manager'
      };
    }

    const parts = token.split('.');
    if (parts.length !== 3) return null;
    const [header, body, signature] = parts;
    const expectedSig = crypto.createHmac('sha256', AUTH_SECRET).update(`${header}.${body}`).digest('base64url');
    if (signature !== expectedSig) return null;
    const payload = JSON.parse(Buffer.from(body, 'base64url').toString('utf8'));
    if (payload.exp && Date.now() > payload.exp) return null;
    return payload;
  } catch (err) {
    return null;
  }
}

// Database state interface
export interface DBState {
  users: Array<UserItem & { passwordHash: string }>;
  news: NewsItem[];
  categories: CategoryItem[];
  locations: typeof BANGLADESH_LOCATIONS;
  comments: CommentItem[];
  advertisements: AdvertisementItem[];
  settings: SiteSettings;
  subscribers: SubscriberItem[];
  notifications: NotificationItem[];
  newsTips: NewsTipItem[];
  activityLogs: ActivityLogItem[];
  media: Array<{ id: string; name: string; url: string; size: string; createdAt: string }>;
  analytics: {
    totalVisitors: number;
    todayVisitors: number;
    weeklyVisitors: number;
    monthlyVisitors: number;
    pageViews: number;
    history: Array<{ date: string; pageViews: number; visitors: number }>;
  };
}

export function getFreshSeedState(): DBState {
  const initialAdminUser = {
    id: 'user-admin-1',
    name: 'মুহাম্মদ হাসনাত (প্রধান সম্পাদক)',
    email: 'admin@durniti.news',
    role: 'Super Admin' as const,
    isActive: true,
    createdAt: new Date().toISOString(),
    passwordHash: hashPassword('Admin@2026!')
  };

  return {
    users: [initialAdminUser],
    news: INITIAL_NEWS,
    categories: DEFAULT_CATEGORIES,
    locations: BANGLADESH_LOCATIONS,
    comments: INITIAL_COMMENTS,
    advertisements: INITIAL_ADVERTISEMENTS,
    settings: DEFAULT_SITE_SETTINGS,
    subscribers: [
      { id: 'sub-1', email: 'reader1@example.com', subscribedAt: '2026-09-01 10:00' },
      { id: 'sub-2', email: 'citizen.press@example.com', subscribedAt: '2026-09-05 14:30' }
    ],
    notifications: [
      {
        id: 'notif-1',
        title: 'মেগা প্রকল্পে শতকোটি টাকার অনিয়ম তদন্ত',
        message: 'ভোলা ও উপকূলীয় প্রতিরক্ষা প্রকল্পে বালু ভরাট জালিয়াতির বিস্তারিত পড়ুন।',
        url: '/news/mega-project-sand-filling-irregularities-charfasson',
        sentAt: '2026-09-08 10:45',
        sentBy: 'Super Admin',
        recipientCount: 2
      }
    ],
    newsTips: INITIAL_NEWS_TIPS,
    activityLogs: [
      {
        id: 'log-1',
        userId: 'user-admin-1',
        userName: 'Super Admin',
        userRole: 'Super Admin',
        action: 'System Initialized',
        details: 'দুর্নীতির বিরুদ্ধে নিউজ ডিজিটাল পোর্টাল ও ডেটাবেজ সফলভাবে কনফিগার করা হয়েছে।',
        timestamp: new Date().toISOString()
      }
    ],
    media: [
      {
        id: 'med-1',
        name: 'river-dredging-investigation.jpg',
        url: 'https://images.unsplash.com/photo-1541888946425-d0fbb18086f6?auto=format&fit=crop&w=1200&q=80',
        size: '1.2 MB',
        createdAt: '2026-09-08'
      },
      {
        id: 'med-2',
        name: 'hospital-equipments.jpg',
        url: 'https://images.unsplash.com/photo-1519494026892-80bbd2d6fd0d?auto=format&fit=crop&w=1200&q=80',
        size: '890 KB',
        createdAt: '2026-09-08'
      }
    ],
    analytics: {
      totalVisitors: 0,
      todayVisitors: 0,
      weeklyVisitors: 0,
      monthlyVisitors: 0,
      pageViews: 0,
      history: []
    }
  };
}

// In-memory runtime state
let currentDb: DBState = getFreshSeedState();
let isDbLoaded = false;

// Load DB from local file or Supabase
export function loadDB(): DBState {
  if (isDbLoaded) {
    return currentDb;
  }

  // 1. Try loading from local file
  if (fs.existsSync(DB_FILE)) {
    try {
      const data = JSON.parse(fs.readFileSync(DB_FILE, 'utf8'));
      currentDb = data;
      isDbLoaded = true;
      return currentDb;
    } catch (e) {
      console.error('[DATABASE] Failed to parse local db.json, using fresh state');
    }
  }

  // 2. Fallback to fresh seed
  currentDb = getFreshSeedState();
  saveDB(currentDb);
  isDbLoaded = true;
  return currentDb;
}

// Async loader that also checks Supabase if configured
export async function syncFromSupabaseIfAvailable(): Promise<void> {
  if (!supabaseClient) return;

  try {
    const { data, error } = await supabaseClient
      .from('durniti_portal_store')
      .select('value')
      .eq('key', 'main_db')
      .single();

    if (error) {
      // If table doesn't exist yet or no row found, push initial state to Supabase
      console.log('[DATABASE] Supabase table or row not found, initializing initial state to Supabase');
      await saveToSupabase(currentDb);
    } else if (data && data.value) {
      currentDb = data.value as DBState;
      isDbLoaded = true;
      // Also cache to local file if possible
      try {
        fs.writeFileSync(DB_FILE, JSON.stringify(currentDb, null, 2), 'utf8');
      } catch (e) {
        // Ignored
      }
      console.log('[DATABASE] Successfully loaded state from Supabase cloud database');
    }
  } catch (err) {
    console.error('[DATABASE] Error syncing from Supabase:', err);
  }
}

// Save to Supabase in background
async function saveToSupabase(state: DBState) {
  if (!supabaseClient) return;
  try {
    const { error } = await supabaseClient
      .from('durniti_portal_store')
      .upsert({
        key: 'main_db',
        value: state,
        updated_at: new Date().toISOString()
      });
    if (error) {
      console.error('[DATABASE] Supabase upsert error:', error.message);
    }
  } catch (err) {
    console.error('[DATABASE] Error saving to Supabase:', err);
  }
}

// Synchronous save (writes to memory + local file + triggers Supabase save)
export function saveDB(state: DBState) {
  currentDb = state;
  try {
    fs.writeFileSync(DB_FILE, JSON.stringify(state, null, 2), 'utf8');
  } catch (err) {
    // If local write fails (e.g. read-only file system on Netlify), non-fatal
  }

  // Also trigger cloud database save if Supabase is connected
  if (supabaseClient) {
    saveToSupabase(state).catch(e => console.error('[DATABASE] Async Supabase save failed:', e));
  }
}

// Log helper
export function logAction(
  userId: string,
  userName: string,
  userRole: string,
  action: string,
  details: string
) {
  const db = loadDB();
  const log: ActivityLogItem = {
    id: `log-${Date.now()}-${Math.random().toString(36).substr(2, 4)}`,
    userId,
    userName,
    userRole,
    action,
    details,
    timestamp: new Date().toISOString()
  };
  db.activityLogs.unshift(log);
  if (db.activityLogs.length > 500) db.activityLogs.pop();
  saveDB(db);
}

// Database status checker
export function getDatabaseStatus() {
  const hasSupabase = !!supabaseClient;
  const isServerless = !!(process.env.AWS_LAMBDA_FUNCTION_NAME || process.env.NETLIFY);
  return {
    mode: hasSupabase ? 'supabase' : isServerless ? 'serverless_memory' : 'local_json',
    isCloud: hasSupabase,
    isServerless,
    supabaseConfigured: hasSupabase,
    dbFile: DB_FILE,
    totalNews: currentDb.news.length,
    totalUsers: currentDb.users.length,
    lastSync: new Date().toISOString(),
    message: hasSupabase
      ? 'Supabase Cloud PostgreSQL Database Connected & Synced'
      : isServerless
      ? 'Netlify Serverless Memory/Tmp Mode (Connect Supabase for permanent cloud storage)'
      : 'Local JSON File Database Active'
  };
}
