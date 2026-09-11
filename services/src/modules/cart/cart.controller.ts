import { Response } from 'express';
import crypto from 'crypto';
import { CartService } from './cart.service.js';
import { ApiResponse } from '../../utils/ApiResponse.js';
import { asyncHandler } from '../../utils/asyncHandler.js';
import { AuthenticatedRequest, extractCookie } from '../../middlewares/auth.middleware.js';
import { ApiError } from '../../utils/ApiError.js';

const getSessionId = (req: AuthenticatedRequest, res: Response): string | undefined => {
  if (req.user?.id) return undefined;
  let sessionId = (req.headers['x-session-id'] as string) || extractCookie(req, 'ktm_session_id');
  if (!sessionId) {
    sessionId = `guest_${crypto.randomUUID()}`;
    res.cookie('ktm_session_id', sessionId, {
      httpOnly: false, // Accessible to client if needed
      maxAge: 30 * 24 * 60 * 60 * 1000, // 30 days
      path: '/',
      sameSite: 'lax',
    });
  }
  return sessionId;
};

export class CartController {
  static getCart = asyncHandler(async (req: AuthenticatedRequest, res: Response) => {
    const userId = req.user?.id;
    const sessionId = getSessionId(req, res);
    const cart = await CartService.getCart(userId, sessionId);
    res.status(200).json(ApiResponse.success(cart, 'Cart retrieved successfully'));
  });

  static addItem = asyncHandler(async (req: AuthenticatedRequest, res: Response) => {
    const userId = req.user?.id;
    const sessionId = getSessionId(req, res);
    const cart = await CartService.addItem(userId, sessionId, req.body);
    res.status(200).json(ApiResponse.success(cart, 'Item added to cart successfully'));
  });

  static updateItem = asyncHandler(async (req: AuthenticatedRequest, res: Response) => {
    const userId = req.user?.id;
    const sessionId = getSessionId(req, res);
    const cart = await CartService.updateItem(userId, sessionId, req.params.id, req.body.quantity);
    res.status(200).json(ApiResponse.success(cart, 'Cart item updated successfully'));
  });

  static removeItem = asyncHandler(async (req: AuthenticatedRequest, res: Response) => {
    const userId = req.user?.id;
    const sessionId = getSessionId(req, res);
    const cart = await CartService.removeItem(userId, sessionId, req.params.id);
    res.status(200).json(ApiResponse.success(cart, 'Cart item removed successfully'));
  });

  static clearCart = asyncHandler(async (req: AuthenticatedRequest, res: Response) => {
    const userId = req.user?.id;
    const sessionId = getSessionId(req, res);
    const cart = await CartService.clearCart(userId, sessionId);
    res.status(200).json(ApiResponse.success(cart, 'Cart cleared successfully'));
  });

  static mergeCart = asyncHandler(async (req: AuthenticatedRequest, res: Response) => {
    const userId = req.user?.id;
    if (!userId) {
      throw ApiError.unauthorized('Authentication required to merge cart');
    }
    const cart = await CartService.mergeGuestCart(userId, req.body.items || []);
    res.status(200).json(ApiResponse.success(cart, 'Guest cart merged successfully'));
  });
}
