import { prisma } from '../../config/database.js';
import { ApiError } from '../../utils/ApiError.js';
import { NotificationType, OrderStatus, PaymentMethod, PaymentStatus, Prisma } from '@prisma/client';

export class AdminService {
  /**
   * Complete Dashboard Overview
   */
  static async getDashboard() {
    const today = new Date();
    today.setHours(0, 0, 0, 0);

    const [
      todayOrdersAgg,
      totalOrdersCount,
      pendingOrdersCount,
      completedOrdersCount,
      totalRevenueAgg,
      lowStockVariants,
      totalCustomersCount,
      recentOrdersRaw,
      topOrderItems,
      recentAuditLogs,
    ] = await Promise.all([
      // 1. Today's sales & count
      prisma.order.aggregate({
        _sum: { totalAmount: true },
        _count: { id: true },
        where: {
          createdAt: { gte: today },
          status: { not: OrderStatus.CANCELLED },
        },
      }),
      // 2. Total orders
      prisma.order.count(),
      // 3. Pending orders
      prisma.order.count({
        where: { status: { in: [OrderStatus.PENDING, OrderStatus.CONFIRMED, OrderStatus.PROCESSING] } },
      }),
      // 4. Completed orders
      prisma.order.count({
        where: { status: { in: [OrderStatus.DELIVERED, OrderStatus.COMPLETED] } },
      }),
      // 5. Total revenue
      prisma.order.aggregate({
        _sum: { totalAmount: true },
        where: { status: { not: OrderStatus.CANCELLED } },
      }),
      // 6. Low stock variants
      prisma.productVariant.findMany({
        where: {
          isAvailable: true,
          OR: [
            { stock: { lte: 5 } },
            { inventory: { availableQuantity: { lte: 5 } } },
          ],
        },
        include: {
          product: { select: { id: true, name: true, sku: true, lowStockThreshold: true } },
          inventory: true,
        },
        take: 10,
      }),
      // 7. Customers count
      prisma.user.count({ where: { role: 'CUSTOMER' } }),
      // 8. Recent orders
      prisma.order.findMany({
        take: 10,
        orderBy: { createdAt: 'desc' },
        include: {
          items: true,
          delivery: true,
          payments: true,
          user: { select: { name: true, email: true } },
        },
      }),
      // 9. Top products
      prisma.orderItem.groupBy({
        by: ['productId', 'productName'],
        _sum: { quantity: true, lineTotal: true },
        orderBy: { _sum: { quantity: 'desc' } },
        take: 5,
      }),
      // 10. Recent audit logs
      prisma.auditLog.findMany({
        take: 8,
        orderBy: { createdAt: 'desc' },
        include: { user: { select: { name: true, email: true, role: true } } },
      }),
    ]);

    const lowStockItems = lowStockVariants.map((v) => ({
      variantId: v.id,
      productId: v.product.id,
      productName: v.product.name,
      variantName: v.name,
      sku: v.sku,
      availableStock: v.inventory?.availableQuantity ?? v.stock,
      threshold: v.product.lowStockThreshold,
    }));

    const topProducts = topOrderItems.map((item) => ({
      productId: item.productId,
      productName: item.productName,
      unitsSold: item._sum.quantity || 0,
      revenue: Number(item._sum.lineTotal || 0),
    }));

    const recentOrders = recentOrdersRaw.map((o) => ({
      id: o.id,
      orderNumber: o.orderNumber,
      customerName: o.delivery?.recipientName || o.user?.name || 'Customer',
      customerPhone: o.delivery?.recipientPhone || '',
      orderStatus: o.status,
      status: o.status,
      totalAmount: Number(o.totalAmount),
      itemCount: o.items.reduce((acc, i) => acc + i.quantity, 0),
      paymentMethod: o.payments[0]?.paymentMethod || 'CASH',
      paymentStatus: o.payments[0]?.paymentStatus || 'PENDING',
      createdAt: o.createdAt,
    }));

    return {
      todaySales: Number(todayOrdersAgg._sum.totalAmount || 0),
      todayOrders: todayOrdersAgg._count.id || 0,
      totalOrders: totalOrdersCount,
      pendingOrders: pendingOrdersCount,
      completedOrders: completedOrdersCount,
      totalRevenue: Number(totalRevenueAgg._sum.totalAmount || 0),
      totalCustomers: totalCustomersCount,
      lowStockCount: lowStockItems.length,
      lowStockProducts: lowStockItems,
      topProducts,
      recentOrders,
      recentAuditLogs,
    };
  }

