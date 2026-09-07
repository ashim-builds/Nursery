import { Router } from 'express';
import { UploadController, uploadMiddleware } from './upload.controller.js';
import { authenticateJWT, requireRole } from '../../middlewares/auth.middleware.js';
import { UserRole } from '@prisma/client';

const router = Router();

// 1. Signature generation (Public for authorized client or admin)
router.get('/signature', UploadController.getUploadSignature);
router.post('/signature', UploadController.getUploadSignature);

// 2. Direct server-side upload with multer file validation
router.post(
  '/image',
  authenticateJWT,
  requireRole(UserRole.ADMIN, UserRole.STAFF),
  uploadMiddleware,
  UploadController.uploadImage
);

// 3. Delete from Cloudinary storage
router.post(
  '/delete',
  authenticateJWT,
  requireRole(UserRole.ADMIN, UserRole.STAFF),
  UploadController.deleteImage
);

router.delete(
  '/:publicId',
  authenticateJWT,
  requireRole(UserRole.ADMIN, UserRole.STAFF),
  UploadController.deleteImage
);

export const uploadRoutes = router;
