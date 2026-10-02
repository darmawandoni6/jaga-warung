# PRD: Jaga Warung Landing Page

## 1. Overview

**Product**: Landing page for Jaga Warung POS & Grocery Store Management app  
**Target Users**: Small grocery store owners (warung) in Indonesia  
**Primary Goal**: Convert visitors to app users  
**Secondary Goal**: Build trust, communicate value proposition

---

## 2. Target Audience

| Segment | Description |
|---------|-------------|
| Primary | Warung/kiosk owners, age 25-50, smartphone-literate |
| Secondary | Small retail shop managers |
| Tertiary | Tech-savvy entrepreneurs exploring POS solutions |

**Pain Points**:
- Manual stock tracking → stockouts, losses
- Paper-based debt records → forgotten payments
- No sales visibility → can't make data-driven decisions
- Complicated POS apps → too hard to learn

---

## 3. Key Messages

**Tagline** (ID): "Kelola Warung Jadi Lebih Mudah"  
**Tagline** (EN): "Manage Your Store With Ease"

**Value Props**:
1. **Offline-first** — Works without internet, syncs later
2. **Simple POS** — Scan barcode, tap, done
3. **Debt tracking** — Never forget customer debts
4. **Cash flow** — Know your money in/out
5. **Reports** — See profit, top products, trends

---

## 4. Page Structure

```
┌─────────────────────────────────────────┐
│ 1. NAVBAR                               │
│    Logo | Features | Pricing | CTA      │
├─────────────────────────────────────────┤
│ 2. HERO                                 │
│    Headline + Subhead + CTA + Mockup    │
├─────────────────────────────────────────┤
│ 3. FEATURES                             │
│    6 feature cards with icons           │
├─────────────────────────────────────────┤
│ 4. HOW IT WORKS                         │
│    3 steps with illustrations           │
├─────────────────────────────────────────┤
│ 5. SCREENSHOTS                          │
│    Carousel/grid of app screens         │
├─────────────────────────────────────────┤
│ 6. TESTIMONIALS (dummy)                 │
│    3 user quotes                        │
├─────────────────────────────────────────┤
│ 7. PRICING                              │
│    Free tier highlighted                │
├─────────────────────────────────────────┤
│ 8. FAQ                                  │
│    5-7 common questions                 │
├─────────────────────────────────────────┤
│ 9. FOOTER                               │
│    Links, contact, social               │
└─────────────────────────────────────────┘
```

---

## 5. Section Details

### 5.1 Navbar
- Logo (left)
- Navigation: Fitur, Harga, FAQ, Download
- Language switcher: ID | EN
- Sticky on scroll

### 5.2 Hero
```
Headline (ID): Kelola Warung Jadi Lebih Mudah
Headline (EN): Manage Your Store With Ease

Subhead (ID): Aplikasi POS offline untuk warung, toko kelontong, dan usaha kecil Anda.
Subhead (EN): Offline POS app for your warung, grocery store, or small business.

CTA Primary: Download Gratis
CTA Secondary: Lihat Demo

Hero Image: Phone mockup showing POS screen with products
```

### 5.3 Features (6 cards)

| Icon | Feature (ID) | Feature (EN) | Description |
|------|--------------|--------------|-------------|
| 📦 | Manajemen Stok | Stock Management | Track inventory, get low-stock alerts |
| 💳 | Kasir Cepat | Fast Checkout | Barcode scan, quick add, cart management |
| 📝 | Catat Utang | Debt Tracking | Record customer debts, payment history |
| 💰 | Arus Kas | Cash Flow | Track money in/out, daily summary |
| 📊 | Laporan Lengkap | Complete Reports | Sales, profit, top products |
| 📴 | Offline Mode | Offline Mode | Works without internet |

### 5.4 How It Works

```
Step 1: Tambah Produk → Scan barcode atau input manual
Step 2: Transaksi → Pilih produk, hitung otomatis
Step 3: Selesai → Cetak struk atau simpan digital
```

### 5.5 Screenshots
- POS screen (product grid + cart)
- Inventory screen (stock list)
- Debt screen (customer debts)
- Report screen (charts)

Placeholder approach: Use wireframe-style mockups or gradient placeholders

### 5.6 Testimonials (dummy)

