import { create } from 'zustand';
import { logger } from '@/lib/logger';

// Product types
export type ProductCategory = 'ebook' | 'software';
export type PaymentMethod = 'jeib' | 'western-union';

export interface Product {
  id: string;
  name: string;
  description: string;
  longDescription: string;
  price: number;
  category: ProductCategory;
  image: string;
  features: string[];
  badge?: string;
  fileUrl?: string;
  fileSize?: number;
}

export interface OrderItem {
  product: Product;
  quantity: number;
  total: number;
}

export interface User {
  id: string;
  name: string;
  email: string;
  role: string;
}

export interface AuthState {
  user: User | null;
  authLoading: boolean;
  setUser: (user: User | null) => void;
  setAuthLoading: (loading: boolean) => void;
  logout: () => Promise<void>;
  checkAuth: () => Promise<void>;
}

export interface CartItem {
  product: Product;
  quantity: number;
}

export interface StoreState {
  // Navigation
  currentView: 'home' | 'products' | 'checkout' | 'admin' | 'invoices';
  setCurrentView: (view: StoreState['currentView']) => void;

  // Products from database
  products: Product[];
  productsLoading: boolean;
  productsError: string | null;
  fetchProducts: () => Promise<void>;
  retryFetchProducts: () => Promise<void>;

  // Store settings
  storeSettings: StoreSettings | null;
  fetchSettings: () => Promise<void>;

  // Cart
  cart: CartItem[];
  addToCart: (product: Product) => void;
  removeFromCart: (productId: string) => void;
  updateQuantity: (productId: string, quantity: number) => void;
  clearCart: () => void;
  getCartTotal: () => number;
  getCartCount: () => number;

  // Product detail
  selectedProduct: Product | null;
  setSelectedProduct: (product: Product | null) => void;

  // Payment
  paymentMethod: PaymentMethod | null;
  setPaymentMethod: (method: PaymentMethod | null) => void;

  // Filters
  categoryFilter: ProductCategory | 'all';
  setCategoryFilter: (filter: ProductCategory | 'all') => void;

  // Cart drawer
  cartOpen: boolean;
  setCartOpen: (open: boolean) => void;

  // Auth
  user: User | null;
  authLoading: boolean;
  setUser: (user: User | null) => void;
  setAuthLoading: (loading: boolean) => void;
  logout: () => Promise<void>;
  checkAuth: () => Promise<void>;
}

export interface StoreSettings {
  storeName: string;
  storeEmail: string;
  storePhone: string;
  storeAddress: string;
  jeibPhone: string;
  wuName: string;
  wuCity: string;
  wuCountry: string;
  siteUrl: string;
  currency: string;
  taxRate: number;
}

const defaultSettings: StoreSettings = {
  storeName: 'سندك',
  storeEmail: 'info@store.com',
  storePhone: '',
  storeAddress: '',
  jeibPhone: '00967770240572',
  wuName: 'Riadh Ahmed Mohammed Alsayaghi',
  wuCity: 'صنعاء - العاصمة',
  wuCountry: 'اليمن',
  siteUrl: '',
  currency: '$',
  taxRate: 15,
};

export function getPaymentInfo(settings: StoreSettings | null) {
  const s = settings || defaultSettings;
  return {
    jeib: {
      name: 'محفظة جيب (Jeib)',
      phone: s.jeibPhone || '00967770240572',
      instructions: [
        'قم بفتح تطبيق محفظة جيب على هاتفك',
        'اختر خيار التحويل',
        `أدخل رقم المحفظة: ${s.jeibPhone || '00967770240572'}`,
        'أدخل المبلغ المطلوب',
        'أرسل إيصال التحويل عبر الواتساب أو البريد الإلكتروني',
      ],
    },
    westernUnion: {
      name: 'ويسترن يونين (Western Union)',
      recipientName: s.wuName || 'Riadh Ahmed Mohammed Alsayaghi',
      city: s.wuCity || 'صنعاء - العاصمة',
      country: s.wuCountry || 'اليمن',
      instructions: [
        'اذهب إلى أقرب فرع ويسترن يونين',
        `أرسل المبلغ باسم: ${s.wuName || 'Riadh Ahmed Mohammed Alsayaghi'}`,
        `المدينة: ${s.wuCity || 'صنعاء - العاصمة'}`,
        `الدولة: ${s.wuCountry || 'اليمن'}`,
        'احتفظ برقم التحويل (MTCN) وأرسله إلينا عبر الواتساب أو البريد الإلكتروني',
      ],
    },
  };
}

