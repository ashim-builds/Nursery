import { apiClient } from './client';

export interface CartItemDto {
  id: string;
  productId: string;
  variantId: string;
  productName: string;
  productSlug: string;
  variantName: string;
  sku: string;
  imageUrl: string | null;
  category?: { id: string; name: string; slug: string };
  unitPrice: number;
  previousPrice: number | null;
  quantity: number;
  totalPrice: number;
  availableStock: number;
  isAvailable: boolean;
  isSufficientStock: boolean;
  validationIssues?: {
    productUnavailable?: boolean;
    variantUnavailable?: boolean;
    outOfStock?: boolean;
    insufficientStock?: boolean;
    priceChanged?: boolean;
  };
}

export interface CartResponseDto {
  cartId: string;
  items: CartItemDto[];
  itemCount: number;
  subtotal: number;
  deliveryFee: number;
  freeDeliveryThreshold: number;
  amountNeededForFreeDelivery: number;
  total: number;
  hasUnavailableItems: boolean;
  hasPriceChanges: boolean;
}

export const cartApi = {
  getCart: async (): Promise<CartResponseDto> => {
    const res = await apiClient.get('/cart');
    return res.data.data;
  },

  addItem: async (productId: string, variantId: string, quantity = 1): Promise<CartResponseDto> => {
    const res = await apiClient.post('/cart/items', { productId, variantId, quantity });
    return res.data.data;
  },

  updateItem: async (cartItemId: string, quantity: number): Promise<CartResponseDto> => {
    const res = await apiClient.patch(`/cart/items/${cartItemId}`, { quantity });
    return res.data.data;
  },

  removeItem: async (cartItemId: string): Promise<CartResponseDto> => {
    const res = await apiClient.delete(`/cart/items/${cartItemId}`);
    return res.data.data;
  },

  clearCart: async (): Promise<CartResponseDto> => {
    const res = await apiClient.delete('/cart');
    return res.data.data;
  },

  mergeCart: async (
    items: Array<{ productId: string; variantId: string; quantity: number }>
  ): Promise<CartResponseDto> => {
    const res = await apiClient.post('/cart/merge', { items });
    return res.data.data;
  },
};
