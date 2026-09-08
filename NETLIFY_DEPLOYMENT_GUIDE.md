# দুর্নীতির বিরুদ্ধে নিউজ (Durniti Biruddhe News)
## Netlify Production Deployment & Cloud Database Integration Guide

একটি আধুনিক, সুরক্ষিত ও প্রিমিয়াম অনুসন্ধানী ডিজিটাল নিউজ পোর্টাল। এই নির্দেশিকাটি অনুসরণ করে আপনি আপনার সম্পূর্ণ ওয়েবসাইটটি খুব সহজে ও নির্ভুলভাবে **Netlify**-তে ডিপ্লয় করতে পারবেন।

---

## 📋 প্রজেক্টের ডিপ্লয়মেন্ট প্রস্তুতি চেকলিস্ট (Production Readiness Checklist)
- [x] **SPA Build & Bundler:** Vite 6 + esbuild প্রস্তুত (`npm run build` -> `dist`)
- [x] **Netlify Serverless API Functions:** `netlify/functions/api.ts` সমস্ত API রুট হ্যান্ডেল করার জন্য কনফিগার করা
- [x] **Netlify Routing Configuration:** `netlify.toml` এবং `public/_redirects` নিশ্চিত করে যাতে কোনো পেজ রিফ্রেশ করলে 404 ত্রুটি না আসে
- [x] **ক্লাউড ডেটাবেজ ডুয়েল ইঞ্জিন:** Supabase PostgreSQL ক্লাউড সাপোর্ট এবং লোকাল ফলব্যাক মোড
- [x] **জিরো কোড রি-ডিপ্লয়মেন্ট:** একবার ডিপ্লয় করার পর প্রতিদিন নতুন নিউজ পাবলিশ বা এডিট করার জন্য কোড হাত দিতে হবে না, সরাসরি ব্রাউজার অ্যাডমিন প্যানেল থেকেই সব নিয়ন্ত্রণ করা যাবে
- [x] **সিকিউরিটি ও প্রমাণীকরণ:** Scrypt পাসওয়ার্ড হ্যাশিং ও HMAC-SHA256 সাইনড সেশন টোকেন

---

## ধাপ ১: প্রজেক্ট ডাউনলোড ও এক্সপোর্ট (Export Project)
১. AI Studio-র উপরের মেনু থেকে **"Download ZIP"** অথবা **"Export to GitHub"** চাপুন।
২. আপনার কম্পিউটারে ফাইলটি আনজিপ করুন।

---

## ধাপ ২: GitHub-এ রিপোজিটরি তৈরি ও কোড আপলোড
টার্মিনালে প্রজেক্টের রুটে গিয়ে নিচের কমান্ডগুলো একবারে রান করুন:
```bash
git init
git add .
git commit -m "Netlify ready release - Durniti Biruddhe News"
git branch -M main
git remote add origin https://github.com/YOUR_USERNAME/durniti-biruddhe-news.git
git push -u origin main
```

---

