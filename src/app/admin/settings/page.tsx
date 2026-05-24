'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { useStore } from '@/lib/store';
import { Loader2, Save, Download, FileArchive, Info } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Separator } from '@/components/ui/separator';
import { toast } from 'sonner';

interface Settings {
  storeName: string;
  storeEmail: string;
  storePhone: string;
  storeAddress: string;
  jeibPhone: string;
  wuName: string;
  wuCity: string;
  wuCountry: string;
  siteUrl: string;
  currency: string;
  taxRate: number;
}

export default function AdminSettingsPage() {
  const router = useRouter();
  const { user, authLoading, checkAuth } = useStore();
  const [checked, setChecked] = useState(false);
  const [settings, setSettings] = useState<Settings>({
    storeName: 'سندك',
    storeEmail: 'info@store.com',
    storePhone: '',
    storeAddress: '',
    jeibPhone: '',
    wuName: '',
    wuCity: '',
    wuCountry: '',
    siteUrl: '',
    currency: '$',
    taxRate: 15,
  });
  const [saving, setSaving] = useState(false);
  const [exporting, setExporting] = useState(false);

  useEffect(() => {
    checkAuth().then(() => setChecked(true));
  }, [checkAuth]);

  useEffect(() => {
    if (checked && !authLoading && !user) {
      router.push('/admin/login');
    }
  }, [checked, authLoading, user, router]);

  useEffect(() => {
    if (user) {
      fetch('/api/settings')
        .then((r) => r.json())
        .then((data) => {
          if (data.success) setSettings(data.data);
        })
        .catch(() => {});
    }
  }, [user]);

  const update = (field: keyof Settings, value: string | number) => {
    setSettings((prev) => ({ ...prev, [field]: value }));
  };

  const handleSave = async () => {
    setSaving(true);
    try {
      const res = await fetch('/api/settings', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(settings),
      });
      const data = await res.json();
      if (data.success) {
        toast.success('تم حفظ الإعدادات بنجاح');
      } else {
        toast.error(data.error || 'فشل في حفظ الإعدادات');
      }
    } catch {
      toast.error('خطأ في الاتصال');
    } finally {
      setSaving(false);
    }
  };

  const handleExport = async () => {
    setExporting(true);
    toast.info('جاري تحضير ملف التحميل...');
    try {
      const response = await fetch('/api/export');
      if (!response.ok) {
        const data = await response.json().catch(() => null);
        throw new Error(data?.error || 'فشل في التصدير');
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
    <div className="max-w-2xl mx-auto space-y-6" dir="rtl">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold">إعدادات المتجر</h1>
          <p className="text-muted-foreground text-sm">تخصيص معلومات وإعدادات المتجر</p>
        </div>
        <Button onClick={handleSave} disabled={saving}>
          {saving ? <Loader2 className="h-4 w-4 animate-spin ml-2" /> : <Save className="h-4 w-4 ml-2" />}
          حفظ الإعدادات
        </Button>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>معلومات المتجر</CardTitle>
          <CardDescription>الاسم وبيانات التواصل</CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid gap-2">
            <Label htmlFor="storeName">اسم المتجر</Label>
            <Input id="storeName" value={settings.storeName} onChange={(e) => update('storeName', e.target.value)} />
          </div>
          <div className="grid gap-2">
            <Label htmlFor="storeEmail">البريد الإلكتروني</Label>
            <Input id="storeEmail" type="email" value={settings.storeEmail} onChange={(e) => update('storeEmail', e.target.value)} />
          </div>
          <div className="grid gap-2">
            <Label htmlFor="storePhone">رقم الهاتف</Label>
            <Input id="storePhone" value={settings.storePhone} onChange={(e) => update('storePhone', e.target.value)} />
          </div>
          <div className="grid gap-2">
            <Label htmlFor="storeAddress">العنوان</Label>
            <Input id="storeAddress" value={settings.storeAddress} onChange={(e) => update('storeAddress', e.target.value)} />
          </div>
          <div className="grid gap-2">
            <Label htmlFor="siteUrl">رابط الموقع</Label>
            <Input id="siteUrl" type="url" value={settings.siteUrl} onChange={(e) => update('siteUrl', e.target.value)} />
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>بيانات الدفع</CardTitle>
          <CardDescription>معلومات طرق الدفع</CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid gap-2">
            <Label htmlFor="jeibPhone">رقم محفظة جيب</Label>
            <Input id="jeibPhone" value={settings.jeibPhone} onChange={(e) => update('jeibPhone', e.target.value)} />
          </div>
          <Separator />
          <div className="grid gap-2">
            <Label htmlFor="wuName">اسم مستفيد ويسترن يونين</Label>
            <Input id="wuName" value={settings.wuName} onChange={(e) => update('wuName', e.target.value)} />
          </div>
          <div className="grid gap-2">
            <Label htmlFor="wuCity">مدينة ويسترن يونين</Label>
            <Input id="wuCity" value={settings.wuCity} onChange={(e) => update('wuCity', e.target.value)} />
          </div>
          <div className="grid gap-2">
            <Label htmlFor="wuCountry">دولة ويسترن يونين</Label>
            <Input id="wuCountry" value={settings.wuCountry} onChange={(e) => update('wuCountry', e.target.value)} />
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>الإعدادات العامة</CardTitle>
          <CardDescription>العملة والضريبة</CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid gap-2">
            <Label htmlFor="currency">العملة</Label>
            <Input id="currency" value={settings.currency} onChange={(e) => update('currency', e.target.value)} />
          </div>
          <div className="grid gap-2">
            <Label htmlFor="taxRate">نسبة الضريبة (%)</Label>
            <Input id="taxRate" type="number" min="0" max="100" value={settings.taxRate} onChange={(e) => update('taxRate', parseFloat(e.target.value) || 0)} />
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <FileArchive className="h-5 w-5 text-emerald-600" />
            تصدير المتجر
          </CardTitle>
          <CardDescription>تحميل نسخة من المتجر</CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <Button onClick={handleExport} disabled={exporting} className="w-full" size="lg">
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
          <div className="flex items-start gap-2 text-sm text-muted-foreground bg-muted/50 rounded-lg p-3">
            <Info className="h-4 w-4 mt-0.5 shrink-0" />
            <span>يتم تصدير المتجر بدون منتجات — أضف منتجاتك الخاصة</span>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
