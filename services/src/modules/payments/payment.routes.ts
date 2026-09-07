import { Router } from 'express';
import { PaymentController } from './payment.controller.js';
import { optionalAuth, authenticateJWT, requireRole } from '../../middlewares/auth.middleware.js';
import { validateRequest } from '../../middlewares/validate.middleware.js';
import {
  createPaymentSchema,
  verifyPaymentSchema,
  markCashPaidSchema,
} from '../../validators/payment.validator.js';
import { UserRole } from '@prisma/client';

const router = Router();

// Payment Initiation (Checkout or Order Retry)
router.post('/create', optionalAuth, validateRequest(createPaymentSchema), PaymentController.createPayment);

// Server-Side Payment Verification (Client sends token / pidx / callback params)
router.post('/verify', optionalAuth, validateRequest(verifyPaymentSchema), PaymentController.verifyPayment);

// Asynchronous Gateway Webhook / IPN
router.post('/webhook', PaymentController.webhook);

// Payment details & history
router.get('/:id', optionalAuth, PaymentController.getPayment);
router.get('/order/:orderId', optionalAuth, PaymentController.getPaymentsByOrder);

// Admin/Rider: Mark Cash on Delivery as collected
router.post(
  '/:id/mark-cash-paid',
  authenticateJWT,
  requireRole(UserRole.ADMIN, UserRole.STAFF),
  validateRequest(markCashPaidSchema),
  PaymentController.markCashPaid
);

export const paymentRoutes = router;
