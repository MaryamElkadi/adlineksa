'use client';

import { useState, useEffect } from 'react';
import { CartItem } from '@/types';

export function useCart() {
  const [items, setItems] = useState<CartItem[]>([]);
  const [isLoaded, setIsLoaded] = useState(false);

  const loadCartFromStorage = () => {
    try {
      const saved = localStorage.getItem('adline_cart');
      if (saved) {
        setItems(JSON.parse(saved));
      } else {
        setItems([]);
      }
    } catch (e) {
      console.error('Failed to load cart from storage', e);
      setItems([]);
    } finally {
      setIsLoaded(true);
    }
  };

  useEffect(() => {
    loadCartFromStorage();

    const handleCartChange = () => loadCartFromStorage();
    const handleAuthChange = () => {
      const user = localStorage.getItem("user");
      if (!user) {
        // User logged out: clear cart state immediately
        localStorage.removeItem('adline_cart');
        setItems([]);
      } else {
        loadCartFromStorage();
      }
    };

    window.addEventListener('cart-change', handleCartChange);
    window.addEventListener('auth-change', handleAuthChange);
    window.addEventListener('storage', handleCartChange);

    return () => {
      window.removeEventListener('cart-change', handleCartChange);
      window.removeEventListener('auth-change', handleAuthChange);
      window.removeEventListener('storage', handleCartChange);
    };
  }, []);

  const saveCart = (newItems: CartItem[]) => {
    setItems(newItems);
    try {
      localStorage.setItem('adline_cart', JSON.stringify(newItems));
    } catch (e) {
      console.error('Failed to save cart', e);
    }
    window.dispatchEvent(new Event('cart-change'));
  };

  const addItem = (newItem: CartItem) => {
    const currentProductQuantity = items
      .filter((item) => item.productId === newItem.productId)
      .reduce((total, item) => total + item.quantity, 0);
    if (currentProductQuantity + newItem.quantity > (newItem.maxStock ?? Infinity)) {
      return false;
    }

    const isTiered = newItem.pricingType === 'tiered';
    const existingIndex = items.findIndex(
      (item) =>
        !isTiered &&
        item.pricingType !== 'tiered' &&
        item.productId === newItem.productId &&
        item.size === newItem.size &&
        item.material === newItem.material &&
        item.finish === newItem.finish &&
        item.color === newItem.color &&
        item.designPlacement === newItem.designPlacement &&
        item.printSide === newItem.printSide &&
        item.lighting === newItem.lighting &&
        item.installation === newItem.installation &&
        item.needDesign === newItem.needDesign &&
        item.designBrief === newItem.designBrief &&
        item.customNotes === newItem.customNotes &&
        item.fileUrl === newItem.fileUrl &&
        item.pricingType === newItem.pricingType
    );

    if (existingIndex > -1) {
      const updated = [...items];
      const nextQuantity = updated[existingIndex].quantity + newItem.quantity;
      if (nextQuantity > (newItem.maxStock ?? updated[existingIndex].maxStock ?? Infinity)) {
        return false;
      }
      updated[existingIndex] = {
        ...updated[existingIndex],
        quantity: nextQuantity,
        totalPrice: Math.round(nextQuantity * updated[existingIndex].unitPrice * 100) / 100,
      };
      saveCart(updated);
    } else {
      if (newItem.quantity > (newItem.maxStock ?? Infinity)) return false;
      saveCart([...items, newItem]);
    }
    return true;
  };

  const removeItem = (id: string) => {
    saveCart(items.filter((item) => item.id !== id));
  };

  const updateQuantity = (id: string, quantity: number) => {
    if (quantity <= 0) {
      removeItem(id);
      return;
    }
    const currentItem = items.find((item) => item.id === id);
    if (!currentItem || currentItem.pricingType === 'tiered') return false;
    const otherProductQuantity = items
      .filter((item) => item.productId === currentItem.productId && item.id !== id)
      .reduce((total, item) => total + item.quantity, 0);
    if (otherProductQuantity + quantity > (currentItem.maxStock ?? Infinity)) return false;

    const updated = items.map((item) => {
      if (item.id === id) {
        if (item.pricingType === 'tiered' || quantity > (item.maxStock ?? Infinity)) {
          return item;
        }
        return {
          ...item,
          quantity,
          totalPrice: Math.round(quantity * item.unitPrice * 100) / 100,
        };
      }
      return item;
    });
    saveCart(updated);
    return true;
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
