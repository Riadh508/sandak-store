import { NextResponse } from 'next/server';
import { db } from '@/lib/db';
import { requireAdmin } from '@/lib/auth';
import { logger } from '@/lib/logger';
import { generateSecureToken } from '@/lib/auth-server';

function generateCuid(): string {
  return `c${Date.now().toString(36)}${generateSecureToken(16).toLowerCase()}`.slice(0, 25);
}

const defaultProducts = [
  { name: 'كتاب تعلم البرمجة من الصفر حتى الاحتراف', description: 'دليلك الشامل لتعلم البرمجة من الصفر المطلق حتى الاحتراف مع أكثر من 500 صفحة', longDescription: 'كتاب شامل ومتكامل يأخذ بيدك في رحلة تعلم البرمجة من الصفر المطلق حتى المستوى المتقدم.', price: 25, category: 'ebook', image: '/covers/02-learn-programming.svg', features: JSON.stringify(['أكثر من 500 صفحة', 'شرح مبسط للمبتدئين', 'أكثر من 200 مثال عملي', 'تمارين مع حلول']), badge: '', sortOrder: 1 },
  { name: 'كتاب التسويق الرقمي الاحترافي', description: 'أتقن استراتيجيات التسويق الرقمي وزد مبيعاتك بنسبة تصل إلى 300%', longDescription: 'كتاب متخصص في التسويق الرقمي يقدم استراتيجيات مجربة لزيادة المبيعات.', price: 20, category: 'ebook', image: '/covers/01-digital-marketing.svg', features: JSON.stringify(['استراتيجيات SEO', 'التسويق عبر السوشيال ميديا', 'إعلانات Google', 'تحليل البيانات']), badge: '', sortOrder: 2 },
  { name: 'كتاب تطوير تطبيقات الويب الحديثة', description: 'دليل عملي شامل لبناء تطبيقات ويب حديثة بأحدث التقنيات', longDescription: 'كتاب متقدم يغطي تطوير تطبيقات الويب الحديثة باستخدام أحدث التقنيات.', price: 30, category: 'ebook', image: '/covers/03-web-development.png', features: JSON.stringify(['React و Next.js', 'HTML5 و CSS3', 'JavaScript', 'مشاريع كاملة']), badge: 'جديد', sortOrder: 3 },
  { name: 'كتاب إدارة المشاريع الفعالة', description: 'أتقن منهجيات إدارة المشاريع Agile و Scrum', longDescription: 'كتاب شامل في إدارة المشاريع يقدم منهجيات وأدوات عملية.', price: 22, category: 'ebook', image: '/covers/04-project-management.png', features: JSON.stringify(['Agile و Scrum', 'أدوات التخطيط', 'إدارة المخاطر', 'قوالب جاهزة']), badge: '', sortOrder: 4 },
  { name: 'كتاب تصميم واجهات المستخدم UI/UX', description: 'تعلم أساسيات تصميم واجهات المستخدم وتجربة المستخدم', longDescription: 'كتاب متخصص يقدم أسس التصميم الرقمي بطريقة عملية.', price: 28, category: 'ebook', image: '/covers/05-ui-ux-design.svg', features: JSON.stringify(['نظرية الألوان', 'Figma', 'تصميم متجاوب', '10 مشاريع عملية']), badge: 'مميز', sortOrder: 5 },
  { name: 'الدليل الشامل للذكاء الاصطناعي التوليدي', description: 'دليلك الشامل لإتقان أدوات الذكاء الاصطناعي التوليدي', longDescription: 'كتاب متقدم في الذكاء الاصطناعي التوليدي.', price: 39, category: 'ebook', image: '/covers/18-comprehensive-ai-guide.png', features: JSON.stringify(['GPT-4 و Claude', 'Midjourney', 'أكثر من 200 برومبت']), badge: 'جديد', sortOrder: 6 },
  { name: 'نظام إدارة الفنادق الشامل', description: 'نظام متكامل لإدارة الفنادق والشقق المفروشة', longDescription: 'نظام إدارة فندقية متكامل مع واجهة عربية.', price: 299, category: 'software', image: '/covers/19-hotel-management.png', features: JSON.stringify(['إدارة حجوزات', 'فوترة', 'تقارير', 'دعم عربي', 'تحميل: /downloads/HotelSystem_v2.1.0_Setup.exe']), badge: 'الأكثر مبيعاً', sortOrder: 7 },
  { name: 'نظام الفواتير الاحترافي', description: 'نظام احترافي لإنشاء وإدارة الفواتير', longDescription: 'نظام متكامل لإدارة الفواتير مع تقارير مالية.', price: 199, category: 'software', image: '/covers/20-invoice-system.svg', features: JSON.stringify(['فواتير احترافية', 'تتبع المدفوعات', 'تقارير مالية', 'تصدير PDF']), badge: '', sortOrder: 8 },
  { name: 'متجر سندك v4 — نظام متجر إلكتروني متكامل', description: 'نظام متجر إلكتروني جاهز مع لوحة تحكم ونظام طلبات', longDescription: 'نظام متجر إلكتروني متكامل مبني بـ Next.js + TypeScript + Prisma.', price: 499, category: 'software', image: '/covers/27-sandak-store.svg', features: JSON.stringify(['لوحة تحكم', 'نظام مصادقة', 'سلة تسوق', 'فواتير']), badge: 'نظام متكامل', sortOrder: 9 },
];

export async function POST(request: Request) {
  const authResult = requireAdmin(request);
  if (authResult) return authResult;

  try {
    await db.$executeRawUnsafe(`DELETE FROM "Product"`);

    for (const product of defaultProducts) {
      const productId = generateCuid();
      await db.$executeRawUnsafe(
        `INSERT INTO "Product" ("id", "name", "description", "longDescription", "price", "category", "image", "features", "badge", "isActive", "sortOrder", "createdAt", "updatedAt")
         VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, true, $10, NOW(), NOW())`,
        productId,
        product.name,
        product.description,
        product.longDescription,
        product.price,
        product.category,
        product.image,
        product.features,
        product.badge,
        product.sortOrder,
      );
    }

    const existingSettings = await db.storeSettings.findFirst();
    if (!existingSettings) {
      await db.storeSettings.create({ data: {} });
    }

    return NextResponse.json({
      success: true,
      message: `تم تهيئة قاعدة البيانات وإضافة ${defaultProducts.length} منتج`,
      data: { productsCount: defaultProducts.length },
    });
  } catch (error) {
    logger.error('Setup failed:', error);
    return NextResponse.json(
      { success: false, error: 'Setup failed: ' + (error instanceof Error ? error.message : String(error)) },
      { status: 500 }
    );
  }
}

export async function GET(request: Request) {
  try {
    let count = 0;
    let isAdmin = false;
    try {
      const rows = await db.$queryRawUnsafe<Array<Record<string, unknown>>>(`SELECT COUNT(*)::int as count FROM "Product"`);
      count = rows?.[0]?.count || 0;
    } catch {
      // Tables not ready yet
    }
    const authResult = requireAdmin(request);
    isAdmin = !authResult;
    return NextResponse.json({
      success: true,
      message: 'System is running',
      data: { productCount: count, isAdmin },
    });
  } catch {
    return NextResponse.json({
      success: false,
      error: 'Database not initialized',
      data: { productCount: 0 },
    });
  }
}
