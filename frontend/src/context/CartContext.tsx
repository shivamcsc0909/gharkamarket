import React, { createContext, useContext, useEffect, useState } from 'react';
import { api } from '../services/api';
import { CartCalculation, CartItem } from '../types';
import { useNotification } from './NotificationContext';

interface RawItem {
  product_id: number;
  quantity: number;
}

interface CartContextType {
  items: CartItem[];
  rawItems: RawItem[];
  calculation: CartCalculation | null;
  isLoading: boolean;
  isCartOpen: boolean;
  couponCode: string;
  pincode: string;
  addItem: (product: { id: number }, quantity?: number) => Promise<void>;
  removeItem: (productId: number) => Promise<void>;
  updateQuantity: (productId: number, quantity: number) => Promise<void>;
  clearCart: () => void;
  applyCoupon: (code: string) => Promise<boolean>;
  removeCoupon: () => Promise<void>;
  setPincode: (pin: string) => void;
  openCart: () => void;
  closeCart: () => void;
  toggleCart: () => void;
  refreshCart: () => Promise<void>;
}

const CartContext = createContext<CartContextType | undefined>(undefined);

export const CartProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [rawItems, setRawItems] = useState<RawItem[]>(() => {
    try {
      const saved = localStorage.getItem('of_cart_items');
      return saved ? JSON.parse(saved) : [];
    } catch {
      return [];
    }
  });

  const [couponCode, setCouponCode] = useState<string>(() => {
    return localStorage.getItem('of_coupon') || '';
  });

  const [pincode, setPincodeState] = useState<string>(() => {
    return localStorage.getItem('of_pincode') || '110001';
  });

  const [calculation, setCalculation] = useState<CartCalculation | null>(null);
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [isCartOpen, setIsCartOpen] = useState<boolean>(false);
  const { showToast } = useNotification();

  // Save to local storage whenever raw items change
  useEffect(() => {
    localStorage.setItem('of_cart_items', JSON.stringify(rawItems));
  }, [rawItems]);

  const refreshCart = async () => {
    if (rawItems.length === 0) {
      setCalculation(null);
      return;
    }

    try {
      setIsLoading(true);
      const res = await api.calculateCart(rawItems, couponCode, pincode);
      if (res.success && res.data) {
        setCalculation(res.data);
      }
    } catch (e: any) {
      console.error('Cart calculation failed:', e);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    refreshCart();
  }, [rawItems, couponCode, pincode]);

  const addItem = async (product: { id: number; name?: string }, quantity = 1) => {
    setRawItems((prev) => {
      const existing = prev.find((i) => i.product_id === product.id);
      if (existing) {
        return prev.map((i) => (i.product_id === product.id ? { ...i, quantity: i.quantity + quantity } : i));
      }
      return [...prev, { product_id: product.id, quantity }];
    });

    showToast(`Added to cart!`, 'success');
    setIsCartOpen(true);
  };

  const removeItem = async (productId: number) => {
    setRawItems((prev) => prev.filter((i) => i.product_id !== productId));
    showToast('Item removed from cart', 'info');
  };

  const updateQuantity = async (productId: number, quantity: number) => {
    if (quantity <= 0) {
      removeItem(productId);
      return;
    }
    setRawItems((prev) =>
      prev.map((i) => (i.product_id === productId ? { ...i, quantity } : i))
    );
  };

  const clearCart = () => {
    setRawItems([]);
    setCalculation(null);
    localStorage.removeItem('of_cart_items');
    localStorage.removeItem('of_coupon');
    setCouponCode('');
  };

  const applyCoupon = async (code: string): Promise<boolean> => {
    const cleanCode = code.toUpperCase().trim();
    if (!cleanCode) return false;

    try {
      const res = await api.calculateCart(rawItems, cleanCode, pincode);
      if (res.success && res.data?.coupon && 'discount_amount' in res.data.coupon) {
        setCouponCode(cleanCode);
        localStorage.setItem('of_coupon', cleanCode);
        setCalculation(res.data);
        showToast(`Coupon ${cleanCode} applied! Saved ₹${res.data.discount_amount}`, 'success');
        return true;
      } else {
        const errorMsg = (res.data?.coupon as any)?.message || 'Invalid or inapplicable coupon code.';
        showToast(errorMsg, 'error');
        return false;
      }
    } catch (e: any) {
      showToast(e.message || 'Failed to apply coupon', 'error');
      return false;
    }
  };

  const removeCoupon = async () => {
    setCouponCode('');
    localStorage.removeItem('of_coupon');
    showToast('Coupon removed', 'info');
    await refreshCart();
  };

  const setPincode = (pin: string) => {
    setPincodeState(pin);
    localStorage.setItem('of_pincode', pin);
  };

  const openCart = () => setIsCartOpen(true);
  const closeCart = () => setIsCartOpen(false);
  const toggleCart = () => setIsCartOpen((prev) => !prev);

  return (
    <CartContext.Provider
      value={{
        items: calculation?.items || [],
        rawItems,
        calculation,
        isLoading,
        isCartOpen,
        couponCode,
        pincode,
        addItem,
        removeItem,
        updateQuantity,
        clearCart,
        applyCoupon,
        removeCoupon,
        setPincode,
        openCart,
        closeCart,
        toggleCart,
        refreshCart,
      }}
    >
      {children}
    </CartContext.Provider>
  );
};

export const useCart = () => {
  const context = useContext(CartContext);
  if (!context) {
    throw new Error('useCart must be used within a CartProvider');
  }
  return context;
};
