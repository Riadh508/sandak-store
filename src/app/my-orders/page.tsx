'use client';

import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Separator } from '@/components/ui/separator';
import {
  Loader2, Search, ShoppingBag, Store, ArrowRight, Download,
  FileText, Package, CheckCircle2, Clock, XCircle, ExternalLink
} from 'lucide-react';
import { formatDateTime } from '@/lib/format';

interface DownloadItem {
  token: string;
  productName: string;
  fileUrl: string;
  fileName: string;
  downloaded: boolean;
  downloadedAt: string | null;
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
  items: OrderItem[];
  downloads: DownloadItem[];
  createdAt: string;
  verifiedAt: string | null;
}

const statusLabels: Record<string, string> = {
  pending: 'قيد الانتظار',
  paid: 'تم الدفع',
  delivered: 'تم التوصيل',
  cancelled: 'ملغي',
};

const statusColors: Record<string, string> = {
  pending: 'bg-amber-100 text-amber-700 border-amber-200',
  paid: 'bg-emerald-100 text-emerald-700 border-emerald-200',
  delivered: 'bg-blue-100 text-blue-700 border-blue-200',
  cancelled: 'bg-red-100 text-red-700 border-red-200',
};

const paymentLabels: Record<string, string> = {
  jeib: 'محفظة جيب',
  'western-union': 'ويسترن يونين',
};

