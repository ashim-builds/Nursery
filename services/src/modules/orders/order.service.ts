import { prisma } from '../../config/database.js';
import { ApiError } from '../../utils/ApiError.js';
import {
  OrderStatus,
  PaymentStatus,
  PaymentMethod,
  OrderSource,
  OrderType,
  DeliveryStatus,
  BillStatus,
  InventoryTransactionType,
  NotificationType,
  DiscountType,
  Prisma,
} from '@prisma/client';
import { NotificationService } from '../notifications/notification.service.js';

// In-memory idempotency cache for checkout requests (TTL: 5 minutes)
const idempotencyStore = new Map<string, { orderId: string; response: any; timestamp: number }>();

const ALLOWED_STATUS_TRANSITIONS: Record<OrderStatus, OrderStatus[]> = {
  PENDING: [OrderStatus.CONFIRMED, OrderStatus.CANCELLED],
  CONFIRMED: [OrderStatus.PROCESSING, OrderStatus.CANCELLED],
  PROCESSING: [OrderStatus.READY, OrderStatus.CANCELLED],
  READY: [OrderStatus.OUT_FOR_DELIVERY, OrderStatus.CANCELLED],
  OUT_FOR_DELIVERY: [OrderStatus.DELIVERED, OrderStatus.CANCELLED],
  DELIVERED: [OrderStatus.COMPLETED],
  COMPLETED: [],
  CANCELLED: [],
};

export class OrderService {
  static generateOrderNumber() {
    const random = Math.floor(1000 + Math.random() * 9000);
    const date = new Date();
    const year = date.getFullYear();
    const month = String(date.getMonth() + 1).padStart(2, '0');
    return `KTM-${year}${month}-${random}`;
  }