## ধাপ ৩: Netlify-তে প্রজেক্ট কানেক্ট করুন
১. [Netlify.com](https://www.netlify.com/)-এ গিয়ে একটি ফ্রি একাউন্ট খুলুন অথবা লগইন করুন।
২. **"Add new site"** বাটনে ক্লিক করে **"Import an existing project"** নির্বাচন করুন।
৩. **GitHub** নির্বাচন করে আপনার তৈরি করা রিপোজিটরি বেছে নিন।
৪. বিল্ড সেটিংস স্বয়ংক্রিয়ভাবে `netlify.toml` থেকে সেট হয়ে যাবে:
   - **Build command:** `npm run build`
   - **Publish directory:** `dist`
   - **Functions directory:** `netlify/functions`

---

## ধাপ ৪: Environment Variables কনফিগার করুন
Netlify ড্যাশবোর্ডে **Site configuration > Environment variables**-এ যান এবং নিচের ভেরিয়েবলগুলো যুক্ত করুন:

| ভেরিয়েবল নাম | বিবরণ | উদাহরণ মান |
|---|---|---|
| `AUTH_SECRET` | সেশন ও টোকেন এনক্রিপশন কি | `durniti-portal-super-key-2026-auth` |
| `ADMIN_SECRET` | সুপার অ্যাডমিন সুরক্ষা কি | `admin-secure-setup-2026` |
| `SUPABASE_URL` | Supabase প্রজেক্টের REST URL | `https://your-id.supabase.co` |
| `SUPABASE_ANON_KEY` | Supabase Anon Public API Key | `eyJhbGciOi...` |
| `NODE_VERSION` | নোড রানটাইম ভার্সন | `20` |

---

## ধাপ ৫: Supabase ক্লাউড ডেটাবেজ সেটআপ (স্থায়ী ডেটা সংরক্ষণের জন্য)
Netlify Serverless পরিবেশের স্টেটলেস প্রকৃতির কারণে লাইভ সাইটের সমস্ত সংবাদ, অ্যাডমিন ডেটা, ক্যাটাগরি এবং নাগরিক অভিযোগ আজীবনের জন্য ক্লাউডে স্থায়ী রাখতে Supabase (ফ্রি PostgreSQL) ব্যবহার করা সবচেয়ে সেরা ও নির্ভরযোগ্য।

১. [Supabase.com](https://supabase.com)-এ গিয়ে **New Project** তৈরি করুন।
২. বামপাশের মেনু থেকে **SQL Editor**-এ যান।
৩. নিচের ১টি মাত্র SQL কোড পেস্ট করে **Run** চাপুন:
```sql
create table if not exists durniti_portal_store (
  key text primary key,
  value jsonb not null,
  updated_at timestamptz default now()
);
```
৪. **Project Settings > API**-তে যান এবং:
   - `Project URL` কপি করে Netlify-র `SUPABASE_URL`-এ বসান।
   - `Project API Keys (anon public)` কপি করে Netlify-র `SUPABASE_ANON_KEY`-এ বসান।
৫. আপনার ডেটাবেজ প্রস্তুত! এখন আপনার লাইভ সাইটের সব তথ্য ক্লাউডে স্থায়ীভাবে সেভ থাকবে।

---

## ধাপ ৬: কাস্টম ডোমেইন ও ফ্রি SSL (HTTPS)
১. Netlify ড্যাশবোর্ডে **Domain management > Add a domain**-এ ক্লিক করুন।
২. আপনার ডোমেইন নাম দিন (যেমন: `durnitibiruddhenews.com`)।
৩. আপনার ডোমেইন প্রোভাইডারে (Namecheap, GoDaddy ইত্যাদি) Netlify-র DNS রেকর্ড যুক্ত করুন।
৪. Netlify বিনামূল্যে স্বয়ংক্রিয়ভাবে **Let's Encrypt SSL/HTTPS** সার্টিফিকেট প্রদান করবে।

---

## ধাপ ৭: লাইভ ওয়েবসাইট ম্যানেজমেন্ট (Zero Redeployment)
সাইট লাইভ হয়ে যাওয়ার পর প্রতিদিন সংবাদ পরিচালনা করার জন্য:
১. ব্রাউজারে প্রবেশ করুন: `https://your-domain.netlify.app/admin`
২. ডিফল্ট লগইন ক্রেডেনশিয়াল:
   - **ইমেইল:** `admin@durniti.news`
   - **পাসওয়ার্ড:** `Admin@2026!`
৩. লগইন করার সাথে সাথে আপনি দেখতে পাবেন:
   - 📝 **নতুন সংবাদ তৈরি:** যেকোনো সময় নতুন খবর লিখুন, ছবি যুক্ত করুন ও প্রকাশ করুন।
   - ⚡ **ব্রেকিং নিউজ টিকার:** লাইভ ব্রেকিং নিউজ পরিবর্তন করুন।
   - 🏷️ **ক্যাটাগরি সমূহ:** নতুন ক্যাটাগরি তৈরি ও রি-অর্ডার করুন।
   - 📢 **বিজ্ঞাপন নেটওয়ার্ক:** Adsterra, AdSense বা কাস্টম ব্যানার অন-অফ ও কোড পরিবর্তন করুন।
   - 💬 **কমেন্ট মডারেশন:** পাঠকদের কমেন্ট অনুমোদন বা ডিলিট করুন।
   - 🕵️ **নাগরিক অভিযোগ:** সাধারণ মানুষের পাঠানো দুর্নীতির গোপন তথ্য ও ছবি যাচাই করুন।

**কোনো অবস্থাতেই কোড পুনরায় ডাউনলোড, এডিট বা আপলোড করার প্রয়োজন হবে না! ব্রাউজার থেকেই সবকিছু রিয়েল-টাইমে আপডেট হবে।**
