# PROJECT_MAP — سندك v4 (Sandak Store)

## [TECH_STACK]
- **Framework**: Next.js 16 (App Router, security headers enabled)
- **Deployment**: Vercel (via `vercel.json`) — previously Netlify
- **Live URL**: `https://sandak-store.vercel.app`
- **UI Library**: React 19 + TypeScript 5
- **Styling**: Tailwind CSS 4 + tw-animate-css
- **Components**: shadcn/ui (Radix UI primitives)
- **State**: Zustand 5 (single store for all UI state)
- **Database**: PostgreSQL via Prisma ORM 6 (`log: ['query']` in dev, `log: ['error']` in prod)
- **Animation**: Framer Motion 12
- **Charts**: Recharts 2
- **Logging**: Custom async logger (`src/lib/logger.ts`) — `info`, `warn`, `error` levels
- **Auth**: JWT + bcryptjs (cookie-based, 7-day expiry) + API-key fallback (`src/lib/auth.ts`) checks `x-api-key` header against `ADMIN_API_KEY` env var
- **Icons**: Lucide React
- **Secure Tokens**: All download/order tokens generated via `crypto.randomBytes()` (cryptographically secure)

## [SYSTEM_FLOW]
```
User → [Home] → Browse Products → View Details → Add to Cart
                                                    ↓
                                          Cart Drawer → Checkout
                                                         ↓
                                              Choose Payment (Jeib/WU)
                                                         ↓
                                              Confirm Order → /order/[orderNumber]
                                                         ↓
                                          Admin marks 'paid' → Download tokens auto-generated
                                                         ↓
                                          User clicks download link → /api/download/[token]
                                                         ↓
                                          Redirect to file (PDF/EXE)
```

Vercel deployment:
```
Git push → Vercel → `npx prisma generate` → `next build` → Deploy to URL
                    └── Prisma migration: run manually via `npx prisma migrate deploy`
                        or Vercel Post-Deploy Hook
```

Admin flow (via `/admin` URL — hidden from store):
```
/admin/login → Login (first user = admin auto) → /admin (Dashboard)
                                                      → /admin/orders (Manage Orders)
                                                      → /admin/invoices (Manage Invoices)
                                                      → /admin/users (Manage Admin Users)
                                                      → /admin/settings (Store Settings)
```

## [ARCHITECTURE]
```
sandak-v4/
├── .env                           # DATABASE_URL + ADMIN_API_KEY + JWT_SECRET + NEXT_PUBLIC_* variables
├── .gitignore
├── vercel.json                    # Vercel deployment config (build, install, env)
├── next.config.ts                 # Security headers + serverExternalPackages for serverless
├── package.json
├── prisma/
│   └── schema.prisma              # 6 models: Product, User, Order, Invoice, InvoiceItem, StoreSettings
├── public/
│   ├── covers/                    # 27 product cover images
│   └── downloads/                 # 27 product files (16 PDFs + 5 EXEs + 1 ZIP + 1 README)
├── src/
│   ├── app/
│   │   ├── admin/                 # Admin pages (dashboard, orders, invoices, users, settings, login)
│   │   ├── api/
│   │   │   ├── products/          # GET (public), POST/PUT/DELETE (admin auth)
│   │   │   │   ├── seed/          # POST — seed default 27 products (auto on first load)
│   │   │   │   └── seed-empty/    # POST (admin) — clear products
│   │   │   ├── orders/            # GET (public by orderNumber, admin all), POST (public), PUT (admin)
│   │   │   ├── auth/              # login, register (first user = admin), logout, me, verify
│   │   │   ├── invoices/          # CRUD (admin auth)
│   │   │   ├── users/             # CRUD (authenticated)
│   │   │   ├── settings/          # GET (public), PUT (admin)
│   │   │   ├── setup/             # GET/POST (admin — seed database with 9 short products)
│   │   │   ├── download/[token]/  # GET (public with valid token) — redirect to file
│   │   │   ├── export/            # GET (admin — export project, disabled on Vercel)
│   │   │   └── log/               # POST (public — client-side logging)
│   │   ├── layout.tsx             # Root layout (RTL Arabic, Geist fonts)
│   │   ├── page.tsx               # SPA-style store page (view switching, products loading)
│   │   ├── order/[orderNumber]/   # Public order tracking page
│   │   ├── store-download/        # Public store-package download page
│   │   └── globals.css            # Tailwind + CSS variables + custom scrollbar
│   ├── components/
│   │   ├── store/                 # 11 components (Header, Hero, HomeContent, Products, ProductCard, ProductDetail, Cart, Checkout, Admin, Footer, etc.)
│   │   ├── invoices/              # InvoiceDashboard — list, create, mark paid
│   │   └── ui/                    # 49 shadcn/ui components
│   ├── hooks/
│   │   └── use-toast.ts           # Custom toast state machine
│   └── lib/
│       ├── store.ts               # Zustand store (cart, products, navigation, filters, auth, error state)
│       ├── db.ts                  # Prisma singleton with Vercel serverless support
│       ├── logger.ts              # Async logger (POST /api/log in prod, console in dev)
│       ├── auth.ts                # requireAdmin() middleware — checks x-api-key + JWT cookie (fail-closed)
│       ├── auth-server.ts         # JWT sign/verify (7d expiry), bcrypt hash, cookie helpers, generateSecureToken
│       ├── config.ts              # Shared config: siteUrl, apiUrl, api() helper
│       ├── format.ts              # formatFileSize, formatDateTime
│       ├── market-analysis.ts     # Market analysis tool
│       └── utils.ts               # cn() helper for Tailwind classes
├── next.config.ts                 # Security headers + serverExternalPackages
├── package.json
├── tsconfig.json
├── postcss.config.mjs
└── tailwind.config.ts
```

