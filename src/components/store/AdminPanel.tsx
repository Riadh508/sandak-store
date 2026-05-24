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
  Users,
  ShoppingCart,
  FileText,
} from 'lucide-react';
import { toast } from 'sonner';
import { motion, AnimatePresence } from 'framer-motion';

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
  downloadUrl: string;
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

  // Form state
  const [formName, setFormName] = useState('');
  const [formDesc, setFormDesc] = useState('');
  const [formLongDesc, setFormLongDesc] = useState('');
  const [formPrice, setFormPrice] = useState('');
  const [formCategory, setFormCategory] = useState('ebook');
  const [formBadge, setFormBadge] = useState('');
  const [formFeatures, setFormFeatures] = useState('');
  const [formActive, setFormActive] = useState(true);
  const [formImage, setFormImage] = useState('');
  const [formDownloadUrl, setFormDownloadUrl] = useState('');

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
    fetch('/api/products/seed', { method: 'POST', headers: adminHeaders() }).then(r => r.json()).then(data => {
      if (data.success && data.data?.count === 0) {
        fetchProducts();
      }
    });
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
    setFormDownloadUrl('');
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
    setFormDownloadUrl(product.downloadUrl || '');
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
      downloadUrl: formDownloadUrl.trim(),
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
      const res = await fetch(`/api/products?id=${productToDelete.id}`, {
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

  const activeProducts = products.filter((p) => p.isActive);
  const inactiveProducts = products.filter((p) => !p.isActive);

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <div className="bg-white border-b sticky top-0 z-40">
        <div className="container mx-auto px-4 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <Button variant="ghost" onClick={onBack} className="text-gray-600">
                <ArrowRight className="ml-2 h-4 w-4" />
                العودة للمتجر
              </Button>
              <Separator orientation="vertical" className="h-8" />
              <div className="flex items-center gap-2">
                <LayoutDashboard className="h-5 w-5 text-emerald-600" />
                <h1 className="text-lg font-bold text-gray-900">لوحة التحكم</h1>
              </div>
            </div>
            <div className="flex items-center gap-3">
              {user && (
                <div className="flex items-center gap-2 text-sm text-gray-500">
                  <User className="h-4 w-4" />
                  <span>{user.name}</span>
                  <span className="text-gray-300">|</span>
                  <span className="text-xs">{user.email}</span>
                </div>
              )}
            <div className="flex items-center gap-2">
              <Button
                variant="outline"
                size="sm"
                onClick={fetchProducts}
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
              <Button
                onClick={openAddDialog}
                className="bg-emerald-600 hover:bg-emerald-700 text-white"
                size="sm"
              >
                <Plus className="ml-1 h-4 w-4" />
                إضافة منتج جديد
              </Button>
            </div>
          </div>
        </div>
      </div>

      {/* Stats */}
      <div className="container mx-auto px-4 py-6">
        <div className="grid gap-4 sm:grid-cols-4 mb-6">
          {[
            { label: 'إجمالي المنتجات', value: products.length, icon: Package, color: 'bg-emerald-100 text-emerald-600' },
            { label: 'منتجات نشطة', value: activeProducts.length, icon: Eye, color: 'bg-blue-100 text-blue-600' },
            { label: 'كتب إلكترونية', value: products.filter(p => p.category === 'ebook').length, icon: BookOpen, color: 'bg-amber-100 text-amber-600' },
            { label: 'برمجيات', value: products.filter(p => p.category === 'software').length, icon: Monitor, color: 'bg-purple-100 text-purple-600' },
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

        {/* Products List */}
        <Tabs defaultValue="active">
          <TabsList className="mb-4 bg-white border">
            <TabsTrigger value="active">
              النشطة ({activeProducts.length})
            </TabsTrigger>
            <TabsTrigger value="inactive">
              المختفية ({inactiveProducts.length})
            </TabsTrigger>
            <TabsTrigger value="all">
              الكل ({products.length})
            </TabsTrigger>
          </TabsList>

          {['active', 'inactive', 'all'].map((tab) => {
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
                          <Card className={`border ${product.isActive ? 'border-gray-100' : 'border-gray-200 bg-gray-50/50'}`}>
                            <CardContent className="p-4">
                              <div className="flex items-center gap-4">
                                {/* Category Icon */}
                                <div className={`h-14 w-14 rounded-xl flex items-center justify-center shrink-0 ${
                                  product.category === 'ebook'
                                    ? 'bg-gradient-to-br from-blue-500 to-indigo-600'
                                    : 'bg-gradient-to-br from-emerald-500 to-teal-600'
                                }`}>
                                  {product.category === 'ebook' ? (
                                    <BookOpen className="h-6 w-6 text-white" />
                                  ) : (
                                    <Monitor className="h-6 w-6 text-white" />
                                  )}
                                </div>

                                {/* Info */}
                                <div className="flex-1 min-w-0">
                                  <div className="flex items-center gap-2 mb-1">
                                    <h3 className="font-semibold text-gray-900 truncate">{product.name}</h3>
                                    {product.badge && (
                                      <Badge variant="outline" className="text-xs shrink-0">{product.badge}</Badge>
                                    )}
                                    {!product.isActive && (
                                      <Badge variant="secondary" className="text-xs shrink-0 bg-gray-200 text-gray-500">مخفي</Badge>
                                    )}
                                  </div>
                                  <p className="text-sm text-gray-500 truncate">{product.description}</p>
                                  <div className="flex items-center gap-3 mt-1.5">
                                    <span className="text-sm font-bold text-emerald-600">{"$"}{product.price}</span>
                                    <Badge variant="outline" className="text-xs">
                                      {product.category === 'ebook' ? 'كتاب PDF' : 'برنامج'}
                                    </Badge>
                                    <span className="text-xs text-gray-400">
                                      {(product.features || []).length} مميزة
                                    </span>
                                  </div>
                                </div>

                                {/* Actions */}
                                <div className="flex items-center gap-1 shrink-0">
                                  <Button
                                    size="icon"
                                    variant="ghost"
                                    className="h-8 w-8"
                                    onClick={() => toggleActive(product)}
                                    title={product.isActive ? 'إخفاء' : 'تفعيل'}
                                  >
                                    {product.isActive ? (
                                      <Eye className="h-4 w-4 text-emerald-600" />
                                    ) : (
                                      <EyeOff className="h-4 w-4 text-gray-400" />
                                    )}
                                  </Button>
                                  <Button
                                    size="icon"
                                    variant="ghost"
                                    className="h-8 w-8"
                                    onClick={() => openEditDialog(product)}
                                  >
                                    <Pencil className="h-4 w-4 text-blue-600" />
                                  </Button>
                                  <Button
                                    size="icon"
                                    variant="ghost"
                                    className="h-8 w-8"
                                    onClick={() => openDeleteDialog(product)}
                                  >
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
          })}
        </Tabs>
      </div>

      {/* Add/Edit Product Dialog */}
      <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
        <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto" dir="rtl">
          <DialogHeader>
            <DialogTitle className="text-right">
              {editingProduct ? 'تعديل المنتج' : 'إضافة منتج جديد'}
            </DialogTitle>
          </DialogHeader>

          <div className="space-y-4 py-4">
            {/* Name */}
            <div className="space-y-2">
              <Label htmlFor="name">اسم المنتج *</Label>
              <Input
                id="name"
                value={formName}
                onChange={(e) => setFormName(e.target.value)}
                placeholder="مثال: كتاب تعلم البرمجة من الصفر"
                className="text-right"
              />
            </div>

            {/* Description */}
            <div className="space-y-2">
              <Label htmlFor="desc">الوصف المختصر *</Label>
              <Textarea
                id="desc"
                value={formDesc}
                onChange={(e) => setFormDesc(e.target.value)}
                placeholder="وصف مختصر يظهر في بطاقة المنتج"
                className="text-right resize-none"
                rows={2}
              />
            </div>

            {/* Long Description */}
            <div className="space-y-2">
              <Label htmlFor="longDesc">الوصف التفصيلي</Label>
              <Textarea
                id="longDesc"
                value={formLongDesc}
                onChange={(e) => setFormLongDesc(e.target.value)}
                placeholder="وصف تفصيلي يظهر في صفحة تفاصيل المنتج"
                className="text-right resize-none"
                rows={4}
              />
            </div>

            {/* Price + Category */}
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="price">السعر (دولار) *</Label>
                <Input
                  id="price"
                  type="number"
                  min="0"
                  step="0.01"
                  value={formPrice}
                  onChange={(e) => setFormPrice(e.target.value)}
                  placeholder="0.00"
                  className="text-left"
                  dir="ltr"
                />
              </div>
              <div className="space-y-2">
                <Label>الفئة *</Label>
                <Select value={formCategory} onValueChange={setFormCategory}>
                  <SelectTrigger className="text-right">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="ebook">كتاب إلكتروني PDF</SelectItem>
                    <SelectItem value="software">برنامج / نظام</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>

            {/* Badge */}
            <div className="space-y-2">
              <Label htmlFor="badge">شارة المنتج (اختياري)</Label>
              <Input
                id="badge"
                value={formBadge}
                onChange={(e) => setFormBadge(e.target.value)}
                placeholder="مثال: الأكثر مبيعاً، جديد، مميز"
                className="text-right"
              />
            </div>

            {/* Image URL */}
            <div className="space-y-2">
              <Label htmlFor="image">رابط الصورة (اختياري)</Label>
              <Input
                id="image"
                value={formImage}
                onChange={(e) => setFormImage(e.target.value)}
                placeholder="https://example.com/image.jpg"
                className="text-left"
                dir="ltr"
              />
            </div>

            {/* Download URL */}
            <div className="space-y-2">
              <Label htmlFor="downloadUrl">رابط التحميل (للمنتجات فقط)</Label>
              <Input
                id="downloadUrl"
                value={formDownloadUrl}
                onChange={(e) => setFormDownloadUrl(e.target.value)}
                placeholder="/downloads/HotelSystem_v2.1.0_Setup.exe"
                className="text-left"
                dir="ltr"
              />
            </div>

            {/* Features */}
            <div className="space-y-2">
              <Label htmlFor="features">المميزات (ميزة واحدة في كل سطر)</Label>
              <Textarea
                id="features"
                value={formFeatures}
                onChange={(e) => setFormFeatures(e.target.value)}
                placeholder={"إدارة حجوزات الغرف بشكل ذكي\nنظام فوترة ومحاسبة متكامل\nدعم كامل للغة العربية"}
                className="text-right resize-none font-mono text-sm"
                rows={5}
              />
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

      {/* Delete Confirmation Dialog */}
      <AlertDialog open={deleteDialogOpen} onOpenChange={setDeleteDialogOpen}>
        <AlertDialogContent dir="rtl">
          <AlertDialogHeader>
            <AlertDialogTitle>هل أنت متأكد من حذف هذا المنتج؟</AlertDialogTitle>
            <AlertDialogDescription>
              سيتم حذف المنتج &quot;{productToDelete?.name}&quot; نهائياً. هذا الإجراء لا يمكن التراجع عنه.
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
