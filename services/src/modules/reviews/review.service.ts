import { prisma } from '../../config/database.js';
import { ApiError } from '../../utils/ApiError.js';

export class ReviewService {
  /**
   * 1. Check if user is eligible to review a product
   */
  static async canUserReview(productId: string, userId?: string) {
    if (!userId) {
      return {
        canReview: false,
        hasPurchased: false,
        hasReviewed: false,
        reason: 'Please sign in to write a review.',
        existingReview: null,
      };
    }

    // Check if product exists
    const product = await prisma.product.findUnique({
      where: { id: productId },
      select: { id: true, name: true },
    });

    if (!product) {
      throw ApiError.notFound('Product not found');
    }

    // Check if already reviewed
    const existingReview = await prisma.productReview.findUnique({
      where: {
        productId_userId: {
          productId,
          userId,
        },
      },
    });

    // Check verified purchase (Customer must have an order containing this product)
    const validPurchaseOrder = await prisma.order.findFirst({
      where: {
        userId,
        status: {
          in: ['DELIVERED', 'COMPLETED', 'CONFIRMED', 'PROCESSING', 'READY', 'OUT_FOR_DELIVERY'],
        },
        items: {
          some: { productId },
        },
      },
      select: { id: true, orderNumber: true, status: true },
    });

    const hasPurchased = !!validPurchaseOrder;
    const hasReviewed = !!existingReview;

    let reason: string | null = null;
    if (!hasPurchased) {
      reason = 'Only customers who have purchased this product can leave a verified review.';
    } else if (hasReviewed) {
      reason = 'You have already submitted a review for this plant. You can update your existing review.';
    }

    return {
      canReview: hasPurchased && !hasReviewed,
      hasPurchased,
      hasReviewed,
      reason,
      existingReview: existingReview || null,
      order: validPurchaseOrder || null,
    };
  }

  /**
   * 2. Submit a new review
   */
  static async createReview(data: {
    productId: string;
    userId: string;
    rating: number;
    title?: string;
    comment: string;
    plantPhotoUrl?: string;
  }) {
    if (!data.userId) {
      throw ApiError.unauthorized('Please sign in to submit a review');
    }

    const rating = Math.round(Number(data.rating));
    if (isNaN(rating) || rating < 1 || rating > 5) {
      throw ApiError.badRequest('Rating must be an integer between 1 and 5');
    }

    if (!data.comment || data.comment.trim().length < 3) {
      throw ApiError.badRequest('Please provide a review comment of at least 3 characters');
    }

    // Verify product exists
    const product = await prisma.product.findUnique({
      where: { id: data.productId },
      select: { id: true, name: true },
    });
    if (!product) {
      throw ApiError.notFound('Product not found');
    }

    // Prevent duplicate review abuse
    const existing = await prisma.productReview.findUnique({
      where: {
        productId_userId: {
          productId: data.productId,
          userId: data.userId,
        },
      },
    });

    if (existing) {
      throw ApiError.conflict('You have already submitted a review for this product. You can edit your existing review.');
    }

    // Strict Verified Purchase check: only customers who purchased can review
    const verifiedOrder = await prisma.order.findFirst({
      where: {
        userId: data.userId,
        status: {
          in: ['DELIVERED', 'COMPLETED', 'CONFIRMED', 'PROCESSING', 'READY', 'OUT_FOR_DELIVERY'],
        },
        items: {
          some: { productId: data.productId },
        },
      },
    });

    if (!verifiedOrder) {
      throw ApiError.forbidden('Only customers who purchased this product can review it.');
    }

    const review = await prisma.productReview.create({
      data: {
        productId: data.productId,
        userId: data.userId,
        rating,
        title: data.title?.trim() || null,
        comment: data.comment.trim(),
        plantPhotoUrl: data.plantPhotoUrl?.trim() || null,
        isVerifiedBuyer: true,
        isApproved: true, // Approved by default or pending admin moderation
      },
      include: {
        user: { select: { id: true, name: true } },
      },
    });

    return review;
  }

  /**
   * 3. Get approved product reviews with stats breakdown & pagination
   */
  static async getProductReviews(
    productId: string,
    query?: { page?: number; limit?: number }
  ) {
    const page = Math.max(1, query?.page || 1);
    const limit = Math.max(1, Math.min(50, query?.limit || 20));
    const skip = (page - 1) * limit;

    const where = {
      productId,
      isApproved: true,
    };

    const [reviews, total, allApprovedReviews] = await Promise.all([
      prisma.productReview.findMany({
        where,
        include: {
          user: { select: { id: true, name: true } },
        },
        orderBy: { createdAt: 'desc' },
        skip,
        take: limit,
      }),
      prisma.productReview.count({ where }),
      prisma.productReview.findMany({
        where,
        select: { rating: true },
      }),
    ]);

    // Calculate ratings distribution
    const ratingBreakdown = {
      5: 0,
      4: 0,
      3: 0,
      2: 0,
      1: 0,
    };

    let totalRatingSum = 0;
    allApprovedReviews.forEach((r) => {
      totalRatingSum += r.rating;
      if (ratingBreakdown[r.rating as keyof typeof ratingBreakdown] !== undefined) {
        ratingBreakdown[r.rating as keyof typeof ratingBreakdown] += 1;
      }
    });

    const averageRating =
      allApprovedReviews.length > 0
        ? Number((totalRatingSum / allApprovedReviews.length).toFixed(1))
        : 5.0;

    return {
      reviews: reviews.map((r) => ({
        id: r.id,
        productId: r.productId,
        userId: r.userId,
        customerName: r.user?.name || 'Verified Gardener',
        rating: r.rating,
        title: r.title,
        comment: r.comment,
        plantPhotoUrl: r.plantPhotoUrl,
        isVerifiedBuyer: r.isVerifiedBuyer,
        createdAt: r.createdAt,
      })),
      stats: {
        averageRating,
        reviewCount: total,
        ratingBreakdown,
      },
      meta: {
        page,
        limit,
        total,
        totalPages: Math.ceil(total / limit),
      },
    };
  }

  /**
   * 4. Update customer's own review
   */
  static async updateReview(
    reviewId: string,
    userId: string,
    data: { rating?: number; title?: string; comment?: string; plantPhotoUrl?: string }
  ) {
    const review = await prisma.productReview.findUnique({
      where: { id: reviewId },
    });

    if (!review) {
      throw ApiError.notFound('Review not found');
    }

    if (review.userId !== userId) {
      throw ApiError.forbidden('You can only edit your own review');
    }

    const updated = await prisma.productReview.update({
      where: { id: reviewId },
      data: {
        ...(data.rating ? { rating: Math.round(data.rating) } : {}),
        ...(data.title !== undefined ? { title: data.title } : {}),
        ...(data.comment ? { comment: data.comment.trim() } : {}),
        ...(data.plantPhotoUrl !== undefined ? { plantPhotoUrl: data.plantPhotoUrl } : {}),
      },
      include: {
        user: { select: { id: true, name: true } },
      },
    });

    return updated;
  }

  /**
   * 5. Delete customer's own review
   */
  static async deleteReview(reviewId: string, userId: string) {
    const review = await prisma.productReview.findUnique({
      where: { id: reviewId },
    });

    if (!review) {
      throw ApiError.notFound('Review not found');
    }

    if (review.userId !== userId) {
      throw ApiError.forbidden('You can only delete your own review');
    }

    await prisma.productReview.delete({
      where: { id: reviewId },
    });

    return { message: 'Review removed successfully' };
  }
}
