import { Router } from 'express';
import { OrderController } from './order.controller.js';
import { authenticateJWT, optionalAuth, requireRole } from '../../middlewares/auth.middleware.js';
import { validateRequest } from '../../middlewares/validate.middleware.js';
import {
  createOrderSchema,
  cancelOrderSchema,
  updateOrderStatusSchema,
  orderQuerySchema,
} from '../../validators/order.validator.js';
import { UserRole } from '@prisma/client';

const router = Router();

// Guest or Authenticated Checkout
router.post('/', optionalAuth, validateRequest(createOrderSchema), OrderController.createOrder);

// Customer / Admin order listing
router.get('/', optionalAuth, validateRequest(orderQuerySchema), OrderController.getOrders);
router.get('/my-orders', authenticateJWT, validateRequest(orderQuerySchema), OrderController.getMyOrders);

// Single order details
router.get('/:id', optionalAuth, OrderController.getOrderById);

// Order Cancellation (Customer or Admin)
router.post('/:id/cancel', optionalAuth, validateRequest(cancelOrderSchema), OrderController.cancelOrder);

// Admin & Fulfillment Staff Status Update
router.patch(
  '/:id/status',
  authenticateJWT,
  requireRole(UserRole.ADMIN, UserRole.STAFF),
  validateRequest(updateOrderStatusSchema),
  OrderController.updateOrderStatus
);

export const orderRoutes = router;
