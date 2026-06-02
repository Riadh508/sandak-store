'use client';

import { useStore } from '@/lib/store';
import { Sheet, SheetContent, SheetHeader, SheetTitle } from '@/components/ui/sheet';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Minus, Plus, Trash2, ShoppingBag, ArrowLeft } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';

export function CartDrawer() {
  const {
    cart, cartOpen, setCartOpen, removeFromCart, updateQuantity,
    getCartTotal, getCartCount, setCurrentView,
  } = useStore();

  const total = getCartTotal();
  const count = getCartCount();

  const handleCheckout = () => {
    setCartOpen(false);
    setCurrentView('checkout');
  };

  function iconBg(category: string): string {
    return category === 'ebook'
      ? 'bg-gradient-to-br from-blue-500 to-indigo-600'
      : 'bg-gradient-to-br from-emerald-500 to-teal-600';
  }

  return (
    <Sheet open={cartOpen} onOpenChange={setCartOpen}>
      <SheetContent side="left" className="w-full sm:max-w-md flex flex-col p-0">
        <SheetHeader className="p-6 pb-4 border-b">
          <SheetTitle className="flex items-center justify-between text-right">
            <div className="flex items-center gap-2">
              <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-emerald-100">
                <ShoppingBag className="h-4 w-4 text-emerald-600" />
              </div>
              <span>سلة المشتريات</span>
            </div>
            <Badge variant="secondary" className="bg-emerald-100 text-emerald-700">
              {count} منتج
            </Badge>
          </SheetTitle>
        </SheetHeader>

        <ScrollArea className="flex-1">
          {cart.length === 0 && (
            <div className="flex flex-col items-center justify-center py-16 text-center px-6">
              <div className="h-20 w-20 rounded-full bg-gray-100 flex items-center justify-center mb-4">
                <ShoppingBag className="h-8 w-8 text-gray-400" />
              </div>
              <p className="text-gray-500 font-medium mb-1">السلة فارغة</p>
              <p className="text-gray-400 text-sm">لم تضف أي منتجات بعد</p>
            </div>
          )}
          {cart.length > 0 && (
            <div className="p-4 space-y-3">
              <AnimatePresence mode="popLayout">
                {cart.map((item: { product: { id: string; name: string; price: number; category: string; image?: string }; quantity: number }) => (
                  <motion.div
                    key={item.product.id}
                    layout
                    initial={{ opacity: 0, x: -20 }}
                    animate={{ opacity: 1, x: 0 }}
                    exit={{ opacity: 0, x: -20, height: 0 }}
                    transition={{ duration: 0.2 }}
                    className="rounded-xl border border-gray-100 bg-white p-4 shadow-sm"
                  >
                    <div className="flex gap-3">
                      <div className={"h-14 w-14 rounded-xl flex items-center justify-center shrink-0 overflow-hidden " + iconBg(item.product.category)}>
                        {item.product.image ? (
                          <img src={item.product.image} alt={item.product.name} className="w-full h-full object-cover" />
                        ) : (
                          <ShoppingBag className="h-6 w-6 text-white" />
                        )}
                      </div>
                      <div className="flex-1 min-w-0">
                        <h4 className="text-sm font-semibold text-gray-900 truncate">{item.product.name}</h4>
                        <p className="text-xs text-gray-400 mt-0.5">
                          {item.product.category === 'ebook' ? 'كتاب إلكتروني PDF' : 'برنامج'}
                        </p>
                        <div className="flex items-center justify-between mt-2">
                          <span className="text-sm font-bold text-emerald-600">{'$' + (item.product.price * item.quantity).toString()}</span>
                          <div className="flex items-center gap-1">
                            <Button size="icon" variant="outline" className="h-7 w-7" onClick={() => updateQuantity(item.product.id, item.quantity - 1)}><Minus className="h-3 w-3" /></Button>
                            <span className="w-8 text-center text-sm font-medium">{item.quantity}</span>
                            <Button size="icon" variant="outline" className="h-7 w-7" onClick={() => updateQuantity(item.product.id, item.quantity + 1)}><Plus className="h-3 w-3" /></Button>
                          </div>
                        </div>
                      </div>
                      <Button size="icon" variant="ghost" className="h-8 w-8 text-gray-400 hover:text-red-500 shrink-0" onClick={() => removeFromCart(item.product.id)}><Trash2 className="h-4 w-4" /></Button>
                    </div>
                  </motion.div>
                ))}
              </AnimatePresence>
            </div>
          )}
        </ScrollArea>

        {cart.length > 0 && (
          <div>
            <div className="border-t p-4 space-y-3 bg-gray-50/50">
              <div className="flex items-center justify-between">
                <span className="text-gray-600 font-medium">المجموع الفرعي</span>
                <span className="font-bold text-gray-900">{'$' + total}</span>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-gray-600 font-medium">الضريبة</span>
                <span className="text-gray-600">شاملة</span>
              </div>
            </div>
            <div className="border-t pt-4">
              <div className="flex items-center justify-between mb-4">
                <span className="text-base font-bold text-gray-900">المجموع:</span>
                <span className="text-xl font-extrabold text-emerald-600">{'$' + total}</span>
              </div>
              <Button onClick={handleCheckout} className="w-full bg-emerald-600 hover:bg-emerald-700 text-white shadow-lg shadow-emerald-200 h-12 text-base">
                إتمام الشراء
                <ArrowLeft className="mr-2 h-5 w-5" />
              </Button>
            </div>
          </div>
        )}
      </SheetContent>
    </Sheet>
  );
}
