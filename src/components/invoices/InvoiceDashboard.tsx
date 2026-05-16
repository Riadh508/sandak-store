'use client';

import { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from '@/components/ui/dialog';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { ArrowRight, Plus, Receipt, Loader2 } from 'lucide-react';
import { toast } from 'sonner';
import { logger } from '@/lib/logger';
import { Separator } from '@/components/ui/separator';

interface InvoiceItem {
  id: string;
  description: string;
  quantity: number;
  unitPrice: number;
  total: number;
  sortOrder: number;
}

interface Invoice {
  id: string;
  invoiceNumber: string;
  clientName: string;
  clientPhone?: string;
  clientEmail?: string;
  date: string;
  dueDate: string;
  status: string;
  subtotal: number;
  taxAmount: number;
  discount: number;
  total: number;
  items: InvoiceItem[];
}

const statusBadge = (status: string) => {
  const map: Record<string, string> = { pending: 'bg-yellow-100 text-yellow-800', paid: 'bg-green-100 text-green-800', overdue: 'bg-red-100 text-red-800' };
  const labels: Record<string, string> = { pending: 'قيد الانتظار', paid: 'مدفوع', overdue: 'متأخر' };
  return <Badge className={map[status] || 'bg-gray-100'}>{labels[status] || status}</Badge>;
};

export function InvoiceDashboard({ onBack }: { onBack: () => void }) {
  const [adminKey, setAdminKey] = useState('');
  const [keyDialogOpen, setKeyDialogOpen] = useState(true);
  const [verifying, setVerifying] = useState(false);
  const [invoices, setInvoices] = useState<Invoice[]>([]);
  const [loading, setLoading] = useState(true);
  const [open, setOpen] = useState(false);
  const [form, setForm] = useState({ clientName: '', clientPhone: '', clientEmail: '', clientAddress: '', dueDate: '', taxRate: '15', discount: '0', discountType: 'fixed', notes: '' });
  const [items, setItems] = useState([{ description: '', quantity: 1, unitPrice: 0 }]);
  const [saving, setSaving] = useState(false);

  const adminHeaders = (): HeadersInit => {
    const h: Record<string, string> = { 'Content-Type': 'application/json' };
    if (adminKey) h['x-api-key'] = adminKey;
    return h;
  };

  const fetchInvoices = async () => {
    setLoading(true);
    try {
      const res = await fetch('/api/invoices', { headers: adminHeaders() });
      const json = await res.json();
      if (json.success) setInvoices(json.data);
    } catch (e) {
      logger.error('Failed to fetch invoices', e);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { fetchInvoices(); }, []);

  const addItem = () => setItems([...items, { description: '', quantity: 1, unitPrice: 0 }]);
  const updateItem = (idx: number, field: string, value: string | number) => {
    setItems(items.map((item, i) => i === idx ? { ...item, [field]: value } : item));
  };
  const removeItem = (idx: number) => {
    if (items.length > 1) setItems(items.filter((_, i) => i !== idx));
  };

  const createInvoice = async () => {
    if (!form.clientName.trim()) { toast.error('اسم العميل مطلوب'); return; }
    const validItems = items.filter(i => i.description.trim());
    if (validItems.length === 0) { toast.error('أضف بنداً واحداً على الأقل'); return; }

    setSaving(true);
    try {
      const res = await fetch('/api/invoices', {
        method: 'POST',
        headers: adminHeaders(),
        body: JSON.stringify({ ...form, taxRate: parseFloat(form.taxRate), discount: parseFloat(form.discount), items: validItems }),
      });
      const json = await res.json();
      if (json.success) {
        toast.success('تم إنشاء الفاتورة');
        setOpen(false);
        setForm({ clientName: '', clientPhone: '', clientEmail: '', clientAddress: '', dueDate: '', taxRate: '15', discount: '0', discountType: 'fixed', notes: '' });
        setItems([{ description: '', quantity: 1, unitPrice: 0 }]);
        fetchInvoices();
      } else {
        toast.error(json.error || 'فشل في إنشاء الفاتورة');
      }
    } catch (e) {
      logger.error('Failed to create invoice', e);
      toast.error('خطأ في الاتصال');
    } finally {
      setSaving(false);
    }
  };

  const markPaid = async (id: string) => {
    try {
      const res = await fetch('/api/invoices', {
        method: 'PUT',
        headers: adminHeaders(),
        body: JSON.stringify({ id, status: 'paid' }),
      });
      const json = await res.json();
      if (json.success) { toast.success('تم تحديث الحالة'); fetchInvoices(); }
    } catch (e) {
      logger.error('Failed to update invoice', e);
    }
  };

  if (keyDialogOpen) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center" dir="rtl">
        <div className="bg-white rounded-xl shadow-lg border p-8 max-w-sm w-full mx-4">
          <h2 className="text-xl font-bold text-gray-900 text-center mb-2">نظام الفواتير</h2>
          <p className="text-sm text-gray-500 text-center mb-6">أدخل مفتاح التحكم للوصول</p>
          <Input
            type="password"
            placeholder="مفتاح التحكم"
            value={adminKey}
            onChange={(e) => setAdminKey(e.target.value)}
            className="text-center mb-4"
            autoFocus
          />
          <Button
            className="w-full bg-blue-600 hover:bg-blue-700 text-white"
            disabled={verifying}
            onClick={async () => {
              if (!adminKey.trim()) {
                toast.error('الرجاء إدخال المفتاح');
                return;
              }
              setVerifying(true);
              try {
                const res = await fetch('/api/auth/verify', {
                  method: 'POST',
                  headers: { 'x-api-key': adminKey.trim(), 'Content-Type': 'application/json' },
                });
                const data = await res.json();
                if (data.success) setKeyDialogOpen(false);
                else toast.error('المفتاح غير صحيح');
              } catch {
                toast.error('خطأ في الاتصال');
              } finally {
                setVerifying(false);
              }
            }}
          >
            {verifying ? 'جارٍ التحقق...' : 'دخول'}
          </Button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50" dir="rtl">
      <div className="container mx-auto px-4 py-6">
        <div className="flex items-center justify-between mb-6">
          <div className="flex items-center gap-3">
            <Button variant="ghost" size="icon" onClick={onBack}><ArrowRight className="h-5 w-5" /></Button>
            <div>
              <h1 className="text-2xl font-bold flex items-center gap-2"><Receipt className="h-6 w-6 text-blue-600" /> نظام الفواتير</h1>
              <p className="text-sm text-muted-foreground">إدارة الفواتير وتتبع المدفوعات</p>
            </div>
          </div>
          <Button onClick={() => setOpen(true)} className="bg-blue-600 hover:bg-blue-700"><Plus className="ml-2 h-4 w-4" /> فاتورة جديدة</Button>
        </div>

        <Card>
          <CardHeader><CardTitle>الفواتير</CardTitle></CardHeader>
          <CardContent>
            {loading ? (
              <div className="flex justify-center py-12"><Loader2 className="h-8 w-8 animate-spin text-blue-600" /></div>
            ) : invoices.length === 0 ? (
              <div className="text-center py-12 text-muted-foreground">لا توجد فواتير بعد. أنشئ أول فاتورة.</div>
            ) : (
              <div className="space-y-3">
                {invoices.map((inv) => (
                  <div key={inv.id} className="flex items-center justify-between p-4 rounded-lg border hover:bg-gray-50 transition-colors">
                    <div className="flex-1">
                      <div className="flex items-center gap-3">
                        <span className="font-medium text-blue-600">{inv.invoiceNumber}</span>
                        {statusBadge(inv.status)}
                      </div>
                      <div className="text-sm text-muted-foreground mt-1">{inv.clientName} · {new Date(inv.date).toLocaleDateString('ar-YE')}</div>
                      <div className="text-xs text-muted-foreground">{inv.items.length} بنود</div>
                    </div>
                    <div className="text-left">
                      <div className="text-lg font-bold">{inv.total.toFixed(2)} $</div>
                      {inv.status === 'pending' && (
                        <Button size="sm" variant="outline" className="mt-1 text-green-600 border-green-200" onClick={() => markPaid(inv.id)}>تحديد كمدفوع</Button>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            )}
          </CardContent>
        </Card>

        <Dialog open={open} onOpenChange={setOpen}>
          <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
            <DialogHeader><DialogTitle>فاتورة جديدة</DialogTitle></DialogHeader>
            <div className="grid gap-4 py-4">
              <div className="grid grid-cols-2 gap-4">
                <div><Label>اسم العميل *</Label><Input value={form.clientName} onChange={(e) => setForm({ ...form, clientName: e.target.value })} /></div>
                <div><Label>رقم الهاتف</Label><Input value={form.clientPhone} onChange={(e) => setForm({ ...form, clientPhone: e.target.value })} /></div>
                <div><Label>البريد الإلكتروني</Label><Input value={form.clientEmail} onChange={(e) => setForm({ ...form, clientEmail: e.target.value })} /></div>
                <div><Label>العنوان</Label><Input value={form.clientAddress} onChange={(e) => setForm({ ...form, clientAddress: e.target.value })} /></div>
                <div><Label>تاريخ الاستحقاق</Label><Input type="date" value={form.dueDate} onChange={(e) => setForm({ ...form, dueDate: e.target.value })} /></div>
                <div className="grid grid-cols-3 gap-2">
                  <div><Label>الضريبة %</Label><Input type="number" value={form.taxRate} onChange={(e) => setForm({ ...form, taxRate: e.target.value })} /></div>
                  <div><Label>الخصم</Label><Input type="number" value={form.discount} onChange={(e) => setForm({ ...form, discount: e.target.value })} /></div>
                  <div><Label>نوع الخصم</Label>
                    <Select value={form.discountType} onValueChange={(v) => setForm({ ...form, discountType: v })}>
                      <SelectTrigger><SelectValue /></SelectTrigger>
                      <SelectContent>
                        <SelectItem value="fixed">ثابت</SelectItem>
                        <SelectItem value="percentage">نسبة مئوية</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                </div>
              </div>
              <Separator />
              <div><Label>البنود</Label></div>
              {items.map((item, idx) => (
                <div key={idx} className="grid grid-cols-12 gap-2 items-end">
                  <div className="col-span-5"><Input placeholder="وصف البند" value={item.description} onChange={(e) => updateItem(idx, 'description', e.target.value)} /></div>
                  <div className="col-span-2"><Input type="number" min={1} value={item.quantity} onChange={(e) => updateItem(idx, 'quantity', parseInt(e.target.value) || 1)} /></div>
                  <div className="col-span-3"><Input type="number" min={0} step={0.01} value={item.unitPrice} onChange={(e) => updateItem(idx, 'unitPrice', parseFloat(e.target.value) || 0)} /></div>
                  <div className="col-span-1 text-sm font-medium pt-2">{(item.quantity * item.unitPrice).toFixed(2)}$</div>
                  <div className="col-span-1">
                    {items.length > 1 && <Button variant="ghost" size="icon" className="text-red-500 h-10 w-10" onClick={() => removeItem(idx)}>×</Button>}
                  </div>
                </div>
              ))}
              <Button variant="outline" size="sm" onClick={addItem}><Plus className="ml-1 h-4 w-4" /> إضافة بند</Button>
              <div><Label>ملاحظات</Label><Textarea value={form.notes} onChange={(e) => setForm({ ...form, notes: e.target.value })} /></div>
            </div>
            <DialogFooter>
              <Button variant="outline" onClick={() => setOpen(false)}>إلغاء</Button>
              <Button onClick={createInvoice} disabled={saving} className="bg-blue-600 hover:bg-blue-700">
                {saving && <Loader2 className="ml-2 h-4 w-4 animate-spin" />}
                حفظ الفاتورة
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      </div>
    </div>
  );
}