## [DATABASE MODELS]

| Model | Fields | Purpose |
|-------|--------|---------|
| **Product** | id, name, description, longDescription, price, category, image, features(JSON), badge, fileUrl, fileSize, isActive, sortOrder | Store products (27 defaults: 22 ebooks + 5 software) |
| **User** | id, name, email(unique), password(hashed), role, isActive | Admin users (default role 'user', first registration = admin) |
| **Order** | id, orderNumber(unique), customerName, customerPhone, customerEmail, paymentMethod, items(JSON), subtotal, tax, total, status, paymentRef, verifiedAt, verifiedBy, notes | Customer orders |
| **Invoice** | id, invoiceNumber(unique), clientName, clientPhone, clientEmail, date, dueDate, status, taxRate, discount, discountType, notes, subtotal, taxAmount, total | Admin invoices |
| **InvoiceItem** | id, invoiceId, description, quantity, unitPrice, total, sortOrder | Invoice line items |
| **DownloadToken** | id, token(unique), orderId, productId, productName, fileUrl, fileName, downloaded, downloadedAt | Auto-generated on order payment |
| **StoreSettings** | id, storeName, storeEmail, storePhone, storeAddress, jeibPhone, wuName, wuCity, wuCountry, siteUrl, currency, taxRate | Singleton settings row |

## [SECURITY]

| Feature | Implementation |
|---------|----------------|
| Admin Auth | JWT cookie (HTTP-only, 7-day expiry, Secure in prod) + bcryptjs password hashing (12 rounds) |
| API Protection | `requireAdmin()` middleware for admin routes (fail-closed) |
| Password Storage | bcryptjs with salt rounds 12 |
| Session Management | JWT tokens stored in `auth_token` cookie; 7-day expiry |
| Secure Tokens | All tokens (download, order) use `crypto.randomBytes()` (NOT Math.random) |
| Registration | First user becomes admin automatically; subsequent require `ADMIN_API_KEY` |
| Password Min Length | 8 characters |
| Email Validation | Server-side regex check on register and orders |
| Product API | GET public, POST/PUT/DELETE admin-only |
| Orders API | POST public (checkout), GET by orderNumber public, GET all/PUT admin-only |
| Users API | All endpoints admin-only |
| Download API | Validates token exists, file exists on disk; tracks `downloaded` and `downloadedAt` |
| Admin Hidden | No admin button in store — only accessible via `/admin` URL |
| JWT Secret | REQUIRED in production; throws on startup if missing |
| Seed-Empty | Now requires admin auth |

## [LOGGING STRATEGY]
- **Dev**: `console[level]()` مباشرة
- **Prod**: `fetch('/api/log', { method: 'POST', keepalive: true })`
- **API routes**: `logger.error()` في كل `catch` blocks

## [FEATURES]

