# متجر سندك v4 — Sandak Store

متجر إلكتروني احترافي عربي متكامل لبيع الكتب الإلكترونية والأنظمة البرمجية.

## المميزات الرئيسية

- 🛒 **متجر إلكتروني متكامل** مع سلة مشتريات ودفع متعدد
- 📚 **27 منتج جاهز** (كتب PDF + أنظمة برمجية)
- 🔐 **نظام مصادقة آمن** (JWT + bcrypt)
- 💳 **طرق دفع متعددة** (جيب، ويسترن يونين)
- 📊 **لوحة تحكم احترافية** (إدارة منتجات، طلبات، فواتير، مستخدمين)
- 🌐 **دعم كامل للعربية RTL** مع واجهة احترافية
- 📱 **تصميم متجاوب** يعمل على جميع الأجهزة
- 🎨 **مكتبة UI شاملة** (Shadcn + Radix + Tailwind 4)
- ⚡ **أداء عالي** مع Next.js 16 و React 19
- 🔒 **أمان متقدم** (Security Headers + bcrypt + JWT)

## التقنيات المستخدمة

| التقنية | الإصدار | الاستخدام |
|---------|---------|-----------|
| Next.js | 16 | إطار العمل الرئيسي |
| React | 19 | مكتبة UI |
| TypeScript | 5 | لغة البرمجة |
| Prisma | 6 | ORM لقاعدة البيانات |
| PostgreSQL | - | قاعدة البيانات |
| Tailwind CSS | 4 | التصميم |
| Shadcn/ui | - | مكونات UI |
| Framer Motion | 12 | الحركات |
| Zod | 4 | التحقق من البيانات |
| Zustand | 5 | إدارة الحالة |

## البنية

```
sandak-store/
├── prisma/
│   ├── schema.prisma          # مخطط قاعدة البيانات
│   └── migrations/            # ملفات الـ migration
├── public/
│   ├── covers/                # أغلفة المنتجات (27 صورة)
│   └── downloads/             # ملفات المنتجات القابلة للتحميل
├── src/
│   ├── app/
│   │   ├── admin/             # صفحات الإدارة
│   │   │   ├── login/         # تسجيل دخول الأدمن
│   │   │   ├── orders/        # إدارة الطلبات
│   │   │   ├── invoices/      # إدارة الفواتير
│   │   │   ├── users/         # إدارة المستخدمين
│   │   │   └── settings/      # إعدادات المتجر
│   │   ├── api/               # API Routes
│   │   │   ├── auth/          # مصادقة (login, register, logout, me)
│   │   │   ├── products/      # CRUD المنتجات
│   │   │   ├── orders/        # CRUD الطلبات + download tokens
│   │   │   ├── invoices/      # CRUD الفواتير
│   │   │   ├── users/         # CRUD المستخدمين
│   │   │   ├── settings/      # إعدادات المتجر
│   │   │   ├── download/      # تحميل الملفات
│   │   │   └── setup/         # تهيئة النظام
│   │   ├── order/             # صفحة تتبع الطلب
│   │   ├── store-download/    # صفحة تحميل المتجر
│   │   ├── page.tsx           # الصفحة الرئيسية
│   │   └── layout.tsx         # الـ layout الجذري
│   ├── components/
│   │   ├── store/             # مكونات المتجر
│   │   ├── invoices/          # مكونات الفواتير
│   │   └── ui/                # مكونات Shadcn UI
│   ├── lib/
│   │   ├── db.ts              # Prisma Client
│   │   ├── store.ts           # Zustand store
│   │   ├── auth.ts            # Middleware المصادقة
│   │   ├── auth-server.ts     # JWT + bcrypt
│   │   ├── format.ts          # Utilities للتنسيق
│   │   ├── logger.ts          # Logger
│   │   └── utils.ts           # cn() helper
│   └── hooks/                 # Custom hooks
├── .env.example               # مثال للمتغيرات البيئية
├── next.config.ts             # إعدادات Next.js
├── package.json
└── README.md
```

## التثبيت والتشغيل

### 1. المتطلبات الأساسية

- Node.js 22+
- npm 10+
- PostgreSQL (أو حساب على Neon/Supabase مجاني)

### 2. تثبيت المكتبات

```bash
npm install
```

### 3. إعداد قاعدة البيانات

#### خيار 1: PostgreSQL محلي
```bash
# أنشئ قاعدة بيانات
createdb sandak_store

# شغل الـ migrations
npx prisma migrate deploy
```

