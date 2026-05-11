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
  fetchProducts: () => Promise<void>;

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
}

// Payment info
export const paymentInfo = {
  jeib: {
    name: 'محفظة جيب (Jeib)',
    phone: '00967770240572',
    instructions: [
      'قم بفتح تطبيق محفظة جيب على هاتفك',
      'اختر خيار التحويل',
      'أدخل رقم المحفظة: 00967770240572',
      'أدخل المبلغ المطلوب',
      'أرسل إيصال التحويل عبر الواتساب أو البريد الإلكتروني',
    ],
  },
  westernUnion: {
    name: 'ويسترن يونين (Western Union)',
    recipientName: 'Riadh Ahmed Mohammed Alsayaghi',
    city: 'صنعاء - العاصمة',
    country: 'اليمن',
    instructions: [
      'اذهب إلى أقرب فرع ويسترن يونين',
      'أرسل المبلغ باسم: Riadh Ahmed Mohammed Alsayaghi',
      'المدينة: صنعاء - العاصمة',
      'الدولة: اليمن',
      'احتفظ برقم التحويل (MTCN) وأرسله لنا',
    ],
  },
};

// Create Zustand store
export const useStore = create<StoreState>((set, get) => ({
  // Navigation
  currentView: 'home',
  setCurrentView: (view) => set({ currentView: view }),

  // Products from database
  products: [],
  productsLoading: true,
  fetchProducts: async () => {
    set({ productsLoading: true });
    try {
      const res = await fetch('/api/products');
      const data = await res.json();
      if (data.success) {
        set({ products: data.data });
      }
      // If no products exist, seed defaults
      if (!data.data || data.data.length === 0) {
        await fetch('/api/products/seed', { method: 'POST' });
        const retryRes = await fetch('/api/products');
        const retryData = await retryRes.json();
        if (retryData.success) {
          set({ products: retryData.data });
        }
      }
    } catch (error) {
      logger.error('Error fetching products:', error);
    } finally {
      set({ productsLoading: false });
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
}));
