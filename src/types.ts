export type Language = 'bn' | 'en';

export type NewsStatus = 'Draft' | 'Pending Review' | 'Published' | 'Scheduled' | 'Archived' | 'Deleted';

export type UserRole = 'Super Admin' | 'Admin' | 'Editor' | 'Manager';

export type AdPosition =
  | 'Header Ad'
  | 'Top Banner'
  | 'Homepage Top'
  | 'Homepage Middle'
  | 'Homepage Bottom'
  | 'News Details Top'
  | 'News Details Middle'
  | 'News Details Bottom'
  | 'Sidebar Top'
  | 'Sidebar Middle'
  | 'Sidebar Bottom'
  | 'Footer Ad'
  | 'Mobile Ad';

export interface NewsItem {
  id: string;
  titleBn: string;
  titleEn: string;
  shortDescBn: string;
  shortDescEn: string;
  contentBn: string;
  contentEn: string;
  featuredImage: string;
  additionalImages?: string[];
  videoUrl?: string;
  categoryId: string;
  categoryNameBn: string;
  categoryNameEn: string;
  country: 'Bangladesh' | 'International';
  division?: string;
  district?: string;
  upazila?: string;
  reporterName: string;
  reporterId: string;
  source?: string;
  tags: string[];
  publishDate: string; // YYYY-MM-DD
  publishTime: string; // HH:mm
  updatedAt?: string;
  isBreaking: boolean;
  isFeatured: boolean;
  isPopular: boolean;
  seoTitle?: string;
  seoDescription?: string;
  seoKeywords?: string;
  slug: string;
  status: NewsStatus;
  viewCount: number;
  shareCount: number;
  accusedStatement?: string; // Room for attribution & response of accused parties
  isFactChecked?: boolean;
}

export interface CategoryItem {
  id: string;
  nameBn: string;
  nameEn: string;
  slug: string;
  order: number;
  isActive: boolean;
}

export interface UpazilaItem {
  id: string;
  nameBn: string;
  nameEn: string;
}

export interface DistrictItem {
  id: string;
  nameBn: string;
  nameEn: string;
  upazilas: UpazilaItem[];
}

export interface DivisionItem {
  id: string;
  nameBn: string;
  nameEn: string;
  districts: DistrictItem[];
}

export interface CommentItem {
  id: string;
  newsId: string;
  newsTitle?: string;
  authorName: string;
  authorEmail?: string;
  content: string;
  createdAt: string;
  status: 'Pending' | 'Approved' | 'Rejected' | 'Spam';
}

export interface AdvertisementItem {
  id: string;
  title: string;
  position: AdPosition;
  type: 'banner' | 'script';
  imageUrl?: string;
  targetUrl?: string;
  scriptCode?: string;
  startDate?: string;
  endDate?: string;
  isActive: boolean;
  impressions: number;
  clicks: number;
}

export interface UserItem {
  id: string;
  name: string;
  email: string;
  role: UserRole;
  isActive: boolean;
  createdAt: string;
  lastLogin?: string;
}

export interface ActivityLogItem {
  id: string;
  userId: string;
  userName: string;
  userRole: string;
  action: string;
  details: string;
  timestamp: string;
}

export interface NewsTipItem {
  id: string;
  name: string;
  contact: string;
  email: string;
  title: string;
  location: string;
  description: string;
  attachmentUrl?: string;
  createdAt: string;
  status: 'Pending' | 'Reviewed' | 'Converted';
}

export interface SubscriberItem {
  id: string;
  email?: string;
  endpoint?: string;
  subscribedAt: string;
}

export interface NotificationItem {
  id: string;
  title: string;
  message: string;
  url: string;
  sentAt: string;
  sentBy: string;
  recipientCount: number;
}

export interface AnalyticsData {
  totalVisitors: number;
  todayVisitors: number;
  weeklyVisitors: number;
  monthlyVisitors: number;
  pageViews: number;
  deviceBreakdown: { desktop: number; mobile: number; tablet: number };
  topCategories: { category: string; views: number }[];
}

export interface SiteSettings {
  siteNameBn: string;
  siteNameEn: string;
  taglineBn: string;
  taglineEn: string;
  officialEmail: string;
  youtubeUrl: string;
  facebookUrl: string;
  xUrl?: string;
  whatsappContact?: string;
  phone?: string;
  address?: string;
  breakingNewsActive: boolean;
  autoPublishScheduled: boolean;
  allowComments: boolean;
  commentModeration: boolean;
  copyrightTextBn: string;
  copyrightTextEn: string;
}
