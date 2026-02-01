import React, { createContext, useState, useEffect, useCallback } from "react";
import type { CartItem } from "../types";
import { cartApi } from "../api/cart";
import { useAuth } from "./AuthContext";

export interface CartContextType {
  items: CartItem[];
  itemCount: number;
  totalPrice: number;
  isLoading: boolean;
  addItem: (productId: number, quantity: number) => Promise<void>;
  updateQuantity: (itemId: number, quantity: number) => Promise<void>;
  removeItem: (itemId: number) => Promise<void>;
  clearCart: () => void;
  refreshCart: () => Promise<void>;
}

export const CartContext = createContext<CartContextType | undefined>(
  undefined,
);

export interface CartProviderProps {
  children: React.ReactNode;
}

export const CartProvider: React.FC<CartProviderProps> = ({ children }) => {
  const [items, setItems] = useState<CartItem[]>([]);
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const { isAuthenticated } = useAuth();

  const loadCart = useCallback(async (): Promise<void> => {
    setIsLoading(true);
    try {
      const cartItems = await cartApi.getAll();
      setItems(cartItems);
    } catch (error) {
      // If cart loading fails, start with empty cart
      setItems([]);
      console.error("Failed to load cart:", error);
    } finally {
      setIsLoading(false);
    }
  }, []);

  useEffect(() => {
    if (isAuthenticated) {
      loadCart();
    } else {
      setItems([]);
    }
  }, [isAuthenticated, loadCart]);

  const addItem = useCallback(
    async (productId: number, quantity: number): Promise<void> => {
      if (!isAuthenticated) {
        throw new Error("Must be authenticated to add items to cart");
      }

      setIsLoading(true);
      try {
        await cartApi.add(productId, quantity);
        await loadCart();
      } catch (error) {
        throw error;
      } finally {
        setIsLoading(false);
      }
    },
    [isAuthenticated, loadCart],
  );

  const updateQuantity = useCallback(
    async (itemId: number, quantity: number): Promise<void> => {
      if (!isAuthenticated) {
        throw new Error("Must be authenticated to update cart");
      }

      const previousItems = [...items];

      try {
        setItems((currentItems) =>
          currentItems.map((item) =>
            item.id === itemId ? { ...item, quantity } : item,
          ),
        );

        setIsLoading(true);
        await cartApi.updateQuantity(itemId, quantity);
      } catch (error) {
        setItems(previousItems);
        throw error;
      } finally {
        setIsLoading(false);
      }
    },
    [items, isAuthenticated],
  );

  const removeItem = useCallback(
    async (itemId: number): Promise<void> => {
      if (!isAuthenticated) {
        throw new Error("Must be authenticated to remove items from cart");
      }

      const previousItems = [...items];

      try {
        setItems((currentItems) =>
          currentItems.filter((item) => item.id !== itemId),
        );

        setIsLoading(true);
        await cartApi.remove(itemId);
      } catch (error) {
        setItems(previousItems);
        throw error;
      } finally {
        setIsLoading(false);
      }
    },
    [items, isAuthenticated],
  );

  const clearCart = useCallback((): void => {
    setItems([]);
  }, []);

  const refreshCart = useCallback(async (): Promise<void> => {
    if (!isAuthenticated) {
      setItems([]);
      return;
    }

    try {
      const cartItems = await cartApi.getAll();
      setItems(cartItems);
    } catch (error) {
      console.error("Failed to refresh cart:", error);
      throw error;
    }
  }, [isAuthenticated]);

  const itemCount = items.reduce((total, item) => total + item.quantity, 0);
  const totalPrice = items.reduce((total, item) => {
    const price = item.product?.price || 0;
    return total + price * item.quantity;
  }, 0);

  const value: CartContextType = {
    items,
    itemCount,
    totalPrice,
    isLoading,
    addItem,
    updateQuantity,
    removeItem,
    clearCart,
    refreshCart,
  };

  return <CartContext.Provider value={value}>{children}</CartContext.Provider>;
};

export const useCart = (): CartContextType => {
  const context = React.useContext(CartContext);
  if (context === undefined) {
    throw new Error("useCart must be used within a CartProvider");
  }
  return context;
};

export default CartContext;
