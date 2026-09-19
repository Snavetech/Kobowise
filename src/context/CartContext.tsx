/* eslint-disable react-refresh/only-export-components */
import React, { createContext, useContext, useState, useEffect, useRef, useCallback } from 'react';
import { useAuth } from './AuthContext';
import { dbService, type Product } from '../supabase';

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
  const { user } = useAuth();
  const [cartItems, setCartItems] = useState<CartItem[]>([]);
  const [deliveryType, setDeliveryType] = useState<'pickup' | 'delivery'>('pickup');
  const prevUserIdRef = useRef<string | null | undefined>(undefined);

  // Helper to determine storage key
  const getStorageKey = useCallback((userId?: string | null) => {
    return userId ? `kobowise_cart_${userId}` : 'kobowise_cart_guest';
  }, []);

  // Synchronize cart when user logs in, logs out, or switches accounts
  useEffect(() => {
    const currentUserId = user?.id || null;
    
    // First run or user changed
    if (prevUserIdRef.current !== currentUserId) {
      prevUserIdRef.current = currentUserId;

      if (currentUserId) {
        // User is logged in: fetch their cloud/user-scoped cart
        const loadUserCart = async () => {
          try {
            // Check for guest items to optionally merge
            let guestItems: CartItem[] = [];
            const guestSaved = localStorage.getItem('kobowise_cart_guest') || localStorage.getItem('kobowise_cart');
            if (guestSaved) {
              try {
                guestItems = JSON.parse(guestSaved);
              } catch {}
            }

            // Fetch user cloud / local cart
            const userCart = await dbService.getUserCart(currentUserId);

            if (userCart && userCart.length > 0) {
              setCartItems(userCart);
            } else if (guestItems.length > 0) {
              // Merge guest items into new user's cart
              setCartItems(guestItems);
              dbService.saveUserCart(currentUserId, guestItems);
            } else {
              setCartItems([]);
            }

            // Clean up legacy/guest storage after assigning to user
            localStorage.removeItem('kobowise_cart_guest');
            localStorage.removeItem('kobowise_cart');
          } catch (err) {
            console.error('Failed to load user cart:', err);
          }
        };

        loadUserCart();
      } else {
        // User logged out: clear active in-memory cart
        // Do not inherit previous user's cart
        setCartItems([]);
      }
    }
  }, [user?.id, getStorageKey]);

  // Save cart to local storage and sync to cloud if logged in
  const saveCart = useCallback((items: CartItem[]) => {
    setCartItems(items);
    const storageKey = getStorageKey(user?.id);
    try {
      localStorage.setItem(storageKey, JSON.stringify(items));
    } catch {
      // Fallback
    }

    // Sync to Supabase cloud metadata for logged in users
    if (user?.id) {
      dbService.saveUserCart(user.id, items).catch(err => {
        console.warn('Background cart cloud sync failed:', err);
      });
    }
  }, [user?.id, getStorageKey]);

  const addToCart = (product: Product, shares: number) => {
    const existingIndex = cartItems.findIndex(item => item.product.id === product.id);
    let updatedCart = [...cartItems];

    if (existingIndex > -1) {
      // Update shares quantity to explicitly chosen shares
      const newShares = Math.min(shares, product.total_shares);
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
