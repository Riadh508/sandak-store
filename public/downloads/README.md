# مجلد التحميلات / Downloads

هذا المجلد مخصص لوضع ملفات المنتجات التي يبيعها المتجر.

## ملاحظات هامة:

1. **الكتب الإلكترونية (PDF)**: ضع ملفات الكتب بصيغة `ebook-name.pdf` في هذا المجلد
2. **البرامج (Setup.exe)**: ضع ملفات التثبيت بصيغة `SoftwareName_v1.0.0_Setup.exe`
3. **المتجر الكامل (ZIP)**: ضع ملف المتجر في `sandak-store-v4.zip`

## المسارات المتوقعة:

- `/downloads/learn-programming.pdf` - كتاب البرمجة
- `/downloads/digital-marketing.pdf` - كتاب التسويق الرقمي
- `/downloads/HotelSystem_v2.1.0_Setup.exe` - نظام إدارة الفنادق
- `/downloads/InvoiceSystem_v1.5.0_Setup.exe` - نظام الفواتير
- `/downloads/POSSystem_v2.0.0_Setup.exe` - نظام نقاط البيع
- `/downloads/AccountingSystem_v3.0.0_Setup.exe` - نظام المحاسبة
- `/downloads/SchoolSystem_v2.5.0_Setup.exe` - نظام إدارة المدارس
- `/downloads/sandak-store-v4.zip` - متجر سندك v4

## البديل:

يمكنك أيضاً استخدام روابط خارجية (مثل Google Drive، Dropbox، S3) في حقل `fileUrl` عند إضافة المنتج.

## الأمان:

- لا تضع الملفات في `git` (المجلد مضاف إلى `.gitignore`)
- تأكد من أن أسماء الملفات لا تحتوي على فراغات
- استخدم أحرف إنجليزية وأرقام فقط في أسماء الملفات

## التحديث:

عند إضافة منتج جديد في لوحة التحكم، أدخل:
- **رابط الملف**: `/downloads/your-file.pdf` (إذا كان محلياً)
- **حجم الملف**: بالبايت (1048576 = 1MB)
