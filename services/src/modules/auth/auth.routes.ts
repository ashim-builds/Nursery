import { Router } from 'express';
import { AuthController } from './auth.controller.js';
import { OAuthController } from './oauth.controller.js';
import { validateRequest } from '../../middlewares/validate.middleware.js';
import { registerSchema, loginSchema } from '../../validators/auth.validator.js';
import { authenticateJWT, optionalAuth } from '../../middlewares/auth.middleware.js';

const router = Router();

router.post('/register', validateRequest(registerSchema), AuthController.register);
router.post('/login', validateRequest(loginSchema), AuthController.login);
router.post('/admin-login', AuthController.adminPasswordLogin);
router.post('/logout', optionalAuth, AuthController.logout);
router.get('/me', authenticateJWT, AuthController.getMe);
router.post('/refresh', AuthController.refresh);
router.post('/refresh-token', AuthController.refresh);

// Google OAuth
router.get('/google/url', OAuthController.getGoogleAuthUrl);
router.post('/google', OAuthController.handleGoogleAuth);
router.post('/google/callback', OAuthController.handleGoogleAuth);

export const authRoutes = router;