| Feature | Status | Details |
|---------|--------|---------|
| Product catalog (27 products) | ✅ | 22 eBooks + 5 Software with cover images |
| Product CRUD | ✅ | Admin panel with add/edit/delete/toggle |
| Shopping cart | ✅ | Add/remove/update quantity |
| Checkout with customer info | ✅ | Name, phone, email + payment method |
| Order persistence | ✅ | Orders saved to DB with order number |
| Payment methods | ✅ | Jeib wallet + Western Union |
| Admin login | ✅ | /admin/login with email + password (8+ chars) |
| Admin dashboard | ✅ | /admin with sidebar navigation |
| Orders management | ✅ | /admin/orders — list, verify, cancel; auto-generates download tokens on 'paid' |
| Invoices management | ✅ | /admin/invoices — list, create, mark paid |
| Users management | ✅ | /admin/users — add, edit, toggle, delete |
| Hotel system link | ✅ | Demo: hotelsystem-web.netlify.app |
| Hotel system download | ✅ | /downloads/HotelSystem_v2.1.0_Setup.exe (14.3MB) |
| Other software downloads | ✅ | Invoice, POS, Accounting, School systems |
| Download button in product detail | ✅ | Shows if product has fileUrl |
| Clickable URLs in product features | ✅ | linkify function |
| Contact email | ✅ | sanedsoft32@gmail.com |
| Loading states | ✅ | ProductCardSkeleton, hero with RefreshCw spinner |
| Error states | ✅ | productsError, retryFetchProducts in store; UI shows retry button |
| Order tracking page | ✅ | /order/[orderNumber] — public, with download links after payment |
| Download flow | ✅ | /api/download/[token] — file existence check, redirect |

## [ENV VARIABLES]
```
# PostgreSQL (required for Vercel)
DATABASE_URL="postgresql://user:password@host:5432/db?pgbouncer=true&connection_limit=1"
DATABASE_URL_UNPOOLED="postgresql://user:password@host:5432/db"

# Auth (REQUIRED in production)
ADMIN_API_KEY="your-secret-api-key"
JWT_SECRET="your-jwt-secret-key"       # Optional, falls back to ADMIN_API_KEY

# Public
NEXT_PUBLIC_SITE_URL="https://sandak-store.vercel.app"
NEXT_PUBLIC_CONTACT_EMAIL="sanedsoft32@gmail.com"
NEXT_PUBLIC_CONTACT_PHONE="+967123456789"
NEXT_PUBLIC_JEIB_PHONE="+967123456789"
NEXT_PUBLIC_WU_RECIPIENT="Your Name"
NEXT_PUBLIC_WU_CITY="صنعاء"
NEXT_PUBLIC_WU_COUNTRY="اليمن"
```

## [DEPLOYMENT]

### Vercel (Current)
```bash
# 1. Push to GitHub
git push origin main

# 2. Connect repo in Vercel Dashboard → Auto-deploy

# 3. Set environment variables in Vercel Dashboard (ADMIN_API_KEY, JWT_SECRET, DATABASE_URL required)

# 4. Run database migrations (one-time)
npx prisma migrate deploy

# 5. Open the store homepage; first visit triggers auto-seed (27 products)
#    OR login as admin and POST /api/products/seed manually
```

### Local Development
```bash
npm install                    # Install + prisma generate
npx prisma migrate dev        # Create local PostgreSQL tables
npm run dev                   # Start dev server on :3000
```

### Seeding Products
- The store auto-seeds on first homepage visit (POST /api/products/seed)
- Or admin can POST /api/products/seed manually
- Or admin can POST /api/setup (uses 9 short products)
- To clear and re-seed, admin can POST /api/products/seed-empty then POST /api/products/seed

## [RECENT CHANGES]

### 2026-06-02 — Security & UX Hardening
- Removed hardcoded JWT secret fallback
- Closed dev-bypass in requireAdmin
- Restricted registration: first user OR valid ADMIN_API_KEY
- Switched from Math.random() to crypto.randomBytes() for all tokens
- JWT expiry reduced from 999y to 7d
- Added Secure cookie flag in production
- Replaced gen_random_uuid() with cuid-compatible IDs (matches Prisma schema)
- Added productsError + retryFetchProducts to Zustand store
- Added loading/error states to ProductsSection and HomeContent
- Fixed brand consistency: "سندك" everywhere (was "سانداك" in admin)
- Fixed Arabic typo: "الانشتتادات" → "المشتتات"
- Added 16 real PDF books + 4 EXE placeholders + 1 ZIP placeholder to public/downloads
- Strengthened password requirements (8+ chars, email validation)
- Strengthened order customer email validation on client

```
