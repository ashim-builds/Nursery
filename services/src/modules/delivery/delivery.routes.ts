import { Router } from 'express';
import { DeliveryController } from './delivery.controller.js';
import { authenticateJWT, requireRole } from '../../middlewares/auth.middleware.js';
import { validateRequest } from '../../middlewares/validate.middleware.js';
import {
  createZoneSchema,
  updateZoneSchema,
  calculateZoneSchema,
  assignRiderSchema,
  updateDeliveryStatusSchema,
} from '../../validators/delivery.validator.js';
import { UserRole } from '@prisma/client';

const router = Router();

// Public & Customer Endpoints
router.get('/', DeliveryController.getZones);
router.post('/calculate', validateRequest(calculateZoneSchema), DeliveryController.calculateZone);
router.get('/:id', DeliveryController.getZoneById);

// Admin / Staff Zone Management
router.post(
  '/',
  authenticateJWT,
  requireRole(UserRole.ADMIN, UserRole.STAFF),
  validateRequest(createZoneSchema),
  DeliveryController.createZone
);

router.patch(
  '/:id',
  authenticateJWT,
  requireRole(UserRole.ADMIN, UserRole.STAFF),
  validateRequest(updateZoneSchema),
  DeliveryController.updateZone
);

// Admin / Logistics Delivery Actions
router.patch(
  '/deliveries/:id/assign',
  authenticateJWT,
  requireRole(UserRole.ADMIN, UserRole.STAFF),
  validateRequest(assignRiderSchema),
  DeliveryController.assignRider
);

router.patch(
  '/deliveries/:id/status',
  authenticateJWT,
  requireRole(UserRole.ADMIN, UserRole.STAFF),
  validateRequest(updateDeliveryStatusSchema),
  DeliveryController.updateDeliveryStatus
);

export const deliveryRoutes = router;
