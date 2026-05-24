# دليل نشر مشروع سندك v4 على Netlify

## 1. المتطلبات المسبقة (Prerequisites)

تأكد من تثبيت الأدوات التالية على جهازك:

| الأداة | الإصدار المطلوب | التحقق |
|--------|----------------|--------|
| Node.js | 22 أو أحدث | `node -v` |
| npm | 10 أو أحدث | `npm -v` |
| Git | 2.40 أو أحدث | `git --version` |

### تثبيت Node.js (إذا لم يكن مثبتاً)
```bash
# Windows - حمل من الموقع الرسمي
# https://nodejs.org/en/download/
# اختر LTS (v22+)
```

---

## 2. الإعداد المحلي (Local Setup)

### 2.1 تثبيت المكتبات
```bash
cd C:\Users\ٍُSeandSoft\Downloads\sandak-v4
npm install
```
> ملاحظة: أمر `prisma generate` يتم تشغيله تلقائياً بعد `npm install` عبر `postinstall`.

### 2.2 إنشاء قاعدة البيانات
```bash
npx prisma db push
```
هذا الأمر ينشئ قاعدة بيانات SQLite المحلية (`prisma/dev.db`) مع جميع الجداول:
- `Product` - المنتجات
- `User` - المستخدمين (الآدمن)
- `Order` - الطلبات
- `Invoice` - الفواتير
- `InvoiceItem` - بنود الفواتير
- `StoreSettings` - إعدادات المتجر

### 2.3 تشغيل المشروع محلياً
```bash
npm run dev
```
افتح المتصفح على: `http://localhost:3000`

---

## 3. إعداد Git و GitHub

### 3.1 تهيئة المستودع
```bash
cd C:\Users\ٍُSeandSoft\Downloads\sandak-v4
git init
```

### 3.2 إنشاء ملف `.gitignore` (إذا لم يكن موجوداً)
تأكد من عدم رفع الملفات الحساسة:
```
node_modules/
.next/
prisma/dev.db
.env
*.log
```

### 3.3 رفع الكود إلى GitHub
```bash
git add .
git commit -m "Initial commit: sandak-v4 store"
git branch -M main
git remote add origin https://github.com/YOUR_USERNAME/sandak-v4.git
git push -u origin main
```
> استبدل `YOUR_USERNAME` باسم المستخدم الخاص بك على GitHub.

---

## 4. الإعداد على Netlify

