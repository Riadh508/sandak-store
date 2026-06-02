'use client';

import { useEffect, useState } from 'react';
import { useParams } from 'next/navigation';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Separator } from '@/components/ui/separator';
import { Loader2, Download, CheckCircle2, Clock, Store, ArrowRight, FileText, Package, Shield, Zap } from 'lucide-react';
import { formatFileSize, formatDateTime } from '@/lib/format';

interface DownloadItem {
  id: string;
  token: string;
  productName: string;
  fileUrl: string;
  fileName: string;
  downloaded: boolean;
  downloadedAt: string | null;
  createdAt: string;
}

interface OrderItem {
  name: string;
  quantity: number;
  price: number;
  total: number;
}

interface OrderData {
  id: string;
  orderNumber: string;
  customerName: string;
  customerPhone: string;
  customerEmail: string;
  paymentMethod: string;
  status: string;
  subtotal: number;
  tax: number;
  total: number;
  currency?: string;
  items: OrderItem[];
  downloads: DownloadItem[];
  createdAt: string;
  verifiedAt: string | null;
}

export default function OrderStatusPage() {
  const params = useParams();
  const orderNumber = params.orderNumber as string;
  const [order, setOrder] = useState<OrderData | null>(null);
  const [loading, setLoading] = useState(true);
  const [notFound, setNotFound] = useState(false);

  useEffect(() => {
    if (!orderNumber) return;
    setLoading(true);
    setNotFound(false);
    fetch(`/api/orders?orderNumber=${encodeURIComponent(orderNumber)}`)
      .then((r) => r.json())
      .then((data) => {
        if (data.success && data.data) {
          setOrder(data.data as OrderData);
        } else {
          setNotFound(true);
        }
      })
      .catch(() => setNotFound(true))
      .finally(() => setLoading(false));
  }, [orderNumber]);

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <Loader2 className="h-8 w-8 animate-spin text-emerald-600" />
      </div>
    );
  }

  if (notFound || !order) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center p-6" dir="rtl">
        <Card className="w-full max-w-md text-center p-8 border-0 shadow-lg">
          <div className="mx-auto mb-4 h-16 w-16 rounded-full bg-red-100 flex items-center justify-center">
            <Clock className="h-8 w-8 text-red-500" />
          </div>
          <h2 className="text-xl font-bold text-gray-900 mb-2">الطلب غير موجود</h2>
          <p className="text-gray-500 text-sm mb-6">تأكد من رقم الطلب وحاول مرة أخرى</p>
          <Button onClick={() => window.location.href = '/'} className="bg-emerald-600 hover:bg-emerald-700 w-full">
            <ArrowRight className="ml-2 h-4 w-4" />
            العودة للمتجر
          </Button>
        </Card>
      </div>
    );
  }

  const statusColors: Record<string, string> = {
    pending: 'bg-amber-100 text-amber-700 border-amber-200',
    paid: 'bg-emerald-100 text-emerald-700 border-emerald-200',
    delivered: 'bg-blue-100 text-blue-700 border-blue-200',
    cancelled: 'bg-red-100 text-red-700 border-red-200',
  };

  const statusLabels: Record<string, string> = {
    pending: 'قيد الانتظار',
    paid: 'تم الدفع',
    delivered: 'تم التوصيل',
    cancelled: 'ملغي',
  };

  const paymentLabels: Record<string, string> = {
    jeib: 'محفظة جيب',
    'western-union': 'ويسترن يونين',
  };

  const currency = order.currency || '$';

  return (
    <div className="min-h-screen bg-gradient-to-bl from-emerald-50/30 via-white to-gray-50" dir="rtl">
      <div className="max-w-2xl mx-auto p-4 md:p-6 space-y-5">
        {/* Header */}
        <div className="flex items-center gap-3">
          <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-2xl bg-gradient-to-br from-emerald-600 to-teal-500 shadow-lg shadow-emerald-200">
            <Store className="h-6 w-6 text-white" />
          </div>
          <div className="flex-1 min-w-0">
            <h1 className="text-xl font-bold text-gray-900">حالة الطلب</h1>
            <p className="text-gray-500 text-sm font-mono truncate" dir="ltr">{order.orderNumber}</p>
          </div>
          <Badge className={'shrink-0 border ' + (statusColors[order.status] || 'bg-gray-100 text-gray-700')}>
            {statusLabels[order.status] || order.status}
          </Badge>
        </div>

        {/* Status Card */}
        {order.status === 'pending' && (
          <Card className="border-amber-200 bg-amber-50/50">
            <CardContent className="p-6 text-center">
              <div className="mx-auto mb-3 flex h-14 w-14 items-center justify-center rounded-full bg-amber-100">
                <Clock className="h-7 w-7 text-amber-600" />
              </div>
              <h3 className="text-lg font-bold text-amber-800 mb-2">في انتظار تأكيد الدفع</h3>
              <p className="text-amber-700 text-sm leading-relaxed">
                طلبك قيد المراجعة. سيتم تأكيده خلال دقائق من وصول المبلغ عبر{' '}
                <strong>{paymentLabels[order.paymentMethod] || order.paymentMethod}</strong>.
                ستصلك إشعارات على هذه الصفحة فور التحديث.
              </p>
            </CardContent>
          </Card>
        )}

        {order.status === 'paid' && order.downloads && order.downloads.length > 0 && (
          <Card className="border-emerald-200 shadow-md">
            <CardHeader className="pb-3">
              <CardTitle className="flex items-center gap-2 text-emerald-700">
                <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-emerald-100">
                  <Download className="h-4 w-4" />
                </div>
                روابط التحميل جاهزة
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-3">
              {order.downloads.map((item) => (
                <div key={item.id} className="flex items-center justify-between rounded-xl border border-gray-100 bg-white p-4 hover:shadow-md transition-all">
                  <div className="flex items-center gap-3 min-w-0 flex-1">
                    <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-xl bg-gradient-to-br from-emerald-500 to-teal-600">
                      <FileText className="h-5 w-5 text-white" />
                    </div>
                    <div className="min-w-0 flex-1">
                      <p className="font-semibold text-gray-900 truncate">{item.productName}</p>
                      <p className="text-xs text-gray-400 truncate" dir="ltr">{item.fileName}</p>
                    </div>
                  </div>
                  <Button
                    size="sm"
                    className="bg-emerald-600 hover:bg-emerald-700 text-white shrink-0"
                    onClick={() => window.open(`/api/download/${item.token}`, '_blank')}
                  >
                    <Download className="h-4 w-4 ml-1" />
                    تحميل
                  </Button>
                </div>
              ))}
              <div className="bg-blue-50 border border-blue-100 rounded-lg p-3 text-xs text-blue-700 flex items-start gap-2">
                <Shield className="h-4 w-4 shrink-0 mt-0.5" />
                <span>روابط التحميل آمنة ومخصصة لك فقط. ننصح بتحميل الملفات وحفظها في مكان آمن.</span>
              </div>
            </CardContent>
          </Card>
        )}

        {order.status === 'paid' && (!order.downloads || order.downloads.length === 0) && (
          <Card className="border-emerald-200 bg-emerald-50/50">
            <CardContent className="p-6 text-center">
              <div className="mx-auto mb-3 flex h-14 w-14 items-center justify-center rounded-full bg-emerald-100">
                <CheckCircle2 className="h-7 w-7 text-emerald-600" />
              </div>
              <h3 className="text-lg font-bold text-emerald-800 mb-2">تم تأكيد الدفع!</h3>
              <p className="text-emerald-700 text-sm">
                سيتم تجهيز روابط التحميل خلال دقائق. يمكنك متابعة الطلب من هذه الصفحة.
              </p>
            </CardContent>
          </Card>
        )}

        {order.status === 'cancelled' && (
          <Card className="border-red-200 bg-red-50/50">
            <CardContent className="p-6 text-center">
              <div className="mx-auto mb-3 flex h-14 w-14 items-center justify-center rounded-full bg-red-100">
                <Clock className="h-7 w-7 text-red-600" />
              </div>
              <h3 className="text-lg font-bold text-red-800 mb-2">تم إلغاء الطلب</h3>
              <p className="text-red-700 text-sm">
                إذا كنت تعتقد أن هناك خطأ، يرجى التواصل مع خدمة العملاء.
              </p>
            </CardContent>
          </Card>
        )}

        {/* Order Details */}
        <Card className="border-gray-100">
          <CardHeader className="pb-3">
            <CardTitle className="flex items-center gap-2 text-base">
              <Package className="h-4 w-4 text-emerald-600" />
              تفاصيل الطلب
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-3 text-sm">
            <div className="grid grid-cols-2 gap-3">
              <div>
                <span className="text-gray-500 block text-xs mb-0.5">الاسم</span>
                <span className="font-semibold text-gray-900">{order.customerName}</span>
              </div>
              <div>
                <span className="text-gray-500 block text-xs mb-0.5">الهاتف</span>
                <span className="font-mono font-semibold text-gray-900" dir="ltr">{order.customerPhone}</span>
              </div>
              {order.customerEmail && (
                <div className="col-span-2">
                  <span className="text-gray-500 block text-xs mb-0.5">البريد الإلكتروني</span>
                  <span className="font-mono text-sm text-gray-900" dir="ltr">{order.customerEmail}</span>
                </div>
              )}
              <div>
                <span className="text-gray-500 block text-xs mb-0.5">طريقة الدفع</span>
                <span className="font-semibold text-gray-900">{paymentLabels[order.paymentMethod] || order.paymentMethod}</span>
              </div>
              <div>
                <span className="text-gray-500 block text-xs mb-0.5">التاريخ</span>
                <span className="font-semibold text-gray-900">{formatDateTime(order.createdAt)}</span>
              </div>
            </div>

            {order.items && order.items.length > 0 && (
              <>
                <Separator />
                <div>
                  <span className="text-gray-500 block text-xs mb-2">المنتجات</span>
                  <div className="space-y-2">
                    {order.items.map((item, i) => (
                      <div key={i} className="flex items-center justify-between text-sm bg-gray-50 p-2.5 rounded-lg">
                        <div className="flex items-center gap-2 min-w-0 flex-1">
                          <FileText className="h-4 w-4 text-gray-400 shrink-0" />
                          <span className="text-gray-900 truncate">{item.name}</span>
                          <span className="text-xs text-gray-400 shrink-0">×{item.quantity}</span>
                        </div>
                        <span className="font-semibold text-gray-700 shrink-0">{currency}{(item.total || 0).toFixed(2)}</span>
                      </div>
                    ))}
                  </div>
                </div>
              </>
            )}

            <Separator />

            <div className="space-y-1.5">
              <div className="flex justify-between text-sm">
                <span className="text-gray-500">المجموع الفرعي</span>
                <span className="font-medium">{currency}{(order.subtotal || 0).toFixed(2)}</span>
              </div>
              <div className="flex justify-between text-sm">
                <span className="text-gray-500">الضريبة</span>
                <span className="font-medium">{currency}{(order.tax || 0).toFixed(2)}</span>
              </div>
              <div className="flex justify-between pt-2 border-t">
                <span className="font-bold text-gray-900">الإجمالي</span>
                <span className="font-extrabold text-emerald-600 text-lg">{currency}{(order.total || 0).toFixed(2)}</span>
              </div>
            </div>
          </CardContent>
        </Card>

        <Button
          onClick={() => window.location.href = '/'}
          className="w-full bg-emerald-600 hover:bg-emerald-700 text-white h-12 shadow-lg shadow-emerald-200"
          size="lg"
        >
          <ArrowRight className="ml-2 h-4 w-4" />
          العودة للمتجر
        </Button>
      </div>
    </div>
  );
}