  /**
   * Concurrency-Safe Transactional Checkout with Idempotency, Coupon Calculation & Inventory Verification
   */
  static async createOrder(
    data: {
      idempotencyKey?: string;
      customerName: string;
      customerEmail: string;
      customerPhone: string;
      deliveryAddress: string;
      deliveryCity?: string;
      deliveryArea?: string;
      deliveryPostalCode?: string;
      deliveryZoneCode?: string;
      deliveryZoneId?: string;
      couponCode?: string;
      scheduledDeliveryDate?: string;
      giftMessage?: string;
      deliveryNotes?: string;
      paymentMethod: PaymentMethod;
      items: Array<{
        productId: string;
        variantId: string;
        quantity: number;
      }>;
    },
    userId?: string
  ) {
    // 1. Idempotency Check
    const idempotencyKey = data.idempotencyKey;
    if (idempotencyKey) {
      const existing = idempotencyStore.get(idempotencyKey);
      if (existing && Date.now() - existing.timestamp < 5 * 60 * 1000) {
        return existing.response;
      }
    }

    const orderResult = await prisma.$transaction(
      async (tx) => {
        let subtotal = 0;
        const orderItemsToCreate: any[] = [];
        const inventoryTransactionsToCreate: any[] = [];

        // 2. Lock & Verify all item stocks and calculate exact server pricing
        for (const item of data.items) {
          if (item.quantity <= 0) {
            throw ApiError.badRequest('Item quantity must be at least 1');
          }

          // Fetch product
          const product = await tx.product.findUnique({
            where: { id: item.productId },
            select: { id: true, name: true, sku: true, available: true, published: true },
          });

          if (!product || !product.available || !product.published) {
            throw ApiError.badRequest(`Product "${product?.name || item.productId}" is not available for purchase`);
          }

          // Fetch variant and its inventory
          const variant = await tx.productVariant.findUnique({
            where: { id: item.variantId },
            include: { inventory: true },
          });

          if (!variant || !variant.isAvailable || variant.productId !== item.productId) {
            throw ApiError.badRequest(`Selected variant for "${product.name}" is no longer available`);
          }

          // Ensure inventory record exists
          let inventory = variant.inventory;
          if (!inventory) {
            inventory = await tx.inventory.create({
              data: {
                variantId: variant.id,
                stockQuantity: variant.stock,
                reservedQuantity: 0,
                availableQuantity: variant.stock,
              },
            });
          }

          // Concurrency Check: Verify available stock
          const currentAvailable = inventory.availableQuantity;
          if (currentAvailable < item.quantity) {
            throw ApiError.badRequest(
              `Insufficient stock for "${product.name} (${variant.name})". Available: ${currentAvailable}, Requested: ${item.quantity}`
            );
          }

          const unitPrice = Number(variant.price);
          const lineTotal = unitPrice * item.quantity;
          subtotal += lineTotal;

          // Snapshot order item
          orderItemsToCreate.push({
            productId: product.id,
            variantId: variant.id,
            productName: product.name,
            variantName: variant.name,
            sku: variant.sku,
            unitPrice,
            quantity: item.quantity,
            lineTotal,
          });

          // Atomic inventory reservation / deduction
          const newStock = inventory.stockQuantity - item.quantity;
          const newAvailable = inventory.availableQuantity - item.quantity;

          await tx.inventory.update({
            where: { id: inventory.id },
            data: {
              stockQuantity: newStock,
              availableQuantity: newAvailable,
            },
          });

          await tx.productVariant.update({
            where: { id: variant.id },
            data: { stock: newStock },
          });

          // Prepare inventory transaction
          inventoryTransactionsToCreate.push({
            inventoryId: inventory.id,
            variantId: variant.id,
            type: InventoryTransactionType.SALE,
            quantity: -item.quantity,
            previousStock: inventory.stockQuantity,
            newStock,
            referenceType: 'OrderCheckout',
            note: `Order checkout for ${product.name} (${variant.name})`,
            performedByUserId: userId,
          });
        }

        // 3. Delivery Fee & Zone Calculation
        let deliveryFee = subtotal >= 2000 ? 0 : 100;
        let matchedZoneId: string | undefined = data.deliveryZoneId;

        if (!matchedZoneId && data.deliveryZoneCode) {
          const zone = await tx.deliveryZone.findUnique({
            where: { code: data.deliveryZoneCode },
          });
          if (zone && zone.isActive) {
            matchedZoneId = zone.id;
            if (subtotal < 2000) {
              deliveryFee = Number(zone.baseDeliveryCharge);
            }
          }
        }

        // 4. Coupon Validation & Discount Calculation
        let discountAmount = 0;
        let appliedCouponId: string | undefined = undefined;

        if (data.couponCode) {
          const coupon = await tx.coupon.findUnique({
            where: { code: data.couponCode.trim().toUpperCase() },
          });

          if (!coupon || !coupon.isActive) {
            throw ApiError.badRequest(`Coupon "${data.couponCode}" is invalid or inactive`);
          }

          const now = new Date();
          if (now < coupon.startDate || now > coupon.expiryDate) {
            throw ApiError.badRequest(`Coupon "${coupon.code}" has expired`);
          }

          if (coupon.usageLimit && coupon.usedCount >= coupon.usageLimit) {
            throw ApiError.badRequest(`Coupon "${coupon.code}" usage limit reached`);
          }

          if (coupon.minimumOrderAmount && subtotal < Number(coupon.minimumOrderAmount)) {
            throw ApiError.badRequest(
              `Coupon "${coupon.code}" requires a minimum order of Rs. ${coupon.minimumOrderAmount}`
            );
          }

          if (userId && coupon.perUserLimit) {
            const userUsages = await tx.couponUsage.count({
              where: { couponId: coupon.id, userId },
            });
            if (userUsages >= coupon.perUserLimit) {
              throw ApiError.badRequest(`You have already redeemed coupon "${coupon.code}"`);
            }
          }

          if (coupon.discountType === DiscountType.PERCENTAGE) {
            discountAmount = (subtotal * Number(coupon.discountValue)) / 100;
            if (coupon.maxDiscountAmount && discountAmount > Number(coupon.maxDiscountAmount)) {
              discountAmount = Number(coupon.maxDiscountAmount);
            }
          } else {
            discountAmount = Math.min(Number(coupon.discountValue), subtotal);
          }

          appliedCouponId = coupon.id;

          // Increment coupon usage count
          await tx.coupon.update({
            where: { id: coupon.id },
            data: { usedCount: { increment: 1 } },
          });
        }

        const totalAmount = Math.max(0, subtotal - discountAmount + deliveryFee);
        const orderNumber = this.generateOrderNumber();

        // 5. Create Order & Related Entities
        const order = await tx.order.create({
          data: {
            orderNumber,
            userId,
            orderSource: OrderSource.CUSTOMER_WEB,
            orderType: OrderType.DELIVERY,
            status: OrderStatus.CONFIRMED,
            subtotal,
            discountAmount,
            deliveryFee,
            totalAmount,
            couponId: appliedCouponId,
            customerNotes: data.giftMessage ? `[Gift Card Note]: ${data.giftMessage}` : undefined,
            internalNotes: data.deliveryNotes,
            items: {
              create: orderItemsToCreate,
            },
            delivery: {
              create: {
                recipientName: data.customerName,
                recipientPhone: data.customerPhone,
                deliveryAddress: data.deliveryAddress,
                city: data.deliveryCity || 'Kathmandu',
                area: data.deliveryArea,
                postalCode: data.deliveryPostalCode,
                zoneId: matchedZoneId,
                scheduledDate: data.scheduledDeliveryDate ? new Date(data.scheduledDeliveryDate) : null,
                deliveryCharge: deliveryFee,
                status: DeliveryStatus.PENDING,
              },
            },
            bill: {
              create: {
                billNumber: `BILL-${orderNumber}`,
                subtotal,
                discountAmount,
                deliveryCharge: deliveryFee,
                grandTotal: totalAmount,
                status: BillStatus.UNPAID,
              },
            },
            payments: {
              create: [
                {
                  paymentMethod: data.paymentMethod,
                  paymentStatus: PaymentStatus.PENDING,
                  amount: totalAmount,
                },
              ],
            },
            statusHistory: {
              create: [
                {
                  fromStatus: OrderStatus.PENDING,
                  toStatus: OrderStatus.CONFIRMED,
                  comment: 'Order placed via secure checkout with inventory lock & price calculation',
                  changedByUserId: userId,
                },
              ],
            },
            couponUsages: appliedCouponId && userId
              ? {
                  create: [
                    {
                      couponId: appliedCouponId,
                      userId,
                      discountApplied: discountAmount,
                    },
                  ],
                }
              : undefined,
          },
          include: {
            items: true,
            delivery: true,
            payments: true,
            bill: true,
          },
        });

        // 6. Create all Inventory Transactions linked to order
        for (const invTx of inventoryTransactionsToCreate) {
          await tx.inventoryTransaction.create({
            data: {
              ...invTx,
              referenceId: order.id,
            },
          });
        }

        // 7. Clear user cart if exists
        if (userId) {
          const userCart = await tx.cart.findUnique({ where: { userId } });
          if (userCart) {
            await tx.cartItem.deleteMany({ where: { cartId: userCart.id } });
          }
        }

        // 8. Customer & Admin Notifications
        NotificationService.notifyOrderEvent('ORDER_CREATED', {
          id: order.id,
          orderNumber: order.orderNumber,
          userId: order.userId,
          customerName: data.customerName,
          deliveryCity: data.deliveryCity,
          totalAmount: Number(order.totalAmount),
        }).catch((err) => console.warn('Order created notification failed:', err.message));

        return {
          id: order.id,
          orderNumber: order.orderNumber,
          userId: order.userId,
          status: order.status,
          subtotal: Number(order.subtotal),
          discountAmount: Number(order.discountAmount),
          deliveryFee: Number(order.deliveryFee),
          totalAmount: Number(order.totalAmount),
          customerName: data.customerName,
          customerEmail: data.customerEmail,
          customerPhone: data.customerPhone,
          deliveryAddress: data.deliveryAddress,
          deliveryCity: data.deliveryCity || 'Kathmandu',
          scheduledDeliveryDate: order.delivery?.scheduledDate,
          giftMessage: data.giftMessage,
          paymentMethod: data.paymentMethod,
          paymentStatus: PaymentStatus.PENDING,
          items: order.items.map((i) => ({
            id: i.id,
            productId: i.productId,
            variantId: i.variantId,
            productName: i.productName,
            variantName: i.variantName,
            sku: i.sku,
            unitPrice: Number(i.unitPrice),
            quantity: i.quantity,
            lineTotal: Number(i.lineTotal),
          })),
          createdAt: order.createdAt,
        };
      },
      {
        maxWait: 5000,
        timeout: 10000,
      }
    );

    // Save to idempotency store if key was provided
    if (idempotencyKey) {
      idempotencyStore.set(idempotencyKey, {
        orderId: orderResult.id,
        response: orderResult,
        timestamp: Date.now(),
      });
    }

    return orderResult;
  }

