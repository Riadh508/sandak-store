'use client';

import { useStore, type Product } from '@/lib/store';
import { Card, CardContent, CardFooter } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { ShoppingCart, Eye, BookOpen, Monitor, Star } from 'lucide-react';
import { Skeleton } from '@/components/ui/skeleton';
import { motion } from 'framer-motion';
import { toast } from 'sonner';

const categoryColors = {
  ebook: {
    gradient: 'from-blue-500 to-indigo-600',
    bg: 'bg-blue-50',
    text: 'text-blue-700',
    border: 'border-blue-200',
  },
  software: {
    gradient: 'from-emerald-500 to-teal-600',
    bg: 'bg-emerald-50',
    text: 'text-emerald-700',
    border: 'border-emerald-200',
  },
};

const categoryIcons = {
  ebook: BookOpen,
  software: Monitor,
};

export function ProductCard({ product, index }: { product: Product; index: number }) {
  const { addToCart, setSelectedProduct, setCartOpen } = useStore();
  const colors = categoryColors[product.category];
  const Icon = categoryIcons[product.category];

  const handleAddToCart = () => {
    addToCart(product);
    toast.success(`تمت إضافة "${product.name}" إلى السلة`, { duration: 2500 });
  };

  const handleViewDetails = () => {
    setSelectedProduct(product);
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.4, delay: index * 0.08 }}
    >
      <Card className="group overflow-hidden border border-gray-100 bg-white transition-all duration-300 hover:shadow-xl hover:shadow-emerald-100/50 hover:-translate-y-1 h-full flex flex-col">
        {/* Image Area */}
        <div className="relative h-52 overflow-hidden bg-gray-100">
          {product.image ? (
            <img
              src={product.image}
              alt={product.name}
              className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-105"
            />
          ) : (
            <div className={`h-full bg-gradient-to-br ${colors.gradient} flex items-center justify-center`}>
              <Icon className="h-12 w-12 text-white/60" />
            </div>
          )}

          {/* Badge */}
          {product.badge && (
            <Badge className="absolute top-3 right-3 bg-white/90 text-gray-800 hover:bg-white shadow-sm">
              {product.badge}
            </Badge>
          )}

          {/* Category badge */}
          <Badge className={`absolute top-3 left-3 ${colors.bg} ${colors.text} border ${colors.border}`}>
            {product.category === 'ebook' ? 'كتاب' : 'برنامج'}
          </Badge>
        </div>

        {/* Content */}
        <CardContent className="p-5 flex-1 flex flex-col">
          <h3 className="mb-2 text-lg font-bold text-gray-900 line-clamp-1">
            {product.name}
          </h3>
          <p className="mb-4 text-sm text-gray-500 line-clamp-2 leading-relaxed flex-1">
            {product.description}
          </p>

          {/* Rating */}
          <div className="flex items-center gap-1 mb-3">
            {[...Array(5)].map((_, i) => (
              <Star key={i} className="h-3.5 w-3.5 fill-amber-400 text-amber-400" />
            ))}
            <span className="text-xs text-gray-400 mr-1">(4.9)</span>
          </div>

          {/* Features preview */}
          <div className="flex flex-wrap gap-1.5">
            {(product.features || []).slice(0, 3).map((f, i) => (
              <span key={i} className="rounded-full bg-gray-50 px-2.5 py-0.5 text-[11px] text-gray-500 border border-gray-100 line-clamp-1 max-w-[180px]">
                {f}
              </span>
            ))}
            {(product.features || []).length > 3 && (
              <span className="rounded-full bg-emerald-50 px-2.5 py-0.5 text-[11px] text-emerald-700 border border-emerald-100 font-medium">
                +{(product.features || []).length - 3} ميزة أخرى
              </span>
            )}
          </div>
        </CardContent>

        {/* Footer */}
        <CardFooter className="px-5 pb-5 pt-0 flex items-center justify-between gap-3">
          <div>
            <div className="text-2xl font-extrabold text-emerald-600">
              {"$"}{product.price}
            </div>
            {product.category === 'software' && (
              <div className="text-[11px] text-gray-400">دفعة واحدة</div>
            )}
          </div>
          <div className="flex gap-2">
            <Button
              size="sm"
              variant="outline"
              onClick={handleViewDetails}
              className="border-emerald-200 text-emerald-700 hover:bg-emerald-50"
            >
              <Eye className="ml-1 h-4 w-4" />
              التفاصيل
            </Button>
            <Button
              size="sm"
              onClick={handleAddToCart}
              className="bg-emerald-600 hover:bg-emerald-700 text-white shadow-sm"
            >
              <ShoppingCart className="ml-1 h-4 w-4" />
              أضف للسلة
            </Button>
          </div>
        </CardFooter>
      </Card>
    </motion.div>
  );
}

export function ProductCardSkeleton() {
  return (
    <Card className="overflow-hidden border border-gray-100 h-full flex flex-col">
      <Skeleton className="h-52 w-full" />
      <CardContent className="p-5 flex-1 flex flex-col gap-3">
        <Skeleton className="h-6 w-3/4" />
        <Skeleton className="h-4 w-full" />
        <Skeleton className="h-4 w-2/3" />
        <div className="flex gap-2">
          <Skeleton className="h-6 w-16 rounded-full" />
          <Skeleton className="h-6 w-20 rounded-full" />
          <Skeleton className="h-6 w-14 rounded-full" />
        </div>
      </CardContent>
      <CardFooter className="px-5 pb-5 pt-0 flex items-center justify-between">
        <Skeleton className="h-8 w-16" />
        <div className="flex gap-2">
          <Skeleton className="h-9 w-20" />
          <Skeleton className="h-9 w-24" />
        </div>
      </CardFooter>
    </Card>
  );
}
