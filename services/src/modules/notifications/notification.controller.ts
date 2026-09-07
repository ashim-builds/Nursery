import { Request, Response } from 'express';
import { NotificationService } from './notification.service.js';
import { ApiResponse } from '../../utils/ApiResponse.js';
import { asyncHandler } from '../../utils/asyncHandler.js';
import { AuthenticatedRequest } from '../../middlewares/auth.middleware.js';
import { ApiError } from '../../utils/ApiError.js';

export class NotificationController {
  // 1. Get logged in user's notifications
  static getMyNotifications = asyncHandler(async (req: AuthenticatedRequest, res: Response) => {
    const userId = req.user?.id;
    if (!userId) throw ApiError.unauthorized('User not authenticated');

    const result = await NotificationService.getUserNotifications(userId, {
      page: req.query.page ? parseInt(req.query.page as string, 10) : undefined,
      limit: req.query.limit ? parseInt(req.query.limit as string, 10) : undefined,
      unreadOnly: req.query.unreadOnly === 'true',
    });

    res.status(200).json(
      ApiResponse.success(
        result.notifications,
        'Notifications retrieved',
        200,
        { ...result.meta, unreadCount: result.unreadCount }
      )
    );
  });

  // 2. Mark single notification as read
  static markAsRead = asyncHandler(async (req: AuthenticatedRequest, res: Response) => {
    const userId = req.user?.id;
    if (!userId) throw ApiError.unauthorized('User not authenticated');

    const notification = await NotificationService.markAsRead(req.params.id, userId);
    res.status(200).json(ApiResponse.success(notification, 'Notification marked as read'));
  });

  // 3. Mark all notifications as read
  static markAllAsRead = asyncHandler(async (req: AuthenticatedRequest, res: Response) => {
    const userId = req.user?.id;
    if (!userId) throw ApiError.unauthorized('User not authenticated');

    const result = await NotificationService.markAllAsRead(userId);
    res.status(200).json(ApiResponse.success(result, 'All notifications marked as read'));
  });

  // 4. Delete single notification
  static deleteNotification = asyncHandler(async (req: AuthenticatedRequest, res: Response) => {
    const userId = req.user?.id;
    if (!userId) throw ApiError.unauthorized('User not authenticated');

    const result = await NotificationService.deleteNotification(req.params.id, userId);
    res.status(200).json(ApiResponse.success(result, 'Notification deleted'));
  });

  // 5. Subscribe to Web Push
  static subscribePush = asyncHandler(async (req: AuthenticatedRequest, res: Response) => {
    const userId = req.user?.id;
    if (!userId) throw ApiError.unauthorized('User not authenticated');

    const { endpoint, keys, userAgent } = req.body;
    if (!endpoint || !keys?.p256dh || !keys?.auth) {
      throw ApiError.badRequest('Invalid push subscription payload');
    }

    const subscription = await NotificationService.subscribePush(userId, {
      endpoint,
      p256dh: keys.p256dh,
      auth: keys.auth,
      userAgent: userAgent || req.headers['user-agent'],
    });

    res.status(201).json(ApiResponse.created(subscription, 'Web push subscribed successfully'));
  });

  // 6. Unsubscribe from Web Push
  static unsubscribePush = asyncHandler(async (req: AuthenticatedRequest, res: Response) => {
    const userId = req.user?.id;
    if (!userId) throw ApiError.unauthorized('User not authenticated');

    const { endpoint } = req.body;
    if (!endpoint) throw ApiError.badRequest('Endpoint required to unsubscribe');

    const result = await NotificationService.unsubscribePush(userId, endpoint);
    res.status(200).json(ApiResponse.success(result, 'Web push unsubscribed'));
  });

  // 7. Get VAPID Public Key for client subscription
  static getVapidPublicKey = asyncHandler(async (req: Request, res: Response) => {
    const publicKey = process.env.VAPID_PUBLIC_KEY || 'BEl62iUYgUivxIkv69yViEuiBIa-Ib9-SkvMeAtA3LFgDzkrxZJjSgSnfckjB-Z_T4iA6_K4n8gB7C3s1xZ1h0A';
    res.status(200).json(ApiResponse.success({ publicKey }, 'VAPID public key retrieved'));
  });
}
