'use client';

import { useStore } from '@/lib/store';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Star, ArrowLeft, Shield, Zap, Users, Clock, BookOpen, Monitor } from 'lucide-react';
import { Skeleton } from '@/components/ui/skeleton';

export function HomeContent() {
  const { products, productsLoading, setCurrentView, setCategoryFilter } = useStore();

  const ebookCount = products.filter((p) => p.category === 'ebook').length;
  const softwareCount = products.filter((p) => p.category === 'software').length;
  const featuredProducts = products.filter((p) => p.badge);

  return (
    <>
      {/* Featured Products Quick Section */}
      <section className="py-12 md:py-16">
        <div className="container mx-auto px-4">
          <div className="mb-8 text-center">
            <h2 className="mb-3 text-2xl font-extrabold text-gray-900 md:text-3xl">
              مميز وشيء جديد
            </h2>
            <p className="text-gray-500">المنتجات الأكثر طلباً والأحدث في متجرنا</p>
			
          </div>

          {/* Featured Cards */}
          <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3 mb-12">
            {/* Software Card */}
            <Card className="group overflow-hidden border-2 border-emerald-100 bg-gradient-to-br from-emerald-50/50 to-teal-50/50 transition-all hover:shadow-xl hover:shadow-emerald-100/50 hover:-translate-y-1 cursor-pointer"
              onClick={() => { setCategoryFilter('software'); setCurrentView('products'); }}
            >
              <div className="h-40 bg-gradient-to-br from-emerald-500 to-teal-600 flex items-center justify-center relative">
                <Monitor className="h-16 w-16 text-white/90" />
                {softwareCount > 0 && (
                  <Badge className="absolute top-3 right-3 bg-white/90 text-emerald-700">{softwareCount} نظام</Badge>
                )}
              </div>
              <CardContent className="p-5">
                <h3 className="text-lg font-bold text-gray-900 mb-2">البرمجيات والأنظمة</h3>
                <p className="text-sm text-gray-500 mb-4">
                  {softwareCount > 0
                    ? 'أنظمة احترافية لإدارة أعمالك بكفاءة عالية'
                    : 'سيتم إضافة أنظمة جديدة قريباً'
                  }
                </p>
                <div className="flex items-center justify-between">
                  {softwareCount > 0 && (
                    <Button size="sm" className="bg-emerald-600 hover:bg-emerald-700 text-white">
                      <ArrowLeft className="mr-1 h-3 w-3" />
                      عرض التفاصيل
                    </Button>
                  )}
                </div>
              </CardContent>
            </Card>

            {/* eBooks Category Card */}
            <Card className="group overflow-hidden border-2 border-blue-100 bg-gradient-to-br from-blue-50/50 to-indigo-50/50 transition-all hover:shadow-xl hover:shadow-blue-100/50 hover:-translate-y-1 cursor-pointer"
              onClick={() => { setCategoryFilter('ebook'); setCurrentView('products'); }}
            >
              <div className="h-40 bg-gradient-to-br from-blue-500 to-indigo-600 flex items-center justify-center relative">
                <BookOpen className="h-16 w-16 text-white/90" />
                <Badge className="absolute top-3 right-3 bg-white/90 text-blue-700">{ebookCount} كتاب</Badge>
              </div>
              <CardContent className="p-5">
                <h3 className="text-lg font-bold text-gray-900 mb-2">الكتب الإلكترونية</h3>
                <p className="text-sm text-gray-500 mb-4">مجموعة متنوعة من الكتب التقنية والإدارية بصيغة PDF</p>
                <div className="flex items-center justify-between">
                  {ebookCount > 0 && (
                    <span className="text-sm font-medium text-blue-600">
                      ابتداءً من {"$"}{Math.min(...products.filter(p => p.category === 'ebook').map(p => p.price))}
                    </span>
                  )}
                  <Button size="sm" variant="outline" className="border-blue-300 text-blue-700 hover:bg-blue-50">
                    <ArrowLeft className="mr-1 h-3 w-3" />
                    تصفح الكتب
                  </Button>
                </div>
              </CardContent>
            </Card>

            {/* Stats Card */}
            <Card className="overflow-hidden border-2 border-amber-100 bg-gradient-to-br from-amber-50/50 to-orange-50/50">
              <CardContent className="p-6 h-full flex flex-col justify-center">
                <h3 className="text-lg font-bold text-gray-900 mb-6">لماذا سندك؟</h3>
                <div className="space-y-4">
                  {[
                    { icon: Shield, text: 'ضمان جودة المنتجات', color: 'text-emerald-600 bg-emerald-100' },
                    { icon: Zap, text: 'استلام فوري بعد الدفع', color: 'text-amber-600 bg-amber-100' },
                    { icon: Users, text: '+500 عميل راضي', color: 'text-blue-600 bg-blue-100' },
                    { icon: Clock, text: 'دعم فني على مدار الساعة', color: 'text-purple-600 bg-purple-100' },
                  ].map((item, i) => (
                    <div key={i} className="flex items-center gap-3">
                      <div className={`h-9 w-9 rounded-lg flex items-center justify-center shrink-0 ${item.color}`}>
                        <item.icon className="h-4 w-4" />
                      </div>
                      <span className="text-sm font-medium text-gray-700">{item.text}</span>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          </div>

          {/* All Products Preview */}
          <div className="text-center">
            <Button
              size="lg"
              onClick={() => { setCategoryFilter('all'); setCurrentView('products'); }}
              className="bg-emerald-600 hover:bg-emerald-700 text-white px-10 shadow-lg shadow-emerald-200"
            >
              عرض جميع المنتجات ({products.length})
              <ArrowLeft className="mr-2 h-4 w-4" />
            </Button>
          </div>
        </div>
      </section>

      {/* Testimonials */}
      <section className="bg-gray-50/50 py-12 md:py-16">
        <div className="container mx-auto px-4">
          <div className="mb-8 text-center">
            <h2 className="mb-3 text-2xl font-extrabold text-gray-900 md:text-3xl">
              آراء عملائنا
            </h2>
            <p className="text-gray-500">ماذا يقول عملاؤنا عن منتجاتنا</p>
          </div>

          <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
            {[
              {
                name: 'أحمد محمد',
                role: 'صاحب فندق - صنعاء',
                text: 'نظام إدارة الفنادق ممتاز جداً! سهل الاستخدام ووفر علي الكثير من الوقت والجهد. أنصح به كل صاحب فندق.',
                rating: 5,
              },
              {
                name: 'سارة علي',
                role: 'مطورة ويب',
                text: 'كتب المتجر مفيدة جداً ومحدثة. خصوصاً كتاب تطوير تطبيقات الويب ساعدني كثيراً في تطوير مهاراتي.',
                rating: 5,
              },
              {
                name: 'خالد حسين',
                role: 'رائد أعمال',
                text: 'خدمة ممتازة ومنتجات عالية الجودة. الدعم الفني متجاوب وسريع. شكراً فريق سندك!',
                rating: 5,
              },
            ].map((testimonial, i) => (
              <Card key={i} className="border-gray-100 bg-white">
                <CardContent className="p-6">
                  <div className="flex items-center gap-1 mb-3">
                    {[...Array(testimonial.rating)].map((_, j) => (
                      <Star key={j} className="h-4 w-4 fill-amber-400 text-amber-400" />
                    ))}
                  </div>
                  <p className="text-sm text-gray-600 leading-relaxed mb-4">
                    &quot;{testimonial.text}&quot;
                  </p>
                  <div>
                    <div className="text-sm font-semibold text-gray-900">{testimonial.name}</div>
                    <div className="text-xs text-gray-400">{testimonial.role}</div>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      </section>
    </>
  );
}
