import { Router } from 'express';
import { InventoryController } from './inventory.controller.js';
import { authenticateJWT, requireRole } from '../../middlewares/auth.middleware.js';
import { UserRole } from '@prisma/client';

const router = Router();

router.get('/low-stock', authenticateJWT, requireRole(UserRole.ADMIN, UserRole.STAFF), InventoryController.getLowStock);
router.get('/logs', authenticateJWT, requireRole(UserRole.ADMIN, UserRole.STAFF), InventoryController.getLogs);
router.post(
  '/variants/:id/adjust',
  authenticateJWT,
  requireRole(UserRole.ADMIN, UserRole.STAFF),
  InventoryController.adjustStock
);

export const inventoryRoutes = router;
