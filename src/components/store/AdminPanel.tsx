'use client';

import { useState, useEffect, useCallback } from 'react';
import { useStore } from '@/lib/store';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Badge } from '@/components/ui/badge';
import { Separator } from '@/components/ui/separator';
import { Tabs, TabsList, TabsTrigger, TabsContent } from '@/components/ui/tabs';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
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
  Plus,
  Pencil,
  Trash2,
  Package,
  BookOpen,
  Monitor,
  Eye,
  EyeOff,
  ArrowRight,
  X,
  Save,
  RefreshCw,
  LayoutDashboard,
  LogOut,
  User,
} from 'lucide-react';
import { toast } from 'sonner';
import { motion, AnimatePresence } from 'framer-motion';
import { formatFileSize } from '@/lib/format';

interface ProductDB {
  id: string;
  name: string;
  description: string;
  longDescription: string;
  price: number;
  category: string;
  image: string;
  features: string[];
  badge: string;
  fileUrl: string;
  fileSize: number;
  isActive: boolean;
  sortOrder: number;
  createdAt: string;
  updatedAt: string;
}

export function AdminPanel({ onBack }: { onBack: () => void }) {
  const { user, logout } = useStore();
  const [products, setProducts] = useState<ProductDB[]>([]);
  const [loading, setLoading] = useState(true);
  const [dialogOpen, setDialogOpen] = useState(false);
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [editingProduct, setEditingProduct] = useState<ProductDB | null>(null);
  const [productToDelete, setProductToDelete] = useState<ProductDB | null>(null);

  const [formName, setFormName] = useState('');
  const [formDesc, setFormDesc] = useState('');
  const [formLongDesc, setFormLongDesc] = useState('');
  const [formPrice, setFormPrice] = useState('');
  const [formCategory, setFormCategory] = useState('ebook');
  const [formBadge, setFormBadge] = useState('');
  const [formFeatures, setFormFeatures] = useState('');
  const [formActive, setFormActive] = useState(true);
  const [formImage, setFormImage] = useState('');
  const [formFileUrl, setFormFileUrl] = useState('');
  const [formFileSize, setFormFileSize] = useState('');

  const adminHeaders = (): HeadersInit => {
    return { 'Content-Type': 'application/json' };
  };

  const fetchProducts = useCallback(async () => {
    setLoading(true);
    try {
      const res = await fetch('/api/products?all=true', { headers: adminHeaders() });
      const data = await res.json();
      if (data.success) {
        setProducts(data.data);
      }
    } catch (error) {
      toast.error('خطأ في تحميل المنتجات');
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchProducts();
  }, [fetchProducts]);

  const resetForm = () => {
    setFormName('');
    setFormDesc('');
    setFormLongDesc('');
    setFormPrice('');
    setFormCategory('ebook');
    setFormBadge('');
    setFormFeatures('');
    setFormActive(true);
    setFormImage('');
    setFormFileUrl('');
    setFormFileSize('');
    setEditingProduct(null);
  };

  const openAddDialog = () => {
    resetForm();
    setDialogOpen(true);
  };

  const openEditDialog = (product: ProductDB) => {
    setEditingProduct(product);
    setFormName(product.name);
    setFormDesc(product.description);
    setFormLongDesc(product.longDescription || '');
    setFormPrice(product.price.toString());
    setFormCategory(product.category);
    setFormBadge(product.badge || '');
    setFormFeatures((product.features || []).join('\n'));
    setFormActive(product.isActive);
    setFormImage(product.image || '');
    setFormFileUrl(product.fileUrl || '');
    setFormFileSize(product.fileSize?.toString() || '');
    setDialogOpen(true);
  };

  const openDeleteDialog = (product: ProductDB) => {
    setProductToDelete(product);
    setDeleteDialogOpen(true);
  };

  const handleSave = async () => {
    if (!formName.trim() || !formDesc.trim() || !formPrice.trim()) {
      toast.error('يرجى ملء جميع الحقول المطلوبة');
      return;
    }

    const featuresArray = formFeatures
      .split('\n')
      .map((f) => f.trim())
      .filter((f) => f.length > 0);

    const productData = {
      name: formName.trim(),
      description: formDesc.trim(),
      longDescription: formLongDesc.trim(),
      price: parseFloat(formPrice),
      category: formCategory,
      badge: formBadge.trim(),
      features: featuresArray,
      isActive: formActive,
      image: formImage.trim(),
      fileUrl: formFileUrl.trim(),
      fileSize: parseInt(formFileSize) || 0,
    };

    try {
      let res;
      if (editingProduct) {
        res = await fetch('/api/products', {
          method: 'PUT',
          headers: adminHeaders(),
          body: JSON.stringify({ id: editingProduct.id, ...productData }),
        });
      } else {
        res = await fetch('/api/products', {
          method: 'POST',
          headers: adminHeaders(),
          body: JSON.stringify(productData),
        });
      }

      const data = await res.json();
      if (data.success) {
        toast.success(editingProduct ? 'تم تحديث المنتج بنجاح' : 'تم إضافة المنتج بنجاح');
        setDialogOpen(false);
        resetForm();
        fetchProducts();
      } else {
        toast.error(data.error || 'حدث خطأ');
      }
    } catch (error) {
      toast.error('حدث خطأ أثناء الحفظ');
    }
  };

  const handleDelete = async () => {
    if (!productToDelete) return;

    try {
      const res = await fetch('/api/products' + '?' + 'id=' + productToDelete.id, {
        method: 'DELETE',
        headers: adminHeaders(),
      });
      const data = await res.json();
      if (data.success) {
        toast.success('تم حذف المنتج بنجاح');
        setDeleteDialogOpen(false);
        setProductToDelete(null);
        fetchProducts();
      } else {
        toast.error(data.error || 'حدث خطأ');
      }
    } catch (error) {
      toast.error('حدث خطأ أثناء الحذف');
    }
  };

  const toggleActive = async (product: ProductDB) => {
    try {
      const res = await fetch('/api/products', {
        method: 'PUT',
        headers: adminHeaders(),
        body: JSON.stringify({ id: product.id, isActive: !product.isActive }),
      });
      const data = await res.json();
      if (data.success) {
        toast.success(product.isActive ? 'تم إخفاء المنتج' : 'تم تفعيل المنتج');
        fetchProducts();
      }
    } catch (error) {
      toast.error('حدث خطأ');
    }
  };

  const handleLogout = async () => {
    await logout();
    window.location.href = '/admin/login';
  };

  const activeProducts = products.filter((p) => p.isActive);
  const inactiveProducts = products.filter((p) => !p.isActive);

  function renderTab(tab: string) {
    const list = tab === 'active' ? activeProducts : tab === 'inactive' ? inactiveProducts : products;
    return (
      <TabsContent key={tab} value={tab}>
        {loading ? (
          <div className="flex items-center justify-center py-16">
            <RefreshCw className="h-8 w-8 text-emerald-600 animate-spin" />
          </div>
        ) : list.length === 0 ? (
          <Card className="border-gray-100">
            <CardContent className="py-16 text-center">
              <Package className="h-12 w-12 text-gray-300 mx-auto mb-3" />
              <p className="text-gray-400">لا توجد منتجات</p>
            </CardContent>
          </Card>
        ) : (
          <div className="space-y-3">
            <AnimatePresence mode="popLayout">
              {list.map((product, index) => (
                <motion.div
                  key={product.id}
                  layout
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -10 }}
                  transition={{ duration: 0.2, delay: index * 0.03 }}
                >
                  <Card className={'border ' + (product.isActive ? 'border-gray-100' : 'border-gray-200 bg-gray-50/50')}>
                    <CardContent className="p-4">
                      <div className="flex items-center gap-4">
                        <div className={'h-14 w-14 rounded-xl flex items-center justify-center shrink-0 ' + (product.category === 'ebook' ? 'bg-gradient-to-br from-blue-500 to-indigo-600' : 'bg-gradient-to-br from-emerald-500 to-teal-600')}>
                          {product.category === 'ebook' ? (
                            <BookOpen className="h-6 w-6 text-white" />
                          ) : (
                            <Monitor className="h-6 w-6 text-white" />
                          )}
                        </div>
                        <div className="flex-1 min-w-0">
                          <div className="flex items-center gap-2 mb-1">
                            <h3 className="font-semibold text-gray-900 truncate">{product.name}</h3>
                            {product.badge ? (
                              <Badge variant="outline" className="text-xs shrink-0">{product.badge}</Badge>
                            ) : null}
                            {!product.isActive ? (
                              <Badge variant="secondary" className="text-xs shrink-0 bg-gray-200 text-gray-500">مخفي</Badge>
                            ) : null}
                          </div>
                          <p className="text-sm text-gray-500 truncate">{product.description}</p>
                          <div className="flex items-center gap-3 mt-1.5 flex-wrap">
                            <span className="text-sm font-bold text-emerald-600">{'$' + product.price}</span>
                            <Badge variant="outline" className="text-xs">
                              {product.category === 'ebook' ? 'كتاب PDF' : 'برنامج'}
                            </Badge>
                            {product.fileSize > 0 && (
                              <span className="text-xs text-gray-400">
                                {formatFileSize(product.fileSize)}
                              </span>
                            )}
                            <span className="text-xs text-gray-400">
                              {(product.features || []).length} مميزة
                            </span>
                          </div>
                        </div>
                        <div className="flex items-center gap-1 shrink-0">
                          <Button size="icon" variant="ghost" className="h-8 w-8" onClick={() => toggleActive(product)} title={product.isActive ? 'إخفاء' : 'تفعيل'}>
                            {product.isActive ? <Eye className="h-4 w-4 text-emerald-600" /> : <EyeOff className="h-4 w-4 text-gray-400" />}
                          </Button>
                          <Button size="icon" variant="ghost" className="h-8 w-8" onClick={() => openEditDialog(product)} title="تعديل">
                            <Pencil className="h-4 w-4 text-blue-600" />
                          </Button>
                          <Button size="icon" variant="ghost" className="h-8 w-8" onClick={() => openDeleteDialog(product)} title="حذف">
                            <Trash2 className="h-4 w-4 text-red-500" />
                          </Button>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                </motion.div>
              ))}
            </AnimatePresence>
          </div>
        )}
      </TabsContent>
    );
  }

  function renderForm() {
    const categories = [
      { value: 'ebook', label: 'كتاب إلكتروني' },
      { value: 'software', label: 'برنامج' },
    ];
    return (
      <Select value={formCategory} onValueChange={setFormCategory}>
        <SelectTrigger className="text-right">
          <SelectValue placeholder="اختر التصنيف" />
        </SelectTrigger>
        <SelectContent>
          {categories.map((cat) => (
            <SelectItem key={cat.value} value={cat.value}>{cat.label}</SelectItem>
          ))}
        </SelectContent>
      </Select>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="bg-white border-b sticky top-0 z-40">
        <div className="container mx-auto px-4 py-4">
          <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3">
            <div className="flex items-center gap-3 w-full sm:w-auto">
              <Button variant="ghost" onClick={onBack} className="text-gray-600 shrink-0">
                <ArrowRight className="ml-2 h-4 w-4" />
                العودة
              </Button>
              <Separator orientation="vertical" className="h-8 hidden sm:block" />
              <div className="flex items-center gap-2 min-w-0">
                <LayoutDashboard className="h-5 w-5 text-emerald-600 shrink-0" />
                <h1 className="text-lg font-bold text-gray-900 truncate">لوحة التحكم</h1>
              </div>
            </div>
            <div className="flex items-center gap-2 w-full sm:w-auto justify-end flex-wrap">
              {user ? (
                <div className="hidden sm:flex items-center gap-2 text-sm text-gray-500">
                  <User className="h-4 w-4" />
                  <span>{user.name}</span>
                  <span className="text-gray-300">|</span>
                  <span className="text-xs truncate max-w-[120px]">{user.email}</span>
                </div>
              ) : null}
              <Button variant="outline" size="sm" onClick={fetchProducts} className="border-gray-200">
                <RefreshCw className={'ml-1 h-4 w-4 ' + (loading ? 'animate-spin' : '')} />
                <span className="hidden sm:inline">تحديث</span>
              </Button>
              <Button variant="ghost" size="sm" onClick={handleLogout} className="text-red-500 hover:text-red-600 hover:bg-red-50">
                <LogOut className="h-4 w-4 sm:ml-1" />
                <span className="hidden sm:inline">تسجيل الخروج</span>
              </Button>
              <Button onClick={openAddDialog} className="bg-emerald-600 hover:bg-emerald-700 text-white" size="sm">
                <Plus className="h-4 w-4 sm:ml-1" />
                <span className="hidden sm:inline">إضافة منتج</span>
              </Button>
            </div>
          </div>
        </div>
      </div>

      <div className="container mx-auto px-4 py-6">
        <div className="grid gap-4 sm:grid-cols-4 mb-6">
          {[
            { label: 'إجمالي المنتجات', value: products.length, icon: Package, color: 'bg-emerald-100 text-emerald-600' },
            { label: 'منتجات نشطة', value: activeProducts.length, icon: Eye, color: 'bg-blue-100 text-blue-600' },
            { label: 'كتب إلكترونية', value: products.filter((p) => p.category === 'ebook').length, icon: BookOpen, color: 'bg-amber-100 text-amber-600' },
            { label: 'برمجيات', value: products.filter((p) => p.category === 'software').length, icon: Monitor, color: 'bg-purple-100 text-purple-600' },
          ].map((stat, i) => (
            <Card key={i} className="border-gray-100">
              <CardContent className="p-4 flex items-center gap-3">
                <div className={'h-10 w-10 rounded-lg flex items-center justify-center ' + stat.color}>
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

        <Tabs defaultValue="active">
          <TabsList className="mb-4 bg-white border">
            <TabsTrigger value="active">النشطة ({activeProducts.length})</TabsTrigger>
            <TabsTrigger value="inactive">المختفية ({inactiveProducts.length})</TabsTrigger>
            <TabsTrigger value="all">الكل ({products.length})</TabsTrigger>
          </TabsList>
          {['active', 'inactive', 'all'].map((tab) => renderTab(tab))}
        </Tabs>
      </div>

      <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
        <DialogContent className="sm:max-w-lg max-h-[90dvh] overflow-y-auto" dir="rtl">
          <DialogHeader>
            <DialogTitle>{editingProduct ? 'تعديل المنتج' : 'إضافة منتج جديد'}</DialogTitle>
          </DialogHeader>
          <div className="space-y-4 py-2">
            <div>
              <Label>اسم المنتج</Label>
              <Input value={formName} onChange={(e) => setFormName(e.target.value)} placeholder="أدخل اسم المنتج" className="text-right" />
            </div>
            <div>
              <Label>الوصف المختصر</Label>
              <Input value={formDesc} onChange={(e) => setFormDesc(e.target.value)} placeholder="وصف مختصر للمنتج" className="text-right" />
            </div>
            <div>
              <Label>الوصف الطويل</Label>
              <Textarea value={formLongDesc} onChange={(e) => setFormLongDesc(e.target.value)} placeholder="وصف تفصيلي للمنتج (اختياري)" className="text-right" rows={4} />
            </div>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <Label>السعر</Label>
                <Input type="number" value={formPrice} onChange={(e) => setFormPrice(e.target.value)} placeholder="0.00" className="text-right" />
              </div>
              <div>
                <Label>التصنيف</Label>
                {renderForm()}
              </div>
            </div>
            <div>
              <Label>الشارة (Badge)</Label>
              <Input value={formBadge} onChange={(e) => setFormBadge(e.target.value)} placeholder="مثل: الأكثر مبيعاً" className="text-right" />
            </div>
            <div>
              <Label>رابط الصورة</Label>
              <Input value={formImage} onChange={(e) => setFormImage(e.target.value)} placeholder="URL الصورة (اختياري)" className="text-right" />
            </div>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <Label>رابط الملف</Label>
                <Input value={formFileUrl} onChange={(e) => setFormFileUrl(e.target.value)} placeholder="/downloads/file.pdf أو رابط خارجي" className="text-right" />
                <p className="text-xs text-gray-400 mt-1">يُستخدم لإنشاء رابط تحميل تلقائي بعد الدفع</p>
              </div>
              <div>
                <Label>حجم الملف (بايت)</Label>
                <Input type="number" value={formFileSize} onChange={(e) => setFormFileSize(e.target.value)} placeholder="0" className="text-right" />
                <p className="text-xs text-gray-400 mt-1">1048576 = 1MB</p>
              </div>
            </div>
            <div>
              <Label>الميزات (ميزة في كل سطر)</Label>
              <Textarea value={formFeatures} onChange={(e) => setFormFeatures(e.target.value)} placeholder={'إدارة حجوزات الغرف بشكل ذكي\nنظام فوترة ومحاسبة متكامل\nدعم كامل للغة العربية'} className="text-right resize-none font-mono text-sm" rows={5} />
              <p className="text-xs text-gray-400">اكتب كل ميزة في سطر منفصل</p>
            </div>
          </div>
          <DialogFooter className="gap-2 sm:gap-0">
            <Button variant="outline" onClick={() => setDialogOpen(false)}>
              <X className="ml-1 h-4 w-4" />
              إلغاء
            </Button>
            <Button onClick={handleSave} className="bg-emerald-600 hover:bg-emerald-700 text-white">
              <Save className="ml-1 h-4 w-4" />
              {editingProduct ? 'تحديث المنتج' : 'إضافة المنتج'}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      <AlertDialog open={deleteDialogOpen} onOpenChange={setDeleteDialogOpen}>
        <AlertDialogContent dir="rtl">
          <AlertDialogHeader>
            <AlertDialogTitle>هل أنت متأكد من حذف هذا المنتج؟</AlertDialogTitle>
            <AlertDialogDescription>
              {'سيتم حذف المنتج (' + (productToDelete?.name || '') + ') نهائياً. هذا الإجراء لا يمكن التراجع عنه.'}
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter className="gap-2 sm:gap-0">
            <AlertDialogCancel>إلغاء</AlertDialogCancel>
            <AlertDialogAction onClick={handleDelete} className="bg-red-600 hover:bg-red-700 text-white">
              <Trash2 className="ml-1 h-4 w-4" />
              حذف نهائي
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
}
