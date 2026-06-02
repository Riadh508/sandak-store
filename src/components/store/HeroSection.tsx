'use client';

import { useStore } from '@/lib/store';
import { Button } from '@/components/ui/button';
import { ArrowLeft, Shield, Zap, Headphones, Star, Sparkles, CheckCircle2 } from 'lucide-react';
import { motion } from 'framer-motion';

export function HeroSection() {
  const { setCurrentView, setCategoryFilter } = useStore();

  const handleViewProducts = () => {
    setCategoryFilter('all');
    setCurrentView('products');
  };

  const handleViewSoftware = () => {
    setCategoryFilter('software');
    setCurrentView('products');
  };

  const handleViewEbooks = () => {
    setCategoryFilter('ebook');
    setCurrentView('products');
  };

  return (
    <section className="relative overflow-hidden bg-gradient-to-bl from-emerald-50 via-white to-teal-50">
      {/* Background decoration */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <div className="absolute -top-24 -right-24 h-96 w-96 rounded-full bg-emerald-100/50 blur-3xl" />
        <div className="absolute -bottom-24 -left-24 h-96 w-96 rounded-full bg-teal-100/50 blur-3xl" />
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 h-[500px] w-[500px] rounded-full bg-emerald-50/30 blur-3xl" />
      </div>

      <div className="container relative mx-auto px-4 py-16 md:py-24">
        <div className="grid items-center gap-10 lg:grid-cols-2">
          {/* Text Content */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6 }}
            className="text-center lg:text-right"
          >
            <motion.div
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5, delay: 0.1 }}
              className="mb-4 inline-flex items-center gap-2 rounded-full bg-emerald-100 px-4 py-1.5 text-sm text-emerald-700"
            >
              <Sparkles className="h-4 w-4" />
              <span>منتجات رقمية احترافية بجودة عالية</span>
            </motion.div>

            <motion.h1
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6, delay: 0.2 }}
              className="mb-4 text-3xl font-extrabold leading-tight text-gray-900 md:text-5xl lg:text-6xl"
            >
              متجر{' '}
              <span className="bg-gradient-to-l from-emerald-600 to-teal-500 bg-clip-text text-transparent">
                سندك
              </span>
              <br />
              <span className="text-2xl md:text-3xl lg:text-4xl text-gray-700">للبرمجيات والمنتجات الرقمية</span>
            </motion.h1>

            <motion.p
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6, delay: 0.3 }}
              className="mb-8 text-lg text-gray-600 md:text-xl max-w-lg mx-auto lg:mx-0 lg:mr-0 leading-relaxed"
            >
              اكتشف مجموعة مميزة من الكتب الإلكترونية والبرمجيات الاحترافية التي ستطور مهاراتك وتنمي أعمالك. جودة عالية وأسعار مناسبة مع دعم فني متواصل.
            </motion.p>

            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6, delay: 0.4 }}
              className="flex flex-wrap justify-center gap-3 lg:justify-start mb-6"
            >
              <Button
                size="lg"
                onClick={handleViewProducts}
                className="bg-emerald-600 hover:bg-emerald-700 text-white px-8 shadow-lg shadow-emerald-200"
              >
                تصفح المنتجات
                <ArrowLeft className="mr-2 h-4 w-4" />
              </Button>
              <Button
                size="lg"
                variant="outline"
                onClick={handleViewEbooks}
                className="border-blue-300 text-blue-700 hover:bg-blue-50 px-8"
              >
                الكتب الإلكترونية
              </Button>
            </motion.div>

            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ duration: 0.6, delay: 0.5 }}
              className="flex flex-wrap items-center justify-center gap-4 lg:justify-start text-sm text-gray-600"
            >
              <div className="flex items-center gap-1.5">
                <CheckCircle2 className="h-4 w-4 text-emerald-600" />
                <span>تسليم فوري</span>
              </div>
              <div className="flex items-center gap-1.5">
                <CheckCircle2 className="h-4 w-4 text-emerald-600" />
                <span>دفع آمن</span>
              </div>
              <div className="flex items-center gap-1.5">
                <CheckCircle2 className="h-4 w-4 text-emerald-600" />
                <span>دعم فني 24/7</span>
              </div>
            </motion.div>

            {/* Stats */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6, delay: 0.6 }}
              className="mt-10 flex flex-wrap justify-center gap-8 lg:justify-start"
            >
              <div className="text-center">
                <div className="text-3xl font-bold text-emerald-700 md:text-4xl">+500</div>
                <div className="text-sm text-gray-500">عميل سعيد</div>
              </div>
              <div className="text-center">
                <div className="text-3xl font-bold text-emerald-700 md:text-4xl">+1000</div>
                <div className="text-sm text-gray-500">عملية بيع</div>
              </div>
              <div className="text-center">
                <div className="text-3xl font-bold text-emerald-700 md:text-4xl">4.9/5</div>
                <div className="text-sm text-gray-500">تقييم العملاء</div>
              </div>
            </motion.div>
          </motion.div>

          {/* Visual Card */}
          <motion.div
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ duration: 0.6, delay: 0.3 }}
            className="hidden lg:block"
          >
            <div className="relative mx-auto max-w-md">
              {/* Main card */}
              <div className="rounded-3xl bg-white p-8 shadow-2xl shadow-emerald-100 border border-emerald-100">
                <div className="mb-6 flex h-20 w-20 items-center justify-center rounded-2xl bg-gradient-to-br from-emerald-500 to-teal-400 shadow-lg">
                  <Star className="h-10 w-10 text-white fill-white" />
                </div>
                <h3 className="mb-2 text-xl font-bold text-gray-900">المنتجات الأكثر مبيعاً</h3>
                <p className="mb-6 text-gray-500">نظام إدارة الفنادق الشامل - الحل الأمثل لإدارة فندقك بكفاءة واحترافية</p>
                <div className="flex items-center gap-3">
                  <div className="flex -space-x-2 rtl:space-x-reverse">
                    {[
                      'bg-emerald-400',
                      'bg-teal-400',
                      'bg-cyan-400',
                      'bg-green-400',
                    ].map((bg, i) => (
                      <div
                        key={i}
                        className={`h-8 w-8 rounded-full ${bg} border-2 border-white flex items-center justify-center text-white text-xs font-bold`}
                      >
                        {String.fromCharCode(1575 + i)}
                      </div>
                    ))}
                  </div>
                  <span className="text-sm text-gray-500">+500 عميل يثقون بنا</span>
                </div>
              </div>

              {/* Floating badge */}
              <motion.div
                animate={{ y: [0, -8, 0] }}
                transition={{ duration: 2, repeat: Infinity, ease: 'easeInOut' }}
                className="absolute -top-4 -left-4 rounded-2xl bg-gradient-to-br from-amber-400 to-orange-400 px-4 py-2 text-white font-bold shadow-lg shadow-amber-200"
              >
                الأكثر مبيعاً
              </motion.div>

              {/* Floating rating */}
              <motion.div
                animate={{ y: [0, 8, 0] }}
                transition={{ duration: 2.5, repeat: Infinity, ease: 'easeInOut' }}
                className="absolute -bottom-3 -right-3 rounded-xl bg-white px-4 py-2 shadow-lg border border-gray-100 flex items-center gap-1"
              >
                {[...Array(5)].map((_, i) => (
                  <Star key={i} className="h-4 w-4 fill-amber-400 text-amber-400" />
                ))}
                <span className="mr-1 text-sm font-semibold text-gray-700">4.9</span>
              </motion.div>

              {/* Floating price tag */}
              <motion.div
                animate={{ x: [0, 5, 0] }}
                transition={{ duration: 3, repeat: Infinity, ease: 'easeInOut' }}
                className="absolute -top-2 -right-2 rounded-full bg-emerald-600 text-white px-3 py-1 text-sm font-bold shadow-lg"
              >
                ابتداءً من $17
              </motion.div>
            </div>
          </motion.div>
        </div>

        {/* Features */}
        <div className="mt-16 grid gap-6 sm:grid-cols-3">
          {[
            {
              icon: Shield,
              title: 'دفع آمن وموثوق',
              desc: 'محفظة جيب وويسترن يونين',
            },
            {
              icon: Zap,
              title: 'استلام فوري',
              desc: 'احصل على منتجك فوراً بعد الدفع',
            },
            {
              icon: Headphones,
              title: 'دعم فني متواصل',
              desc: 'فريق دعم متخصص على مدار الساعة',
            },
          ].map((feature, i) => (
            <motion.div
              key={i}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5, delay: 0.4 + i * 0.1 }}
              className="flex items-start gap-3 rounded-xl bg-white/60 p-5 backdrop-blur border border-emerald-100/50 hover:bg-white/80 transition-all hover:shadow-md"
            >
              <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-lg bg-emerald-100">
                <feature.icon className="h-5 w-5 text-emerald-600" />
              </div>
              <div>
                <h3 className="font-semibold text-gray-900">{feature.title}</h3>
                <p className="text-sm text-gray-500">{feature.desc}</p>
              </div>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  );
}
