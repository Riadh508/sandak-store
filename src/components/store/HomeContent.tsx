'use client';

import { useStore } from '@/lib/store';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Star, ArrowLeft, Shield, Zap, Users, Clock, BookOpen, Monitor, Award, Sparkles, TrendingUp, CheckCircle2, MessageCircle, Heart, Award as AwardIcon, RefreshCw } from 'lucide-react';
import { Skeleton } from '@/components/ui/skeleton';
import { motion } from 'framer-motion';
import Link from 'next/link';

export function HomeContent() {
  const { products, productsLoading, productsError, setCurrentView, setCategoryFilter, retryFetchProducts } = useStore();

  const ebookCount = products.filter((p) => p.category === 'ebook').length;
  const softwareCount = products.filter((p) => p.category === 'software').length;
  const bestsellers = products.filter((p) => p.badge && (p.badge.includes('مبيع') || p.badge.includes('مميز')));
  const newArrivals = products.filter((p) => p.badge === 'جديد');
  const featured = [...bestsellers, ...newArrivals].slice(0, 6);
  const ebooks = products.filter((p) => p.category === 'ebook');
  const lowestEbookPrice = ebooks.length > 0 ? Math.min(...ebooks.map((p) => p.price)) : 0;

  return (
    <>
      {/* Quick Stats Bar */}
      <section className="border-y bg-white">
        <div className="container mx-auto px-4 py-6">
          <div className="grid grid-cols-2 gap-4 md:grid-cols-4">
            {[
              { icon: BookOpen, label: 'كتاب إلكتروني', value: ebookCount, color: 'text-blue-600', bg: 'bg-blue-50' },
              { icon: Monitor, label: 'نظام برمجي', value: softwareCount, color: 'text-emerald-600', bg: 'bg-emerald-50' },
              { icon: Users, label: 'عميل سعيد', value: '+500', color: 'text-amber-600', bg: 'bg-amber-50' },
              { icon: Award, label: 'تقييم', value: '4.9/5', color: 'text-purple-600', bg: 'bg-purple-50' },
            ].map((stat, i) => (
              <motion.div
                key={i}
                initial={{ opacity: 0, y: 10 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ duration: 0.3, delay: i * 0.05 }}
                className="flex items-center gap-3"
              >
                <div className={'flex h-12 w-12 shrink-0 items-center justify-center rounded-xl ' + stat.bg}>
                  <stat.icon className={'h-6 w-6 ' + stat.color} />
                </div>
                <div>
                  <div className="text-xl font-extrabold text-gray-900 md:text-2xl">{stat.value}</div>
                  <div className="text-xs text-gray-500 md:text-sm">{stat.label}</div>
                </div>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* Featured & Best Sellers */}
      <section className="py-12 md:py-16">
        <div className="container mx-auto px-4">
          <div className="mb-8 text-center">
            <Badge className="mb-3 bg-emerald-100 text-emerald-700 border-0">
              <Sparkles className="ml-1 h-3 w-3" />
              الأكثر طلباً
            </Badge>
            <h2 className="mb-3 text-2xl font-extrabold text-gray-900 md:text-3xl">
              المنتجات المميزة والجديدة
            </h2>
            <p className="text-gray-500">اكتشف أفضل ما لدينا من منتجات احترافية موثوقة</p>
          </div>

          {/* Category Quick Cards */}
          <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3 mb-12">
            {/* Software Card */}
            <Card
              className="group overflow-hidden border-2 border-emerald-100 bg-gradient-to-br from-emerald-50/50 to-teal-50/50 transition-all hover:shadow-xl hover:shadow-emerald-100/50 hover:-translate-y-1 cursor-pointer"
              onClick={() => { setCategoryFilter('software'); setCurrentView('products'); }}
            >
              <div className="h-40 bg-gradient-to-br from-emerald-500 to-teal-600 flex items-center justify-center relative">
                <Monitor className="h-16 w-16 text-white/90" />
                {softwareCount > 0 && (
                  <Badge className="absolute top-3 right-3 bg-white/90 text-emerald-700">{softwareCount} نظام</Badge>
                )}
                <div className="absolute bottom-3 left-3 flex items-center gap-1 bg-white/20 backdrop-blur-sm rounded-full px-2 py-1 text-xs text-white">
                  <Award className="h-3 w-3" />
                  <span>جاهز للتشغيل</span>
                </div>
              </div>
              <CardContent className="p-5">
                <h3 className="text-lg font-bold text-gray-900 mb-2">الأنظمة والبرمجيات</h3>
                <p className="text-sm text-gray-500 mb-4">
                  أنظمة احترافية جاهزة لإدارة أعمالك بكفاءة عالية
                </p>
                <div className="flex items-center justify-between">
                  {softwareCount > 0 && (
                    <span className="text-sm font-bold text-emerald-600">
                      ابتداءً من ${Math.min(...products.filter(p => p.category === 'software').map(p => p.price))}
                    </span>
                  )}
                  <Button size="sm" className="bg-emerald-600 hover:bg-emerald-700 text-white">
                    <ArrowLeft className="mr-1 h-3 w-3" />
                    عرض الأنظمة
                  </Button>
                </div>
              </CardContent>
            </Card>

            {/* eBooks Category Card */}
            <Card
              className="group overflow-hidden border-2 border-blue-100 bg-gradient-to-br from-blue-50/50 to-indigo-50/50 transition-all hover:shadow-xl hover:shadow-blue-100/50 hover:-translate-y-1 cursor-pointer"
              onClick={() => { setCategoryFilter('ebook'); setCurrentView('products'); }}
            >
              <div className="h-40 bg-gradient-to-br from-blue-500 to-indigo-600 flex items-center justify-center relative">
                <BookOpen className="h-16 w-16 text-white/90" />
                <Badge className="absolute top-3 right-3 bg-white/90 text-blue-700">{ebookCount} كتاب</Badge>
                <div className="absolute bottom-3 left-3 flex items-center gap-1 bg-white/20 backdrop-blur-sm rounded-full px-2 py-1 text-xs text-white">
                  <BookOpen className="h-3 w-3" />
                  <span>صيغة PDF</span>
                </div>
              </div>
              <CardContent className="p-5">
                <h3 className="text-lg font-bold text-gray-900 mb-2">الكتب الإلكترونية</h3>
                <p className="text-sm text-gray-500 mb-4">
                  مجموعة متنوعة من الكتب التقنية والإدارية بصيغة PDF
                </p>
                <div className="flex items-center justify-between">
                  {ebookCount > 0 && (
                    <span className="text-sm font-bold text-blue-600">
                      ابتداءً من ${lowestEbookPrice}
                    </span>
                  )}
                  <Button size="sm" variant="outline" className="border-blue-300 text-blue-700 hover:bg-blue-50">
                    <ArrowLeft className="mr-1 h-3 w-3" />
                    تصفح الكتب
                  </Button>
                </div>
              </CardContent>
            </Card>

            {/* Why Us Card */}
            <Card className="overflow-hidden border-2 border-amber-100 bg-gradient-to-br from-amber-50/50 to-orange-50/50">
              <CardContent className="p-6 h-full flex flex-col justify-center">
                <h3 className="text-lg font-bold text-gray-900 mb-6 flex items-center gap-2">
                  <AwardIcon className="h-5 w-5 text-amber-600" />
                  لماذا تختار سندك؟
                </h3>
                <div className="space-y-3">
                  {[
                    { icon: Shield, text: 'ضمان جودة المنتجات', color: 'text-emerald-600 bg-emerald-100' },
                    { icon: Zap, text: 'استلام فوري بعد الدفع', color: 'text-amber-600 bg-amber-100' },
                    { icon: Users, text: '+500 عميل راضي', color: 'text-blue-600 bg-blue-100' },
                    { icon: Clock, text: 'دعم فني على مدار الساعة', color: 'text-purple-600 bg-purple-100' },
                  ].map((item, i) => (
                    <div key={i} className="flex items-center gap-3">
                      <div className={'h-8 w-8 rounded-lg flex items-center justify-center shrink-0 ' + item.color}>
                        <item.icon className="h-4 w-4" />
                      </div>
                      <span className="text-sm font-medium text-gray-700">{item.text}</span>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Featured Products Grid */}
          {featured.length > 0 && (
            <div className="mb-12">
              <div className="flex items-center justify-between mb-6">
                <h3 className="text-xl font-extrabold text-gray-900 flex items-center gap-2">
                  <TrendingUp className="h-5 w-5 text-emerald-600" />
                  الأكثر مبيعاً والمميز
                </h3>
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => { setCategoryFilter('all'); setCurrentView('products'); }}
                  className="text-emerald-600 hover:text-emerald-700"
                >
                  عرض الكل
                  <ArrowLeft className="mr-1 h-3 w-3" />
                </Button>
              </div>
              <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
                {featured.map((product, i) => (
                  <motion.div
                    key={product.id}
                    initial={{ opacity: 0, y: 20 }}
                    whileInView={{ opacity: 1, y: 0 }}
                    viewport={{ once: true }}
                    transition={{ duration: 0.4, delay: i * 0.05 }}
                  >
                    <Card
                      className="group overflow-hidden border border-gray-100 hover:shadow-xl hover:shadow-emerald-100/50 hover:-translate-y-1 transition-all cursor-pointer h-full"
                      onClick={() => { setCategoryFilter('all'); setCurrentView('products'); }}
                    >
                      <div className="relative h-44 overflow-hidden bg-gray-100">
                        {product.image ? (
                          <img
                            src={product.image}
                            alt={product.name}
                            className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-105"
                          />
                        ) : (
                          <div className={'h-full bg-gradient-to-br flex items-center justify-center ' + (product.category === 'ebook' ? 'from-blue-500 to-indigo-600' : 'from-emerald-500 to-teal-600')}>
                            {product.category === 'ebook' ? <BookOpen className="h-12 w-12 text-white" /> : <Monitor className="h-12 w-12 text-white" />}
                          </div>
                        )}
                        {product.badge && (
                          <Badge className="absolute top-3 right-3 bg-white/90 text-gray-800 shadow-sm">
                            {product.badge}
                          </Badge>
                        )}
                        <div className="absolute bottom-3 left-3 flex items-center gap-1 bg-emerald-600 text-white text-xs px-2 py-1 rounded-full">
                          <span>${product.price}</span>
                        </div>
                      </div>
                      <CardContent className="p-4">
                        <h4 className="font-bold text-gray-900 line-clamp-1 mb-1">{product.name}</h4>
                        <p className="text-xs text-gray-500 line-clamp-2">{product.description}</p>
                      </CardContent>
                    </Card>
                  </motion.div>
                ))}
              </div>
            </div>
          )}

          {/* All Products Button */}
          <div className="text-center">
            {productsError ? (
              <div className="space-y-3">
                <p className="text-amber-700 bg-amber-50 inline-block px-4 py-2 rounded-lg border border-amber-200">
                  تعذر تحميل بعض المنتجات
                </p>
                <div>
                  <Button
                    size="lg"
                    onClick={retryFetchProducts}
                    variant="outline"
                    className="border-emerald-300 text-emerald-700 hover:bg-emerald-50 px-10"
                  >
                    <RefreshCw className="ml-2 h-4 w-4" />
                    إعادة المحاولة
                  </Button>
                </div>
              </div>
            ) : (
              <Button
                size="lg"
                onClick={() => { setCategoryFilter('all'); setCurrentView('products'); }}
                className="bg-emerald-600 hover:bg-emerald-700 text-white px-10 shadow-lg shadow-emerald-200"
                disabled={productsLoading}
              >
                {productsLoading ? (
                  <>
                    <RefreshCw className="ml-2 h-4 w-4 animate-spin" />
                    جاري التحميل...
                  </>
                ) : (
                  <>
                    عرض جميع المنتجات ({products.length})
                    <ArrowLeft className="mr-2 h-4 w-4" />
                  </>
                )}
              </Button>
            )}
          </div>
        </div>
      </section>

      {/* How It Works */}
      <section className="bg-gradient-to-br from-emerald-50 via-white to-teal-50 py-12 md:py-16">
        <div className="container mx-auto px-4">
          <div className="mb-10 text-center">
            <Badge className="mb-3 bg-emerald-100 text-emerald-700 border-0">
              <CheckCircle2 className="ml-1 h-3 w-3" />
              سهل وآمن
            </Badge>
            <h2 className="mb-3 text-2xl font-extrabold text-gray-900 md:text-3xl">
              كيف تشتري من سندك؟
            </h2>
            <p className="text-gray-500">3 خطوات بسيطة للحصول على منتجك</p>
          </div>

          <div className="grid gap-6 md:grid-cols-3">
            {[
              {
                step: '1',
                title: 'اختر المنتج',
                desc: 'تصفح مجموعتنا المتنوعة من الكتب والأنظمة واختر ما يناسبك',
                icon: BookOpen,
                color: 'from-blue-500 to-indigo-600',
              },
              {
                step: '2',
                title: 'ادفع بسهولة',
                desc: 'اختر طريقة الدفع المناسبة (جيب أو ويسترن يونين) وأتمم العملية',
                icon: Shield,
                color: 'from-amber-500 to-orange-600',
              },
              {
                step: '3',
                title: 'استلم فوراً',
                desc: 'بعد تأكيد الدفع، ستحصل على رابط التحميل مباشرة في صفحة الطلب',
                icon: Zap,
                color: 'from-emerald-500 to-teal-600',
              },
            ].map((item, i) => (
              <motion.div
                key={i}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ duration: 0.4, delay: i * 0.1 }}
                className="relative"
              >
                <Card className="h-full border-gray-100 hover:shadow-lg transition-all">
                  <CardContent className="p-6 text-center">
                    <div className={'mx-auto mb-4 flex h-16 w-16 items-center justify-center rounded-2xl bg-gradient-to-br ' + item.color + ' text-white shadow-lg'}>
                      <item.icon className="h-8 w-8" />
                    </div>
                    <div className="mb-2 inline-block rounded-full bg-emerald-100 px-3 py-0.5 text-xs font-bold text-emerald-700">
                      الخطوة {item.step}
                    </div>
                    <h3 className="mb-2 text-lg font-bold text-gray-900">{item.title}</h3>
                    <p className="text-sm text-gray-500 leading-relaxed">{item.desc}</p>
                  </CardContent>
                </Card>
                {i < 2 && (
                  <div className="hidden md:block absolute top-1/2 -left-3 -translate-y-1/2 text-emerald-300 text-2xl">
                    ←
                  </div>
                )}
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* Testimonials */}
      <section className="bg-white py-12 md:py-16">
        <div className="container mx-auto px-4">
          <div className="mb-8 text-center">
            <Badge className="mb-3 bg-purple-100 text-purple-700 border-0">
              <MessageCircle className="ml-1 h-3 w-3" />
              آراء العملاء
            </Badge>
            <h2 className="mb-3 text-2xl font-extrabold text-gray-900 md:text-3xl">
              ماذا يقول عملاؤنا
            </h2>
            <p className="text-gray-500">تجارب حقيقية من عملاء استفادوا من منتجاتنا</p>
          </div>

          <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
            {[
              {
                name: 'أحمد محمد',
                role: 'صاحب فندق - صنعاء',
                text: 'نظام إدارة الفنادق ممتاز جداً! سهل الاستخدام ووفر علي الكثير من الوقت والجهد. أنصح به كل صاحب فندق.',
                rating: 5,
                avatar: 'أ',
                color: 'bg-emerald-500',
              },
              {
                name: 'سارة علي',
                role: 'مطورة ويب',
                text: 'كتب المتجر مفيدة جداً ومحدثة. خصوصاً كتاب تطوير تطبيقات الويب ساعدني كثيراً في تطوير مهاراتي.',
                rating: 5,
                avatar: 'س',
                color: 'bg-blue-500',
              },
              {
                name: 'خالد حسين',
                role: 'رائد أعمال',
                text: 'خدمة ممتازة ومنتجات عالية الجودة. الدعم الفني متجاوب وسريع. شكراً فريق سندك!',
                rating: 5,
                avatar: 'خ',
                color: 'bg-purple-500',
              },
            ].map((testimonial, i) => (
              <motion.div
                key={i}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ duration: 0.4, delay: i * 0.1 }}
              >
                <Card className="border-gray-100 bg-white h-full hover:shadow-lg transition-all">
                  <CardContent className="p-6">
                    <div className="flex items-center gap-1 mb-3">
                      {[...Array(testimonial.rating)].map((_, j) => (
                        <Star key={j} className="h-4 w-4 fill-amber-400 text-amber-400" />
                      ))}
                    </div>
                    <p className="text-sm text-gray-600 leading-relaxed mb-4">
                      &quot;{testimonial.text}&quot;
                    </p>
                    <div className="flex items-center gap-3">
                      <div className={'flex h-10 w-10 items-center justify-center rounded-full text-white font-bold ' + testimonial.color}>
                        {testimonial.avatar}
                      </div>
                      <div>
                        <div className="text-sm font-semibold text-gray-900">{testimonial.name}</div>
                        <div className="text-xs text-gray-400">{testimonial.role}</div>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* Trust Section */}
      <section className="bg-gray-50 py-10">
        <div className="container mx-auto px-4">
          <div className="grid grid-cols-2 gap-4 md:grid-cols-4 text-center">
            {[
              { icon: Shield, label: 'دفع آمن 100%' },
              { icon: Zap, label: 'تسليم فوري' },
              { icon: Heart, label: 'دعم فني دائم' },
              { icon: Award, label: 'ضمان الجودة' },
            ].map((item, i) => (
              <div key={i} className="flex flex-col items-center gap-2">
                <item.icon className="h-6 w-6 text-emerald-600" />
                <span className="text-sm font-medium text-gray-700">{item.label}</span>
              </div>
            ))}
          </div>
        </div>
      </section>
    </>
  );
}