// Create Zustand store
export const useStore = create<StoreState>((set, get) => ({
  // Navigation
  currentView: 'home',
  setCurrentView: (view) => set({ currentView: view }),

  // Products from database
  products: [],
  productsLoading: true,
  productsError: null,
  fetchProducts: async () => {
    set({ productsLoading: true, productsError: null });
    try {
      const res = await fetch('/api/products', { cache: 'no-store' });
      if (!res.ok) {
        throw new Error(`HTTP ${res.status}`);
      }
      const data = await res.json();
      if (data.success && Array.isArray(data.data)) {
        set({ products: data.data, productsError: null });
        if (data.data.length === 0) {
          try {
            await fetch('/api/products/seed', { method: 'POST', cache: 'no-store' });
            const retryRes = await fetch('/api/products', { cache: 'no-store' });
            const retryData = await retryRes.json();
            if (retryData.success && Array.isArray(retryData.data)) {
              set({ products: retryData.data });
            }
          } catch (seedErr) {
            logger.warn('Auto-seed failed (may need admin auth):', seedErr);
          }
        }
      } else {
        set({ productsError: data.error || 'فشل تحميل المنتجات' });
      }
    } catch (error) {
      logger.error('Error fetching products:', error);
      set({ productsError: error instanceof Error ? error.message : 'حدث خطأ في الاتصال' });
    } finally {
      set({ productsLoading: false });
    }
  },
  retryFetchProducts: async () => {
    const { fetchProducts } = get();
    await fetchProducts();
  },

  // Store settings
  storeSettings: null,
  fetchSettings: async () => {
    try {
      const res = await fetch('/api/settings');
      const data = await res.json();
      if (data.success) {
        set({ storeSettings: data.data });
      }
    } catch (error) {
      logger.error('Error fetching store settings:', error);
    }
  },

  // Cart
  cart: [],
  addToCart: (product) =>
    set((state) => {
      const existing = state.cart.find((item) => item.product.id === product.id);
      if (existing) {
        return {
          cart: state.cart.map((item) =>
            item.product.id === product.id
              ? { ...item, quantity: item.quantity + 1 }
              : item
          ),
        };
      }
      return { cart: [...state.cart, { product, quantity: 1 }] };
    }),
  removeFromCart: (productId) =>
    set((state) => ({
      cart: state.cart.filter((item) => item.product.id !== productId),
    })),
  updateQuantity: (productId, quantity) =>
    set((state) => ({
      cart:
        quantity <= 0
          ? state.cart.filter((item) => item.product.id !== productId)
          : state.cart.map((item) =>
              item.product.id === productId ? { ...item, quantity } : item
            ),
    })),
  clearCart: () => set({ cart: [] }),
  getCartTotal: () => {
    const { cart } = get();
    return cart.reduce((total, item) => total + item.product.price * item.quantity, 0);
  },
  getCartCount: () => {
    const { cart } = get();
    return cart.reduce((count, item) => count + item.quantity, 0);
  },

  // Product detail
  selectedProduct: null,
  setSelectedProduct: (product) => set({ selectedProduct: product }),

  // Payment
  paymentMethod: null,
  setPaymentMethod: (method) => set({ paymentMethod: method }),

  // Filters
  categoryFilter: 'all',
  setCategoryFilter: (filter) => set({ categoryFilter: filter }),

  // Cart drawer
  cartOpen: false,
  setCartOpen: (open) => set({ cartOpen: open }),

  // Auth
  user: null,
  authLoading: false,
  setUser: (user) => set({ user }),
  setAuthLoading: (loading) => set({ authLoading: loading }),
  logout: async () => {
    try {
      await fetch('/api/auth/logout', { method: 'POST' });
    } catch {}
    set({ user: null });
  },
  checkAuth: async () => {
    set({ authLoading: true });
    try {
      const res = await fetch('/api/auth/me');
      const data = await res.json();
      if (data.success) set({ user: data.data });
      else set({ user: null });
    } catch {
      set({ user: null });
    } finally {
      set({ authLoading: false });
    }
  },
}));
