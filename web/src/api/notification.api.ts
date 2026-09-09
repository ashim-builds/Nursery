import { apiClient } from './client';

export type NotificationType =
  | 'ORDER_STATUS'
  | 'CARE_REMINDER'
  | 'INVENTORY_ALERT'
  | 'PROMOTION'
  | 'SYSTEM';

export interface AppNotification {
  id: string;
  userId: string;
  title: string;
  message: string;
  type: NotificationType;
  isRead: boolean;
  linkUrl?: string | null;
  createdAt: string;
}

export interface NotificationResponse {
  data: AppNotification[];
  pagination?: {
    page: number;
    limit: number;
    total: number;
    totalPages: number;
    unreadCount: number;
  };
}

export const notificationApi = {
  // Get all notifications with unread count
  getNotifications: async (params?: { page?: number; limit?: number; unreadOnly?: boolean }): Promise<{ notifications: AppNotification[]; unreadCount: number }> => {
    const response = await apiClient.get('/notifications', { params });
    const payload = response.data;
    const notifications: AppNotification[] = payload?.data || [];
    const unreadCount: number = payload?.pagination?.unreadCount ?? notifications.filter(n => !n.isRead).length;
    return { notifications, unreadCount };
  },

  // Mark single as read
  markAsRead: async (id: string): Promise<AppNotification> => {
    const response = await apiClient.patch(`/notifications/${id}/read`);
    return response.data?.data;
  },

  // Mark all as read
  markAllAsRead: async (): Promise<void> => {
    await apiClient.patch('/notifications/read-all');
  },

  // Delete notification
  deleteNotification: async (id: string): Promise<void> => {
    await apiClient.delete(`/notifications/${id}`);
  },

  // Get VAPID public key
  getVapidKey: async (): Promise<string> => {
    const response = await apiClient.get('/notifications/push/vapid-key');
    return response.data?.data?.publicKey;
  },

  // Subscribe push subscription object
  subscribePush: async (subscription: PushSubscriptionJSON): Promise<void> => {
    await apiClient.post('/notifications/push/subscribe', subscription);
  },

  // Unsubscribe
  unsubscribePush: async (endpoint: string): Promise<void> => {
    await apiClient.post('/notifications/push/unsubscribe', { endpoint });
  },
};
