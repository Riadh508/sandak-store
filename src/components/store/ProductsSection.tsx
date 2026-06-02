'use client';

import { useStore } from '@/lib/store';
import { ProductCard, ProductCardSkeleton } from './ProductCard';
import { Tabs, TabsList, TabsTrigger } from '@/components/ui/tabs';
import type { ProductCategory } from '@/lib/store';
import { Button } from '@/components/ui/button';
import { RefreshCw } from 'lucide-react';

export function ProductsSection() {
  const { products, productsLoading, productsError, categoryFilter, setCategoryFilter, retryFetchProducts } = useStore();

  const filteredProducts = categoryFilter === 'all'
    ? products
    : products.filter((p) => p.category === categoryFilter);

  return (
    <section className="bg-gray-50/50 py-12 md:py-16">
      <div className="container mx-auto px-4">
        {/* Section Header */}
        <div className="mb-8 text-center">
          <h2 className="mb-3 text-2xl font-extrabold text-gray-900 md:text-3xl">
            منتجاتنا المميزة
          </h2>
          <p className="text-gray-500 max-w-lg mx-auto">
            اكتشف مجموعتنا المتنوعة من الكتب الإلكترونية والبرمجيات الاحترافية المصممة لتطوير مهاراتك
          </p>
        </div>

        {/* Category Filter Tabs */}
        <div className="mb-8 flex justify-center">
          <Tabs
            value={categoryFilter}
            onValueChange={(value) => setCategoryFilter(value as ProductCategory | 'all')}
          >
            <TabsList className="bg-white border border-gray-200 shadow-sm">
              <TabsTrigger value="all" className="data-[state=active]:bg-emerald-600 data-[state=active]:text-white px-5">
                الكل
              </TabsTrigger>
              <TabsTrigger value="ebook" className="data-[state=active]:bg-emerald-600 data-[state=active]:text-white px-5">
                الكتب الإلكترونية
              </TabsTrigger>
              <TabsTrigger value="software" className="data-[state=active]:bg-emerald-600 data-[state=active]:text-white px-5">
                البرمجيات
              </TabsTrigger>
            </TabsList>
          </Tabs>
        </div>

        {/* Error State */}
        {productsError && !productsLoading && (
          <div className="text-center py-12 bg-amber-50 rounded-2xl border border-amber-200 mb-6">
            <p className="text-amber-800 mb-3">حدث خطأ في تحميل المنتجات: {productsError}</p>
            <Button onClick={retryFetchProducts} variant="outline" className="border-amber-300">
              <RefreshCw className="ml-2 h-4 w-4" />
              إعادة المحاولة
            </Button>
          </div>
        )}

        {/* Products Grid */}
        <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
          {productsLoading
            ? Array.from({ length: 6 }).map((_, i) => (
                <ProductCardSkeleton key={i} />
              ))
            : filteredProducts.map((product, index) => (
                <ProductCard key={product.id} product={product} index={index} />
              ))}
        </div>

        {/* Empty State */}
        {!productsLoading && !productsError && filteredProducts.length === 0 && (
          <div className="text-center py-16">
            <p className="text-gray-400 text-lg">لا توجد منتجات في هذه الفئة حالياً</p>
            <Button onClick={retryFetchProducts} variant="outline" className="mt-4">
              <RefreshCw className="ml-2 h-4 w-4" />
              إعادة تحميل
            </Button>
          </div>
        )}
      </div>
    </section>
  );
}
