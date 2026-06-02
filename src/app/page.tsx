'use client';

import { useStore } from '@/lib/store';
import { Header } from '@/components/store/Header';
import { HeroSection } from '@/components/store/HeroSection';
import { ProductsSection } from '@/components/store/ProductsSection';
import { ProductDetailDialog } from '@/components/store/ProductDetailDialog';
import { CartDrawer } from '@/components/store/CartDrawer';
import { CheckoutSection } from '@/components/store/CheckoutSection';
import { HomeContent } from '@/components/store/HomeContent';
import { Footer } from '@/components/store/Footer';
import { motion, AnimatePresence } from 'framer-motion';
import { useEffect } from 'react';

export default function StorePage() {
  const { currentView, setCurrentView, fetchProducts, products, productsLoading } = useStore();

  useEffect(() => {
    fetchProducts();
  }, [fetchProducts]);

  return (
    <div className="min-h-screen flex flex-col bg-white">
      <Header />

      <main className="flex-1">
        <AnimatePresence mode="wait">
          <motion.div
            key={currentView}
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -10 }}
            transition={{ duration: 0.3 }}
          >
            {currentView === 'home' && (
              <>
                <HeroSection />
                <HomeContent />
              </>
            )}
            {currentView === 'products' && (
              <>
                <section className="bg-gradient-to-l from-emerald-600 to-teal-500 py-10 md:py-14">
                  <div className="container mx-auto px-4 text-center">
                    <h1 className="text-2xl font-extrabold text-white md:text-3xl mb-2">
                      جميع المنتجات {productsLoading ? '' : `(${products.length})`}
                    </h1>
                    <p className="text-emerald-100">
                      تصفح مجموعتنا الكاملة من البرمجيات والكتب الإلكترونية
                    </p>
                  </div>
                </section>
                <ProductsSection />
              </>
            )}
            {currentView === 'checkout' && <CheckoutSection />}
          </motion.div>
        </AnimatePresence>
      </main>

      <Footer />

      <ProductDetailDialog />
      <CartDrawer />
    </div>
  );
}