### 4.1 إنشاء حساب Netlify
1. افتح [https://app.netlify.com](https://app.netlify.com)
2. سجّل الدخول عبر حساب GitHub

### 4.2 استيراد المشروع
1. اضغط على **"Add new site"** > **"Import an existing project"**
2. اختر **GitHub**
3. ابحث عن مستودع `sandak-v4` واختره

### 4.3 إعدادات البناء (Build Settings)

| الإعداد | القيمة |
|---------|--------|
| **Base directory** | (اتركه فارغاً) |
| **Build command** | `npm run build` |
| **Publish directory** | `.next` |
| **Node version** | 22 |

> هذه الإعدادات موجودة بالفعل في ملف `netlify.toml` وسيتم قراءتها تلقائياً.

### 4.4 تثبيت إضافة Next.js
تأكد من وجود الإضافة في `netlify.toml`:
```toml
[[plugins]]
  package = "@netlify/plugin-nextjs"
```

### 4.5 بدء النشر
اضغط على **"Deploy site"** - سيتم البناء والنشر تلقائياً.

---

## 5. متغيرات البيئة (Environment Variables)

أضف المتغيرات التالية في Netlify:
**Site settings > Environment variables > Add a variable**

| المتغير | القيمة | الوصف |
|---------|--------|-------|
| `DATABASE_URL` | `file:./dev.db` | مسار قاعدة بيانات SQLite |
| `ADMIN_API_KEY` | `your-fallback-key` | مفتاح API الاحتياطي للآدمن |
| `JWT_SECRET` | `your-jwt-secret` | مفتاح تشفير توكنات JWT |
| `NEXT_PUBLIC_SITE_URL` | `https://your-site.netlify.app` | رابط الموقع المنشور |

### إضافة المتغيرات عبر واجهة Netlify:
```
1. اذهب إلى: Site configuration > Environment variables
2. اضغط "Add a variable"
3. أدخل اسم المتغير والقيمة
4. اضغط "Create variable"
5. كرر لكل متغير
```

### أو عبر ملف `.env` محلياً:
```env
DATABASE_URL="file:./dev.db"
ADMIN_API_KEY="your-fallback-key"
JWT_SECRET="your-jwt-secret"
NEXT_PUBLIC_SITE_URL="https://your-site.netlify.app"
```

> **مهمة:** بعد إضافة المتغيرات، أعد النشر عبر **"Deploy site" > "Trigger deploy" > "Clear cache and deploy site"**

---

## 5.1 قاعدة البيانات SQLite على Netlify

### كيف يعمل SQLite على Netlify

SQLite يعمل على Netlify لكن **يتم مسحه مع كل نشر جديد**. هذا يعني:

- ✅ SQLite يعمل أثناء تشغيل الموقع
- ❌ البيانات **تُفقد** عند كل deploy جديد
- ❌ لا يُناسب بيئة الإنتاج الحقيقية

### الحل: استخدام PostgreSQL للبيانات الدائمة

للحفاظ على بياناتك بين عمليات النشر، استخدم قاعدة بيانات PostgreSQL سحابية:

| الخدمة | الخطة المجانية | الرابط |
|--------|---------------|--------|
| **Neon** | 0.5 GB تخزين | [neon.tech](https://neon.tech) |
| **Supabase** | 500 MB تخزين | [supabase.com](https://supabase.com) |

### كيفية التبديل من SQLite إلى PostgreSQL

**الخطوة 1:** غيّر المزود في `prisma/schema.prisma`:

```prisma
// قبل (SQLite)
datasource db {
  provider = "sqlite"
  url      = env("DATABASE_URL")
}

// بعد (PostgreSQL)
datasource db {
  provider = "postgresql"
  url      = env("DATABASE_URL")
}
```

**الخطوة 2:** أنشئ قاعدة بيانات PostgreSQL على Neon أو Supabase واحصل على رابط الاتصال.

**الخطوة 3:** حدّث متغير `DATABASE_URL` في Netlify:

```
DATABASE_URL="postgresql://user:password@host:port/dbname?sslmode=require"
```

**الخطوة 4:** شغّل الأمر التالي محلياً لإنشاء الجداول:

```bash
npx prisma db push
```

**الخطوة 5:** أعد نشر المشروع على Netlify.

---

## 6. إعداد أول مستخدم آدمن (First Admin Setup)

### 6.1 عبر صفحة التسجيل
1. افتح رابط: `https://your-site.netlify.app/admin/login`
2. اضغط على **"تسجيل حساب جديد"** (Register)
3. أدخل البيانات:
   - **الاسم:** اسمك
   - **البريد الإلكتروني:** بريدك
   - **كلمة المرور:** كلمة مرور قوية
4. اضغط **"تسجيل"**

### 6.2 عبر API مباشرة
```bash
curl -X POST https://your-site.netlify.app/api/auth/register \
  -H "Content-Type: application/json" \
  -d '{
    "name": "Admin",
    "email": "admin@store.com",
    "password": "YourStrongPassword123!"
  }'
```

### 6.3 تسجيل الدخول
1. افتح: `https://your-site.netlify.app/admin/login`
2. أدخل البريد وكلمة المرور
3. سيتم توجيهك إلى لوحة التحكم `/admin`

---

## 7. استكشاف الأخطاء وإصلاحها (Troubleshooting)

### 7.1 البناء يفشل (Build Fails)

**الخطأ:** `Build failed with exit code 1`

**الحلول:**
```bash
# تأكد من إصدار Node.js
node -v
# يجب أن يكون v22 أو أحدث

# نظّف وأعد التثبيت
rm -rf node_modules .next
npm install

# تأكد من توليد Prisma
npx prisma generate

# جرّب البناء محلياً
npm run build
```

**أسباب شائعة:**
- إصدار Node.js قديم → حدّث إلى v22+
- مكتبة مفقودة → `npm install`
- خطأ في TypeScript → راجع أخطاء `npm run build`

---

### 7.2 قاعدة البيانات غير موجودة (Database Not Found)

**الخطأ:** `Database file not found` أو `PrismaClientInitializationError`

**الحلول:**

```bash
# محلياً - أنشئ قاعدة البيانات
npx prisma db push

# على Netlify - SQLite يعمل في نفس بيئة البناء
# تأكد من أن DATABASE_URL مضبوط correctly:
DATABASE_URL="file:./dev.db"
```

> **تنبيه مهم:** SQLite على Netlify يتم إنشاؤه في كل بناء جديد. البيانات **لا تُحفظ** بين عمليات النشر. للإنتاج، استخدم قاعدة بيانات سحابية مثل:
> - [Neon](https://neon.tech) (PostgreSQL مجاني)
> - [Supabase](https://supabase.com) (PostgreSQL مجاني)
> - [Turso](https://turso.tech) (SQLite سحابي)

**لتغيير قاعدة البيانات إلى PostgreSQL:**
```prisma
// prisma/schema.prisma
datasource db {
  provider = "postgresql"
  url      = env("DATABASE_URL")
}
```

---

### 7.3 المصادقة لا تعمل (Auth Not Working)

**الأعراض:** لا يمكن تسجيل الدخول، أو يتم طردك بعد تسجيل الدخول

**الحلول:**

1. **تحقق من `JWT_SECRET`:**
   ```
   تأكد من أن المتغير JWT_SECRET مضبوط في Netlify
   يجب أن يكون نفس القيمة في كل مرة
   ```

2. **تحقق من `NEXT_PUBLIC_SITE_URL`:**
   ```
   يجب أن يطابق رابط موقعك بالضبط
   مثال: https://sandak-store.netlify.app
   ```

3. **مسح الكاش وإعادة النشر:**
   ```
   Netlify Dashboard > Deploys > Trigger deploy > Clear cache and deploy site
   ```

4. **تحقق من سجلات البناء:**
   ```
   Netlify Dashboard > Deploys > اختر البناء > راجع السجل
   ```

---

### 7.4 المنتجات لا تظهر (Products Not Showing)

**الأعراض:** صفحة المتجر فارغة أو بدون منتجات

**الحلول:**

1. **بذر المنتجات الافتراضية:**
   ```bash
   curl -X POST https://your-site.netlify.app/api/products/seed
   ```

2. **تحقق من قاعدة البيانات:**
   ```bash
   # محلياً
   npx prisma studio
   ```

3. **أعد بناء قاعدة البيانات:**
   ```bash
   npx prisma db push
   npm run build
   ```

4. **تحقق من المتغيرات:**
   ```
   تأكد من أن DATABASE_URL مضبوط بشكل صحيح
   ```

---

## ملخص سريع للأوامر

```bash
# 1. التثبيت
npm install

# 2. قاعدة البيانات
npx prisma db push

# 3. التشغيل المحلي
npm run dev

# 4. البناء
npm run build

# 5. Git
git add . && git commit -m "update" && git push

# 6. بذر المنتجات
curl -X POST https://your-site.netlify.app/api/products/seed
```

---

## قائمة النشر السريع (Quick Deploy Checklist)

قبل اعتبار موقعك جاهزاً، تأكد من إتمام جميع الخطوات:

- [ ] تم تهيئة مستودع Git ورفعه إلى GitHub
- [ ] تم إنشاء موقع Netlify من مستودع GitHub
- [ ] تم ضبط متغيرات البيئة في Netlify (DATABASE_URL, JWT_SECRET, ADMIN_API_KEY, NEXT_PUBLIC_SITE_URL)
- [ ] تم تسجيل أول مستخدم آدمن عبر `/admin/login`
- [ ] تم إعداد إعدادات المتجر عبر `/admin/settings`

---

## روابط مفيدة

| الرابط | الوصف |
|--------|-------|
| [Netlify Docs](https://docs.netlify.com) | وثائق Netlify |
| [Next.js on Netlify](https://docs.netlify.com/frameworks/next-js/overview/) | دليل Next.js على Netlify |
| [Prisma Docs](https://www.prisma.io/docs) | وثائق Prisma |
| [الموقع المنشور](https://sandak-store.netlify.app) | موقع سندك |
