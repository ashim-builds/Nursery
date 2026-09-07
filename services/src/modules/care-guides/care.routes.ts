import { Router } from 'express';
import { CareGuideController } from './care.controller.js';
import { authenticateJWT, requireRole } from '../../middlewares/auth.middleware.js';
import { UserRole } from '@prisma/client';

const router = Router();

router.get('/', CareGuideController.getAll);
router.get('/:slug', CareGuideController.getBySlug);

router.post(
  '/',
  authenticateJWT,
  requireRole(UserRole.ADMIN, UserRole.STAFF),
  CareGuideController.create
);

router.put(
  '/:id',
  authenticateJWT,
  requireRole(UserRole.ADMIN, UserRole.STAFF),
  CareGuideController.update
);

router.delete(
  '/:id',
  authenticateJWT,
  requireRole(UserRole.ADMIN),
  CareGuideController.delete
);

export const careRoutes = router;
