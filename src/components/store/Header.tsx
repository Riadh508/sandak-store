'use client';

import { useStore, type ProductCategory } from '@/lib/store';
import { ShoppingCart, Menu, Store, Settings } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Sheet, SheetContent, SheetHeader, SheetTitle, SheetTrigger } from '@/components/ui/sheet';

export function Header() {
  const { currentView, setCurrentView, getCartCount, setCartOpen, setCategoryFilter } = useStore();
  const cartCount = getCartCount();

  return (
    <header className="sticky top-0 z-50 w-full border-b bg-white/80 backdrop-blur-md">
      <div className="container mx-auto px-4">
        <div className="flex h-16 items-center justify-between">
          {/* Logo */}
          <button
            onClick={() => setCurrentView('home')}
            className="flex items-center gap-2 transition-transform hover:scale-105"
          >
            <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-gradient-to-br from-emerald-600 to-teal-500">
              <Store className="h-5 w-5 text-white" />
            </div>
            <div className="flex flex-col">
              <span className="text-lg font-bold leading-tight text-emerald-700">سندك</span>
              <span className="text-[10px] leading-tight text-muted-foreground">للبرمجيات والمنتجات الرقمية</span>
            </div>
          </button>

          {/* Desktop Navigation */}
          <nav className="hidden md:flex items-center gap-1">
            <Button
              variant={currentView === 'home' ? 'default' : 'ghost'}
              size="sm"
              onClick={() => setCurrentView('home')}
              className={currentView === 'home' ? 'bg-emerald-600 hover:bg-emerald-700 text-white' : 'text-gray-600'}
            >
              الرئيسية
            </Button>
            <Button
              variant={currentView === 'products' ? 'default' : 'ghost'}
              size="sm"
              onClick={() => setCurrentView('products')}
              className={currentView === 'products' ? 'bg-emerald-600 hover:bg-emerald-700 text-white' : 'text-gray-600'}
            >
              المنتجات
            </Button>
            <Button
              variant="ghost"
              size="sm"
              onClick={() => { setCategoryFilter('ebook'); setCurrentView('products'); }}
              className="text-gray-600"
            >
              الكتب الإلكترونية
            </Button>
            <Button
              variant="ghost"
              size="sm"
              onClick={() => { setCategoryFilter('software'); setCurrentView('products'); }}
              className="text-gray-600"
            >
              البرمجيات
            </Button>
          </nav>

          {/* Cart + Admin + Mobile Menu */}
          <div className="flex items-center gap-2">
            <Button
              variant="outline"
              size="icon"
              className="relative border-emerald-200 hover:bg-emerald-50"
              onClick={() => setCartOpen(true)}
            >
              <ShoppingCart className="h-5 w-5 text-emerald-700" />
              {cartCount > 0 && (
                <Badge className="absolute -top-2 -left-2 h-5 w-5 rounded-full bg-emerald-600 p-0 text-[10px] text-white flex items-center justify-center">
                  {cartCount}
                </Badge>
              )}
            </Button>

            {/* Admin Button */}
            <Button
              variant="outline"
              size="icon"
              className="border-gray-200 hover:bg-gray-50"
              onClick={() => setCurrentView('admin')}
              title="لوحة التحكم"
            >
              <Settings className="h-5 w-5 text-gray-600" />
            </Button>

            {/* Mobile Navigation */}
            <Sheet>
              <SheetTrigger asChild>
                <Button variant="outline" size="icon" className="md:hidden border-emerald-200">
                  <Menu className="h-5 w-5 text-emerald-700" />
                </Button>
              </SheetTrigger>
              <SheetContent side="left" className="w-64">
                <SheetHeader>
                  <SheetTitle className="text-right text-emerald-700">القائمة</SheetTitle>
                </SheetHeader>
                <nav className="mt-6 flex flex-col gap-2">
                  <Button
                    variant={currentView === 'home' ? 'default' : 'ghost'}
                    className="justify-end"
                    onClick={() => setCurrentView('home')}
                  >
                    الرئيسية
                  </Button>
                  <Button
                    variant={currentView === 'products' ? 'default' : 'ghost'}
                    className="justify-end"
                    onClick={() => setCurrentView('products')}
                  >
                    المنتجات
                  </Button>
                  <Button
                    variant="ghost"
                    className="justify-end"
                    onClick={() => { setCategoryFilter('ebook'); setCurrentView('products'); }}
                  >
                    الكتب الإلكترونية
                  </Button>
                  <Button
                    variant="ghost"
                    className="justify-end"
                    onClick={() => { setCategoryFilter('software'); setCurrentView('products'); }}
                  >
                    البرمجيات
                  </Button>
                  <Button
                    variant={currentView === 'admin' ? 'default' : 'ghost'}
                    className="justify-end"
                    onClick={() => setCurrentView('admin')}
                  >
                    <Settings className="ml-2 h-4 w-4" />
                    لوحة التحكم
                  </Button>
                </nav>
              </SheetContent>
            </Sheet>
          </div>
        </div>
      </div>
    </header>
  );
}