  /**
   * Customers Management
   */
  static async getCustomers(query: { page?: string; limit?: string; search?: string }) {
    const page = Math.max(1, parseInt(query.page || '1', 10));
    const limit = Math.max(1, Math.min(100, parseInt(query.limit || '20', 10)));
    const skip = (page - 1) * limit;

    const where: Prisma.UserWhereInput = {
      role: 'CUSTOMER',
    };

    if (query.search) {
      where.OR = [
        { name: { contains: query.search } },
        { email: { contains: query.search } },
        { phoneNumber: { contains: query.search } },
      ];
    }

    const [usersRaw, total] = await Promise.all([
      prisma.user.findMany({
        where,
        select: {
          id: true,
          name: true,
          email: true,
          phoneNumber: true,
          role: true,
          isActive: true,
          createdAt: true,
          orders: {
            where: { status: { not: OrderStatus.CANCELLED } },
            select: { totalAmount: true },
          },
          addresses: {
            take: 1,
            select: { city: true, area: true, streetAddress: true },
          },
        },
        orderBy: { createdAt: 'desc' },
        skip,
        take: limit,
      }),
      prisma.user.count({ where }),
    ]);

    const customers = usersRaw.map((u) => {
      const totalSpent = u.orders.reduce((sum, o) => sum + Number(o.totalAmount), 0);
      return {
        id: u.id,
        name: u.name,
        fullName: u.name,
        email: u.email,
        phoneNumber: u.phoneNumber,
        role: u.role || 'CUSTOMER',
        isActive: u.isActive,
        totalOrders: u.orders.length,
        orderCount: u.orders.length,
        totalSpent,
        primaryAddress: u.addresses[0] ? `${u.addresses[0].streetAddress}, ${u.addresses[0].city}` : null,
        joinedDate: u.createdAt,
        createdAt: u.createdAt,
      };
    });

    return {
      customers,
      meta: { page, limit, total, totalPages: Math.ceil(total / limit) },
    };
  }

  /**
   * Payments Listing
   */
  static async getPayments(query: {
    page?: string;
    limit?: string;
    status?: PaymentStatus;
    method?: PaymentMethod;
    search?: string;
  }) {
    const page = Math.max(1, parseInt(query.page || '1', 10));
    const limit = Math.max(1, Math.min(100, parseInt(query.limit || '20', 10)));
    const skip = (page - 1) * limit;

    const where: Prisma.PaymentWhereInput = {};

    if (query.status) where.paymentStatus = query.status;
    if (query.method) where.paymentMethod = query.method;
    if (query.search) {
      where.OR = [
        { transactionReference: { contains: query.search } },
        { order: { orderNumber: { contains: query.search } } },
      ];
    }

    const [paymentsRaw, total] = await Promise.all([
      prisma.payment.findMany({
        where,
        include: {
          order: {
            select: {
              id: true,
              orderNumber: true,
              status: true,
              user: { select: { name: true, email: true } },
              delivery: { select: { recipientName: true } },
            },
          },
          bill: { select: { id: true, billNumber: true, grandTotal: true, status: true } },
        },
        orderBy: { createdAt: 'desc' },
        skip,
        take: limit,
      }),
      prisma.payment.count({ where }),
    ]);

    const payments = paymentsRaw.map((p) => ({
      id: p.id,
      orderId: p.orderId,
      orderNumber: p.order.orderNumber,
      customerName: p.order.delivery?.recipientName || p.order.user?.name || 'Customer',
      billNumber: p.bill?.billNumber,
      paymentMethod: p.paymentMethod,
      paymentStatus: p.paymentStatus,
      amount: Number(p.amount),
      transactionReference: p.transactionReference,
      paidAt: p.paidAt,
      createdAt: p.createdAt,
    }));

    return {
      payments,
      meta: { page, limit, total, totalPages: Math.ceil(total / limit) },
    };
  }

