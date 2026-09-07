import { apiClient } from './client';
import { Product, Category, Review } from '../types/product';

export interface ProductQueryParams {
  page?: number;
  limit?: number;
  search?: string;
  category?: string;
  productType?: string;
  sunlight?: string;
  watering?: string;
  difficulty?: string;
  petFriendly?: boolean;
  airPurifying?: boolean;
  isSeasonal?: boolean;
  isFeatured?: boolean;
  inStock?: boolean;
  size?: string;
  minPrice?: number;
  maxPrice?: number;
  sortBy?: 'price_asc' | 'price_desc' | 'newest' | 'rating' | 'popular' | 'relevance';
}

export const productApi = {
  getProducts: async (params?: ProductQueryParams): Promise<{ products: Product[]; meta: any }> => {
    const res = await apiClient.get('/products', { params });
    return { products: res.data.data, meta: res.data.meta };
  },

  getProductBySlug: async (slug: string): Promise<Product> => {
    const res = await apiClient.get(`/products/slug/${slug}`);
    return res.data.data;
  },

  getProductById: async (id: string): Promise<Product> => {
    const res = await apiClient.get(`/products/${id}`);
    return res.data.data;
  },

  getCategories: async (): Promise<Category[]> => {
    const res = await apiClient.get('/categories');
    return res.data.data;
  },

  submitReview: async (reviewData: {
    productId: string;
    customerName: string;
    rating: number;
    comment: string;
    plantPhotoUrl?: string;
  }): Promise<Review> => {
    const res = await apiClient.post('/reviews', reviewData);
    return res.data.data;
  },
};
