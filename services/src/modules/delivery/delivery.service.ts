import { prisma } from '../../config/database.js';
import { ApiError } from '../../utils/ApiError.js';
import { DeliveryStatus, OrderStatus, NotificationType } from '@prisma/client';

export class DeliveryService {
  /**
   * Get all active delivery zones
   */
  static async getZones(onlyActive = true) {
    const where = onlyActive ? { isActive: true } : {};
    const zones = await prisma.deliveryZone.findMany({
      where,
      orderBy: { baseDeliveryCharge: 'asc' },
    });

    return zones.map((z) => ({
      id: z.id,
      name: z.name,
      code: z.code,
      description: z.description,
      deliveryCharge: Number(z.baseDeliveryCharge),
      baseDeliveryCharge: Number(z.baseDeliveryCharge),
      minimumOrder: Number(z.minimumOrder || 0),
      estimatedHours: z.estimatedHours,
      estimatedDeliveryTime: z.estimatedDeliveryTime || `${z.estimatedHours} Hours`,
      isActive: z.isActive,
      active: z.isActive,
    }));
  }

  /**
   * Get single delivery zone by ID
   */
  static async getZoneById(id: string) {
    const zone = await prisma.deliveryZone.findUnique({
      where: { id },
    });

    if (!zone) throw ApiError.notFound('Delivery zone not found');

    return {
      id: zone.id,
      name: zone.name,
      code: zone.code,
      description: zone.description,
      deliveryCharge: Number(zone.baseDeliveryCharge),
      baseDeliveryCharge: Number(zone.baseDeliveryCharge),
      minimumOrder: Number(zone.minimumOrder || 0),
      estimatedHours: zone.estimatedHours,
      estimatedDeliveryTime: zone.estimatedDeliveryTime,
      isActive: zone.isActive,
      active: zone.isActive,
    };
  }

  /**
   * Determine Applicable Delivery Zone & Calculate Shipping Charge Server-Side
   */
  static async determineZone(data: {
    city: string;
    area?: string;
    streetAddress?: string;
    subtotal: number;
  }) {
    const combined = `${data.city} ${data.area || ''} ${data.streetAddress || ''}`.toLowerCase();

    // Ensure zones exist in DB, fallback to seed defaults if needed
    let zone = null;

    if (combined.includes('bhaktapur') || combined.includes('thimi') || combined.includes('suryabinayak')) {
      zone = await prisma.deliveryZone.findFirst({ where: { code: 'BKT', isActive: true } });
    } else if (
      combined.includes('lalitpur') ||
      combined.includes('patan') ||
      combined.includes('jawalakhel') ||
      combined.includes('jhamsikhel') ||
      combined.includes('kupondole') ||
      combined.includes('lagankhel') ||
      combined.includes('sanepa')
    ) {
      zone = await prisma.deliveryZone.findFirst({ where: { code: 'LLP_CORE', isActive: true } });
    } else if (
      combined.includes('pokhara') ||
      combined.includes('chitwan') ||
      combined.includes('butwal') ||
      combined.includes('biratnagar') ||
      combined.includes('dharan')
    ) {
      zone = await prisma.deliveryZone.findFirst({ where: { code: 'OUTSIDE_VALLEY', isActive: true } });
    }

    if (!zone) {
      zone = await prisma.deliveryZone.findFirst({
        where: {
          OR: [{ code: 'KTM_RING' }, { name: { contains: 'Kathmandu' } }],
          isActive: true,
        },
      });
    }

    // Default fallback if table is empty
    const zoneName = zone?.name || 'Kathmandu Valley Ring Road';
    const zoneCode = zone?.code || 'KTM_RING';
    const baseCharge = zone ? Number(zone.baseDeliveryCharge) : 100;
    const minOrder = zone ? Number(zone.minimumOrder || 0) : 0;
    const estTime = zone?.estimatedDeliveryTime || 'Within 24 Hours';

    // Free shipping calculation policy (Rs. 2,000 threshold for Kathmandu Valley)
    const isFreeDeliveryEligible = data.subtotal >= 2000 && zoneCode !== 'OUTSIDE_VALLEY';
    const calculatedDeliveryCharge = isFreeDeliveryEligible ? 0 : baseCharge;

    return {
      zoneId: zone?.id,
      zoneName,
      zoneCode,
      baseDeliveryCharge: baseCharge,
      deliveryCharge: calculatedDeliveryCharge,
      minimumOrder: minOrder,
      estimatedDeliveryTime: estTime,
      isFreeDelivery: isFreeDeliveryEligible,
      freeDeliveryThreshold: 2000,
      amountNeededForFreeDelivery: Math.max(0, 2000 - data.subtotal),
    };
  }

