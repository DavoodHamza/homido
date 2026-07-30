import React, { createContext, useContext, useState, useEffect } from 'react';
import AsyncStorage from '@react-native-async-storage/async-storage';

export interface CartItem {
  menuItemId: string;
  name: string;
  price: number;
  quantity: number;
  vendorId: string;
  image?: string;
  vendorName?: string;
}

interface CartContextType {
  items: CartItem[];
  addToCart: (item: CartItem) => void;
  removeFromCart: (menuItemId: string) => void;
  updateQuantity: (menuItemId: string, quantity: number) => void;
  clearCart: () => void;
  cartTotal: number;
  itemCount: number;
}

const CartContext = createContext<CartContextType | undefined>(undefined);

export function CartProvider({ children }: { children: React.ReactNode }) {
  const [items, setItems] = useState<CartItem[]>([]);

  useEffect(() => {
    // Load cart from storage on mount
    AsyncStorage.getItem('homido_cart').then(stored => {
      if (stored) {
        try {
          setItems(JSON.parse(stored));
        } catch (e) {
          console.error('Failed to parse cart', e);
        }
      }
    });
  }, []);

  const saveCart = (newItems: CartItem[]) => {
    setItems(newItems);
    AsyncStorage.setItem('homido_cart', JSON.stringify(newItems));
  };

  const addToCart = (newItem: CartItem) => {
    setItems(prevItems => {
      const existing = prevItems.find(i => i.menuItemId === newItem.menuItemId);
      if (existing) {
        const updated = prevItems.map(i =>
          i.menuItemId === newItem.menuItemId
            ? { ...i, quantity: i.quantity + newItem.quantity }
            : i
        );
        AsyncStorage.setItem('homido_cart', JSON.stringify(updated));
        return updated;
      }
      const updated = [...prevItems, newItem];
      AsyncStorage.setItem('homido_cart', JSON.stringify(updated));
      return updated;
    });
  };

  const removeFromCart = (menuItemId: string) => {
    const updated = items.filter(i => i.menuItemId !== menuItemId);
    saveCart(updated);
  };

  const updateQuantity = (menuItemId: string, quantity: number) => {
    if (quantity <= 0) {
      removeFromCart(menuItemId);
      return;
    }
    const updated = items.map(i =>
      i.menuItemId === menuItemId ? { ...i, quantity } : i
    );
    saveCart(updated);
  };

  const clearCart = () => {
    saveCart([]);
  };

  const cartTotal = items.reduce((total, item) => total + item.price * item.quantity, 0);
  const itemCount = items.reduce((count, item) => count + item.quantity, 0);

  return (
    <CartContext.Provider value={{ items, addToCart, removeFromCart, updateQuantity, clearCart, cartTotal, itemCount }}>
      {children}
    </CartContext.Provider>
  );
}

export function useCart() {
  const context = useContext(CartContext);
  if (context === undefined) {
    throw new Error('useCart must be used within a CartProvider');
  }
  return context;
}