  /**
   * Get Orders (Filtered by Role & Ownership)
   */
  static async getOrders(
    query: {
      status?: OrderStatus;
      search?: string;
      startDate?: string;
      endDate?: string;
      page?: string;
      limit?: string;
    },
    userId?: string,
    isAdminOrStaff = false
  ) {
    const page = Math.max(1, parseInt(query.page || '1', 10));
    const limit = Math.max(1, Math.min(100, parseInt(query.limit || '10', 10)));
    const skip = (page - 1) * limit;

    const where: Prisma.OrderWhereInput = {};

    // Customer only sees their own orders
    if (!isAdminOrStaff) {
      if (!userId) throw ApiError.unauthorized('Authentication required');
      where.userId = userId;
    }

    if (query.status) {
      where.status = query.status;
    }

    if (query.search) {
      where.OR = [
        { orderNumber: { contains: query.search } },
        { delivery: { recipientName: { contains: query.search } } },
        { delivery: { recipientPhone: { contains: query.search } } },
      ];
    }

    if (query.startDate || query.endDate) {
      where.createdAt = {};
      if (query.startDate) where.createdAt.gte = new Date(query.startDate);
      if (query.endDate) where.createdAt.lte = new Date(query.endDate);
    }

    const [ordersRaw, total] = await Promise.all([
      prisma.order.findMany({
        where,
        include: {
          items: true,
          delivery: true,
          payments: true,
          user: { select: { id: true, name: true, email: true, phoneNumber: true } },
        },
        orderBy: { createdAt: 'desc' },
        skip,
        take: limit,
      }),
      prisma.order.count({ where }),
    ]);

    const orders = ordersRaw.map((o) => ({
      id: o.id,
      orderNumber: o.orderNumber,
      userId: o.userId,
      orderStatus: o.status,
      status: o.status,
      subtotal: Number(o.subtotal),
      discountAmount: Number(o.discountAmount),
      deliveryFee: Number(o.deliveryFee),
      totalAmount: Number(o.totalAmount),
      customerName: o.delivery?.recipientName || o.user?.name || 'Customer',
      customerEmail: o.user?.email || '',
      customerPhone: o.delivery?.recipientPhone || o.user?.phoneNumber || '',
      deliveryAddress: o.delivery?.deliveryAddress || '',
      deliveryCity: o.delivery?.city || 'Kathmandu',
      scheduledDeliveryDate: o.delivery?.scheduledDate,
      itemCount: o.items.reduce((sum, i) => sum + i.quantity, 0),
      items: o.items.map((i) => ({
        id: i.id,
        productId: i.productId,
        variantId: i.variantId,
        productName: i.productName,
        variantName: i.variantName,
        sku: i.sku,
        unitPrice: Number(i.unitPrice),
        quantity: i.quantity,
        lineTotal: Number(i.lineTotal),
      })),
      paymentMethod: o.payments[0]?.paymentMethod || PaymentMethod.CASH,
      paymentStatus: o.payments[0]?.paymentStatus || PaymentStatus.PENDING,
      deliveryStatus: o.delivery?.status || DeliveryStatus.PENDING,
      createdAt: o.createdAt,
    }));

    return {
      orders,
      meta: { page, limit, total, totalPages: Math.ceil(total / limit) },
    };
  }

