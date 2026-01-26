'use client';

import React, { createContext, useContext, useState, useEffect, useCallback } from 'react';
import { Cart, cartApi, AddToCartDto, UpdateCartItemDto } from '@/services/cartApi';

interface CartContextType {
  cart: Cart | null;
  loading: boolean;
  error: string | null;
  refreshCart: () => Promise<void>;
  addToCart: (data: AddToCartDto) => Promise<void>;
  updateCartItem: (itemId: string, data: UpdateCartItemDto) => Promise<void>;
  removeFromCart: (itemId: string) => Promise<void>;
  clearCart: () => Promise<void>;
  cartItemCount: number;
}

const CartContext = createContext<CartContextType | undefined>(undefined);

export const CartProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [cart, setCart] = useState<Cart | null>(null);
  const [loading, setLoading] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);

  const refreshCart = useCallback(async () => {
    try {
      setLoading(true);
      const cartData = await cartApi.getCart();
      setCart(cartData);
      setError(null);
    } catch (err: any) {
      console.error('Failed to fetch cart:', err);
      if (err.response?.status !== 401) {
        setError(err.response?.data?.message || 'Failed to load cart');
      }
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    const token = localStorage.getItem('accessToken');
    if (token) {
      refreshCart();
    }
  }, [refreshCart]);

  const addToCart = async (data: AddToCartDto) => {
    try {
      setError(null);
      setLoading(true);
      const updatedCart = await cartApi.addToCart(data);
      setCart(updatedCart);
    } catch (err: any) {
      const message = err.response?.data?.message || 'Failed to add to cart';
      setError(message);
      throw new Error(message);
    } finally {
      setLoading(false);
    }
  };

  const updateCartItem = async (itemId: string, data: UpdateCartItemDto) => {
    try {
      setError(null);
      setLoading(true);
      const updatedCart = await cartApi.updateCartItem(itemId, data);
      setCart(updatedCart);
    } catch (err: any) {
      const message = err.response?.data?.message || 'Failed to update cart item';
      setError(message);
      throw new Error(message);
    } finally {
      setLoading(false);
    }
  };

  const removeFromCart = async (itemId: string) => {
    try {
      setError(null);
      setLoading(true);
      const updatedCart = await cartApi.removeFromCart(itemId);
      setCart(updatedCart);
    } catch (err: any) {
      const message = err.response?.data?.message || 'Failed to remove from cart';
      setError(message);
      throw new Error(message);
    } finally {
      setLoading(false);
    }
  };

  const clearCart = async () => {
    try {
      setError(null);
      setLoading(true);
      const updatedCart = await cartApi.clearCart();
      setCart(updatedCart);
    } catch (err: any) {
      const message = err.response?.data?.message || 'Failed to clear cart';
      setError(message);
      throw new Error(message);
    } finally {
      setLoading(false);
    }
  };

  const cartItemCount = cart?.items?.length || 0;

  return (
    <CartContext.Provider
      value={{
        cart,
        loading,
        error,
        refreshCart,
        addToCart,
        updateCartItem,
        removeFromCart,
        clearCart,
        cartItemCount,
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
