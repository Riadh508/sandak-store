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
- **Auth**: JWT + bcryptjs (cookie-based) + API-key fallback (`src/lib/auth.ts`) checks `x-api-key` header against `ADMIN_API_KEY` env var
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

Vercel deployment:
```
Git push → Vercel → `npx prisma generate` → `next build` → Deploy to URL
                    └── Prisma migration: run manually via `npx prisma migrate deploy`
                        or Vercel Post-Deploy Hook
```

Admin flow (via `/admin` URL — hidden from store):
```
/admin/login → Register/Login → /admin (Dashboard)
                              → /admin/orders (Manage Orders)
                              → /admin/invoices (Manage Invoices)
                              → /admin/users (Manage Admin Users)
```

## [ARCHITECTURE]
```
sandak-v4/
├── .env                           # DATABASE_URL + ADMIN_API_KEY + NEXT_PUBLIC_* variables
├── .gitignore
├── vercel.json                    # Vercel deployment config (build, install, env)
├── next.config.ts                 # Security headers + serverExternalPackages for serverless
├── package.json
├── prisma/
│   └── schema.prisma              # 6 models: Product, User, Order, Invoice, InvoiceItem, StoreSettings
├── public/covers/                 # 27 product cover images
├── src/
│   ├── app/
│   │   ├── admin/                 # Admin pages (dashboard, orders, invoices, users, settings, login)
│   │   ├── api/
│   │   │   ├── products/          # GET (public), POST/PUT/DELETE (admin auth)
│   │   │   │   └── seed/          # POST — seed default products
│   │   │   │   └── seed-empty/    # POST — clear products
│   │   │   ├── orders/            # GET (admin), POST (public order), PUT (admin verify)
│   │   │   ├── auth/              # login, register, logout, me, verify
│   │   │   ├── invoices/          # CRUD (admin auth)
│   │   │   ├── users/             # CRUD (authenticated)
│   │   │   ├── settings/          # GET (public), PUT (admin)
│   │   │   ├── setup/             # GET/POST (admin — seed database)
│   │   │   ├── export/            # GET (admin — export project, disabled on Vercel)
│   │   │   └── log/               # POST (public — client-side logging)
│   │   ├── layout.tsx             # Root layout (RTL Arabic, Geist fonts)
│   │   ├── page.tsx               # SPA-style store page (view switching)
│   │   ├── store-download/        # Public download/purchase page
│   │   └── globals.css            # Tailwind + CSS variables + custom scrollbar
│   ├── components/
│   │   ├── store/                 # 10 components (Header, Hero, Products, Cart, Checkout, Admin, etc.)
│   │   ├── invoices/              # InvoiceDashboard — list, create, mark paid
│   │   └── ui/                    # shadcn/ui components
│   ├── hooks/
│   │   └── use-toast.ts           # Custom toast state machine
│   └── lib/
│       ├── store.ts               # Zustand store (cart, products, navigation, filters, auth)
│       ├── db.ts                  # Prisma singleton with Vercel serverless support
│       ├── logger.ts              # Async logger (POST /api/log in prod, console in dev)
│       ├── auth.ts                # requireAdmin() middleware — checks x-api-key + JWT cookie
│       ├── auth-server.ts         # JWT sign/verify, bcrypt hash, cookie helpers
│       ├── config.ts              # Shared config: siteUrl, apiUrl, api() helper
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
| **Product** | id, name, description, longDescription, price, category, image, features(JSON), badge, downloadUrl, isActive, sortOrder | Store products (26 defaults) |
| **User** | id, name, email(unique), password(hashed), role, isActive | Admin users (JWT auth) |
| **Order** | id, orderNumber(unique), customerName, customerPhone, customerEmail, paymentMethod, items(JSON), subtotal, tax, total, status, paymentRef, verifiedAt, verifiedBy, notes | Customer orders |
| **Invoice** | id, invoiceNumber(unique), clientName, clientPhone, clientEmail, date, dueDate, status, taxRate, discount, discountType, notes, subtotal, taxAmount, total | Admin invoices |
| **InvoiceItem** | id, invoiceId, description, quantity, unitPrice, total, sortOrder | Invoice line items |

## [SECURITY]

| Feature | Implementation |
|---------|----------------|
| Admin Auth | JWT cookie (HTTP-only, 7 days expiry) + bcryptjs password hashing |
| API Protection | `requireAuth()` middleware for admin routes |
| Password Storage | bcryptjs with salt rounds 12 |
| Session Management | JWT tokens stored in `auth_token` cookie |
| Product API | GET public, POST/PUT/DELETE admin-only |
| Orders API | POST public (checkout), GET/PUT admin-only |
| Users API | All endpoints admin-only |
| Admin Hidden | No admin button in store — only accessible via `/admin` URL |

## [LOGGING STRATEGY]
- **Dev**: `console[level]()` مباشرة
- **Prod**: `fetch('/api/log', { method: 'POST', keepalive: true })`
- **API routes**: `logger.error()` في كل `catch` blocks

## [FEATURES]

| Feature | Status | Details |
|---------|--------|---------|
| Product catalog (26 products) | ✅ | eBooks + Software with cover images |
| Product CRUD | ✅ | Admin panel with add/edit/delete/toggle |
| Shopping cart | ✅ | Add/remove/update quantity |
| Checkout with customer info | ✅ | Name, phone, email + payment method |
| Order persistence | ✅ | Orders saved to DB with order number |
| Payment methods | ✅ | Jeib wallet + Western Union |
| Admin login/register | ✅ | /admin/login with email + password |
| Admin dashboard | ✅ | /admin with sidebar navigation |
| Orders management | ✅ | /admin/orders — list, verify, cancel |
| Invoices management | ✅ | /admin/invoices — list, create, mark paid |
| Users management | ✅ | /admin/users — add, edit, toggle, delete |
| Hotel system link | ✅ | Demo: hotelsystem-web.netlify.app |
| Hotel system download | ✅ | /downloads/HotelSystem_v2.1.0_Setup.exe |
| Download button in product detail | ✅ | Shows if product has downloadUrl |
| Clickable URLs in product features | ✅ | linkify function |
| Contact email | ✅ | sanedsoft32@gmail.com |

## [ENV VARIABLES]
```
# PostgreSQL (required for Vercel)
DATABASE_URL="postgresql://user:password@host:5432/db?pgbouncer=true&connection_limit=1"
DATABASE_URL_UNPOOLED="postgresql://user:password@host:5432/db"

# Auth
ADMIN_API_KEY="your-secret-api-key"
JWT_SECRET="your-jwt-secret-key"       # Optional, falls back to ADMIN_API_KEY

# Public
NEXT_PUBLIC_SITE_URL="https://sandak-store.vercel.app"
NEXT_PUBLIC_CONTACT_EMAIL="your@email.com"
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

# 3. Set environment variables in Vercel Dashboard

# 4. Run database migrations (one-time)
npx prisma migrate deploy

# 5. Create first admin user via /admin/register
```

### Local Development
```bash
npm install                    # Install + prisma generate
npx prisma migrate dev        # Create local PostgreSQL tables
npm run dev                   # Start dev server on :3000
```

### Seeding Products
زيارة `/api/setup` (POST) بعد تسجيل الدخول — أو الضغط على زر التحديث في لوحة التحكم
```