#### خيار 2: PostgreSQL سحابي (موصى به للنشر)
1. أنشئ حساباً على [Neon](https://neon.tech) أو [Supabase](https://supabase.com)
2. أنشئ مشروع جديد واحصل على `DATABASE_URL`
3. شغل الـ migrations:
```bash
npx prisma migrate deploy
```

### 4. إعداد ملف البيئة

أنشئ ملف `.env`:
```env
# قاعدة البيانات
DATABASE_URL="postgresql://user:password@host:5432/dbname"

# المصادقة
ADMIN_API_KEY="your-strong-api-key-min-32-chars"
JWT_SECRET="your-jwt-secret-min-32-chars"

# معلومات المتجر (اختياري)
NEXT_PUBLIC_SITE_URL="http://localhost:3000"
NEXT_PUBLIC_CONTACT_EMAIL="your@email.com"
NEXT_PUBLIC_CONTACT_PHONE="+967123456789"
NEXT_PUBLIC_JEIB_PHONE="+967123456789"
NEXT_PUBLIC_WU_RECIPIENT="Recipient Name"
NEXT_PUBLIC_WU_CITY="City"
NEXT_PUBLIC_WU_COUNTRY="Country"
```

### 5. تشغيل المشروع محلياً

```bash
npm run dev
```

افتح المتصفح على: `http://localhost:3000`

### 6. إنشاء أول مستخدم أدمن

افتح: `http://localhost:3000/admin/login` ثم اضغط "إنشاء حساب جديد"

### 7. بذر قاعدة البيانات بالمنتجات الافتراضية

بعد تسجيل الدخول كأدمن، اذهب إلى:
```
http://localhost:3000/admin
```

ثم اضغط على "تحديث" — أو مباشرة:
```bash
curl -X POST http://localhost:3000/api/products/seed
```

## النشر على Vercel

1. **ادفع الكود إلى GitHub**:
```bash
git init
git add .
git commit -m "Initial commit"
git branch -M main
git remote add origin https://github.com/YOUR_USERNAME/sandak-store.git
git push -u origin main
```

2. **اربط Vercel**:
   - اذهب إلى [vercel.com](https://vercel.com)
   - "Add New Project" > استورد المستودع
   - Vercel سيكتشف Next.js تلقائياً

3. **أضف متغيرات البيئة** في Vercel Dashboard:
   - `DATABASE_URL`
   - `ADMIN_API_KEY`
   - `JWT_SECRET`
   - `NEXT_PUBLIC_SITE_URL` (رابط Vercel الخاص بك)

4. **شغل الـ migrations**:
```bash
# محلياً مع DATABASE_URL للإنتاج
DATABASE_URL="your-prod-url" npx prisma migrate deploy
```

## نظام المنتجات

### إضافة منتج جديد

1. اذهب إلى `/admin` 
2. اضغط "إضافة منتج جديد"
3. املأ البيانات:
   - **الاسم**: اسم المنتج
   - **الوصف المختصر**: جملة أو جملتين
   - **الوصف الطويل**: وصف تفصيلي
   - **السعر**: بالدولار
   - **التصنيف**: ebook أو software
   - **رابط الصورة**: `/covers/your-image.png`
   - **رابط الملف**: `/downloads/your-file.pdf` (للتحميل بعد الدفع)
   - **حجم الملف**: بالبايت
   - **الميزات**: ميزة في كل سطر

### رفع الملفات

ضع ملفات المنتجات في:
```
public/downloads/
├── book-name.pdf
└── software-setup.exe
```

ثم في حقل "رابط الملف" ضع:
```
/downloads/book-name.pdf
```

## نظام الطلبات

### تدفق الطلب
```
1. العميل يضيف منتجات للسلة
2. يذهب إلى الدفع
3. يختار طريقة الدفع (جيب أو ويسترن يونين)
4. يؤكد الطلب (يحفظ في DB بحالة "pending")
5. يحصل على رقم الطلب
6. يرسل الإيصال عبر الواتساب
7. الأدمن يؤكد الدفع في /admin/orders
8. يتم توليد رابط تحميل تلقائياً
9. العميل يحصل على الرابط في /order/[orderNumber]
```

### إدارة الطلبات

في `/admin/orders`:
- **قيد الانتظار**: الطلب في انتظار تأكيد الدفع
- **مدفوع**: تم تأكيد الدفع (يولد روابط تحميل تلقائياً)
- **ملغي**: تم إلغاء الطلب

## الأمان

- ✅ كلمات المرور مشفرة بـ bcrypt (12 rounds)
- ✅ JWT tokens في HTTP-only cookies
- ✅ Security Headers (X-Frame-Options, CSP, etc.)
- ✅ SQL Injection protection (Prisma parameterized queries)
- ✅ XSS protection (React automatic escaping)
- ✅ Admin routes محمية بـ requireAdmin middleware

## المساهمة

نرحب بالمساهمات! افتح Issue أو Pull Request.

## الترخيص

MIT License

## الدعم

- 📧 البريد الإلكتروني: sanedsoft32@gmail.com
- 📱 الواتساب: 00967770240572
