# دليل النشر الكامل - متجر سندك v4

## ✅ الحالة الحالية

تم إصلاح جميع المشاكل الحرجة في المشروع:

1. ✅ Migration جديد يضيف DownloadToken + fileUrl/fileSize
2. ✅ API orders يدعم الاستعلام بـ orderNumber
3. ✅ Seed route محدّث بـ fileUrl و fileSize لكل المنتجات
4. ✅ AdminPanel لا يستدعي seed تلقائياً
5. ✅ جميع أوصاف المنتجات محسّنة (10 ميزات لكل منتج)
6. ✅ إصلاح النصوص المختلطة
7. ✅ تحسين UI: HeroSection, HomeContent, Order Page

---

## 🔑 المتغيرات البيئية المطلوبة

### من ملف `vercel.json` (الإنتاج - Neon PostgreSQL)

```env
# قاعدة البيانات (أضف رابط PostgreSQL الخاص بك)
DATABASE_URL="postgresql://USER:PASSWORD@HOST:PORT/DATABASE"

# المصادقة (غيّر القيم الافتراضية فوراً)
ADMIN_API_KEY="your-secret-admin-key"
JWT_SECRET="your-secret-jwt-key"

# الموقع
NEXT_PUBLIC_SITE_URL="https://sandak-store.vercel.app"

# معلومات التواصل والدفع
NEXT_PUBLIC_CONTACT_EMAIL="your@email.com"
NEXT_PUBLIC_CONTACT_PHONE="+967XXXXXXXXX"
NEXT_PUBLIC_JEIB_PHONE="+967XXXXXXXXX"
NEXT_PUBLIC_WU_RECIPIENT="Your Name"
NEXT_PUBLIC_WU_CITY="Your City"
NEXT_PUBLIC_WU_COUNTRY="Your Country"
```

---

## 🚀 خطوات النشر على Vercel

### 1. إضافة المتغيرات في Vercel Dashboard

1. اذهب إلى [vercel.com](https://vercel.com) > اختر المشروع
2. **Settings** > **Environment Variables**
3. أضف كل متغير من القائمة أعلاه
4. اختر البيئة: **Production** (و **Preview** اختيارياً)

### 2. تطبيق Migrations على قاعدة البيانات

#### خيار A: عبر Vercel CLI
```bash
npm i -g vercel
vercel login
vercel link
vercel env pull .env.production
npx prisma migrate deploy
```

#### خيار B: محلياً
```bash
# تأكد من DATABASE_URL في .env يشير للإنتاج
npx prisma migrate deploy
```

### 3. بذر المنتجات الافتراضية

بعد أول نشر، شغّل seed مرة واحدة:
```bash
# محلياً مع DATABASE_URL للإنتاج
DATABASE_URL="postgresql://..." npx tsx -e "
import { PrismaClient } from '@prisma/client';
const db = new PrismaClient();
db.\$executeRawUnsafe('DELETE FROM \"Product\"').then(() => process.exit());
"

# ثم استدعِ API
curl -X POST https://sandak-store.vercel.app/api/products/seed
```

أو من خلال واجهة الإدارة:
1. اذهب إلى `https://sandak-store.vercel.app/admin/login`
2. سجّل حساب جديد
3. اذهب إلى `/admin`
4. سيعرض زر "إضافة منتج" — أو استخدم API

### 4. نشر التحديثات

```bash
git add .
git commit -m "تحديث المشروع"
git push origin main
# Vercel سيبني وينشر تلقائياً
```

---

## 🧪 اختبار الموقع

### 1. الصفحة الرئيسية
```
https://sandak-store.vercel.app
```

### 2. تسجيل دخول الأدمن
```
https://sandak-store.vercel.app/admin/login
```

### 3. اختبار طلب
1. أضف منتج للسلة
2. اذهب إلى الدفع
3. أكمل البيانات واختر طريقة دفع
4. سجّل رقم الطلب
5. في `/admin/orders` اضغط "دفع" — سيُنشأ رابط تحميل تلقائياً
6. افتح `/order/[orderNumber]` — ستظهر روابط التحميل

---

## 📁 رفع ملفات المنتجات

### الخطوة 1: جهّز الملفات

ضع ملفات المنتجات في:
```
public/downloads/
├── learn-programming.pdf          (كتاب البرمجة)
├── digital-marketing.pdf          (كتاب التسويق)
├── HotelSystem_v2.1.0_Setup.exe   (نظام الفنادق)
└── ...
```

### الخطوة 2: ارفعها على Vercel

بما أن Vercel لا يدعم رفع الملفات الديناميكي، استخدم:
- **GitHub**: ضع الملفات في `public/downloads/` وارفعها (لكن `.gitignore` يمنع ذلك)
- **خيار أفضل**: استخدم خدمة تخزين سحابية (AWS S3, Cloudflare R2, Supabase Storage)
- أو استخدم روابط خارجية في حقل `fileUrl` عند إضافة المنتج

### مثال على رابط خارجي:
```
fileUrl: "https://your-s3-bucket.s3.amazonaws.com/HotelSystem_Setup.exe"
```

---

## 🔧 إعدادات لوحة التحكم

### 1. سجّل دخول كأدمن
- افتح `/admin/login`
- اضغط "إنشاء حساب جديد"
- أدخل اسم + إيميل + كلمة مرور (6+ أحرف)

### 2. حدّث إعدادات المتجر
- اذهب إلى `/admin/settings`
- حدّث:
  - اسم المتجر
  - رقم جيب
  - اسم المستفيد في ويسترن يونين
  - المدينة والدولة
  - نسبة الضريبة

### 3. أضف منتجات أو استخدم Seed
- `/admin` > "تحديث" لتحميل المنتجات الافتراضية

---

## 🛠️ استكشاف الأخطاء

### مشكلة: المنتجات لا تظهر

```bash
# تحقق من قاعدة البيانات
npx prisma studio

# أعد بذر المنتجات
curl -X POST https://sandak-store.vercel.app/api/products/seed
```

### مشكلة: رابط التحميل لا يعمل

1. تأكد من أن `fileUrl` في المنتج صحيح
2. تأكد من أن الطلب حالته "paid" في `/admin/orders`
3. الـ token يُنشأ تلقائياً عند تأكيد الدفع

### مشكلة: خطأ في Migration

```bash
# حذف الـ migrations القديمة وإنشاء جديدة
npx prisma migrate reset
npx prisma db push
```

---

## 📊 معلومات المشروع

- **الاسم**: متجر سندك v4
- **النسخة**: 0.2.1
- **التقنيات**: Next.js 16, React 19, TypeScript 5, Prisma 6, PostgreSQL (Neon)
- **النشر**: Vercel
- **الـ URL**: https://sandak-store.vercel.app
- **التواصل**: sanedsoft32@gmail.com

---

## 🔐 ملاحظات أمنية

- ⚠️ `ADMIN_API_KEY` و `JWT_SECRET` في `vercel.json` مكشوفان. يُفضل نقلهما إلى Vercel Environment Variables فقط وحذفهما من `vercel.json`.
- ⚠️ كلمات المرور مشفرة بـ bcrypt (12 rounds)
- ⚠️ Security Headers مفعّلة (CSP, X-Frame-Options, etc.)
