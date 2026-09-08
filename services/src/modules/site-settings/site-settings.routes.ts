import { Router } from 'express';
import { SiteSettingsController } from './site-settings.controller.js';
import { authenticateJWT, requireRole } from '../../middlewares/auth.middleware.js';
import { UserRole } from '@prisma/client';

const router = Router();

// Public read
router.get('/', SiteSettingsController.getSettings);

// Admin updates
router.put(
  '/',
  authenticateJWT,
  requireRole(UserRole.ADMIN),
  SiteSettingsController.updateSettings
);

// Admin Complete First-Time Setup Wizard
router.post(
  '/setup',
  authenticateJWT,
  requireRole(UserRole.ADMIN),
  SiteSettingsController.completeSetupWizard
);

export const siteSettingsRoutes = router;
