import React, { createContext, useContext, useState, useEffect, useCallback, useRef } from 'react';
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

const CART_STORAGE_KEY = 'ktm_botanica_cart_v1';

export const CartProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [items, setItems] = useState<CartItem[]>(() => {
    try {
      const saved = localStorage.getItem(CART_STORAGE_KEY);
      return saved ? JSON.parse(saved) : [];
    } catch {
      return [];
    }
  });

  const [scheduledDeliveryDate, setScheduledDeliveryDate] = useState<string>('');
  const [giftMessage, setGiftMessage] = useState<string>('');
  const [deliveryNotes, setDeliveryNotes] = useState<string>('');
  const [hasUnavailableItems, setHasUnavailableItems] = useState<boolean>(false);
  const [hasPriceChanges, setHasPriceChanges] = useState<boolean>(false);
  const syncStartedRef = useRef(false);

  const applyServerCart = (serverItems: Awaited<ReturnType<typeof cartApi.getCart>>['items']) => {
    setItems((currentItems) =>
      currentItems.map((item) => {
        const serverItem = serverItems.find(
          (candidate) => candidate.productId === item.productId && candidate.variantId === item.variantId
        );
        return serverItem
          ? {
              ...item,
              id: serverItem.id,
              quantity: serverItem.quantity,
              unitPrice: serverItem.unitPrice,
              totalPrice: serverItem.totalPrice,
            }
          : item;
      })
    );
  };

  // Sync to localStorage
  useEffect(() => {
    try {
      localStorage.setItem(CART_STORAGE_KEY, JSON.stringify(items));
    } catch (e) {
      console.error('Failed to save cart to localStorage', e);
    }
  }, [items]);

  // Sync with Server on mount or token change
  const syncWithServer = useCallback(async () => {
    const token = localStorage.getItem('ktm_access_token');
    if (!token) return;
    if (syncStartedRef.current) return;
    syncStartedRef.current = true;

    try {
      // Only synthetic IDs are guest items. Server cart IDs must never be merged again.
      const localItems = items
        .filter((item) => item.id === `${item.productId}_${item.variantId}`)
        .map((i) => ({
        productId: i.productId,
        variantId: i.variantId,
        quantity: i.quantity,
        }));

      if (localItems.length > 0) {
        const res = await cartApi.mergeCart(localItems);
        applyServerCart(res.items);
        setHasUnavailableItems(res.hasUnavailableItems);
        setHasPriceChanges(res.hasPriceChanges);
      } else {
        const res = await cartApi.getCart();
        applyServerCart(res.items);
        setHasUnavailableItems(res.hasUnavailableItems);
        setHasPriceChanges(res.hasPriceChanges);
      }
    } catch (err) {
      console.error('Failed to sync server cart:', err);
    }
  }, [items]);

  useEffect(() => {
    const token = localStorage.getItem('ktm_access_token');
    if (token) {
      syncWithServer();
    }
  }, []);

  const refreshCart = async () => {
    const token = localStorage.getItem('ktm_access_token');
    if (token) {
      try {
        const res = await cartApi.getCart();
        applyServerCart(res.items);
        setHasUnavailableItems(res.hasUnavailableItems);
        setHasPriceChanges(res.hasPriceChanges);
      } catch (err) {
        console.error('Cart refresh error:', err);
      }
    }
  };

  const addToCart = async (product: Product, variant: ProductVariant, quantity = 1) => {
    const cartItemId = `${product.id}_${variant.id}`;
    const effectiveBase = Number(product.discountPrice || product.basePrice);
    const unitPrice = effectiveBase + Number(variant.priceAdjustment);

    setItems((prevItems) => {
      const existingIndex = prevItems.findIndex((item) => item.id === cartItemId || (item.productId === product.id && item.variantId === variant.id));
      if (existingIndex > -1) {
        const updated = [...prevItems];
        const newQty = updated[existingIndex].quantity + quantity;
        updated[existingIndex] = {
          ...updated[existingIndex],
          quantity: newQty,
          totalPrice: unitPrice * newQty,
        };
        return updated;
      } else {
        return [
          ...prevItems,
          {
            id: cartItemId,
            productId: product.id,
            variantId: variant.id,
            product,
            variant,
            quantity,
            unitPrice,
            totalPrice: unitPrice * quantity,
          },
        ];
      }
    });

    const token = localStorage.getItem('ktm_access_token');
    if (token) {
      try {
        const res = await cartApi.addItem(product.id, variant.id, quantity);
        applyServerCart(res.items);
      } catch (err) {
        console.error('Failed to add item to backend cart:', err);
      }
    }
  };

  const removeFromCart = async (cartItemId: string) => {
    setItems((prev) => prev.filter((item) => item.id !== cartItemId));

    const token = localStorage.getItem('ktm_access_token');
    if (token) {
      try {
        await cartApi.removeItem(cartItemId);
      } catch (err) {
        console.error('Failed to remove item from backend cart:', err);
      }
    }
  };

  const updateQuantity = async (cartItemId: string, quantity: number) => {
    if (quantity <= 0) {
      await removeFromCart(cartItemId);
      return;
    }
    setItems((prev) =>
      prev.map((item) => {
        if (item.id === cartItemId) {
          return {
            ...item,
            quantity,
            totalPrice: item.unitPrice * quantity,
          };
        }
        return item;
      })
    );

    const token = localStorage.getItem('ktm_access_token');
    if (token) {
      try {
        await cartApi.updateItem(cartItemId, quantity);
      } catch (err) {
        console.error('Failed to update item quantity in backend cart:', err);
      }
    }
  };

  const clearCart = async () => {
    setItems([]);
    setGiftMessage('');
    setScheduledDeliveryDate('');
    setDeliveryNotes('');
    localStorage.removeItem(CART_STORAGE_KEY);

    const token = localStorage.getItem('ktm_access_token');
    if (token) {
      try {
        await cartApi.clearCart();
      } catch (err) {
        console.error('Failed to clear backend cart:', err);
      }
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