  /**
   * Admin: Create Delivery Zone
   */
  static async createZone(data: any) {
    const charge = data.deliveryCharge !== undefined ? data.deliveryCharge : data.baseDeliveryCharge || 0;
    const zone = await prisma.deliveryZone.create({
      data: {
        name: data.name,
        code: data.code.toUpperCase(),
        description: data.description,
        baseDeliveryCharge: charge,
        minimumOrder: data.minimumOrder || 0,
        estimatedHours: data.estimatedHours || 24,
        estimatedDeliveryTime: data.estimatedDeliveryTime || 'Within 24 Hours',
        isActive: data.isActive !== undefined ? data.isActive : true,
      },
    });

    return zone;
  }

  /**
   * Admin: Update Delivery Zone
   */
  static async updateZone(id: string, data: any) {
    const zone = await prisma.deliveryZone.findUnique({ where: { id } });
    if (!zone) throw ApiError.notFound('Delivery zone not found');

    const updatePayload: any = { ...data };
    if (data.deliveryCharge !== undefined) {
      updatePayload.baseDeliveryCharge = data.deliveryCharge;
      delete updatePayload.deliveryCharge;
    }
    if (data.code) {
      updatePayload.code = data.code.toUpperCase();
    }

    const updated = await prisma.deliveryZone.update({
      where: { id },
      data: updatePayload,
    });

    return updated;
  }

  /**
   * Admin/Staff: Assign Delivery Rider
   */
  static async assignRider(deliveryId: string, riderName: string, riderPhone: string, staffUserId?: string) {
    const delivery = await prisma.delivery.findUnique({
      where: { id: deliveryId },
      include: { order: true },
    });

    if (!delivery) throw ApiError.notFound('Delivery record not found');

    return prisma.$transaction(async (tx) => {
      const updated = await tx.delivery.update({
        where: { id: deliveryId },
        data: {
          riderName,
          riderPhone,
          status: DeliveryStatus.ASSIGNED,
        },
      });

      // Update Order Status to PROCESSING if currently CONFIRMED
      if (delivery.order.status === OrderStatus.CONFIRMED) {
        await tx.order.update({
          where: { id: delivery.orderId },
          data: { status: OrderStatus.PROCESSING },
        });
      }

      await tx.orderStatusHistory.create({
        data: {
          orderId: delivery.orderId,
          fromStatus: delivery.order.status,
          toStatus: OrderStatus.PROCESSING,
          comment: `Rider assigned: ${riderName} (${riderPhone})`,
          changedByUserId: staffUserId,
        },
      });

      return updated;
    });
  }

  /**
   * Admin/Staff: Update Delivery Status & Trigger Alerts
   */
  static async updateDeliveryStatus(
    deliveryId: string,
    status: DeliveryStatus,
    trackingNotes?: string,
    staffUserId?: string
  ) {
    const delivery = await prisma.delivery.findUnique({
      where: { id: deliveryId },
      include: { order: true },
    });

    if (!delivery) throw ApiError.notFound('Delivery record not found');

    return prisma.$transaction(async (tx) => {
      const isDelivered = status === DeliveryStatus.DELIVERED;
      const updatedDelivery = await tx.delivery.update({
        where: { id: deliveryId },
        data: {
          status,
          trackingNotes,
          deliveredAt: isDelivered ? new Date() : undefined,
        },
      });

      // Synchronize Order status
      let targetOrderStatus: OrderStatus = delivery.order.status;
      if (status === DeliveryStatus.OUT_FOR_DELIVERY) {
        targetOrderStatus = OrderStatus.OUT_FOR_DELIVERY;
      } else if (status === DeliveryStatus.DELIVERED) {
        targetOrderStatus = OrderStatus.DELIVERED;
      } else if (status === DeliveryStatus.FAILED || status === DeliveryStatus.RETURNED) {
        targetOrderStatus = OrderStatus.CANCELLED;
      }

      if (targetOrderStatus !== delivery.order.status) {
        await tx.order.update({
          where: { id: delivery.orderId },
          data: { status: targetOrderStatus },
        });

        await tx.orderStatusHistory.create({
          data: {
            orderId: delivery.orderId,
            fromStatus: delivery.order.status,
            toStatus: targetOrderStatus,
            comment: trackingNotes || `Delivery status changed to ${status}`,
            changedByUserId: staffUserId,
          },
        });

        // Notify customer
        if (delivery.order.userId) {
          await tx.notification.create({
            data: {
              userId: delivery.order.userId,
              title: `Delivery Update: ${status}`,
              message: `Your order ${delivery.order.orderNumber} is now ${status.toLowerCase().replace(/_/g, ' ')}.`,
              type: NotificationType.ORDER_STATUS,
              linkUrl: `/order-success/${delivery.orderId}`,
            },
          });
        }
      }

      return updatedDelivery;
    });
  }
}
