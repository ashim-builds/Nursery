import { apiClient } from './client';
import { Order, OrderStatus, PaymentStatus } from '../types/order';

export interface AdminDashboardMetrics {
  todaySales: number;
  todayOrders: number;
  totalOrders: number;
  pendingOrders: number;
  completedOrders: number;
  totalRevenue: number;
  totalCustomers: number;
  lowStockCount: number;
  lowStockProducts: Array<{
    variantId: string;
    productId: string;
    productName: string;
    variantName: string;
    sku: string;
    availableStock: number;
    threshold: number;
  }>;
  topProducts: Array<{
    productId: string;
    productName: string;
    unitsSold: number;
    revenue: number;
  }>;
  recentOrders: any[];
  recentAuditLogs: any[];
}

export const adminApi = {
  // Dashboard & Analytics
  getDashboard: async (): Promise<AdminDashboardMetrics> => {
    const res = await apiClient.get('/admin/dashboard');
    return res.data.data;
  },

  getMetrics: async (): Promise<AdminDashboardMetrics> => {
    const res = await apiClient.get('/admin/metrics');
    return res.data.data;
  },

  // Orders
  getAllOrders: async (params?: { status?: string; page?: number; limit?: number; search?: string }) => {
    const res = await apiClient.get('/admin/orders', { params });
    return { orders: res.data.data, meta: res.data.meta };
  },

  getOrderById: async (orderId: string): Promise<Order> => {
    const res = await apiClient.get(`/admin/orders/${orderId}`);
    return res.data.data;
  },

  updateOrderStatus: async (
    orderId: string,
    data: { orderStatus?: OrderStatus; paymentStatus?: PaymentStatus; deliveryNotes?: string; comment?: string }
  ): Promise<Order> => {
    const res = await apiClient.patch(`/admin/orders/${orderId}/status`, data);
    return res.data.data;
  },

  // Products & Variants
  getProducts: async (params?: { page?: number; limit?: number; search?: string; category?: string }) => {
    const res = await apiClient.get('/products', { params });
    return { products: res.data.data, meta: res.data.meta };
  },

  getProductById: async (id: string) => {
    const res = await apiClient.get(`/products/${id}`);
    return res.data.data;
  },

  createProduct: async (productData: any) => {
    const res = await apiClient.post('/admin/products', productData);
    return res.data.data;
  },

  updateProduct: async (id: string, productData: any) => {
    const res = await apiClient.patch(`/admin/products/${id}`, productData);
    return res.data.data;
  },

  deleteProduct: async (id: string) => {
    const res = await apiClient.delete(`/admin/products/${id}`);
    return res.data.data;
  },

  createVariant: async (productId: string, variantData: any) => {
    const res = await apiClient.post(`/admin/products/${productId}/variants`, variantData);
    return res.data.data;
  },

  updateVariant: async (variantId: string, variantData: any) => {
    const res = await apiClient.patch(`/admin/variants/${variantId}`, variantData);
    return res.data.data;
  },

  deleteVariant: async (variantId: string) => {
    const res = await apiClient.delete(`/admin/variants/${variantId}`);
    return res.data.data;
  },

  // Categories
  getCategories: async () => {
    const res = await apiClient.get('/categories');
    return res.data.data;
  },

  createCategory: async (categoryData: any) => {
    const res = await apiClient.post('/admin/categories', categoryData);
    return res.data.data;
  },

  updateCategory: async (id: string, categoryData: any) => {
    const res = await apiClient.patch(`/admin/categories/${id}`, categoryData);
    return res.data.data;
  },

  deleteCategory: async (id: string) => {
    const res = await apiClient.delete(`/admin/categories/${id}`);
    return res.data.data;
  },

  // Inventory
  getInventory: async (params?: { page?: number; limit?: number; search?: string; lowStockOnly?: string }) => {
    const res = await apiClient.get('/admin/inventory', { params });
    return res.data.data;
  },

  getLowStockAlerts: async () => {
    const res = await apiClient.get('/admin/inventory', { params: { lowStockOnly: 'true' } });
    return res.data.data;
  },

  getInventoryTransactions: async (params?: { page?: number; limit?: number }) => {
    const res = await apiClient.get('/admin/inventory/transactions', { params });
    return res.data.data;
  },

  adjustStock: async (data: { variantId: string; changeAmount: number; type: string; note?: string }) => {
    const res = await apiClient.post('/admin/inventory/adjust', data);
    return res.data.data;
  },

  // Customers & Payments
  getCustomers: async (params?: { page?: number; limit?: number; search?: string }) => {
    const res = await apiClient.get('/admin/customers', { params });
    return { customers: res.data.data, meta: res.data.meta };
  },

  getPayments: async (params?: { page?: number; limit?: number; status?: string; method?: string; search?: string }) => {
    const res = await apiClient.get('/admin/payments', { params });
    return { payments: res.data.data, meta: res.data.meta };
  },

  // Coupons
  getCoupons: async () => {
    const res = await apiClient.get('/admin/coupons');
    return res.data.data;
  },

  createCoupon: async (couponData: any) => {
    const res = await apiClient.post('/admin/coupons', couponData);
    return res.data.data;
  },

  updateCoupon: async (id: string, couponData: any) => {
    const res = await apiClient.patch(`/admin/coupons/${id}`, couponData);
    return res.data.data;
  },

  deleteCoupon: async (id: string) => {
    const res = await apiClient.delete(`/admin/coupons/${id}`);
    return res.data.data;
  },

  // Reviews Moderation
  getReviews: async (params?: { page?: number; limit?: number; isApproved?: boolean }) => {
    const res = await apiClient.get('/admin/reviews', { params });
    return { reviews: res.data.data, meta: res.data.meta };
  },

  moderateReview: async (id: string, isApproved: boolean) => {
    const res = await apiClient.patch(`/admin/reviews/${id}/moderate`, { isApproved });
    return res.data.data;
  },

  deleteReview: async (id: string) => {
    const res = await apiClient.delete(`/admin/reviews/${id}`);
    return res.data.data;
  },

  // Delivery Zones
  getDeliveryZones: async () => {
    const res = await apiClient.get('/delivery-zones', { params: { all: true } });
    return res.data.data;
  },

  createDeliveryZone: async (zoneData: any) => {
    const res = await apiClient.post('/delivery-zones', zoneData);
    return res.data.data;
  },

  updateDeliveryZone: async (id: string, zoneData: any) => {
    const res = await apiClient.patch(`/delivery-zones/${id}`, zoneData);
    return res.data.data;
  },

  // Notifications Broadcast
  broadcastNotification: async (data: { title: string; message: string; type?: string; linkUrl?: string; userIds?: string[] }) => {
    const res = await apiClient.post('/admin/notifications/broadcast', data);
    return res.data.data;
  },

  // Audit Logs
  getAuditLogs: async (limit = 50) => {
    const res = await apiClient.get('/admin/audit-logs', { params: { limit } });
    return res.data.data;
  },
};
