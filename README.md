# দুর্নীতির বিরুদ্ধে নিউজ (Durniti Biruddhe News)
### Modern Investigative Digital News Media Portal - Netlify Ready

একটি সম্পূর্ণ প্রফেশনাল, আধুনিক ও প্রিমিয়াম মানের ডিজিটাল নিউজ পোর্টাল ও অনুসন্ধানী সাংবাদিকতা প্ল্যাটফর্ম। বাংলাদেশ ও আন্তর্জাতিক পর্যায়ের দুর্নীতি, অনিয়ম, অপরাধ, সুশাসন, অর্থনীতি, রাজনীতি ও জনস্বার্থের খবর প্রকাশের জন্য বিশেষভাবে নির্মিত।

---

## 🚀 প্রধান বৈশিষ্ট্যসমূহ (Key Features)

- **দ্বিভাষিক পোর্টাল (Bilingual):** সম্পূর্ণ বাংলা (Bangla) ও ইংরেজি (English) ইন্টারফেস ও কনটেন্ট সাপোর্ট।
- **অনুসন্ধানী ও ক্যাটাগরিভিত্তিক সংবাদ:** জাতীয়, দুর্নীতি ও অনুসন্ধান, অর্থনীতি ও ব্যাংক কেলেঙ্কারি, রাজনীতি, অপরাধ ও আদালত, জেলা সংবাদ (৬৪ জেলা ও ৪৯৫ উপজেলা ফিল্টার), আন্তর্জাতিক, মতামত ইত্যাদি।
- **ব্রেকিং নিউজ টিকার:** লাইভ ব্রেকিং নিউজ ও গুরুত্বপূর্ণ নোটিশ স্ক্রলার।
- **নাগরিক সাংবাদিকতা ও অভিযোগ (Whistleblower Tips):** নাগরিকরা গোপনে দুর্নীতি ও অনিয়মের তথ্য, প্রমাণ ও ছবি আপলোড করতে পারেন।
- **শক্তিশালী অ্যাডমিন পোর্টাল (Admin Dashboard):**
  - সংবাদ তৈরি, ড্রাফট, শিডিউল ও প্রকাশনা (CRUD)।
  - ফ্যাক্ট-চেক ও অভিযুক্তের বক্তব্য (Fair Journalism Accordion)।
  - ক্যাটাগরি ব্যবস্থাপনা ও রি-অর্ডারিং।
  - কমেন্ট মডারেশন সিস্টেম।
  - বিজ্ঞাপন নেটওয়ার্ক ব্যবস্থাপনা (Adsterra, Google AdSense, কাস্টম ব্যানার)।
  - পুশ নোটিফিকেশন ও নিউজলেটার সাবস্ক্রিপশন।
  - রোল-বেসড অ্যাক্সেস কন্ট্রোল (Super Admin, Admin, Editor, Reporter, Manager)।
  - বিস্তারিত ভিজিটর ও রিডারশিপ অ্যানালিটিক্স।
  - Netlify ডিপ্লয়মেন্ট গাইড ও ক্লাউড ডেটাবেজ স্ট্যাটাস।
- **Netlify ও Serverless প্রস্তুত:** Netlify Functions (`netlify/functions/api.ts`) ও `netlify.toml` প্রি-কনফিগার করা।
- **ক্লাউড ডেটাবেজ কানেক্টিভিটি:** Supabase (Cloud PostgreSQL) অথবা লোকাল JSON ডেটাবেজ অ্যাডাপ্টার।

---

## 🛠️ প্রযুক্তি কাঠামো (Tech Stack)

- **Frontend:** React 19, TypeScript, Tailwind CSS, Lucide Icons, Motion.
- **Build Tool:** Vite 6.
- **Backend / API:** Netlify Functions (Serverless) + Express 4 (Dual-Engine: runs serverless on Netlify, and full Node.js in development/Docker).
- **Database:** Pluggable Dual-Adapter — Supabase (Cloud PostgreSQL) for permanent live production on Netlify, plus local JSON file fallback.
- **Deployment Platform:** Netlify (Ready with 1-click CI/CD via GitHub).

---

## 💻 লোকাল ডেভেলপমেন্ট (Local Development)

১. রিপোজিটরি ক্লোন করুন বা জিপ আনপ্যাক করুন:
```bash
git clone https://github.com/YOUR_USERNAME/durniti-biruddhe-news.git
cd durniti-biruddhe-news
```

২. ডিপেনডেন্সি ইনস্টল করুন:
```bash
npm install
```

