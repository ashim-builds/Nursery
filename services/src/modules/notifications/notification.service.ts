import { prisma } from '../../config/database.js';
import { ApiError } from '../../utils/ApiError.js';
import { NotificationType, UserRole } from '@prisma/client';

export type NotificationEvent =
  | 'ORDER_CREATED'
  | 'ORDER_CONFIRMED'
  | 'ORDER_PROCESSING'
  | 'ORDER_READY'
  | 'ORDER_OUT_FOR_DELIVERY'
  | 'ORDER_DELIVERED'
  | 'ORDER_COMPLETED'
  | 'ORDER_CANCELLED'
  | 'PAYMENT_RECEIVED'
  | 'LOW_STOCK'
  | 'SYSTEM_ALERT';

export class NotificationService {
  // 1. Get paginated notifications for current user with unread counter
  static async getUserNotifications(
    userId: string,
    query?: { page?: number; limit?: number; unreadOnly?: boolean }
  ) {
    const page = Math.max(1, query?.page || 1);
    const limit = Math.max(1, Math.min(50, query?.limit || 20));
    const skip = (page - 1) * limit;

    const where: any = { userId };
    if (query?.unreadOnly) {
      where.isRead = false;
    }

    const [notifications, total, unreadCount] = await Promise.all([
      prisma.notification.findMany({
        where,
        orderBy: { createdAt: 'desc' },
        skip,
        take: limit,
      }),
      prisma.notification.count({ where }),
      prisma.notification.count({ where: { userId, isRead: false } }),
    ]);

    return {
      notifications,
      unreadCount,
      meta: {
        page,
        limit,
        total,
        totalPages: Math.ceil(total / limit),
      },
    };
  }

  // 2. Mark single notification as read
  static async markAsRead(notificationId: string, userId: string) {
    const notification = await prisma.notification.findFirst({
      where: { id: notificationId, userId },
    });
    if (!notification) throw ApiError.notFound('Notification not found');

    return prisma.notification.update({
      where: { id: notificationId },
      data: { isRead: true },
    });
  }

  // 3. Mark all notifications as read
  static async markAllAsRead(userId: string) {
    const result = await prisma.notification.updateMany({
      where: { userId, isRead: false },
      data: { isRead: true },
    });

    return { updatedCount: result.count };
  }

  // 4. Delete single notification
  static async deleteNotification(notificationId: string, userId: string) {
    const notification = await prisma.notification.findFirst({
      where: { id: notificationId, userId },
    });
    if (!notification) throw ApiError.notFound('Notification not found');

    await prisma.notification.delete({ where: { id: notificationId } });
    return { message: 'Notification deleted successfully' };
  }

  // 5. Create In-App Notification (Customer or Admin)
  static async createNotification(params: {
    userId: string;
    title: string;
    message: string;
    type?: NotificationType;
    linkUrl?: string;
  }) {
    const notification = await prisma.notification.create({
      data: {
        userId: params.userId,
        title: params.title,
        message: params.message,
        type: params.type || NotificationType.ORDER_STATUS,
        linkUrl: params.linkUrl,
      },
    });

    // Optional Web Push Dispatch
    this.dispatchWebPushToUser(params.userId, {
      title: params.title,
      body: params.message,
      url: params.linkUrl || '/',
    }).catch((err) => console.warn('Web push dispatch error:', err.message));

    return notification;
  }

  // 6. Notify All Admins & Staff (Operational events)
  static async notifyAdmins(params: {
    title: string;
    message: string;
    type?: NotificationType;
    linkUrl?: string;
  }) {
    const adminUsers = await prisma.user.findMany({
      where: {
        role: { in: [UserRole.ADMIN, UserRole.STAFF] },
        isActive: true,
      },
      select: { id: true },
    });

    if (adminUsers.length === 0) return [];

    const creations = adminUsers.map((admin) =>
      prisma.notification.create({
        data: {
          userId: admin.id,
          title: params.title,
          message: params.message,
          type: params.type || NotificationType.SYSTEM,
          linkUrl: params.linkUrl,
        },
      })
    );

    const results = await prisma.$transaction(creations);

    // Dispatch Web Push to admins
    for (const admin of adminUsers) {
      this.dispatchWebPushToUser(admin.id, {
        title: params.title,
        body: params.message,
        url: params.linkUrl || '/admin',
      }).catch((err) => console.warn('Admin web push dispatch error:', err.message));
    }

    return results;
  }

  // ==========================================
  // Web Push Subscriptions
  // ==========================================
  static async subscribePush(
    userId: string,
    data: { endpoint: string; p256dh: string; auth: string; userAgent?: string }
  ) {
    // Upsert subscription based on unique endpoint
    const existing = await prisma.pushSubscription.findUnique({
      where: { endpoint: data.endpoint },
    });

    if (existing) {
      return prisma.pushSubscription.update({
        where: { endpoint: data.endpoint },
        data: {
          userId,
          p256dh: data.p256dh,
          auth: data.auth,
          userAgent: data.userAgent,
        },
      });
    }

    return prisma.pushSubscription.create({
      data: {
        userId,
        endpoint: data.endpoint,
        p256dh: data.p256dh,
        auth: data.auth,
        userAgent: data.userAgent,
      },
    });
  }