  /**
   * Coupons Management
   */
  static async getCoupons() {
    return prisma.coupon.findMany({
      orderBy: { createdAt: 'desc' },
      include: { _count: { select: { usages: true, orders: true } } },
    });
  }

  static async createCoupon(data: any, adminUserId?: string) {
    const coupon = await prisma.coupon.create({
      data: {
        code: data.code.toUpperCase(),
        description: data.description,
        discountType: data.discountType,
        discountValue: data.discountValue,
        minimumOrderAmount: data.minimumOrderAmount,
        maxDiscountAmount: data.maxDiscountAmount,
        startDate: data.startDate ? new Date(data.startDate) : new Date(),
        expiryDate: new Date(data.expiryDate),
        usageLimit: data.usageLimit,
        perUserLimit: data.perUserLimit || 1,
        isActive: data.isActive !== undefined ? data.isActive : true,
      },
    });

    await prisma.auditLog.create({
      data: {
        userId: adminUserId,
        action: 'COUPON_CREATE',
        resource: 'Coupon',
        resourceId: coupon.id,
        details: { code: coupon.code, discountValue: data.discountValue },
      },
    });

    return coupon;
  }

  static async updateCoupon(id: string, data: any, adminUserId?: string) {
    const coupon = await prisma.coupon.findUnique({ where: { id } });
    if (!coupon) throw ApiError.notFound('Coupon not found');

    const updatePayload: any = { ...data };
    if (data.code) updatePayload.code = data.code.toUpperCase();
    if (data.startDate) updatePayload.startDate = new Date(data.startDate);
    if (data.expiryDate) updatePayload.expiryDate = new Date(data.expiryDate);

    const updated = await prisma.coupon.update({
      where: { id },
      data: updatePayload,
    });

    await prisma.auditLog.create({
      data: {
        userId: adminUserId,
        action: 'COUPON_UPDATE',
        resource: 'Coupon',
        resourceId: id,
        details: { fields: Object.keys(data) },
      },
    });

    return updated;
  }

  static async deleteCoupon(id: string, adminUserId?: string) {
    const coupon = await prisma.coupon.findUnique({
      where: { id },
      include: { _count: { select: { usages: true } } },
    });

    if (!coupon) throw ApiError.notFound('Coupon not found');

    if (coupon._count.usages > 0) {
      await prisma.coupon.update({
        where: { id },
        data: { isActive: false },
      });

      await prisma.auditLog.create({
        data: {
          userId: adminUserId,
          action: 'COUPON_DEACTIVATE',
          resource: 'Coupon',
          resourceId: id,
          details: { note: 'Deactivated due to historical coupon usage records' },
        },
      });

      return { message: 'Coupon deactivated successfully (historical usage preserved)' };
    } else {
      await prisma.coupon.delete({ where: { id } });

      await prisma.auditLog.create({
        data: {
          userId: adminUserId,
          action: 'COUPON_DELETE',
          resource: 'Coupon',
          resourceId: id,
          details: { code: coupon.code },
        },
      });

      return { message: 'Coupon permanently deleted' };
    }
  }