  /**
   * Get Order by ID with full snapshots & status history
   */
  static async getOrderById(id: string, userId?: string, isAdminOrStaff = false) {
    const order = await prisma.order.findUnique({
      where: { id },
      include: {
        items: true,
        delivery: { include: { zone: true } },
        payments: true,
        bill: true,
        statusHistory: {
          orderBy: { createdAt: 'asc' },
          include: { changedByUser: { select: { name: true, role: true } } },
        },
        user: { select: { id: true, name: true, email: true, phoneNumber: true } },
      },
    });

    if (!order) throw ApiError.notFound('Order not found');

    if (!isAdminOrStaff && userId && order.userId !== userId) {
      throw ApiError.forbidden('Access denied to this order');
    }

    return {
      id: order.id,
      orderNumber: order.orderNumber,
      userId: order.userId,
      orderStatus: order.status,
      status: order.status,
      subtotal: Number(order.subtotal),
      discountAmount: Number(order.discountAmount),
      deliveryFee: Number(order.deliveryFee),
      taxAmount: Number(order.taxAmount),
      totalAmount: Number(order.totalAmount),
      customerNotes: order.customerNotes,
      internalNotes: isAdminOrStaff ? order.internalNotes : undefined,
      customerName: order.delivery?.recipientName || order.user?.name || 'Customer',
      customerEmail: order.user?.email || '',
      customerPhone: order.delivery?.recipientPhone || order.user?.phoneNumber || '',
      deliveryAddress: order.delivery?.deliveryAddress || '',
      deliveryCity: order.delivery?.city || 'Kathmandu',
      deliveryArea: order.delivery?.area,
      deliveryPostalCode: order.delivery?.postalCode,
      scheduledDeliveryDate: order.delivery?.scheduledDate,
      deliveryZone: order.delivery?.zone?.name,
      deliveryStatus: order.delivery?.status,
      riderName: order.delivery?.riderName,
      riderPhone: order.delivery?.riderPhone,
      billNumber: order.bill?.billNumber,
      paymentMethod: order.payments[0]?.paymentMethod || PaymentMethod.CASH,
      paymentStatus: order.payments[0]?.paymentStatus || PaymentStatus.PENDING,
      items: order.items.map((i) => ({
        id: i.id,
        productId: i.productId,
        variantId: i.variantId,
        productName: i.productName,
        variantName: i.variantName,
        sku: i.sku,
        unitPrice: Number(i.unitPrice),
        quantity: i.quantity,
        lineTotal: Number(i.lineTotal),
      })),
      statusHistory: order.statusHistory.map((h) => ({
        id: h.id,
        fromStatus: h.fromStatus,
        toStatus: h.toStatus,
        comment: h.comment,
        changedBy: h.changedByUser ? `${h.changedByUser.name} (${h.changedByUser.role})` : 'System',
        createdAt: h.createdAt,
      })),
      createdAt: order.createdAt,
      updatedAt: order.updatedAt,
    };
  }

