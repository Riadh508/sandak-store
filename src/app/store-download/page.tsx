'use client';

import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Loader2, Download, Package, CheckCircle, XCircle, Info, Store } from 'lucide-react';
import { toast } from 'sonner';

const INCLUDED_ITEMS = [
  'لوحة تحكم كاملة (منتجات، طلبات، فواتير، مستخدمين)',
  'نظام مصادقة آمن JWT + bcryptjs',
  'سلة تسوق + نظام طلبات',
  'دفع عبر جيب وويسترن يونين',
  'تصميم عصري متجاوب',
  'دعم اللغة العربية RTL',
  'قاعدة بيانات PostgreSQL + Prisma',
  'إعدادات قابلة للتخصيص',
  'جاهز للنشر على Vercel',
];

const NOT_INCLUDED = [
  'منتجات جاهزة — أضف منتجاتك الخاصة',
  'بيانات تجريبية',
  '.env — أنشئ ملف البيئة الخاص بك',
  'node_modules — ثبّطها بـ npm install',
];

export default function StoreDownloadPage() {
  const [downloading, setDownloading] = useState(false);

  const handleDownload = async () => {
    setDownloading(true);
    toast.info('جاري تحضير ملف التحميل...');

    try {
      const response = await fetch('/api/export');

      if (!response.ok) {
        const data = await response.json().catch(() => null);
        throw new Error(data?.error || 'فشل في التحميل');
      }

      const blob = await response.blob();
      const url = window.URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = 'sandak-store-v4.zip';
      document.body.appendChild(a);
      a.click();
      window.URL.revokeObjectURL(url);
      document.body.removeChild(a);

      toast.success('تم تحميل المتجر بنجاح');
    } catch (error) {
      const message = error instanceof Error ? error.message : 'حدث خطأ غير متوقع';
      toast.error(message);
    } finally {
      setDownloading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gray-50" dir="rtl">
      <div className="max-w-4xl mx-auto p-6 space-y-6">
        <div className="flex items-center gap-3">
          <Store className="h-8 w-8 text-emerald-600" />
          <div>
            <h1 className="text-2xl font-bold text-gray-900">متجر سندك v4</h1>
            <p className="text-gray-500 text-sm">نظام متجر إلكتروني متكامل</p>
          </div>
          <Badge variant="default" className="mr-auto bg-emerald-600">
            نظام متكامل
          </Badge>
        </div>

        <Card>
          <CardHeader>
            <CardTitle className="text-xl">نظام متجر إلكتروني جاهز للبيع</CardTitle>
            <CardDescription>
              نظام متجر إلكتروني متكامل مبني بـ Next.js 16 + React 19 + TypeScript + Prisma + PostgreSQL
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-6">
            <div className="flex items-center justify-between bg-emerald-50 rounded-lg p-4">
              <div>
                <p className="text-sm text-gray-500">السعر</p>
                <p className="text-3xl font-bold text-emerald-600">$499</p>
              </div>
              <Button
                onClick={handleDownload}
                disabled={downloading}
                size="lg"
                className="bg-emerald-600 hover:bg-emerald-700"
              >
                {downloading ? (
                  <>
                    <Loader2 className="h-4 w-4 ml-2 animate-spin" />
                    جاري التحميل...
                  </>
                ) : (
                  <>
                    <Download className="h-4 w-4 ml-2" />
                    تحميل المتجر
                  </>
                )}
              </Button>
            </div>

            <div>
              <h3 className="text-lg font-semibold mb-3 flex items-center gap-2">
                <Package className="h-5 w-5 text-emerald-600" />
                ما يتضمنه المتجر
              </h3>
              <ul className="space-y-2">
                {INCLUDED_ITEMS.map((item) => (
                  <li key={item} className="flex items-center gap-2 text-sm text-gray-700">
                    <CheckCircle className="h-4 w-4 text-emerald-500 shrink-0" />
                    {item}
                  </li>
                ))}
              </ul>
            </div>

            <div>
              <h3 className="text-lg font-semibold mb-3 flex items-center gap-2">
                <Info className="h-5 w-5 text-amber-500" />
                ما لا يتضمنه
              </h3>
              <ul className="space-y-2">
                {NOT_INCLUDED.map((item) => (
                  <li key={item} className="flex items-center gap-2 text-sm text-gray-500">
                    <XCircle className="h-4 w-4 text-red-400 shrink-0" />
                    {item}
                  </li>
                ))}
              </ul>
            </div>

            <div className="bg-amber-50 border border-amber-200 rounded-lg p-4">
              <p className="text-sm text-amber-800">
                <strong>ملاحظة:</strong> يُصدّر المتجر بدون منتجات — ستحصل على قاعدة بيانات فارغة يمكنك ملؤها بمنتجاتك الخاصة.
              </p>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
