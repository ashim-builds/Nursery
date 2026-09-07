import { Request, Response } from 'express';
import { ReviewService } from './review.service.js';
import { ApiResponse } from '../../utils/ApiResponse.js';
import { asyncHandler } from '../../utils/asyncHandler.js';
import { AuthenticatedRequest } from '../../middlewares/auth.middleware.js';
import { ApiError } from '../../utils/ApiError.js';

export class ReviewController {
  // 1. Check if authenticated user can review this product
  static canUserReview = asyncHandler(async (req: AuthenticatedRequest, res: Response) => {
    const userId = req.user?.id;
    const productId = req.params.productId;

    const result = await ReviewService.canUserReview(productId, userId);
    res.status(200).json(ApiResponse.success(result, 'Review eligibility checked'));
  });

  // 2. Submit review (Must be authenticated and verified purchaser)
  static create = asyncHandler(async (req: AuthenticatedRequest, res: Response) => {
    const userId = req.user?.id;
    if (!userId) {
      throw ApiError.unauthorized('Please sign in to submit a review');
    }

    const { productId, rating, title, comment, plantPhotoUrl } = req.body;

    if (!productId) {
      throw ApiError.badRequest('Product ID is required');
    }

    const review = await ReviewService.createReview({
      productId,
      userId,
      rating: Number(rating),
      title,
      comment,
      plantPhotoUrl,
    });

    res.status(201).json(ApiResponse.created(review, 'Review submitted successfully'));
  });

  // 3. Get approved reviews for a product with breakdown & stats
  static getProductReviews = asyncHandler(async (req: Request, res: Response) => {
    const productId = req.params.productId;
    const page = req.query.page ? parseInt(req.query.page as string, 10) : undefined;
    const limit = req.query.limit ? parseInt(req.query.limit as string, 10) : undefined;

    const result = await ReviewService.getProductReviews(productId, { page, limit });
    res.status(200).json(
      ApiResponse.success(result.reviews, 'Product reviews retrieved', 200, {
        ...result.meta,
        stats: result.stats,
      })
    );
  });

  // 4. Update own review
  static updateReview = asyncHandler(async (req: AuthenticatedRequest, res: Response) => {
    const userId = req.user?.id;
    if (!userId) {
      throw ApiError.unauthorized('User not authenticated');
    }

    const review = await ReviewService.updateReview(req.params.id, userId, req.body);
    res.status(200).json(ApiResponse.success(review, 'Review updated successfully'));
  });

  // 5. Delete own review
  static deleteReview = asyncHandler(async (req: AuthenticatedRequest, res: Response) => {
    const userId = req.user?.id;
    if (!userId) {
      throw ApiError.unauthorized('User not authenticated');
    }

    const result = await ReviewService.deleteReview(req.params.id, userId);
    res.status(200).json(ApiResponse.success(result, 'Review deleted successfully'));
  });
}
