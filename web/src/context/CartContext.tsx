import React, { createContext, useContext, useState, useEffect, useCallback } from 'react';
import { CartItem } from '../types/cart';
import { Product, ProductVariant } from '../types/product';
import { cartApi } from '../api/cart.api';

interface CartContextType {
  items: CartItem[];
  itemCount: number;
  subtotal: number;
  deliveryFee: number;
  total: number;
  scheduledDeliveryDate: string;
  giftMessage: string;
  deliveryNotes: string;
  hasUnavailableItems: boolean;
  hasPriceChanges: boolean;
  addToCart: (product: Product, variant: ProductVariant, quantity?: number) => Promise<void>;
  removeFromCart: (cartItemId: string) => Promise<void>;
  updateQuantity: (cartItemId: string, quantity: number) => Promise<void>;
  setScheduledDeliveryDate: (date: string) => void;
  setGiftMessage: (msg: string) => void;
  setDeliveryNotes: (notes: string) => void;
  clearCart: () => Promise<void>;
  refreshCart: () => Promise<void>;
}

const CartContext = createContext<CartContextType | undefined>(undefined);

export const CartProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [items, setItems] = useState<CartItem[]>([]);
  const [scheduledDeliveryDate, setScheduledDeliveryDate] = useState<string>('');
  const [giftMessage, setGiftMessage] = useState<string>('');
  const [deliveryNotes, setDeliveryNotes] = useState<string>('');
  const [hasUnavailableItems, setHasUnavailableItems] = useState<boolean>(false);
  const [hasPriceChanges, setHasPriceChanges] = useState<boolean>(false);

  const applyServerCart = (serverCart: Awaited<ReturnType<typeof cartApi.getCart>>) => {
    if (!serverCart || !Array.isArray(serverCart.items)) {
      setItems([]);
      return;
    }

    const mappedItems: CartItem[] = serverCart.items.map((item: any) => ({
      id: item.id,
      productId: item.productId,
      variantId: item.variantId,
      product: item.product,
      variant: item.variant,
      quantity: item.quantity,
      unitPrice: Number(item.unitPrice),
      totalPrice: Number(item.totalPrice),
    }));

    setItems(mappedItems);
    setHasUnavailableItems(!!serverCart.hasUnavailableItems);
    setHasPriceChanges(!!serverCart.hasPriceChanges);
  };

  const refreshCart = useCallback(async () => {
    try {
      const res = await cartApi.getCart();
      applyServerCart(res);
    } catch {
      // Backend cart may be empty or newly initialized
    }
  }, []);

  // Fetch cart directly from MySQL on mount
  useEffect(() => {
    refreshCart();
  }, [refreshCart]);

  const addToCart = async (product: Product, variant: ProductVariant, quantity = 1) => {
    try {
      const res = await cartApi.addItem(product.id, variant.id, quantity);
      applyServerCart(res);
    } catch (err) {
      console.error('Failed to add item to backend cart:', err);
    }
  };

  const removeFromCart = async (cartItemId: string) => {
    try {
      const res = await cartApi.removeItem(cartItemId);
      applyServerCart(res);
    } catch (err) {
      console.error('Failed to remove item from backend cart:', err);
    }
  };

  const updateQuantity = async (cartItemId: string, quantity: number) => {
    if (quantity <= 0) {
      await removeFromCart(cartItemId);
      return;
    }
    try {
      const res = await cartApi.updateItem(cartItemId, quantity);
      applyServerCart(res);
    } catch (err) {
      console.error('Failed to update item quantity in backend cart:', err);
    }
  };

  const clearCart = async () => {
    setItems([]);
    setGiftMessage('');
    setScheduledDeliveryDate('');
    setDeliveryNotes('');

    try {
      await cartApi.clearCart();
    } catch (err) {
      console.error('Failed to clear backend cart:', err);
    }
  };

  const itemCount = items.reduce((sum, item) => sum + item.quantity, 0);
  const subtotal = items.reduce((sum, item) => sum + item.totalPrice, 0);
  const deliveryFee = subtotal === 0 ? 0 : subtotal >= 2000 ? 0 : 100;
  const total = subtotal + deliveryFee;

  return (
    <CartContext.Provider
      value={{
        items,
        itemCount,
        subtotal,
        deliveryFee,
        total,
        scheduledDeliveryDate,
        giftMessage,
        deliveryNotes,
        hasUnavailableItems,
        hasPriceChanges,
        addToCart,
        removeFromCart,
        updateQuantity,
        setScheduledDeliveryDate,
        setGiftMessage,
        setDeliveryNotes,
        clearCart,
        refreshCart,
      }}
    >
      {children}
    </CartContext.Provider>
  );
};

export const useCart = () => {
  const context = useContext(CartContext);
  if (!context) throw new Error('useCart must be used within a CartProvider');
  return context;
};
