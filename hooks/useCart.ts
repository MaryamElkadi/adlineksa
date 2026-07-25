'use client';

import { useState, useEffect } from 'react';
import { CartItem } from '@/types';

export function useCart() {
  const [items, setItems] = useState<CartItem[]>([]);
  const [isLoaded, setIsLoaded] = useState(false);

  useEffect(() => {
    try {
      const saved = localStorage.getItem('adline_cart');
      if (saved) {
        setItems(JSON.parse(saved));
      }
    } catch (e) {
      console.error('Failed to load cart from storage', e);
    } finally {
      setIsLoaded(true);
    }
  }, []);

  const saveCart = (newItems: CartItem[]) => {
    setItems(newItems);
    try {
      localStorage.setItem('adline_cart', JSON.stringify(newItems));
    } catch (e) {
      console.error('Failed to save cart', e);
    }
  };

  const addItem = (newItem: CartItem) => {
    const existingIndex = items.findIndex(
      (item) =>
        item.productId === newItem.productId &&
        item.size === newItem.size &&
        item.material === newItem.material
    );

    if (existingIndex > -1) {
      const updated = [...items];
      updated[existingIndex].quantity += newItem.quantity;
      updated[existingIndex].totalPrice = updated[existingIndex].quantity * updated[existingIndex].unitPrice;
      saveCart(updated);
    } else {
      saveCart([...items, newItem]);
    }
  };

  const removeItem = (id: string) => {
    saveCart(items.filter((item) => item.id !== id));
  };

  const updateQuantity = (id: string, quantity: number) => {
    if (quantity <= 0) {
      removeItem(id);
      return;
    }
    const updated = items.map((item) => {
      if (item.id === id) {
        return {
          ...item,
          quantity,
          totalPrice: quantity * item.unitPrice,
        };
      }
      return item;
    });
    saveCart(updated);
  };

  const clearCart = () => {
    saveCart([]);
  };

  const subtotal = items.reduce((sum, item) => sum + item.totalPrice, 0);
  const tax = subtotal * 0.15; // 15% VAT in KSA
  const shipping = subtotal > 300 || items.length === 0 ? 0 : 35;
  const total = subtotal + tax + shipping;

  return {
    items,
    isLoaded,
    addItem,
    removeItem,
    updateQuantity,
    clearCart,
    subtotal,
    tax,
    shipping,
    total,
    itemCount: items.reduce((count, item) => count + item.quantity, 0),
  };
}
