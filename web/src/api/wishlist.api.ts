import { apiClient } from './client';

export interface WishlistItemDto {
  wishlistItemId: string;
  productId: string;
  name: string;
  slug: string;
  sku: string;
  shortDescription?: string;
  category?: { id: string; name: string; slug: string };
  imageUrl: string | null;
  basePrice: number;
  compareAtPrice: number | null;
  inStock: boolean;
  isAvailable: boolean;
  addedAt: string;
}

export interface WishlistResponseDto {
  wishlistId: string;
  items: WishlistItemDto[];
  totalCount: number;
}

export const wishlistApi = {
  getWishlist: async (): Promise<WishlistResponseDto> => {
    const res = await apiClient.get('/wishlist');
    return res.data.data;
  },

  addToWishlist: async (productId: string): Promise<WishlistResponseDto> => {
    const res = await apiClient.post(`/wishlist/${productId}`);
    return res.data.data;
  },

  removeFromWishlist: async (productId: string): Promise<WishlistResponseDto> => {
    const res = await apiClient.delete(`/wishlist/${productId}`);
    return res.data.data;
  },

  toggleWishlist: async (productId: string): Promise<{ inWishlist: boolean; wishlist: WishlistResponseDto }> => {
    const res = await apiClient.post(`/wishlist/toggle/${productId}`);
    return res.data.data;
  },
};
