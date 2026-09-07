import { Request, Response } from 'express';
import { AdminService } from './admin.service.js';
import { ApiResponse } from '../../utils/ApiResponse.js';
import { asyncHandler } from '../../utils/asyncHandler.js';
import { AuthenticatedRequest } from '../../middlewares/auth.middleware.js';

export class AdminController {
  static getDashboard = asyncHandler(async (req: Request, res: Response) => {
    const dashboard = await AdminService.getDashboard();
    res.status(200).json(ApiResponse.success(dashboard, 'Admin dashboard overview'));
  });

  static getMetrics = asyncHandler(async (req: Request, res: Response) => {
    const metrics = await AdminService.getDashboard();
    res.status(200).json(ApiResponse.success(metrics, 'Admin metrics overview'));
  });

  static getCustomers = asyncHandler(async (req: Request, res: Response) => {
    const result = await AdminService.getCustomers(req.query as any);
    res.status(200).json(ApiResponse.success(result.customers, 'Customers retrieved', 200, result.meta));
  });

  static getPayments = asyncHandler(async (req: Request, res: Response) => {
    const result = await AdminService.getPayments(req.query as any);
    res.status(200).json(ApiResponse.success(result.payments, 'Payments list retrieved', 200, result.meta));
  });

  // Coupons
  static getCoupons = asyncHandler(async (req: Request, res: Response) => {
    const coupons = await AdminService.getCoupons();
    res.status(200).json(ApiResponse.success(coupons, 'Coupons list'));
  });

  static createCoupon = asyncHandler(async (req: AuthenticatedRequest, res: Response) => {
    const coupon = await AdminService.createCoupon(req.body, req.user?.id);
    res.status(201).json(ApiResponse.created(coupon, 'Coupon created successfully'));
  });

  static updateCoupon = asyncHandler(async (req: AuthenticatedRequest, res: Response) => {
    const coupon = await AdminService.updateCoupon(req.params.id, req.body, req.user?.id);
    res.status(200).json(ApiResponse.success(coupon, 'Coupon updated successfully'));
  });

  static deleteCoupon = asyncHandler(async (req: AuthenticatedRequest, res: Response) => {
    const result = await AdminService.deleteCoupon(req.params.id, req.user?.id);
    res.status(200).json(ApiResponse.success(result, 'Coupon deleted'));
  });

  // Reviews Moderation
  static getReviews = asyncHandler(async (req: Request, res: Response) => {
    const result = await AdminService.getReviews(req.query as any);
    res.status(200).json(ApiResponse.success(result.reviews, 'Reviews list', 200, result.meta));
  });

  static moderateReview = asyncHandler(async (req: AuthenticatedRequest, res: Response) => {
    const review = await AdminService.moderateReview(req.params.id, req.body.isApproved, req.user?.id);
    res.status(200).json(ApiResponse.success(review, 'Review moderation updated'));
  });

  static deleteReview = asyncHandler(async (req: AuthenticatedRequest, res: Response) => {
    const result = await AdminService.deleteReview(req.params.id, req.user?.id);
    res.status(200).json(ApiResponse.success(result, 'Review deleted'));
  });

  // Notifications
  static broadcastNotification = asyncHandler(async (req: AuthenticatedRequest, res: Response) => {
    const result = await AdminService.broadcastNotification(req.body, req.user?.id);
    res.status(200).json(ApiResponse.success(result, result.message));
  });

  // Audit Logs
  static getAuditLogs = asyncHandler(async (req: Request, res: Response) => {
    const logs = await AdminService.getAuditLogs(req.query as any);
    res.status(200).json(ApiResponse.success(logs, 'Audit logs retrieved'));
  });
}