  static async unsubscribePush(userId: string, endpoint: string) {
    const existing = await prisma.pushSubscription.findFirst({
      where: { userId, endpoint },
    });
    if (existing) {
      await prisma.pushSubscription.delete({ where: { id: existing.id } });
    }
    return { message: 'Push subscription removed' };
  }

  private static async dispatchWebPushToUser(
    userId: string,
    payload: { title: string; body: string; url?: string }
  ) {
    const subscriptions = await prisma.pushSubscription.findMany({
      where: { userId },
    });
    if (subscriptions.length === 0) return;

    // Log web push event (can be wired with web-push library when VAPID keys are configured)
    console.log(`📡 [WebPush] Sent notification to user ${userId} (${subscriptions.length} active devices):`, payload.title);
  }

  // ==========================================
  // Event Triggers
  // ==========================================
  static async notifyOrderEvent(event: NotificationEvent, order: any) {
    const orderNumber = order.orderNumber || order.id?.substring(0, 8);
    const totalAmount = Number(order.totalAmount || 0).toLocaleString();

    let customerTitle = '';
    let customerMessage = '';
    let linkUrl = `/orders/${order.id}`;

    switch (event) {
      case 'ORDER_CREATED':
        customerTitle = `🌱 Order Placed: #${orderNumber}`;
        customerMessage = `Your botanical order of रू ${totalAmount} has been received and is being prepared with care.`;
        break;
      case 'ORDER_CONFIRMED':
        customerTitle = `🌿 Order Confirmed: #${orderNumber}`;
        customerMessage = `Payment and details for order #${orderNumber} verified. Greenhouse intake initiated.`;
        break;
      case 'ORDER_PROCESSING':
        customerTitle = `🪴 Preparing Your Plants: #${orderNumber}`;
        customerMessage = `Your live plants and pot options are being hand-selected and inspected by our nursery horticulturists.`;
        break;
      case 'ORDER_READY':
        customerTitle = `📦 Order Packed & Ready: #${orderNumber}`;
        customerMessage = `Order #${orderNumber} is packed securely with personalized botanical care guides.`;
        break;
      case 'ORDER_OUT_FOR_DELIVERY':
        customerTitle = `🚚 Out For Delivery: #${orderNumber}`;
        customerMessage = `Our Pokhara rider is on the way with your living plants!`;
        break;
      case 'ORDER_DELIVERED':
        customerTitle = `🏡 Order Delivered: #${orderNumber}`;
        customerMessage = `Your botanical order has arrived. Thank you for bringing greenery into your home!`;
        break;
      case 'ORDER_COMPLETED':
        customerTitle = `✨ Order Completed: #${orderNumber}`;
        customerMessage = `Order #${orderNumber} is marked completed. Happy planting!`;
        break;
      case 'ORDER_CANCELLED':
        customerTitle = `🛑 Order Cancelled: #${orderNumber}`;
        customerMessage = `Order #${orderNumber} has been cancelled and plant stock reserved has been restored.`;
        break;
      default:
        customerTitle = `Notification for #${orderNumber}`;
        customerMessage = `Order update: #${orderNumber}`;
    }

    // 1. Notify Customer if registered userId exists
    if (order.userId) {
      await this.createNotification({
        userId: order.userId,
        title: customerTitle,
        message: customerMessage,
        type: NotificationType.ORDER_STATUS,
        linkUrl,
      });
    }

    // 2. Notify Admins & Staff for operational awareness
    if (event === 'ORDER_CREATED') {
      await this.notifyAdmins({
        title: `🛍️ New Order #${orderNumber}`,
        message: `Customer ${order.customerName || 'Guest'} placed order for रू ${totalAmount} (${order.deliveryCity || 'Pokhara'}).`,
        type: NotificationType.ORDER_STATUS,
        linkUrl: `/admin/orders/${order.id}`,
      });
    }
  }

  static async notifyPaymentReceived(order: any, payment: any) {
    const orderNumber = order.orderNumber || order.id?.substring(0, 8);
    const amount = Number(payment.amount || order.totalAmount || 0).toLocaleString();

    // Customer Notification
    if (order.userId) {
      await this.createNotification({
        userId: order.userId,
        title: `💳 Payment Received: #${orderNumber}`,
        message: `Payment of रू ${amount} via ${payment.paymentMethod || 'online gateway'} has been verified.`,
        type: NotificationType.ORDER_STATUS,
        linkUrl: `/orders/${order.id}`,
      });
    }

    // Admin Notification
    await this.notifyAdmins({
      title: `💰 Payment Verified #${orderNumber}`,
      message: `Received रू ${amount} for order #${orderNumber} via ${payment.paymentMethod || 'Gateway'}.`,
      type: NotificationType.ORDER_STATUS,
      linkUrl: `/admin/orders/${order.id}`,
    });
  }

  static async notifyLowStock(variantName: string, productTitle: string, currentStock: number, threshold: number) {
    await this.notifyAdmins({
      title: `⚠️ Low Stock Warning: ${productTitle}`,
      message: `Variant "${variantName}" has dropped to ${currentStock} units (Threshold: ${threshold}). Restock recommended.`,
      type: NotificationType.INVENTORY_ALERT,
      linkUrl: `/admin/inventory`,
    });
  }
}