৩. ডেভেলপমেন্ট সার্ভার চালু করুন:
```bash
npm run dev
```
ব্রাউজারে [http://localhost:3000](http://localhost:3000) ওপেন করুন।

---

## 🌐 Netlify-তে ডিপ্লয় করার নিয়ম (Deploy to Netlify)

### ধাপ ১: GitHub-এ রিপোজিটরি আপলোড
```bash
git init
git add .
git commit -m "Netlify ready release - Durniti Biruddhe News"
git branch -M main
git remote add origin https://github.com/YOUR_USERNAME/durniti-biruddhe-news.git
git push -u origin main
```

### ধাপ ২: Netlify-তে প্রজেক্ট কানেক্ট
১. [Netlify](https://www.netlify.com/)-এ লগইন করে **"Add new site"** > **"Import an existing project"** চাপুন।
২. আপনার GitHub রিপোজিটরি সিলেক্ট করুন।
৩. সেটিংস যাচাই করুন:
   - **Build Command:** `npm run build`
   - **Publish directory:** `dist`
   - **Functions directory:** `netlify/functions` (অটোমেটিক্যালি `netlify.toml` থেকে নিয়ে নেবে)

### ধাপ ৩: Environment Variables যোগ করুন
Netlify ড্যাশবোর্ডে **Site configuration** > **Environment variables**-এ গিয়ে নিচের ভেরিয়েবলগুলো যুক্ত করুন:

| Variable Name | Description | Recommended Value |
|---|---|---|
| `AUTH_SECRET` | অ্যাডমিন সেশন টোকেন ও এনক্রিপশন সিক্রেট | `any-random-long-secret-key-32-chars` |
| `ADMIN_SECRET` | সুপার অ্যাডমিন সিক্রেট কি | `admin-secure-2026` |
| `SUPABASE_URL` | Supabase প্রজেক্টের REST URL | `https://your-project.supabase.co` |
| `SUPABASE_ANON_KEY` | Supabase Anon Public API Key | `eyJhbGciOi...` |
| `NODE_VERSION` | নোড রানটাইম সংস্করণ | `20` |

### ধাপ ৪: Supabase ক্লাউড ডেটাবেজ সেটআপ (স্থায়ী ডেটা সংরক্ষণের জন্য)
১. [Supabase.com](https://supabase.com/)-এ বিনামূল্যে একটি অ্যাকাউন্ট খুলে **New Project** তৈরি করুন।
২. বামপাশের মেনু থেকে **SQL Editor**-এ যান এবং নিচের ১টি লাইন চালিয়ে টেবিল তৈরি করুন:
```sql
create table if not exists durniti_portal_store (
  key text primary key,
  value jsonb not null,
  updated_at timestamptz default now()
);
```
৩. **Project Settings** > **API** থেকে `Project URL` ও `anon public key` কপি করে Netlify Environment Variables-এ বসিয়ে দিন।
৪. ব্যাস! এখন আপনার লাইভ সাইটের সমস্ত সংবাদ, অ্যাডমিন এডিট, ক্যাটাগরি ও কমেন্ট সরাসরি Supabase ক্লাউডে স্থায়ীভাবে সেভ থাকবে। সাইট রি-ডিপ্লয় করার প্রয়োজন হবে না!

---

## 🔐 অ্যাডমিন লগইন ও প্রাথমিক তথ্য

ডিপ্লয় শেষে ব্রাউজারে প্রবেশ করুন:
- **URL:** `https://your-domain.netlify.app/admin`
- **ইমেইল:** `admin@durniti.news`
- **পাসওয়ার্ড:** `Admin@2026!`

*লগইন করার পর অ্যাডমিন প্রোফাইল থেকে অবিলম্বে পাসওয়ার্ড পরিবর্তন করে নিজের পছন্দের শক্তিশালী পাসওয়ার্ড দিন।*

---

## 📁 প্রজেক্ট স্ট্রাকচার (Project Structure)

```
durniti-biruddhe-news/
├── netlify/
│   └── functions/
│       └── api.ts             # Netlify Serverless API Functions
├── public/
│   └── _redirects             # Netlify SPA & API rewrite rules
├── src/
│   ├── components/            # UI Components (Header, Footer, NewsCards, AdSlots, etc.)
│   ├── data/                  # Categories, Locations & Initial Seed Data
│   ├── pages/                 # Full Page Views (Home, CategoryPage, StaticPages, AdminPortal)
│   ├── server/                # Express API App & DB persistence logic (Supabase & Local)
│   ├── services/              # Client-side API client
│   ├── types.ts               # Shared TypeScript interfaces
│   ├── App.tsx                # Main App entry with SPA Router
│   └── main.tsx               # React DOM Entrypoint
├── .env.example               # Environment Variables template
├── .gitignore                 # Git ignore rules
├── netlify.toml               # Netlify build, redirects & function config
├── package.json               # Dependencies & scripts
└── README.md                  # Project documentation
```

---

© ২০২৬ দুর্নীতির বিরুদ্ধে নিউজ (Durniti Biruddhe News). সর্বস্বত্ব সংরক্ষিত।
