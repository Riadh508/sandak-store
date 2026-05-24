'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { useStore } from '@/lib/store';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Loader2, Download, Package, ShieldCheck, FileArchive, Info } from 'lucide-react';
import { toast } from 'sonner';

const INCLUDED_ITEMS = [
  'ملفات المصدر (src/)',
  'إعدادات المشروع (package.json, tsconfig.json)',
  'قاعدة البيانات (prisma/)',
  'الملفات العامة (public/)',
  'إعدادات Tailwind و PostCSS',
];

const EXCLUDED_ITEMS = [
  'node_modules/',
  '.git/',
  '.env',
  '.next/',
];

export default function AdminExportPage() {
  const router = useRouter();
  const { user, authLoading, checkAuth } = useStore();
  const [checked, setChecked] = useState(false);
  const [exporting, setExporting] = useState(false);
  const [fileSize, setFileSize] = useState<string | null>(null);

  useEffect(() => {
    checkAuth().then(() => setChecked(true));
  }, [checkAuth]);

  useEffect(() => {
    if (checked && !authLoading) {
      if (!user) {
        router.push('/admin/login');
      } else if (user.role !== 'admin') {
        toast.error('غير مصرح - يتطلب صلاحية المدير');
        router.push('/admin');
      }
    }
  }, [checked, authLoading, user, router]);

  const handleExport = async () => {
    setExporting(true);
    toast.info('جاري تحضير ملف التصدير...');

    try {
      const response = await fetch('/api/export');

      if (!response.ok) {
        const data = await response.json().catch(() => null);
        throw new Error(data?.error || 'فشل في التصدير');
      }

      const blob = await response.blob();
      const size = blob.size;
      const sizeMB = (size / (1024 * 1024)).toFixed(2);
      setFileSize(`${sizeMB} MB`);

      const url = window.URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = 'sandak-store-v4.zip';
      document.body.appendChild(a);
      a.click();
      window.URL.revokeObjectURL(url);
      document.body.removeChild(a);

      toast.success('تم تصدير المتجر بنجاح');
    } catch (error) {
      const message = error instanceof Error ? error.message : 'حدث خطأ غير متوقع';
      toast.error(message);
    } finally {
      setExporting(false);
    }
  };

  if (!checked || authLoading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <Loader2 className="h-8 w-8 animate-spin text-emerald-600" />
      </div>
    );
  }

  if (!user) return null;

  return (
    <div className="min-h-screen bg-gray-50" dir="rtl">
      <div className="max-w-3xl mx-auto p-6 space-y-6">
        <div className="flex items-center gap-3">
          <Package className="h-8 w-8 text-emerald-600" />
          <div>
            <h1 className="text-2xl font-bold text-gray-900">تصدير المتجر</h1>
            <p className="text-gray-500 text-sm">تحميل نسخة كاملة من مشروع المتجر</p>
          </div>
          <Badge variant="secondary" className="mr-auto">
            <ShieldCheck className="h-3 w-3 ml-1" />
            مدير فقط
          </Badge>
        </div>

        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <FileArchive className="h-5 w-5 text-emerald-600" />
              تصدير المشروع
            </CardTitle>
            <CardDescription>
              سيتم إنشاء أرشيف مضغوط يحتوي على جميع ملفات المشروع الأساسية
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <Button
              onClick={handleExport}
              disabled={exporting}
              className="w-full"
              size="lg"
            >
              {exporting ? (
                <>
                  <Loader2 className="h-4 w-4 ml-2 animate-spin" />
                  جاري التصدير...
                </>
              ) : (
                <>
                  <Download className="h-4 w-4 ml-2" />
                  تصدير المتجر
                </>
              )}
            </Button>

            {fileSize && (
              <div className="text-center text-sm text-gray-600">
                حجم الملف: <span className="font-semibold">{fileSize}</span>
              </div>
            )}

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 pt-4 border-t">
              <div>
                <h3 className="text-sm font-semibold text-emerald-600 mb-2 flex items-center gap-1">
                  <Info className="h-4 w-4" />
                  الملفات المشمولة
                </h3>
                <ul className="space-y-1 text-sm text-gray-600">
                  {INCLUDED_ITEMS.map((item) => (
                    <li key={item} className="flex items-center gap-2">
                      <span className="h-1.5 w-1.5 rounded-full bg-emerald-500" />
                      {item}
                    </li>
                  ))}
                </ul>
              </div>
              <div>
                <h3 className="text-sm font-semibold text-red-500 mb-2">الملفات المستبعدة</h3>
                <ul className="space-y-1 text-sm text-gray-500">
                  {EXCLUDED_ITEMS.map((item) => (
                    <li key={item} className="flex items-center gap-2">
                      <span className="h-1.5 w-1.5 rounded-full bg-red-400" />
                      <code className="text-xs bg-gray-100 px-1.5 py-0.5 rounded">{item}</code>
                    </li>
                  ))}
                </ul>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