```json
[
  {
    "name": "Pak Budi",
    "business": "Warung Semeru",
    "quote_id": "Sekarang gak perlu takut lupa utang pelanggan.",
    "quote_en": "No more worrying about forgotten customer debts."
  },
  {
    "name": "Bu Sari",
    "business": "Toko Kelontong Sari",
    "quote_id": "Stok selalu terkontrol, rugi berkurang.",
    "quote_en": "Stock is always controlled, losses reduced."
  },
  {
    "name": "Mas Rizki",
    "business": "Minimarket Rizki",
    "quote_id": "Laporan profit membantu saya tentukan produk laris.",
    "quote_en": "Profit reports help me identify best-selling products."
  }
]
```

### 5.7 Pricing

| Tier | Price | Features |
|------|-------|----------|
| **Gratis** | Rp 0 | Semua fitur, unlimited transaksi, offline mode |
| Premium (coming soon) | TBD | Cloud sync, multi-device, advanced reports |

*Free tier highlighted as primary choice*

### 5.8 FAQ (7 questions)

1. **Apakah butuh internet?** → Tidak. Aplikasi bekerja offline.
2. **Bagaimana cara backup data?** → Export ke file, simpan di local storage.
3. **Bisa pakai printer struk?** → Fitur dalam pengembangan, akan segera tersedia.
4. **Apakah gratis selamanya?** → Ya, fitur dasar gratis tanpa batas.
5. **Bisa untuk jenis usaha lain?** → Ya, cocok untuk warung, kios, toko kelontong.
6. **Bagaimana jika ganti HP?** → Backup dari HP lama, restore di HP baru.
7. **Ada batas transaksi?** → Tidak ada. Transaksi unlimited.

---

## 6. Tech Stack

| Layer | Technology |
|-------|------------|
| Framework | React 18 + TypeScript |
| Build Tool | Vite (fast, simple) |
| Styling | Tailwind CSS |
| Icons | Lucide React |
| i18n | react-i18next (ID/EN) |
| Deployment | Vercel / Netlify / Cloudflare Pages |

**Rationale**:
- Separate from Expo app for independent deploy
- Vite = fastest dev experience, simple config
- Tailwind = matches existing project patterns
- No backend needed (static site)

---

## 7. File Structure

```
landing/
├── index.html
├── package.json
├── tsconfig.json
├── vite.config.ts
├── tailwind.config.js
├── postcss.config.js
├── src/
│   ├── main.tsx
│   ├── App.tsx
│   ├── index.css
│   ├── i18n/
│   │   ├── index.ts
│   │   └── locales/
│   │       ├── id.json
│   │       └── en.json
│   ├── components/
│   │   ├── Navbar.tsx
│   │   ├── Hero.tsx
│   │   ├── Features.tsx
│   │   ├── HowItWorks.tsx
│   │   ├── Screenshots.tsx
│   │   ├── Testimonials.tsx
│   │   ├── Pricing.tsx
│   │   ├── FAQ.tsx
│   │   ├── Footer.tsx
│   │   └── ui/
│   │       ├── Button.tsx
│   │       ├── Card.tsx
│   │       └── LanguageSwitcher.tsx
│   └── assets/
│       └── images/
│           └── .gitkeep
└── public/
    └── favicon.ico
```

---

## 8. Responsive Breakpoints

| Breakpoint | Width | Layout |
|------------|-------|--------|
| Mobile | < 640px | Single column, hamburger menu |
| Tablet | 640-1024px | 2 columns where applicable |
| Desktop | > 1024px | Full layout, max-width 1280px |

---

## 9. Performance Targets

| Metric | Target |
|--------|--------|
| Lighthouse Performance | > 90 |
| First Contentful Paint | < 1.5s |
| Largest Contentful Paint | < 2.5s |
| Total Bundle Size | < 200KB gzipped |

---

## 10. SEO & Meta

```html
<title>Jaga Warung — Aplikasi POS untuk Warung & Toko Kelontong</title>
<meta name="description" content="Kelola warung jadi lebih mudah. Aplikasi POS offline untuk manajemen stok, pencatatan utang, dan laporan penjualan.">
<meta property="og:title" content="Jaga Warung — POS & Grocery Store Management">
<meta property="og:description" content="Offline-first POS app for warung and small grocery stores.">
<meta property="og:image" content="/og-image.png">
<meta property="og:locale" content="id_ID">
<meta property="og:locale:alternate" content="en_US">
```

---

## 11. Implementation Phases

| Phase | Deliverable | Est. Time |
|-------|-------------|-----------|
| 1 | Setup project + i18n + Tailwind | 1 hour |
| 2 | Build all sections (Navbar → Footer) | 3-4 hours |
| 3 | Responsive design + polish | 1-2 hours |
| 4 | SEO + performance optimization | 1 hour |
| 5 | Deploy to Vercel | 30 min |

**Total Estimate**: 6-8 hours
