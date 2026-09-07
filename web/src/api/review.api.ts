import { apiClient } from './client';

export interface ProductReviewItem {
  id: string;
  productId: string;
  userId?: string;
  customerName: string;
  rating: number;
  title?: string | null;
  comment: string;
  plantPhotoUrl?: string | null;
  isVerifiedBuyer: boolean;
  createdAt: string;
}

export interface ReviewStats {
  averageRating: number;
  reviewCount: number;
  ratingBreakdown: {
    5: number;
    4: number;
    3: number;
    2: number;
    1: number;
  };
}

export interface ReviewEligibility {
  canReview: boolean;
  hasPurchased: boolean;
  hasReviewed: boolean;
  reason?: string | null;
  existingReview?: ProductReviewItem | null;
}

export interface ReviewsResponse {
  reviews: ProductReviewItem[];
  stats: ReviewStats;
  meta: {
    page: number;
    limit: number;
    total: number;
    totalPages: number;
  };
}

export const reviewApi = {
  // Get approved reviews and statistics for a product
  getProductReviews: async (productId: string, params?: { page?: number; limit?: number }): Promise<ReviewsResponse> => {
    const res = await apiClient.get(`/reviews/products/${productId}`, { params });
    const payload = res.data;
    return {
      reviews: payload.data || [],
      stats: payload.meta?.stats || {
        averageRating: 5.0,
        reviewCount: (payload.data || []).length,
        ratingBreakdown: { 5: 0, 4: 0, 3: 0, 2: 0, 1: 0 },
      },
      meta: payload.meta || { page: 1, limit: 20, total: 0, totalPages: 1 },
    };
  },

  // Check if authenticated user is eligible to write a review
  canUserReview: async (productId: string): Promise<ReviewEligibility> => {
    try {
      const res = await apiClient.get(`/reviews/can-review/${productId}`);
      return res.data.data;
    } catch {
      return {
        canReview: false,
        hasPurchased: false,
        hasReviewed: false,
        reason: 'Sign in to check review eligibility',
      };
    }
  },

  // Submit new review
  createReview: async (data: {
    productId: string;
    rating: number;
    title?: string;
    comment: string;
    plantPhotoUrl?: string;
  }): Promise<ProductReviewItem> => {
    const res = await apiClient.post('/reviews', data);
    return res.data.data;
  },

  // Update customer's own review
  updateReview: async (
    id: string,
    data: { rating?: number; title?: string; comment?: string; plantPhotoUrl?: string }
  ): Promise<ProductReviewItem> => {
    const res = await apiClient.patch(`/reviews/${id}`, data);
    return res.data.data;
  },

  // Delete customer's own review
  deleteReview: async (id: string): Promise<void> => {
    await apiClient.delete(`/reviews/${id}`);
  },
};