  /**
   * Cancel Order with strict state validation and Inventory Restoration
   */
  static async cancelOrder(id: string, reason?: string, userId?: string, isAdminOrStaff = false) {
    return prisma.$transaction(async (tx) => {
      const order = await tx.order.findUnique({
        where: { id },
        include: {
          items: true,
          delivery: true,
          payments: true,
        },
      });

      if (!order) throw ApiError.notFound('Order not found');

      // Authorization check
      if (!isAdminOrStaff && userId && order.userId !== userId) {
        throw ApiError.forbidden('Access denied to cancel this order');
      }

      // Allowed state check for cancellation
      const nonCancellableStates: OrderStatus[] = [
        OrderStatus.OUT_FOR_DELIVERY,
        OrderStatus.DELIVERED,
        OrderStatus.COMPLETED,
        OrderStatus.CANCELLED,
      ];

      if (nonCancellableStates.includes(order.status)) {
        throw ApiError.badRequest(
          `Cannot cancel order in "${order.status}" status. Orders out for delivery or completed cannot be cancelled.`
        );
      }

      // 1. Release / Return all inventory for order items
      for (const item of order.items) {
        const inventory = await tx.inventory.findUnique({
          where: { variantId: item.variantId },
        });

        if (inventory) {
          const newStock = inventory.stockQuantity + item.quantity;
          const newAvailable = inventory.availableQuantity + item.quantity;

          await tx.inventory.update({
            where: { id: inventory.id },
            data: {
              stockQuantity: newStock,
              availableQuantity: newAvailable,
            },
          });

          await tx.productVariant.update({
            where: { id: item.variantId },
            data: { stock: newStock },
          });

          await tx.inventoryTransaction.create({
            data: {
              inventoryId: inventory.id,
              variantId: item.variantId,
              type: InventoryTransactionType.RETURN,
              quantity: item.quantity,
              previousStock: inventory.stockQuantity,
              newStock,
              referenceType: 'OrderCancellation',
              referenceId: order.id,
              note: `Stock released on order cancellation (${order.orderNumber}): ${reason || 'Customer cancellation'}`,
              performedByUserId: userId,
            },
          });
        }
      }

      // 2. Update Order Status & create immutable history
      const updatedOrder = await tx.order.update({
        where: { id },
        data: {
          status: OrderStatus.CANCELLED,
          internalNotes: reason ? `[Cancellation Reason]: ${reason}` : undefined,
          statusHistory: {
            create: [
              {
                fromStatus: order.status,
                toStatus: OrderStatus.CANCELLED,
                comment: reason || 'Order cancelled by customer/admin. Inventory returned to stock.',
                changedByUserId: userId,
              },
            ],
          },
        },
      });

      // 3. Update Delivery & Bill Status
      if (order.delivery) {
        await tx.delivery.update({
          where: { id: order.delivery.id },
          data: { status: DeliveryStatus.RETURNED },
        });
      }

      await tx.bill.updateMany({
        where: { orderId: id },
        data: { status: BillStatus.CANCELLED },
      });

      // Notify customer of cancellation
      NotificationService.notifyOrderEvent('ORDER_CANCELLED', {
        id: updatedOrder.id,
        orderNumber: updatedOrder.orderNumber,
        userId: order.userId,
        totalAmount: Number(order.totalAmount),
      }).catch((err) => console.warn('Order cancel notification error:', err.message));

      return {
        id: updatedOrder.id,
        orderNumber: updatedOrder.orderNumber,
        status: updatedOrder.status,
        message: 'Order cancelled successfully and inventory restored',
      };
    });
  }

