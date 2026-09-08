import { Response } from 'express';
import { OrderService } from './order.service.js';
import { ApiResponse } from '../../utils/ApiResponse.js';
import { ApiError } from '../../utils/ApiError.js';
import { asyncHandler } from '../../utils/asyncHandler.js';
import { AuthenticatedRequest } from '../../middlewares/auth.middleware.js';
import { UserRole } from '@prisma/client';

export class OrderController {
  static createOrder = asyncHandler(async (req: AuthenticatedRequest, res: Response) => {
    const userId = req.user?.id;
    if (!userId) {
      throw ApiError.unauthorized('Please log in to place an order. Anonymous checkout is not permitted.');
    }
    // Extract optional idempotency key from header or body
    const idempotencyKey = (req.headers['idempotency-key'] as string) || req.body.idempotencyKey;
    const order = await OrderService.createOrder({ ...req.body, idempotencyKey }, userId);
    res.status(201).json(ApiResponse.created(order, 'Order created successfully'));
  });

  static getMyOrders = asyncHandler(async (req: AuthenticatedRequest, res: Response) => {
    const userId = req.user?.id;
    const result = await OrderService.getOrders(req.query as any, userId, false);
    res.status(200).json(ApiResponse.success(result.orders, 'Customer orders retrieved', 200, result.meta));
  });

  static getOrders = asyncHandler(async (req: AuthenticatedRequest, res: Response) => {
    const userId = req.user?.id;
    const isAdminOrStaff = req.user?.role === UserRole.ADMIN || req.user?.role === UserRole.STAFF;
    const result = await OrderService.getOrders(req.query as any, userId, isAdminOrStaff);
    res.status(200).json(ApiResponse.success(result.orders, 'Orders retrieved', 200, result.meta));
  });

  static getOrderById = asyncHandler(async (req: AuthenticatedRequest, res: Response) => {
    const userId = req.user?.id;
    const isAdminOrStaff = req.user?.role === UserRole.ADMIN || req.user?.role === UserRole.STAFF;
    const order = await OrderService.getOrderById(req.params.id, userId, isAdminOrStaff);
    res.status(200).json(ApiResponse.success(order, 'Order details retrieved'));
  });

  static cancelOrder = asyncHandler(async (req: AuthenticatedRequest, res: Response) => {
    const userId = req.user?.id;
    const isAdminOrStaff = req.user?.role === UserRole.ADMIN || req.user?.role === UserRole.STAFF;
    const result = await OrderService.cancelOrder(req.params.id, req.body.reason, userId, isAdminOrStaff);
    res.status(200).json(ApiResponse.success(result, 'Order cancelled and inventory restored'));
  });

  static updateOrderStatus = asyncHandler(async (req: AuthenticatedRequest, res: Response) => {
    const adminUserId = req.user?.id;
    const order = await OrderService.updateOrderStatus(req.params.id, req.body, adminUserId);
    res.status(200).json(ApiResponse.success(order, 'Order status updated successfully'));
  });
}
