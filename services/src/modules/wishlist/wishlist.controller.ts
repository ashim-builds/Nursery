import { Response } from 'express';
import { WishlistService } from './wishlist.service.js';
import { ApiResponse } from '../../utils/ApiResponse.js';
import { asyncHandler } from '../../utils/asyncHandler.js';
import { AuthenticatedRequest } from '../../middlewares/auth.middleware.js';
import { ApiError } from '../../utils/ApiError.js';

export class WishlistController {
  static getWishlist = asyncHandler(async (req: AuthenticatedRequest, res: Response) => {
    const userId = req.user?.id;
    if (!userId) throw ApiError.unauthorized('Authentication required to access wishlist');

    const wishlist = await WishlistService.getWishlist(userId);
    res.status(200).json(ApiResponse.success(wishlist, 'Wishlist retrieved successfully'));
  });

  static addToWishlist = asyncHandler(async (req: AuthenticatedRequest, res: Response) => {
    const userId = req.user?.id;
    if (!userId) throw ApiError.unauthorized('Authentication required to update wishlist');

    const wishlist = await WishlistService.addToWishlist(userId, req.params.productId);
    res.status(200).json(ApiResponse.success(wishlist, 'Product added to wishlist'));
  });

  static removeFromWishlist = asyncHandler(async (req: AuthenticatedRequest, res: Response) => {
    const userId = req.user?.id;
    if (!userId) throw ApiError.unauthorized('Authentication required to update wishlist');

    const wishlist = await WishlistService.removeFromWishlist(userId, req.params.productId);
    res.status(200).json(ApiResponse.success(wishlist, 'Product removed from wishlist'));
  });

  static toggleWishlist = asyncHandler(async (req: AuthenticatedRequest, res: Response) => {
    const userId = req.user?.id;
    if (!userId) throw ApiError.unauthorized('Authentication required to update wishlist');

    const result = await WishlistService.toggleWishlist(userId, req.params.productId);
    res.status(200).json(
      ApiResponse.success(
        result,
        result.inWishlist ? 'Product added to wishlist' : 'Product removed from wishlist'
      )
    );
  });
}
