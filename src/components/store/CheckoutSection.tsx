'use client';

import { useStore, paymentInfo, type PaymentMethod } from '@/lib/store';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Separator } from '@/components/ui/separator';
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group';
import { Label } from '@/components/ui/label';
import {
  ArrowRight,
  Wallet,
  Building2,
  CheckCircle2,
  Copy,
  Check,
  ShoppingBag,
  Shield,
} from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { useState } from 'react';
import { toast } from 'sonner';

export function CheckoutSection() {
  const {
    cart,
    getCartTotal,
    paymentMethod,
    setPaymentMethod,
    setCurrentView,
    clearCart,
  } = useStore();
  const [copiedField, setCopiedField] = useState<string | null>(null);
  const [orderPlaced, setOrderPlaced] = useState(false);

  const total = getCartTotal();

  const copyToClipboard = (text: string, field: string) => {
    navigator.clipboard.writeText(text);
    setCopiedField(field);
    toast.success('تم النسخ بنجاح');
    setTimeout(() => setCopiedField(null), 2000);
  };

  const handlePlaceOrder = () => {
    if (!paymentMethod) {
      toast.error('يرجى اختيار طريقة الدفع');
      return;
    }
    setOrderPlaced(true);
    clearCart();
  };

  if (orderPlaced) {
    return (
      <section className="py-12 md:py-20">
        <div className="container mx-auto px-4 max-w-lg">
          <motion.div
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            className="text-center"
          >
            <div className="mx-auto mb-6 h-20 w-20 rounded-full bg-emerald-100 flex items-center justify-center">
              <CheckCircle2 className="h-10 w-10 text-emerald-600" />
            </div>
            <h2 className="mb-3 text-2xl font-extrabold text-gray-900">تم تأكيد طلبك!</h2>
            <p className="mb-6 text-gray-500">
              شكراً لطلبك من متجر سندك. يرجى إتمام عملية الدفع وإرسال إيصال التحويل لنا.
            </p>
            <div className="rounded-xl bg-amber-50 border border-amber-200 p-4 mb-6 text-right">
              <h4 className="font-semibold text-amber-800 mb-2">خطوات إتمام الدفع:</h4>
              <ol className="text-sm text-amber-700 space-y-1 list-decimal list-inside">
                <li>قم بالتحويل باستخدام طريقة الدفع المختارة</li>
                <li>احصل على إيصال التحويل (رقم MTCN أو لقطة شاشة)</li>
                <li>أرسل الإيصال عبر الواتساب أو البريد الإلكتروني</li>
                <li>سيتم إرسال المنتج إليك خلال دقائق بعد التأكيد</li>
              </ol>
            </div>
            <Button
              onClick={() => {
                setCurrentView('home');
                setPaymentMethod(null);
              }}
              className="bg-emerald-600 hover:bg-emerald-700 text-white"
              size="lg"
            >
              العودة للرئيسية
            </Button>
          </motion.div>
        </div>
      </section>
    );
  }

  if (cart.length === 0 && !orderPlaced) {
    return (
      <section className="py-12 md:py-20">
        <div className="container mx-auto px-4 max-w-lg text-center">
          <div className="mx-auto mb-6 h-20 w-20 rounded-full bg-gray-100 flex items-center justify-center">
            <ShoppingBag className="h-10 w-10 text-gray-400" />
          </div>
          <h2 className="mb-3 text-2xl font-extrabold text-gray-900">السلة فارغة</h2>
          <p className="mb-6 text-gray-500">أضف منتجات إلى السلة أولاً ثم proceed للدفع</p>
          <Button
            onClick={() => setCurrentView('products')}
            className="bg-emerald-600 hover:bg-emerald-700 text-white"
            size="lg"
          >
            تصفح المنتجات
          </Button>
        </div>
      </section>
    );
  }

  return (
    <section className="py-12 md:py-16 bg-gray-50/50 min-h-screen">
      <div className="container mx-auto px-4 max-w-4xl">
        {/* Back button */}
        <Button
          variant="ghost"
          onClick={() => setCurrentView('products')}
          className="mb-6 text-gray-600 hover:text-emerald-700"
        >
          <ArrowRight className="ml-2 h-4 w-4" />
          العودة للمنتجات
        </Button>

        <h2 className="mb-8 text-2xl font-extrabold text-gray-900 md:text-3xl">
          إتمام الشراء
        </h2>

        <div className="grid gap-6 lg:grid-cols-3">
          {/* Payment Methods */}
          <div className="lg:col-span-2 space-y-6">
            {/* Step 1: Choose payment */}
            <Card className="border-gray-100 shadow-sm">
              <CardHeader>
                <CardTitle className="flex items-center gap-2 text-right">
                  <Badge className="bg-emerald-100 text-emerald-700 border-0">الخطوة 1</Badge>
                  اختر طريقة الدفع
                </CardTitle>
              </CardHeader>
              <CardContent>
                <RadioGroup
                  value={paymentMethod || ''}
                  onValueChange={(value) => setPaymentMethod(value as PaymentMethod)}
                  className="space-y-3"
                >
                  {/* Jeib Payment */}
                  <motion.div whileHover={{ scale: 1.01 }} transition={{ duration: 0.2 }}>
                    <Label
                      htmlFor="jeib"
                      className={`flex cursor-pointer items-start gap-4 rounded-xl border-2 p-4 transition-all ${
                        paymentMethod === 'jeib'
                          ? 'border-emerald-500 bg-emerald-50/50'
                          : 'border-gray-200 hover:border-emerald-200 hover:bg-gray-50'
                      }`}
                    >
                      <RadioGroupItem value="jeib" id="jeib" className="mt-1" />
                      <div className="flex-1">
                        <div className="flex items-center gap-2 mb-1">
                          <Wallet className="h-5 w-5 text-emerald-600" />
                          <span className="font-semibold text-gray-900">{paymentInfo.jeib.name}</span>
                        </div>
                        <p className="text-sm text-gray-500">الدفع عبر تطبيق المحفظة على هاتفك</p>
                      </div>
                      <Badge variant="outline" className="text-emerald-600 border-emerald-200 text-xs">
                        سريع
                      </Badge>
                    </Label>
                  </motion.div>

                  {/* Western Union */}
                  <motion.div whileHover={{ scale: 1.01 }} transition={{ duration: 0.2 }}>
                    <Label
                      htmlFor="western-union"
                      className={`flex cursor-pointer items-start gap-4 rounded-xl border-2 p-4 transition-all ${
                        paymentMethod === 'western-union'
                          ? 'border-emerald-500 bg-emerald-50/50'
                          : 'border-gray-200 hover:border-emerald-200 hover:bg-gray-50'
                      }`}
                    >
                      <RadioGroupItem value="western-union" id="western-union" className="mt-1" />
                      <div className="flex-1">
                        <div className="flex items-center gap-2 mb-1">
                          <Building2 className="h-5 w-5 text-emerald-600" />
                          <span className="font-semibold text-gray-900">{paymentInfo.westernUnion.name}</span>
                        </div>
                        <p className="text-sm text-gray-500">التحويل من أي فرع حول العالم</p>
                      </div>
                      <Badge variant="outline" className="text-blue-600 border-blue-200 text-xs">
                        دولي
                      </Badge>
                    </Label>
                  </motion.div>
                </RadioGroup>
              </CardContent>
            </Card>

            {/* Step 2: Payment Details */}
            <AnimatePresence mode="wait">
              {paymentMethod && (
                <motion.div
                  key={paymentMethod}
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -10 }}
                  transition={{ duration: 0.3 }}
                >
                  <Card className="border-gray-100 shadow-sm">
                    <CardHeader>
                      <CardTitle className="flex items-center gap-2 text-right">
                        <Badge className="bg-emerald-100 text-emerald-700 border-0">الخطوة 2</Badge>
                        تفاصيل التحويل
                      </CardTitle>
                    </CardHeader>
                    <CardContent className="space-y-4">
                      {paymentMethod === 'jeib' ? (
                        <div className="space-y-3">
                          <div className="flex items-center justify-between rounded-lg bg-gray-50 p-3 border border-gray-100">
                            <span className="text-sm text-gray-500">رقم المحفظة</span>
                            <div className="flex items-center gap-2">
                              <span className="font-mono font-bold text-gray-900 text-lg" dir="ltr">
                                {paymentInfo.jeib.phone}
                              </span>
                              <Button
                                size="icon"
                                variant="ghost"
                                className="h-8 w-8"
                                onClick={() => copyToClipboard(paymentInfo.jeib.phone, 'phone')}
                              >
                                {copiedField === 'phone' ? (
                                  <Check className="h-4 w-4 text-emerald-600" />
                                ) : (
                                  <Copy className="h-4 w-4 text-gray-400" />
                                )}
                              </Button>
                            </div>
                          </div>
                          <div className="rounded-lg bg-emerald-50 border border-emerald-100 p-4">
                            <h4 className="font-semibold text-emerald-800 mb-2">خطوات الدفع عبر جيب:</h4>
                            <ol className="text-sm text-emerald-700 space-y-2">
                              {paymentInfo.jeib.instructions.map((step, i) => (
                                <li key={i} className="flex items-start gap-2">
                                  <span className="flex h-5 w-5 shrink-0 items-center justify-center rounded-full bg-emerald-200 text-xs font-bold text-emerald-700">
                                    {i + 1}
                                  </span>
                                  {step}
                                </li>
                              ))}
                            </ol>
                          </div>
                        </div>
                      ) : (
                        <div className="space-y-3">
                          <div className="rounded-lg bg-gray-50 p-4 border border-gray-100 space-y-2">
                            <div className="flex items-center justify-between">
                              <span className="text-sm text-gray-500">اسم المستفيد</span>
                              <div className="flex items-center gap-2">
                                <span className="font-semibold text-gray-900" dir="ltr">
                                  {paymentInfo.westernUnion.recipientName}
                                </span>
                                <Button
                                  size="icon"
                                  variant="ghost"
                                  className="h-7 w-7"
                                  onClick={() => copyToClipboard(paymentInfo.westernUnion.recipientName, 'name')}
                                >
                                  {copiedField === 'name' ? (
                                    <Check className="h-3 w-3 text-emerald-600" />
                                  ) : (
                                    <Copy className="h-3 w-3 text-gray-400" />
                                  )}
                                </Button>
                              </div>
                            </div>
                            <Separator />
                            <div className="flex items-center justify-between">
                              <span className="text-sm text-gray-500">المدينة</span>
                              <span className="font-semibold text-gray-900">{paymentInfo.westernUnion.city}</span>
                            </div>
                            <Separator />
                            <div className="flex items-center justify-between">
                              <span className="text-sm text-gray-500">الدولة</span>
                              <span className="font-semibold text-gray-900">{paymentInfo.westernUnion.country}</span>
                            </div>
                          </div>
                          <div className="rounded-lg bg-blue-50 border border-blue-100 p-4">
                            <h4 className="font-semibold text-blue-800 mb-2">خطوات الدفع عبر ويسترن يونين:</h4>
                            <ol className="text-sm text-blue-700 space-y-2">
                              {paymentInfo.westernUnion.instructions.map((step, i) => (
                                <li key={i} className="flex items-start gap-2">
                                  <span className="flex h-5 w-5 shrink-0 items-center justify-center rounded-full bg-blue-200 text-xs font-bold text-blue-700">
                                    {i + 1}
                                  </span>
                                  {step}
                                </li>
                              ))}
                            </ol>
                          </div>
                        </div>
                      )}

                      {/* Amount to transfer */}
                      <div className="rounded-xl bg-gradient-to-l from-emerald-50 to-teal-50 border border-emerald-200 p-4 text-center">
                        <span className="text-sm text-gray-500">المبلغ المطلوب تحويله</span>
                        <div className="text-3xl font-extrabold text-emerald-700">${total}</div>
                      </div>
                    </CardContent>
                  </Card>
                </motion.div>
              )}
            </AnimatePresence>

            {/* Step 3: Confirm */}
            {paymentMethod && (
              <motion.div
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
              >
                <Card className="border-gray-100 shadow-sm">
                  <CardHeader>
                    <CardTitle className="flex items-center gap-2 text-right">
                      <Badge className="bg-emerald-100 text-emerald-700 border-0">الخطوة 3</Badge>
                      تأكيد الطلب
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="rounded-xl bg-amber-50 border border-amber-200 p-4 mb-4">
                      <h4 className="font-semibold text-amber-800 mb-2 text-sm">مهم!</h4>
                      <p className="text-sm text-amber-700 leading-relaxed">
                        بعد الضغط على &quot;تأكيد الطلب&quot;، يرجى إتمام عملية التحويل وإرسال إيصال التحويل عبر الواتساب أو البريد الإلكتروني. سيتم إرسال المنتج إليك فوراً بعد التأكيد من الدفع.
                      </p>
                    </div>
                    <Button
                      onClick={handlePlaceOrder}
                      className="w-full bg-emerald-600 hover:bg-emerald-700 text-white h-12 text-base shadow-lg shadow-emerald-200"
                      size="lg"
                    >
                      <Shield className="ml-2 h-5 w-5" />
                      تأكيد الطلب - ${total}
                    </Button>
                  </CardContent>
                </Card>
              </motion.div>
            )}
          </div>

          {/* Order Summary Sidebar */}
          <div className="lg:col-span-1">
            <Card className="border-gray-100 shadow-sm sticky top-20">
              <CardHeader>
                <CardTitle className="text-right">ملخص الطلب</CardTitle>
              </CardHeader>
              <CardContent className="space-y-3">
                {cart.map((item) => (
                  <div key={item.product.id} className="flex items-center gap-3">
                    <div className={`h-10 w-10 rounded-lg flex items-center justify-center shrink-0 ${
                      item.product.category === 'ebook'
                        ? 'bg-gradient-to-br from-blue-500 to-indigo-600'
                        : 'bg-gradient-to-br from-emerald-500 to-teal-600'
                    }`}>
                      <span className="text-white text-xs font-bold">{item.quantity}x</span>
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="text-sm font-medium text-gray-900 truncate">
                        {item.product.name}
                      </p>
                      <p className="text-xs text-gray-400">{item.quantity} نسخة</p>
                    </div>
                    <span className="text-sm font-semibold text-gray-700">
                      ${item.product.price * item.quantity}
                    </span>
                  </div>
                ))}
                <Separator />
                <div className="flex items-center justify-between">
                  <span className="text-gray-500">المجموع الفرعي</span>
                  <span className="font-semibold">${total}</span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-gray-500">التوصيل</span>
                  <span className="text-sm font-medium text-emerald-600">مجاني</span>
                </div>
                <Separator />
                <div className="flex items-center justify-between">
                  <span className="font-bold text-gray-900">الإجمالي</span>
                  <span className="text-xl font-extrabold text-emerald-600">${total}</span>
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    </section>
  );
}
