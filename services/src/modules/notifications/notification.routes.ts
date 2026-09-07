import { Router } from 'express';
import { NotificationController } from './notification.controller.js';
import { authenticateJWT } from '../../middlewares/auth.middleware.js';

const router = Router();

// 1. In-App Notifications
router.get('/', authenticateJWT, NotificationController.getMyNotifications);
router.patch('/read-all', authenticateJWT, NotificationController.markAllAsRead);
router.patch('/:id/read', authenticateJWT, NotificationController.markAsRead);
router.delete('/:id', authenticateJWT, NotificationController.deleteNotification);

// 2. Web Push Subscriptions
router.get('/push/vapid-key', NotificationController.getVapidPublicKey);
router.post('/push/subscribe', authenticateJWT, NotificationController.subscribePush);
router.post('/push/unsubscribe', authenticateJWT, NotificationController.unsubscribePush);

export const notificationRoutes = router;