  /**
   * Admin/Staff Status Transitions with State Validation Machine
   */
  static async updateOrderStatus(
    id: string,
    data: {
      orderStatus?: OrderStatus;
      paymentStatus?: PaymentStatus;
      deliveryStatus?: DeliveryStatus;
      riderName?: string;
      riderPhone?: string;
      comment?: string;
      deliveryNotes?: string;
    },
    adminUserId?: string
  ) {
    const result = await prisma.$transaction(async (tx) => {
      const order = await tx.order.findUnique({
        where: { id },
        include: { delivery: true, payments: true },
      });

      if (!order) throw ApiError.notFound('Order not found');

      // State Transition Validation
      if (data.orderStatus && data.orderStatus !== order.status) {
        const allowed = ALLOWED_STATUS_TRANSITIONS[order.status] || [];
        if (!allowed.includes(data.orderStatus)) {
          throw ApiError.badRequest(
            `Invalid status transition from "${order.status}" to "${data.orderStatus}". Allowed: [${allowed.join(', ')}]`
          );
        }
      }

      // Update Order
      const updated = await tx.order.update({
        where: { id },
        data: {
          ...(data.orderStatus ? { status: data.orderStatus } : {}),
          internalNotes: data.deliveryNotes,
          statusHistory:
            data.orderStatus && data.orderStatus !== order.status
              ? {
                  create: [
                    {
                      fromStatus: order.status,
                      toStatus: data.orderStatus,
                      comment: data.comment || `Status transition to ${data.orderStatus}`,
                      changedByUserId: adminUserId,
                    },
                  ],
                }
              : undefined,
        },
      });

      // Update Delivery
      if (order.delivery && (data.deliveryStatus || data.riderName || data.riderPhone)) {
        await tx.delivery.update({
          where: { id: order.delivery.id },
          data: {
            ...(data.deliveryStatus ? { status: data.deliveryStatus } : {}),
            ...(data.riderName ? { riderName: data.riderName } : {}),
            ...(data.riderPhone ? { riderPhone: data.riderPhone } : {}),
            ...(data.deliveryStatus === DeliveryStatus.DELIVERED ? { deliveredAt: new Date() } : {}),
          },
        });
      }

      // Update Payment
      if (data.paymentStatus && order.payments.length > 0) {
        await tx.payment.update({
          where: { id: order.payments[0].id },
          data: {
            paymentStatus: data.paymentStatus,
            ...(data.paymentStatus === PaymentStatus.PAID ? { paidAt: new Date() } : {}),
          },
        });
      }

      return updated;
    });

    // Notify customer about status transition
    if (data.orderStatus) {
      const eventName = `ORDER_${data.orderStatus}` as any;
      NotificationService.notifyOrderEvent(eventName, {
        id: result.id,
        orderNumber: result.orderNumber,
        userId: result.userId,
        totalAmount: Number(result.totalAmount),
      }).catch((err) => console.warn('Status change notification error:', err.message));
    }

    return result;
  }
}