export default function MyOrdersPage() {
  const [phone, setPhone] = useState('');
  const [orders, setOrders] = useState<OrderData[]>([]);
  const [loading, setLoading] = useState(false);
  const [searched, setSearched] = useState(false);
  const [notFound, setNotFound] = useState(false);
  const [error, setError] = useState('');

  const handleSearch = async () => {
    if (!phone.trim()) {
      setError('يرجى إدخال رقم الهاتف');
      return;
    }
    setError('');
    setLoading(true);
    setSearched(false);
    setNotFound(false);
    try {
      const res = await fetch(`/api/orders?phone=${encodeURIComponent(phone.trim())}`);
      const data = await res.json();
      if (data.success && Array.isArray(data.data)) {
        setOrders(data.data);
        setSearched(true);
        if (data.data.length === 0) setNotFound(true);
      } else {
        setOrders([]);
        setNotFound(true);
      }
    } catch {
      setError('حدث خطأ في الاتصال');
      setOrders([]);
    } finally {
      setLoading(false);
      setSearched(true);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-bl from-emerald-50/30 via-white to-gray-50" dir="rtl">
      <div className="max-w-2xl mx-auto p-4 md:p-6 space-y-5">
        {/* Header */}
        <div className="flex items-center gap-3">
          <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-2xl bg-gradient-to-br from-emerald-600 to-teal-500 shadow-lg shadow-emerald-200">
            <ShoppingBag className="h-6 w-6 text-white" />
          </div>
          <div className="flex-1 min-w-0">
            <h1 className="text-xl font-bold text-gray-900">مشترياتي</h1>
            <p className="text-gray-500 text-sm">عرض جميع طلباتك وروابط التحميل</p>
          </div>
          <Button variant="ghost" size="sm" onClick={() => window.location.href = '/'} className="text-gray-500">
            <ArrowRight className="h-4 w-4 ml-1" />
            المتجر
          </Button>
        </div>

        {/* Search Card */}
        <Card className="border-gray-100 shadow-sm">
          <CardContent className="p-6">
            <div className="flex flex-col sm:flex-row gap-3 items-end">
              <div className="flex-1 w-full">
                <Label htmlFor="phone-search" className="text-right block mb-1.5">رقم الهاتف</Label>
                <Input
                  id="phone-search"
                  value={phone}
                  onChange={(e) => setPhone(e.target.value)}
                  onKeyDown={(e) => e.key === 'Enter' && handleSearch()}
                  placeholder="أدخل رقم هاتفك للبحث عن طلباتك"
                  className="text-right"
                  dir="ltr"
                />
              </div>
              <Button onClick={handleSearch} disabled={loading} className="bg-emerald-600 hover:bg-emerald-700 text-white w-full sm:w-auto">
                {loading ? <Loader2 className="h-4 w-4 animate-spin" /> : <Search className="h-4 w-4 ml-1" />}
                بحث
              </Button>
            </div>
            {error && <p className="text-sm text-red-600 mt-2">{error}</p>}
          </CardContent>
        </Card>

        {/* Results */}
        {loading && (
          <div className="flex items-center justify-center py-12">
            <Loader2 className="h-8 w-8 animate-spin text-emerald-600" />
          </div>
        )}

        {!loading && notFound && searched && (
          <Card className="border-gray-100">
            <CardContent className="py-12 text-center">
              <div className="mx-auto mb-4 h-16 w-16 rounded-full bg-gray-100 flex items-center justify-center">
                <Search className="h-8 w-8 text-gray-400" />
              </div>
              <h3 className="text-lg font-bold text-gray-900 mb-1">لا توجد طلبات</h3>
              <p className="text-gray-500 text-sm">لم نعثر على أي طلبات بهذا الرقم. تأكد من الرقم وحاول مرة أخرى.</p>
            </CardContent>
          </Card>
        )}

        {!loading && orders.length > 0 && (
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <h2 className="text-lg font-bold text-gray-900">
                تم العثور على {orders.length} طلب{orders.length > 1 ? 'ات' : ''}
              </h2>
              <Button variant="outline" size="sm" onClick={handleSearch} className="border-gray-200">
                <ArrowRight className="h-4 w-4 ml-1" />
                تحديث
              </Button>
            </div>

            {orders.map((order) => (
              <Card key={order.id} className="border-gray-100 overflow-hidden">
                {/* Order Header */}
                <div className="bg-gray-50 px-4 py-3 flex items-center justify-between border-b">
                  <div className="flex items-center gap-2 min-w-0">
                    <Package className="h-4 w-4 text-emerald-600 shrink-0" />
                    <span className="font-mono text-sm font-medium truncate" dir="ltr">{order.orderNumber}</span>
                  </div>
                  <Badge className={'shrink-0 border ' + (statusColors[order.status] || 'bg-gray-100 text-gray-700')}>
                    {statusLabels[order.status] || order.status}
                  </Badge>
                </div>

                <CardContent className="p-4 space-y-3">
                  {/* Order Info */}
                  <div className="flex items-center justify-between text-sm">
                    <span className="text-gray-500">{formatDateTime(order.createdAt)}</span>
                    <span className="font-bold text-emerald-600">${(order.total || 0).toFixed(2)}</span>
                  </div>
                  <div className="text-sm text-gray-500">
                    {paymentLabels[order.paymentMethod] || order.paymentMethod}
                  </div>

                  {/* Items */}
                  <div className="space-y-1">
                    {order.items.map((item, i) => (
                      <div key={i} className="flex items-center justify-between text-sm bg-gray-50 p-2 rounded">
                        <span className="truncate ml-2">{item.name} x{item.quantity}</span>
                        <span className="font-medium shrink-0">${(item.total || 0).toFixed(2)}</span>
                      </div>
                    ))}
                  </div>

                  {/* Downloads */}
                  {order.downloads && order.downloads.length > 0 && (
                    <>
                      <Separator />
                      <div>
                        <p className="text-xs font-semibold text-emerald-700 mb-2 flex items-center gap-1">
                          <Download className="h-3 w-3" />
                          روابط التحميل
                        </p>
                        <div className="space-y-1.5">
                          {order.downloads.map((dl, i) => (
                            <div key={i} className="flex items-center justify-between text-sm bg-emerald-50 p-2 rounded">
                              <div className="flex items-center gap-2 min-w-0 flex-1">
                                <FileText className="h-3 w-3 text-emerald-600 shrink-0" />
                                <span className="truncate">{dl.productName}</span>
                              </div>
                              <Button
                                size="sm"
                                variant="outline"
                                className="h-7 text-xs shrink-0"
                                onClick={() => window.open(`/api/download/${dl.token}`, '_blank')}
                              >
                                <Download className="h-3 w-3 ml-1" />
                                تحميل
                              </Button>
                            </div>
                          ))}
                        </div>
                      </div>
                    </>
                  )}

                  {/* Link to full details */}
                  <div className="text-center pt-1">
                    <Button
                      variant="link"
                      size="sm"
                      onClick={() => window.location.href = `/order/${order.orderNumber}`}
                      className="text-emerald-600"
                    >
                      <ExternalLink className="h-3 w-3 ml-1" />
                      عرض التفاصيل الكاملة
                    </Button>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        )}

        {/* Back to store */}
        <div className="text-center pt-2">
          <Button
            onClick={() => window.location.href = '/'}
            className="bg-emerald-600 hover:bg-emerald-700 text-white"
          >
            <Store className="ml-2 h-4 w-4" />
            العودة للمتجر
          </Button>
        </div>
      </div>
    </div>
  );
}