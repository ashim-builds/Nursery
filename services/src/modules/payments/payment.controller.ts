import { Request, Response } from 'express';
import { PaymentService } from './payment.service.js';
import { ApiResponse } from '../../utils/ApiResponse.js';
import { asyncHandler } from '../../utils/asyncHandler.js';
import { AuthenticatedRequest } from '../../middlewares/auth.middleware.js';
import { PaymentMethod } from '@prisma/client';
import { ApiError } from '../../utils/ApiError.js';

export class PaymentController {
  static createPayment = asyncHandler(async (req: AuthenticatedRequest, res: Response) => {
    const userId = req.user?.id;
    const result = await PaymentService.initiatePayment({
      ...req.body,
      userId,
    });
    res.status(201).json(ApiResponse.created(result, 'Payment initiated successfully'));
  });

  static verifyPayment = asyncHandler(async (req: AuthenticatedRequest, res: Response) => {
    const userId = req.user?.id;
    const result = await PaymentService.verifyPayment({
      ...req.body,
      userId,
    });
    res.status(200).json(ApiResponse.success(result, result.message));
  });

  static webhook = asyncHandler(async (req: Request, res: Response) => {
    const methodQuery = req.query.method as string;
    if (!methodQuery) {
      throw ApiError.badRequest('Payment method is required');
    }
    const method = methodQuery.toUpperCase() as PaymentMethod;
    const result = await PaymentService.processWebhook(method, req.headers, req.body);
    res.status(200).json(ApiResponse.success(result, 'Webhook processed successfully'));
  });

  static getPayment = asyncHandler(async (req: Request, res: Response) => {
    const payment = await PaymentService.getPaymentDetails(req.params.id);
    res.status(200).json(ApiResponse.success(payment, 'Payment details retrieved'));
  });

  static getPaymentsByOrder = asyncHandler(async (req: Request, res: Response) => {
    const payments = await PaymentService.getPaymentsByOrder(req.params.orderId);
    res.status(200).json(ApiResponse.success(payments, 'Order payment history retrieved'));
  });

  static markCashPaid = asyncHandler(async (req: AuthenticatedRequest, res: Response) => {
    const adminUserId = req.user?.id;
    const result = await PaymentService.markCashPaymentPaid(
      req.params.id,
      adminUserId,
      req.body.reference
    );
    res.status(200).json(ApiResponse.success(result, 'Cash payment marked as paid'));
  });
}
