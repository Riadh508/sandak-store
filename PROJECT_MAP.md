# PROJECT_MAP — سندك v4 (Sandak Store)

## [TECH_STACK]
- **Framework**: Next.js 16 (App Router, security headers enabled)
- **Deployment**: Netlify (`@netlify/plugin-nextjs`) via `netlify.toml`
- **Live URL**: `https://sandak-store.netlify.app`
- **UI Library**: React 19 + TypeScript 5
- **Styling**: Tailwind CSS 4 + tw-animate-css
- **Components**: shadcn/ui (Radix UI primitives)
- **State**: Zustand 5 (single store for all UI state)
- **Database**: SQLite via Prisma ORM 6 (`log: ['query']` in dev, `log: ['error']` in prod)
- **Animation**: Framer Motion 12
- **Charts**: Recharts 2
- **Logging**: Custom async logger (`src/lib/logger.ts`) — `info`, `warn`, `error` levels
- **Auth**: API-key-based admin auth (`src/lib/auth.ts`) — checks `x-api-key` header against `ADMIN_API_KEY` env var
- **Icons**: Lucide React

## [SYSTEM_FLOW]
```
User → [Home] → Browse Products → View Details → Add to Cart
                                                    ↓
                                          Cart Drawer → Checkout
                                                         ↓
                                              Choose Payment (Jeib/WU)
                                                         ↓
                                              Confirm Order → Sent to WhatsApp/Email
```
Admin flow:
```
Password Gate → Admin Panel → CRUD Products | Toggle Active | Search
```
Invoices flow:
```
Password Gate → InvoiceDashboard → List Invoices | Create Invoice | Mark Paid
```

## [ARCHITECTURE]
```
sandak-v4/
├── .env                           # DATABASE_URL + ADMIN_API_KEY + NEXT_PUBLIC_SITE_URL
├── netlify.toml                   # Netlify deployment config (@netlify/plugin-nextjs)
├── prisma/
│   └── schema.prisma              # 3 models: Product, Invoice, InvoiceItem
├── public/covers/                 # 26 product cover images
├── src/
│   ├── app/
│   │   ├── api/
│   │   │   ├── products/          # GET (public), POST/PUT/DELETE (admin auth)
│   │   │   │   └── seed/          # POST (public) — seed 26 default products
│   │   │   └── invoices/          # GET/POST/PUT (admin auth)
│   │   ├── layout.tsx             # Root layout (RTL Arabic, Geist fonts)
│   │   ├── page.tsx               # SPA-style store page (view switching)
│   │   └── globals.css            # Tailwind + CSS variables + custom scrollbar
│   ├── components/
│   │   ├── store/                 # 11 components (Header, Hero, Products, Cart, Checkout, Admin, etc.)
│   │   ├── invoices/              # InvoiceDashboard — list, create, mark paid
│   │   └── ui/                    # shadcn/ui components
│   ├── hooks/
│   │   ├── use-toast.ts           # Custom toast state machine
│   │   └── use-mobile.ts          # Mobile breakpoint detector
│   └── lib/
│       ├── store.ts               # Zustand store (cart, products, navigation, filters)
│       ├── db.ts                  # Prisma singleton (query log in dev only)
│       ├── logger.ts              # Async logger (POST /api/log in prod, console in dev)
│       ├── auth.ts                # requireAdmin() middleware — checks x-api-key header
│       ├── config.ts              # Shared config: siteUrl, apiUrl, api() helper
│       └── utils.ts               # cn() helper for Tailwind classes
├── next.config.ts                 # Standalone output + security headers (X-Frame-Options, HSTS, etc.)
├── package.json
├── tsconfig.json
└── postcss.config.mjs
```

## [SECURITY FIXES APPLIED]

