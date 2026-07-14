/* eslint-disable react-refresh/only-export-components */
import React, { createContext, useContext, useState, useEffect } from 'react';
import type { Product } from '../supabase';

export interface CartItem {
  product: Product;
  sharesBought: number;
}

interface CartContextType {
  cartItems: CartItem[];
  addToCart: (product: Product, shares: number) => void;
  removeFromCart: (productId: string) => void;
  updateShares: (productId: string, shares: number) => void;
  clearCart: () => void;
  cartCount: number;
  cartSubtotal: number;
  deliveryType: 'pickup' | 'delivery';
  setDeliveryType: (type: 'pickup' | 'delivery') => void;
  deliveryFee: number;
  platformFee: number;
  cartTotal: number;
}

const CartContext = createContext<CartContextType | undefined>(undefined);

export const CartProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [cartItems, setCartItems] = useState<CartItem[]>([]);
  const [deliveryType, setDeliveryType] = useState<'pickup' | 'delivery'>('pickup');

  // Load cart from session storage on mount
  useEffect(() => {
    const savedCart = sessionStorage.getItem('kobowise_cart');
    if (savedCart) {
      setCartItems(JSON.parse(savedCart));
    }
  }, []);

  // Save cart to session storage whenever it changes
  const saveCart = (items: CartItem[]) => {
    setCartItems(items);
    sessionStorage.setItem('kobowise_cart', JSON.stringify(items));
  };

  const addToCart = (product: Product, shares: number) => {
    const existingIndex = cartItems.findIndex(item => item.product.id === product.id);
    let updatedCart = [...cartItems];

    if (existingIndex > -1) {
      // Check limits
      const currentShares = updatedCart[existingIndex].sharesBought;
      const newShares = Math.min(currentShares + shares, product.total_shares);
      updatedCart[existingIndex] = {
        ...updatedCart[existingIndex],
        sharesBought: newShares
      };
    } else {
      updatedCart.push({
        product,
        sharesBought: Math.min(shares, product.total_shares)
      });
    }

    saveCart(updatedCart);
  };

  const removeFromCart = (productId: string) => {
    const updatedCart = cartItems.filter(item => item.product.id !== productId);
    saveCart(updatedCart);
  };

  const updateShares = (productId: string, shares: number) => {
    const updatedCart = cartItems.map(item => {
      if (item.product.id === productId) {
        return {
          ...item,
          sharesBought: Math.min(Math.max(1, shares), item.product.total_shares)
        };
      }
      return item;
    });
    saveCart(updatedCart);
  };

  const clearCart = () => {
    saveCart([]);
    setDeliveryType('pickup');
  };

  // Calculations
  const cartCount = cartItems.reduce((acc, item) => acc + item.sharesBought, 0);
  const cartSubtotal = cartItems.reduce((acc, item) => acc + (item.sharesBought * item.product.price_per_share), 0);
  const platformFee = cartItems.length > 0 ? 150 : 0; // ₦150 flat student service fee
  const deliveryFee = cartItems.length > 0 && deliveryType === 'delivery' ? 500 : 0; // ₦500 delivery fee
  const cartTotal = cartSubtotal + platformFee + deliveryFee;

  return (
    <CartContext.Provider
      value={{
        cartItems,
        addToCart,
        removeFromCart,
        updateShares,
        clearCart,
        cartCount,
        cartSubtotal,
        deliveryType,
        setDeliveryType,
        deliveryFee,
        platformFee,
        cartTotal
      }}
    >
      {children}
    </CartContext.Provider>
  );
};

export const useCart = () => {
  const context = useContext(CartContext);
  if (context === undefined) {
    throw new Error('useCart must be used within a CartProvider');
  }
  return context;
};
