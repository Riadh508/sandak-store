import { NextResponse } from 'next/server';
import { db } from '@/lib/db';
import { logger } from '@/lib/logger';

interface SetupProduct {
  name: string;
  description: string;
  longDescription: string;
  price: number;
  category: 'ebook' | 'software';
  image: string;
  features: string[];
  badge: string;
  fileUrl: string;
  fileSize: number;
  sortOrder: number;
}

const defaultProducts: SetupProduct[] = [
  {
    name: 'كتاب تعلم البرمجة من الصفر حتى الاحتراف',
    description: 'دليلك الشامل لتعلم البرمجة من الصفر المطلق حتى الاحتراف مع أمثلة عملية تطبيقية وتمارين تفاعلية',
    longDescription: 'كتاب شامل ومتكامل يأخذ بيدك خطوة بخطوة في رحلة تعلم البرمجة من الصفر المطلق حتى المستوى المتقدم.',
    price: 25,
    category: 'ebook',
    image: '/covers/02-learn-programming.svg',
    features: ['كتاب إلكتروني شامل لتعلم البرمجة', 'شرح مبسط خطوة بخطوة', 'أكثر من 200 مثال عملي', '50 تمرين تطبيقي'],
    badge: '',
    fileUrl: '/downloads/learn-programming.pdf',
    fileSize: 75700,
    sortOrder: 1,
  },
  {
    name: 'كتاب التسويق الرقمي الاحترافي',
    description: 'أتقن استراتيجيات التسويق الرقمي وزد مبيعاتك بنسبة تصل إلى 300%',
    longDescription: 'كتاب متخصص في التسويق الرقمي يقدم استراتيجيات وتقنيات مجربة لزيادة مبيعاتك عبر الإنترنت.',
    price: 20,
    category: 'ebook',
    image: '/covers/01-digital-marketing.svg',
    features: ['استراتيجيات SEO المتقدمة', 'التسويق على وسائل التواصل', 'إعلانات Google و Meta'],
    badge: '',
    fileUrl: '/downloads/digital-marketing.pdf',
    fileSize: 88660,
    sortOrder: 2,
  },
  {
    name: 'كتاب تطوير تطبيقات الويب الحديثة',
    description: 'دليل عملي لبناء تطبيقات ويب حديثة بأحدث التقنيات من HTML حتى Next.js',
    longDescription: 'كتاب متقدم يغطي تطوير تطبيقات الويب من الصفر باستخدام أحدث الأطر.',
    price: 30,
    category: 'ebook',
    image: '/covers/03-web-development.png',
    features: ['HTML5 و CSS3 المتقدم', 'JavaScript ES6+', 'React و Next.js 14'],
    badge: 'جديد',
    fileUrl: '/downloads/web-development.pdf',
    fileSize: 71969,
    sortOrder: 3,
  },
  {
    name: 'كتاب تصميم واجهات المستخدم UI/UX',
    description: 'تعلم أساسيات تصميم واجهات المستخدم وتجربة المستخدم من الصفر حتى الاحتراف مع Figma',
    longDescription: 'كتاب متخصص في تصميم واجهات المستخدم UI وتجربة المستخدم UX.',
    price: 28,
    category: 'ebook',
    image: '/covers/05-ui-ux-design.svg',
    features: ['أساسيات التصميم البصري', 'تعلم Figma', 'تصميم متجاوب'],
    badge: 'مميز',
    fileUrl: '/downloads/ui-ux-design.pdf',
    fileSize: 72860,
    sortOrder: 4,
  },
  {
    name: 'كتاب التجارة الإلكترونية الاحترافية',
    description: 'دليلك الشامل لإنشاء متجر إلكتروني ناجح من الصفر',
    longDescription: 'كتاب شامل لإنشاء متجر إلكتروني ناجح من الصفر.',
    price: 27,
    category: 'ebook',
    image: '/covers/08-ecommerce.svg',
    features: ['دليل إنشاء متجر إلكتروني', 'اختيار المنتجات الرابحة', 'شرح Shopify و WooCommerce'],
    badge: 'جديد',
    fileUrl: '/downloads/ecommerce.pdf',
    fileSize: 51475,
    sortOrder: 5,
  },
  {
    name: 'كتاب دليل الذكاء الاصطناعي الشامل',
    description: 'افهم عالم الذكاء الاصطناعي من الألف إلى الياء',
    longDescription: 'كتاب شامل يقدم فهماً عميقاً لعالم AI وتقنياته.',
    price: 35,
    category: 'ebook',
    image: '/covers/06-ai-guide.png',
    features: ['شرح مبسط لمفاهيم AI', 'تطبيقات عملية', 'دليل ChatGPT و Claude'],
    badge: 'الأكثر مبيعاً',
    fileUrl: '/downloads/ai-guide.pdf',
    fileSize: 71479,
    sortOrder: 6,
  },
  {
    name: 'نظام إدارة الفنادق الشامل',
    description: 'نظام متكامل لإدارة الفنادق والشقق المفروشة',
    longDescription: 'نظام إدارة فندقية متكامل مبني بأحدث التقنيات.',
    price: 299,
    category: 'software',
    image: '/covers/19-hotel-management.png',
    features: ['إدارة حجوزات الغرف', 'نظام تسجيل النزلاء', 'لوحة تحليلية'],
    badge: 'الأكثر مبيعاً',
    fileUrl: '/downloads/HotelSystem_v2.1.0_Setup.exe',
    fileSize: 14294235,
    sortOrder: 7,
  },
  {
    name: 'نظام الفواتير الاحترافي',
    description: 'نظام احترافي لإنشاء وإدارة الفواتير',
    longDescription: 'نظام متكامل لإدارة الفواتير يتيح إنشاء فواتير احترافية.',
    price: 199,
    category: 'software',
    image: '/covers/20-invoice-system.svg',
    features: ['إنشاء فواتير احترافية', 'تتبع المدفوعات', 'تقارير مالية'],
    badge: '',
    fileUrl: '/downloads/InvoiceSystem_v2.5.0_Setup.zip',
    fileSize: 69753,
    sortOrder: 8,
  },
  {
    name: 'نظام المحاسبة الشامل',
    description: 'نظام محاسبة متكامل لإدارة الحسابات المالية',
    longDescription: 'نظام محاسبي متكامل يغطي جميع العمليات المحاسبية.',
    price: 279,
    category: 'software',
    image: '/covers/22-accounting-system.png',
    features: ['القيود اليومية', 'قائمة الدخل', 'تقارير مالية'],
    badge: 'جديد',
    fileUrl: '/downloads/AccountingSystem_v2.1.0_Setup.zip',
    fileSize: 54280,
    sortOrder: 9,
  },
  {
    name: 'نظام نقاط البيع POS',
    description: 'نظام نقاط بيع متكامل وسريع',
    longDescription: 'نظام نقاط بيع حديث وسريع للمحلات والمطاعم.',
    price: 249,
    category: 'software',
    image: '/covers/21-pos-system.png',
    features: ['واجهة سهلة', 'إدارة المبيعات', 'إدارة المخزون'],
    badge: '',
    fileUrl: '/downloads/POSSystem_v2.0.0_Setup.zip',
    fileSize: 59679,
    sortOrder: 10,
  },
  {
    name: 'متجر سندك v4 — نظام متجر إلكتروني متكامل',
    description: 'نظام متجر إلكتروني جاهز مع لوحة تحكم ونظام طلبات',
    longDescription: 'نظام متجر إلكتروني مبني بأحدث التقنيات Next.js + TypeScript.',
    price: 499,
    category: 'software',
    image: '/covers/27-sandak-store.svg',
    features: ['لوحة تحكم كاملة', 'نظام مصادقة آمن', 'سلة تسوق'],
    badge: 'نظام متكامل',
    fileUrl: '/downloads/sandak-store-v4.zip',
    fileSize: 202970,
    sortOrder: 11,
  },
];

export async function POST() {
  try {
    const existing = await db.product.findFirst();
    if (existing) {
      return NextResponse.json({ success: true, message: 'النظام مُعد مسبقاً' });
    }

    for (const product of defaultProducts) {
      await db.product.create({ data: product });
    }

    await db.storeSettings.create({ data: {} });

    return NextResponse.json({
      success: true,
      message: `تم إعداد ${defaultProducts.length} منتج بنجاح`,
    });
  } catch (error) {
    logger.error('Setup error:', error);
    return NextResponse.json({ success: false, error: 'فشل إعداد المتجر' }, { status: 500 });
  }
}
