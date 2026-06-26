'use client';

import { useStore } from '@/lib/store';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Separator } from '@/components/ui/separator';
import { ShoppingCart, BookOpen, Monitor, Check, Star, ArrowLeft } from 'lucide-react';
import { motion } from 'framer-motion';

const categoryLabels = {
  ebook: { label: 'كتاب إلكتروني PDF', icon: BookOpen, color: 'text-blue-600', bg: 'bg-blue-50' },
  software: { label: 'برنامج', icon: Monitor, color: 'text-emerald-600', bg: 'bg-emerald-50' },
};

function linkify(text: string) {
  const urlRegex = /(https?:\/\/[^\s]+)/g;
  return text.split(urlRegex).map((part, i) =>
    urlRegex.test(part)
      ? <a key={i} href={part} target="_blank" rel="noopener noreferrer" className="text-blue-600 underline hover:text-blue-800" onClick={e => e.stopPropagation()}>{part}</a>
      : part
  );
}

export function ProductDetailDialog() {
  const { selectedProduct, setSelectedProduct, addToCart, setCartOpen, setCurrentView } = useStore();

  if (!selectedProduct) return null;

  const cat = categoryLabels[selectedProduct.category];
  const Icon = cat.icon;

  const handleAddToCart = () => {
    addToCart(selectedProduct);
    setSelectedProduct(null);
    setCartOpen(true);
  };

  const handleGoToCheckout = () => {
    addToCart(selectedProduct);
    setSelectedProduct(null);
    setCurrentView('checkout');
  };

  const gradients: Record<string, string> = {
    ebook: 'from-blue-500 to-indigo-600',
    software: 'from-emerald-500 to-teal-600',
  };

  return (
    <Dialog open={!!selectedProduct} onOpenChange={(open) => !open && setSelectedProduct(null)}>
      <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto p-0">
        {/* Header Image */}
        <div className="relative h-56 overflow-hidden bg-gray-100 rounded-t-xl">
          {selectedProduct.image ? (
            <img
              src={selectedProduct.image}
              alt={selectedProduct.name}
              className="w-full h-full object-cover"
            />
          ) : (
            <div className={`h-full bg-gradient-to-br ${gradients[selectedProduct.category]} flex items-center justify-center`}>
              <div className="h-20 w-20 rounded-2xl bg-white/20 backdrop-blur-sm flex items-center justify-center">
                <Icon className="h-10 w-10 text-white" />
              </div>
            </div>
          )}
          {selectedProduct.badge && (
            <Badge className="absolute top-4 right-4 bg-white/90 text-gray-800 hover:bg-white shadow-sm text-sm px-3">
              {selectedProduct.badge}
            </Badge>
          )}
        </div>

        <div className="p-6">
          {/* Category + Rating */}
          <div className="flex items-center justify-between mb-3">
            <Badge className={`${cat.bg} ${cat.color} border-0 px-3`}>
              {cat.label}
            </Badge>
            <div className="flex items-center gap-1">
              {[...Array(5)].map((_, i) => (
                <Star key={i} className="h-4 w-4 fill-amber-400 text-amber-400" />
              ))}
              <span className="text-sm text-gray-500 mr-1">(4.9)</span>
            </div>
          </div>

          {/* Title */}
          <DialogHeader className="mb-3">
            <DialogTitle className="text-2xl font-extrabold text-gray-900 text-right">
              {selectedProduct.name}
            </DialogTitle>
          </DialogHeader>

          {/* Price */}
          <div className="mb-4">
            <span className="text-3xl font-extrabold text-emerald-600">{"$"}{selectedProduct.price}</span>
            {selectedProduct.priceLabel && (
              <span className="text-sm text-gray-400 mr-2">{selectedProduct.priceLabel}</span>
            )}
          </div>

          <Separator className="mb-4" />

          {/* Description */}
          <div className="mb-5">
            <h4 className="text-sm font-bold text-gray-700 mb-2">الوصف</h4>
            <p className="text-gray-600 leading-relaxed text-sm">
              {linkify(selectedProduct.longDescription)}
            </p>
          </div>

          {/* Features */}
          <div className="mb-6">
            <h4 className="text-sm font-bold text-gray-700 mb-3">المميزات</h4>
            <div className="grid gap-2 sm:grid-cols-2">
              {selectedProduct.features.map((feature, i) => (
                  <div key={i} className="flex items-start gap-2 rounded-lg bg-gray-50 p-2.5">
                    <div className="mt-0.5 flex h-5 w-5 shrink-0 items-center justify-center rounded-full bg-emerald-100">
                      <Check className="h-3 w-3 text-emerald-600" />
                    </div>
                    <span className="text-sm text-gray-700">{linkify(feature)}</span>
                  </div>
              ))}
            </div>
          </div>

          {/* Actions */}
          <div className="flex flex-col sm:flex-row gap-3">
            <Button
              onClick={handleAddToCart}
              className="flex-1 bg-emerald-600 hover:bg-emerald-700 text-white shadow-lg shadow-emerald-200"
              size="lg"
            >
              <ShoppingCart className="ml-2 h-5 w-5" />
              أضف إلى السلة
            </Button>
            <Button
              onClick={handleGoToCheckout}
              variant="outline"
              className="flex-1 border-emerald-300 text-emerald-700 hover:bg-emerald-50"
              size="lg"
            >
              اشتري الآن
              <ArrowLeft className="mr-2 h-4 w-4" />
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}
