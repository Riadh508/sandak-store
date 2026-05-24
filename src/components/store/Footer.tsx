'use client';

import { useEffect, useState } from 'react';
import { useStore } from '@/lib/store';
import { Separator } from '@/components/ui/separator';
import { Store, Mail, Phone, MapPin, Shield, Heart } from 'lucide-react';

interface StoreSettings {
  storeName: string;
  storeEmail: string;
  storePhone: string;
  storeAddress: string;
}

export function Footer() {
  const { setCurrentView, setCategoryFilter } = useStore();
  const [settings, setSettings] = useState<StoreSettings | null>(null);

  useEffect(() => {
    fetch('/api/settings')
      .then((r) => r.json())
      .then((data) => {
        if (data.success) setSettings(data.data);
      })
      .catch(() => {});
  }, []);

  const navigate = (view: string, category?: string) => {
    if (category) setCategoryFilter(category as 'ebook' | 'software');
    setCurrentView(view as 'home' | 'products');
  };

  const storeName = settings?.storeName || 'سندك';
  const storeEmail = settings?.storeEmail || 'sanedsoft32@gmail.com';
  const storePhone = settings?.storePhone || '00967770240572';
  const storeAddress = settings?.storeAddress || 'صنعاء - العاصمة، اليمن';

  return (
    <footer className="bg-gray-900 text-gray-300">
      <div className="container mx-auto px-4 py-12">
        <div className="grid gap-8 sm:grid-cols-2 lg:grid-cols-4">
          {/* About */}
          <div>
            <button onClick={() => navigate('home')} className="flex items-center gap-2 mb-4 hover:opacity-80 transition-opacity">
              <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-gradient-to-br from-emerald-600 to-teal-500">
                <Store className="h-5 w-5 text-white" />
              </div>
              <div>
                <span className="text-lg font-bold text-white">{storeName}</span>
                <span className="block text-[10px] text-gray-500">للبرمجيات والمنتجات الرقمية</span>
              </div>
            </button>
            <p className="text-sm text-gray-400 leading-relaxed">
              متجرك الموثوق للبرمجيات والمنتجات الرقمية. نوفر لك أفضل الكتب الإلكترونية والأنظمة البرمجية بأسعار تنافسية وجودة عالية.
            </p>
          </div>

          {/* Quick Links */}
          <div>
            <h3 className="mb-4 text-sm font-bold text-white">روابط سريعة</h3>
            <ul className="space-y-2 text-sm">
              <li><button onClick={() => navigate('home')} className="hover:text-emerald-400 transition-colors">الرئيسية</button></li>
              <li><button onClick={() => navigate('products')} className="hover:text-emerald-400 transition-colors">المنتجات</button></li>
              <li><button onClick={() => navigate('products', 'ebook')} className="hover:text-emerald-400 transition-colors">الكتب الإلكترونية</button></li>
              <li><button onClick={() => navigate('products', 'software')} className="hover:text-emerald-400 transition-colors">البرمجيات والأنظمة</button></li>
            </ul>
          </div>

          {/* Products */}
          <div>
            <h3 className="mb-4 text-sm font-bold text-white">المنتجات</h3>
            <ul className="space-y-2 text-sm">
              <li><button onClick={() => navigate('products', 'software')} className="hover:text-emerald-400 transition-colors">نظام إدارة الفنادق</button></li>
              <li><button onClick={() => navigate('products', 'software')} className="hover:text-emerald-400 transition-colors">نظام الفواتير الاحترافي</button></li>
              <li><button onClick={() => navigate('products', 'ebook')} className="hover:text-emerald-400 transition-colors">دليل الذكاء الاصطناعي</button></li>
              <li><button onClick={() => navigate('products')} className="hover:text-emerald-400 transition-colors">جميع المنتجات</button></li>
            </ul>
          </div>

          {/* Contact */}
          <div>
            <h3 className="mb-4 text-sm font-bold text-white">تواصل معنا</h3>
            <ul className="space-y-3 text-sm">
              <li className="flex items-center gap-2">
                <Phone className="h-4 w-4 text-emerald-400 shrink-0" />
                <span dir="ltr">{storePhone}</span>
              </li>
              <li className="flex items-center gap-2">
                <Mail className="h-4 w-4 text-emerald-400 shrink-0" />
                <span>{storeEmail}</span>
              </li>
              <li className="flex items-start gap-2">
                <MapPin className="h-4 w-4 text-emerald-400 shrink-0 mt-0.5" />
                <span>{storeAddress}</span>
              </li>
            </ul>
          </div>
        </div>

        <Separator className="my-8 bg-gray-800" />

        {/* Payment Methods */}
        <div className="flex flex-col sm:flex-row items-center justify-between gap-4">
          <div className="flex items-center gap-2">
            <Shield className="h-4 w-4 text-emerald-400" />
            <span className="text-xs text-gray-400">طرق الدفع المتاحة:</span>
            <span className="rounded bg-gray-800 px-2 py-1 text-xs font-medium text-gray-300">محفظة جيب</span>
            <span className="rounded bg-gray-800 px-2 py-1 text-xs font-medium text-gray-300">ويسترن يونين</span>
          </div>
          <div className="flex items-center gap-1 text-xs text-gray-500">
            <span>صنع بـ</span>
            <Heart className="h-3 w-3 text-red-400 fill-red-400" />
            <span>في اليمن</span>
          </div>
        </div>
      </div>
    </footer>
  );
}
