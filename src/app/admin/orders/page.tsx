'use client';

import { useEffect, useState, useCallback } from 'react';
import { useRouter } from 'next/navigation';
import { useStore } from '@/lib/store';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import {
  Table,
  TableHeader,
  TableBody,
  TableRow,
  TableHead,
  TableCell,
} from '@/components/ui/table';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from '@/components/ui/alert-dialog';
import {
  Loader2,
  ArrowRight,
  LayoutDashboard,
  LogOut,
  User,
  ShoppingCart,
  CheckCircle,
  XCircle,
  Clock,
  Eye,
  DollarSign,
  RefreshCw,
} from 'lucide-react';
import { toast } from 'sonner';

interface Order {
  id: string;
  orderNumber: string;
  customerName: string;
  customerPhone: string;
  customerEmail: string;
  paymentMethod: string;
  total: number;
  status: 'pending' | 'paid' | 'cancelled';
  items: Array<{
    product: { id: string; name: string; price: number };
    quantity: number;
    total: number;
  }>;
  createdAt: string;
  updatedAt: string;
}

export default function AdminOrdersPage() {
  const router = useRouter();
  const { user, authLoading, checkAuth, logout } = useStore();
  const [checked, setChecked] = useState(false);
  const [orders, setOrders] = useState<Order[]>([]);
  const [loading, setLoading] = useState(true);
  const [actionLoading, setActionLoading] = useState<string | null>(null);
  const [viewDialogOpen, setViewDialogOpen] = useState(false);
  const [cancelDialogOpen, setCancelDialogOpen] = useState(false);
  const [selectedOrder, setSelectedOrder] = useState<Order | null>(null);

  useEffect(() => {
    checkAuth().then(() => setChecked(true));
  }, [checkAuth]);

  useEffect(() => {
    if (checked && !authLoading) {
      if (!user) {
        router.push('/admin/login');
      }
    }
  }, [checked, authLoading, user, router]);

  const fetchOrders = useCallback(async () => {
    setLoading(true);
    try {
      const res = await fetch('/api/orders');
      const data = await res.json();
      if (data.success) {
        setOrders(data.data);
      }
    } catch {
      toast.error('خطأ في تحميل الطلبات');
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    if (checked && user) {
      fetchOrders();
    }
  }, [checked, user, fetchOrders]);

  const handleMarkPaid = async (order: Order) => {
    setActionLoading(order.id);
    try {
      const res = await fetch(`/api/orders?id=${order.id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ status: 'paid' }),
      });
      const data = await res.json();
      if (data.success) {
        toast.success('تم تحديث حالة الطلب إلى مدفوع');
        fetchOrders();
      } else {
        toast.error(data.error || 'حدث خطأ');
      }
    } catch {
      toast.error('حدث خطأ أثناء التحديث');
    } finally {
      setActionLoading(null);
    }
  };

  const openCancelDialog = (order: Order) => {
    setSelectedOrder(order);
    setCancelDialogOpen(true);
  };

  const handleCancel = async () => {
    if (!selectedOrder) return;
    setActionLoading(selectedOrder.id);
    try {
      const res = await fetch(`/api/orders?id=${selectedOrder.id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ status: 'cancelled' }),
      });
      const data = await res.json();
      if (data.success) {
        toast.success('تم إلغاء الطلب');
        setCancelDialogOpen(false);
        setSelectedOrder(null);
        fetchOrders();
      } else {
        toast.error(data.error || 'حدث خطأ');
      }
    } catch {
      toast.error('حدث خطأ أثناء الإلغاء');
    } finally {
      setActionLoading(null);
    }
  };

  const openViewDialog = (order: Order) => {
    setSelectedOrder(order);
    setViewDialogOpen(true);
  };

  const getStatusBadge = (status: Order['status']) => {
    switch (status) {
      case 'paid':
        return (
          <Badge className="bg-emerald-100 text-emerald-700 border-emerald-200 hover:bg-emerald-100">
            <CheckCircle className="h-3 w-3 ml-1" />
            مدفوع
          </Badge>
        );
      case 'cancelled':
        return (
          <Badge className="bg-red-100 text-red-700 border-red-200 hover:bg-red-100">
            <XCircle className="h-3 w-3 ml-1" />
            ملغي
          </Badge>
        );
      default:
        return (
          <Badge className="bg-amber-100 text-amber-700 border-amber-200 hover:bg-amber-100">
            <Clock className="h-3 w-3 ml-1" />
            قيد الانتظار
          </Badge>
        );
    }
  };

  const getPaymentMethodLabel = (method: string) => {
    switch (method) {
      case 'jeib':
        return 'محفظة جيب';
      case 'western-union':
        return 'ويسترن يونين';
      default:
        return method;
    }
  };

  const formatDate = (dateStr: string) => {
    return new Date(dateStr).toLocaleDateString('ar-YE', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
    });
  };

  const totalOrders = orders.length;
  const pendingOrders = orders.filter((o) => o.status === 'pending').length;
  const paidOrders = orders.filter((o) => o.status === 'paid').length;
  const totalRevenue = orders
    .filter((o) => o.status === 'paid')
    .reduce((sum, o) => sum + o.total, 0);

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
      {/* Header */}
      <div className="bg-white border-b sticky top-0 z-40">
        <div className="container mx-auto px-4 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <Button
                variant="ghost"
                size="sm"
                onClick={() => router.push('/admin')}
                className="text-gray-500"
              >
                <ArrowRight className="h-4 w-4 ml-1" />
                العودة
              </Button>
              <div className="flex items-center gap-2">
                <ShoppingCart className="h-5 w-5 text-emerald-600" />
                <h1 className="text-lg font-bold text-gray-900">إدارة الطلبات</h1>
              </div>
            </div>
            <div className="flex items-center gap-3">
              {user && (
                <div className="flex items-center gap-2 text-sm text-gray-500">
                  <User className="h-4 w-4" />
                  <span>{user.name}</span>
                </div>
              )}
              <Button
                variant="outline"
                size="sm"
                onClick={fetchOrders}
                className="border-gray-200"
              >
                <RefreshCw className={`ml-1 h-4 w-4 ${loading ? 'animate-spin' : ''}`} />
                تحديث
              </Button>
              <Button
                variant="ghost"
                size="sm"
                onClick={async () => {
                  await logout();
                  window.location.href = '/admin/login';
                }}
                className="text-red-500 hover:text-red-600 hover:bg-red-50"
              >
                <LogOut className="ml-1 h-4 w-4" />
                تسجيل الخروج
              </Button>
            </div>
          </div>
        </div>
      </div>

      {/* Stats */}
      <div className="container mx-auto px-4 py-6">
        <div className="grid gap-4 sm:grid-cols-4 mb-6">
          {[
            { label: 'إجمالي الطلبات', value: totalOrders, icon: ShoppingCart, color: 'bg-emerald-100 text-emerald-600' },
            { label: 'قيد الانتظار', value: pendingOrders, icon: Clock, color: 'bg-amber-100 text-amber-600' },
            { label: 'مدفوعة', value: paidOrders, icon: CheckCircle, color: 'bg-blue-100 text-blue-600' },
            { label: 'الإيرادات', value: `$${totalRevenue.toFixed(2)}`, icon: DollarSign, color: 'bg-purple-100 text-purple-600' },
          ].map((stat, i) => (
            <Card key={i} className="border-gray-100">
              <CardContent className="p-4 flex items-center gap-3">
                <div className={`h-10 w-10 rounded-lg flex items-center justify-center ${stat.color}`}>
                  <stat.icon className="h-5 w-5" />
                </div>
                <div>
                  <div className="text-2xl font-bold text-gray-900">{stat.value}</div>
                  <div className="text-xs text-gray-500">{stat.label}</div>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>

        {/* Orders Table */}
        <Card className="border-gray-100">
          <CardHeader className="pb-3">
            <CardTitle className="text-base font-semibold">الطلبات</CardTitle>
          </CardHeader>
          <CardContent>
            {loading ? (
              <div className="flex items-center justify-center py-16">
                <Loader2 className="h-8 w-8 text-emerald-600 animate-spin" />
              </div>
            ) : orders.length === 0 ? (
              <div className="py-16 text-center">
                <ShoppingCart className="h-12 w-12 text-gray-300 mx-auto mb-3" />
                <p className="text-gray-400">لا توجد طلبات</p>
              </div>
            ) : (
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead className="text-right">رقم الطلب</TableHead>
                    <TableHead className="text-right">اسم العميل</TableHead>
                    <TableHead className="text-right">رقم الهاتف</TableHead>
                    <TableHead className="text-right">طريقة الدفع</TableHead>
                    <TableHead className="text-right">المبلغ</TableHead>
                    <TableHead className="text-right">الحالة</TableHead>
                    <TableHead className="text-right">التاريخ</TableHead>
                    <TableHead className="text-right">الإجراءات</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {orders.map((order) => (
                    <TableRow key={order.id}>
                      <TableCell className="font-mono text-sm font-medium">
                        {order.orderNumber}
                      </TableCell>
                      <TableCell>{order.customerName}</TableCell>
                      <TableCell className="font-mono text-sm" dir="ltr">
                        {order.customerPhone}
                      </TableCell>
                      <TableCell>{getPaymentMethodLabel(order.paymentMethod)}</TableCell>
                      <TableCell className="font-semibold text-emerald-600">
                        {"$"}{order.total.toFixed(2)}
                      </TableCell>
                      <TableCell>{getStatusBadge(order.status)}</TableCell>
                      <TableCell className="text-sm text-gray-500">
                        {formatDate(order.createdAt)}
                      </TableCell>
                      <TableCell>
                        <div className="flex items-center gap-1">
                          <Button
                            size="icon"
                            variant="ghost"
                            className="h-8 w-8"
                            onClick={() => openViewDialog(order)}
                            title="عرض التفاصيل"
                          >
                            <Eye className="h-4 w-4 text-gray-500" />
                          </Button>
                          {order.status === 'pending' && (
                            <>
                              <Button
                                size="sm"
                                variant="ghost"
                                className="h-8 text-emerald-600 hover:text-emerald-700 hover:bg-emerald-50"
                                onClick={() => handleMarkPaid(order)}
                                disabled={actionLoading === order.id}
                              >
                                {actionLoading === order.id ? (
                                  <Loader2 className="h-3.5 w-3.5 animate-spin" />
                                ) : (
                                  <CheckCircle className="h-3.5 w-3.5 ml-1" />
                                )}
                                <span className="text-xs mr-1">دفع</span>
                              </Button>
                              <Button
                                size="sm"
                                variant="ghost"
                                className="h-8 text-red-500 hover:text-red-600 hover:bg-red-50"
                                onClick={() => openCancelDialog(order)}
                                disabled={actionLoading === order.id}
                              >
                                <XCircle className="h-3.5 w-3.5 ml-1" />
                                <span className="text-xs mr-1">إلغاء</span>
                              </Button>
                            </>
                          )}
                        </div>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            )}
          </CardContent>
        </Card>
      </div>

      {/* View Order Details Dialog */}
      <Dialog open={viewDialogOpen} onOpenChange={setViewDialogOpen}>
        <DialogContent className="max-w-lg" dir="rtl">
          <DialogHeader>
            <DialogTitle className="text-right">
              تفاصيل الطلب {selectedOrder?.orderNumber}
            </DialogTitle>
          </DialogHeader>
          {selectedOrder && (
            <div className="space-y-4 py-4">
              <div className="grid grid-cols-2 gap-4 text-sm">
                <div>
                  <span className="text-gray-500">العميل:</span>
                  <p className="font-medium">{selectedOrder.customerName}</p>
                </div>
                <div>
                  <span className="text-gray-500">الهاتف:</span>
                  <p className="font-mono" dir="ltr">{selectedOrder.customerPhone}</p>
                </div>
                <div>
                  <span className="text-gray-500">البريد:</span>
                  <p className="font-mono text-xs" dir="ltr">{selectedOrder.customerEmail}</p>
                </div>
                <div>
                  <span className="text-gray-500">طريقة الدفع:</span>
                  <p>{getPaymentMethodLabel(selectedOrder.paymentMethod)}</p>
                </div>
                <div>
                  <span className="text-gray-500">الحالة:</span>
                  <div className="mt-1">{getStatusBadge(selectedOrder.status)}</div>
                </div>
                <div>
                  <span className="text-gray-500">التاريخ:</span>
                  <p>{formatDate(selectedOrder.createdAt)}</p>
                </div>
              </div>

              <div>
                <h4 className="font-semibold mb-2">المنتجات:</h4>
                <div className="space-y-2">
                  {selectedOrder.items.map((item, i) => (
                    <div key={i} className="flex justify-between text-sm bg-gray-50 p-2 rounded">
                      <span>{item.product.name} × {item.quantity}</span>
                      <span className="font-medium">{"$"}{item.total.toFixed(2)}</span>
                    </div>
                  ))}
                </div>
              </div>

              <div className="flex justify-between pt-2 border-t">
                <span className="font-bold">الإجمالي:</span>
                <span className="font-bold text-emerald-600 text-lg">
                  {"$"}{selectedOrder.total.toFixed(2)}
                </span>
              </div>
            </div>
          )}
        </DialogContent>
      </Dialog>

      {/* Cancel Confirmation Dialog */}
      <AlertDialog open={cancelDialogOpen} onOpenChange={setCancelDialogOpen}>
        <AlertDialogContent dir="rtl">
          <AlertDialogHeader>
            <AlertDialogTitle>هل أنت متأكد من إلغاء هذا الطلب؟</AlertDialogTitle>
            <AlertDialogDescription>
              سيتم إلغاء الطلب &quot;{selectedOrder?.orderNumber}&quot; الخاص بـ &quot;{selectedOrder?.customerName}&quot;. هذا الإجراء لا يمكن التراجع عنه.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter className="gap-2 sm:gap-0">
            <AlertDialogCancel>رجوع</AlertDialogCancel>
            <AlertDialogAction
              onClick={handleCancel}
              className="bg-red-600 hover:bg-red-700 text-white"
              disabled={actionLoading === selectedOrder?.id}
            >
              {actionLoading === selectedOrder?.id ? (
                <Loader2 className="h-4 w-4 animate-spin" />
              ) : (
                <>
                  <XCircle className="ml-1 h-4 w-4" />
                  تأكيد الإلغاء
                </>
              )}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
}
