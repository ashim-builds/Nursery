import { Router } from 'express';
import { UploadController, uploadMiddleware } from './upload.controller.js';
import { authenticateJWT, requireRole } from '../../middlewares/auth.middleware.js';
import { UserRole } from '@prisma/client';

const router = Router();

// 1. Direct server-side upload with Multer file validation to MySQL storage
router.post(
  '/image',
  authenticateJWT,
  requireRole(UserRole.ADMIN, UserRole.STAFF),
  uploadMiddleware,
  UploadController.uploadImage
);

// Public image bytes are served from MySQL.
router.get('/image/:id', UploadController.getImage);

// 2. Delete from MySQL storage
router.post(
  '/delete',
  authenticateJWT,
  requireRole(UserRole.ADMIN, UserRole.STAFF),
  UploadController.deleteImage
);

router.delete(
  '/:id',
  authenticateJWT,
  requireRole(UserRole.ADMIN, UserRole.STAFF),
  UploadController.deleteImage
);

export const uploadRoutes = router;