| الثغرة | المستوى | الإصلاح |
|--------|---------|---------|
| Admin API بدون Auth | 🔴 Critical | `requireAdmin()` middleware على جميع نقاط POST/PUT/DELETE + `ADMIN_API_KEY` في `.env` |
| تسجيل SQL queries في الإنتاج | 🔴 High | `log: ['error']` في production، `log: ['query']` في dev فقط |
| لا ترويسات أمنية | 🟠 High | `X-Frame-Options: DENY`, `X-Content-Type-Options: nosniff`, `Referrer-Policy`, `X-XSS-Protection` |
| `Math.random()` لتوليد رقم الفاتورة | 🟠 Medium | استبدال بـ `crypto.randomUUID()` |
| لا مدخلات مُتحقق منها | 🟠 Medium | حد طول للنصوص (name 200, desc 500, longDesc 2000, features 50 items)، التحقق من صحة الفئة، حد السعر |
| Seed endpoint مكشوف | 🟠 Medium | حماية بـ `requireAdmin()` |
| Admin UI بدون Auth | 🟠 Medium | إضافة Password Gate في `AdminPanel` و `InvoiceDashboard` — يُطلب `adminKey` قبل عرض المحتوى |

## [LOGGING STRATEGY]
- **Dev**: `console[level]()` مباشرة
- **Prod**: `fetch('/api/log', { method: 'POST', keepalive: true })` — غير حظري، لا يؤثر على الأداء
- **API routes**: `logger.error()` في كل `catch` blocks
- **Store**: `logger.error()` بدلاً من `console.error`

## [ORPHANS & PENDING]

| العنصر | الحالة | ملاحظات |
|--------|--------|---------|
| ملف `.env` | ✅ | `DATABASE_URL` + `ADMIN_API_KEY` |
| `src/app/page.tsx` | ✅ | منقول من الجذر |
| `src/app/layout.tsx` | ✅ | منقول من الجذر |
| `src/app/globals.css` | ✅ | منقول من الجذر |
| `src/lib/store.ts` | ✅ | منقول من الجذر |
| `src/lib/db.ts` | ✅ | منقول من الجذر، مع إصلاح log |
| `src/lib/utils.ts` | ✅ | منقول من الجذر |
| `prisma/schema.prisma` | ✅ | منقول من الجذر، تمت إزالة User + Post |
| `src/components/invoices/InvoiceDashboard.tsx` | ✅ | تم الإنشاء + Password Gate |
| `src/app/api/invoices/route.ts` | ✅ | تم الإنشاء (GET/POST/PUT + auth) |
| `src/lib/auth.ts` | ✅ | تم الإنشاء — `requireAdmin()` |
| `src/lib/logger.ts` | ✅ | تم الإنشاء — async logger |
| `next.config.ts` flags | ✅ | تم إزالة `ignoreBuildErrors` + `reactStrictMode` |
| `z-ai-web-dev-sdk` | ✅ | تم الإزالة من `package.json` |
| `uuid` | ✅ | تم الإزالة (غير مستخدم) |
| `next-auth` | ✅ | تم الإزالة (غير مستخدم) |
| `next-intl` | ✅ | تم الإزالة (غير مستخدم) |
| `@tanstack/react-query` | ✅ | تم الإزالة (غير مستخدم) |
| `@dnd-kit/*` | ✅ | تم الإزالة (غير مستخدم) |
| `bun-types` | ✅ | تم الإزالة (غير مستخدم) |
| User + Post models | ✅ | تم الإزالة من `prisma/schema.prisma` |
| PRISMA QUERY LOG (prod) | ⬜ | إذا تطلب الأمر إخفاء التتبع تماماً من الإنتاج، يمكن إزالة `log` بالكامل من `db.ts` |
| Rate limiting | ⬜ | خارج النطاق الحالي — يمكن إضافته في طبقة Middleware لاحقاً إذا تطلب الأمر |
| CSP (Content Security Policy) | ⬜ | يتطلب تحليل دقيق للموارد الخارجية، قد يكسر تحميل الصور والخطوط الحالية |
| **Netlify deployment**: `sandak-store.netlify.app` | ✅ | `netlify.toml` + `NEXT_PUBLIC_SITE_URL` + `next.config.ts` بدون `standalone` |
| **API base URL config**: `src/lib/config.ts` | ✅ | متاح للاستخدام المستقبلي، لا يؤثر على الكود الحالي |
