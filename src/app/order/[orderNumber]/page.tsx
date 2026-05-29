'use client';

import { useEffect, useState } from 'react';
import { useParams } from 'next/navigation';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Loader2, Download, CheckCircle2, Clock, Store, ArrowRight, FileText } from 'lucide-react';

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

interface OrderData {
  id: string;
  orderNumber: string;
  customerName: string;
  status: string;
  total: number;
  currency: string;
  downloads: DownloadItem[];
}

export default function OrderStatusPage() {
  const params = useParams();
  const orderNumber = params.orderNumber as string;
  const [order, setOrder] = useState<OrderData | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (orderNumber) {
      fetch(`/api/orders?orderNumber=${orderNumber}`)
        .then(r => r.json())
        .then(data => {
          if (data.success && data.data) {
            const found = Array.isArray(data.data)
              ? data.data.find((o: OrderData) => o.orderNumber === orderNumber)
              : data.data;
            setOrder(found || null);
          }
        })
        .catch(() => {})
        .finally(() => setLoading(false));
    }
  }, [orderNumber]);

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <Loader2 className="h-8 w-8 animate-spin text-emerald-600" />
      </div>
    );
  }

  if (!order) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center p-6">
        <Card className="w-full max-w-md text-center p-8">
          <p className="text-gray-500 text-lg mb-4">الطلب غير موجود</p>
          <Button onClick={() => window.location.href = '/'} className="bg-emerald-600">
            العودة للرئيسية
          </Button>
        </Card>
      </div>
    );
  }

  const statusColors: Record<string, string> = {
    pending: 'bg-amber-100 text-amber-700',
    paid: 'bg-emerald-100 text-emerald-700',
    delivered: 'bg-blue-100 text-blue-700',
  };

  const statusLabels: Record<string, string> = {
    pending: 'قيد الانتظار',
    paid: 'تم الدفع',
    delivered: 'تم التوصيل',
  };

  return (
    <div className="min-h-screen bg-gray-50 p-6" dir="rtl">
      <div className="max-w-2xl mx-auto space-y-6">
        <div className="flex items-center gap-3 mb-4">
          <Store className="h-8 w-8 text-emerald-600" />
          <div>
            <h1 className="text-2xl font-bold text-gray-900">حالة الطلب</h1>
            <p className="text-gray-500 text-sm">رقم الطلب: {order.orderNumber}</p>
          </div>
          <Badge className={`mr-auto ${statusColors[order.status] || 'bg-gray-100 text-gray-700'}`}>
            {statusLabels[order.status] || order.status}
          </Badge>
        </div>

        {order.status === 'pending' && (
          <Card className="border-amber-200 bg-amber-50">
            <CardContent className="p-6 text-center">
              <Clock className="h-12 w-12 text-amber-500 mx-auto mb-3" />
              <h3 className="text-lg font-bold text-amber-800 mb-2">في انتظار تأكيد الدفع</h3>
              <p className="text-amber-700 text-sm">
                طلبك قيد المراجعة. سيتم تأكيده بعد التأكد من الدفع عبر <strong>جيب</strong> أو <strong>ويسترن يونين</strong>.
              </p>
            </CardContent>
          </Card>
        )}

        {order.status === 'paid' && order.downloads && order.downloads.length > 0 && (
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Download className="h-5 w-5 text-emerald-600" />
                روابط التحميل
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-3">
              {order.downloads.map((item) => (
                <div key={item.id} className="flex items-center justify-between rounded-lg border border-gray-100 bg-white p-4 shadow-sm">
                  <div className="flex items-center gap-3">
                    <FileText className="h-5 w-5 text-emerald-600" />
                    <div>
                      <p className="font-semibold text-gray-900">{item.productName}</p>
                      <p className="text-xs text-gray-400">{item.fileName}</p>
                    </div>
                  </div>
                  <Button
                    size="sm"
                    className="bg-emerald-600 hover:bg-emerald-700 text-white"
                    onClick={() => window.open(`/api/download/${item.token}`, '_blank')}
                  >
                    <Download className="h-4 w-4 ml-1" />
                    تحميل
                  </Button>
                </div>
              ))}
            </CardContent>
          </Card>
        )}

        {order.status === 'paid' && (!order.downloads || order.downloads.length === 0) && (
          <Card className="border-emerald-200 bg-emerald-50">
            <CardContent className="p-6 text-center">
              <CheckCircle2 className="h-12 w-12 text-emerald-500 mx-auto mb-3" />
              <h3 className="text-lg font-bold text-emerald-800 mb-2">تم تأكيد الدفع!</h3>
              <p className="text-emerald-700 text-sm">
                سيتم تجهيز روابط التحميل قريباً. يمكنك متابعة الطلب من هذه الصفحة.
              </p>
            </CardContent>
          </Card>
        )}

        <Card>
          <CardHeader>
            <CardTitle className="text-right">تفاصيل الطلب</CardTitle>
          </CardHeader>
          <CardContent className="space-y-2 text-sm">
            <div className="flex justify-between"><span className="text-gray-500">الاسم:</span><span className="font-semibold">{order.customerName}</span></div>
            <div className="flex justify-between"><span className="text-gray-500">المجموع:</span><span className="font-semibold">${order.total}</span></div>
            <div className="flex justify-between"><span className="text-gray-500">الحالة:</span><span className="font-semibold">{statusLabels[order.status] || order.status}</span></div>
          </CardContent>
        </Card>

        <Button
          onClick={() => window.location.href = '/'}
          className="w-full bg-emerald-600 hover:bg-emerald-700 text-white"
        >
          <ArrowRight className="ml-2 h-4 w-4" />
          العودة للمتجر
        </Button>
      </div>
    </div>
  );
}