  /**
   * Reviews Moderation
   */
  static async getReviews(query: { page?: string; limit?: string; isApproved?: string }) {
    const page = Math.max(1, parseInt(query.page || '1', 10));
    const limit = Math.max(1, Math.min(100, parseInt(query.limit || '20', 10)));
    const skip = (page - 1) * limit;

    const where: Prisma.ProductReviewWhereInput = {};
    if (query.isApproved !== undefined) {
      where.isApproved = query.isApproved === 'true';
    }

    const [reviews, total] = await Promise.all([
      prisma.productReview.findMany({
        where,
        include: {
          product: { select: { id: true, name: true, slug: true } },
          user: { select: { id: true, name: true, email: true } },
        },
        orderBy: { createdAt: 'desc' },
        skip,
        take: limit,
      }),
      prisma.productReview.count({ where }),
    ]);

    return {
      reviews,
      meta: { page, limit, total, totalPages: Math.ceil(total / limit) },
    };
  }

  static async moderateReview(id: string, isApproved: boolean, adminUserId?: string) {
    const review = await prisma.productReview.findUnique({ where: { id } });
    if (!review) throw ApiError.notFound('Review not found');

    const updated = await prisma.productReview.update({
      where: { id },
      data: { isApproved },
    });

    await prisma.auditLog.create({
      data: {
        userId: adminUserId,
        action: isApproved ? 'REVIEW_APPROVE' : 'REVIEW_REJECT',
        resource: 'ProductReview',
        resourceId: id,
        details: { isApproved },
      },
    });

    return updated;
  }

  static async deleteReview(id: string, adminUserId?: string) {
    const review = await prisma.productReview.findUnique({ where: { id } });
    if (!review) throw ApiError.notFound('Review not found');

    await prisma.productReview.delete({ where: { id } });

    await prisma.auditLog.create({
      data: {
        userId: adminUserId,
        action: 'REVIEW_DELETE',
        resource: 'ProductReview',
        resourceId: id,
        details: { rating: review.rating, title: review.title },
      },
    });

    return { message: 'Review deleted successfully' };
  }

  /**
   * Broadcast Notifications
   */
  static async broadcastNotification(
    data: {
      title: string;
      message: string;
      type?: NotificationType;
      linkUrl?: string;
      userIds?: string[];
    },
    adminUserId?: string
  ) {
    let targetUserIds: string[] = data.userIds || [];

    if (targetUserIds.length === 0) {
      const customers = await prisma.user.findMany({
        where: { isActive: true, role: 'CUSTOMER' },
        select: { id: true },
      });
      targetUserIds = customers.map((c) => c.id);
    } else {
      const customers = await prisma.user.findMany({
        where: {
          id: { in: targetUserIds },
          isActive: true,
          role: 'CUSTOMER',
        },
        select: { id: true },
      });
      targetUserIds = customers.map((customer) => customer.id);
    }

    const notificationsToCreate = targetUserIds.map((userId) => ({
      userId,
      title: data.title,
      message: data.message,
      type: data.type || NotificationType.PROMOTION,
      linkUrl: data.linkUrl,
    }));

    await prisma.notification.createMany({
      data: notificationsToCreate,
    });

    await prisma.auditLog.create({
      data: {
        userId: adminUserId,
        action: 'NOTIFICATION_BROADCAST',
        resource: 'Notification',
        details: {
          title: data.title,
          recipientsCount: targetUserIds.length,
          type: data.type,
        },
      },
    });

    return {
      sentCount: targetUserIds.length,
      message: `Notification broadcasted to ${targetUserIds.length} users`,
    };
  }

  /**
   * Audit Logs
   */
  static async getAuditLogs(query: { limit?: string; action?: string; userId?: string }) {
    const limit = Math.max(1, Math.min(100, parseInt(query.limit || '50', 10)));
    const where: Prisma.AuditLogWhereInput = {};

    if (query.action) where.action = { contains: query.action };
    if (query.userId) where.userId = query.userId;

    return prisma.auditLog.findMany({
      where,
      take: limit,
      orderBy: { createdAt: 'desc' },
      include: {
        user: { select: { id: true, name: true, email: true, role: true } },
      },
    });
  }
}
