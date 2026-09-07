import { describe, it, expect } from './test-framework.js';
import { OrderService } from '../modules/orders/order.service.js';
import { prisma } from '../config/database.js';
import { OrderStatus, PaymentMethod } from '@prisma/client';

export function registerOrderTests() {
  describe('Order Lifecycle & Status State Machine Tests', () => {
    let testUserId: string;
    let adminUserId: string;
    let testProductId: string;
    let testVariantId: string;
    let orderId: string;

    it('1. Setup customer, admin user, product and create an initial order', async () => {
      const customer = await prisma.user.create({
        data: {
          name: 'Order State Customer',
          email: `order_customer_${Date.now()}@ktmtest.com`,
          passwordHash: 'hash123',
          role: 'CUSTOMER',
        },
      });
      testUserId = customer.id;

      const admin = await prisma.user.create({
        data: {
          name: 'Admin Supervisor',
          email: `admin_sup_${Date.now()}@ktmtest.com`,
          passwordHash: 'hash123',
          role: 'ADMIN',
        },
      });
      adminUserId = admin.id;

      let category = await prisma.category.findFirst();
      if (!category) {
        category = await prisma.category.create({
          data: { name: 'Indoor Trees', slug: `trees-${Date.now()}` },
        });
      }

      const product = await prisma.product.create({
        data: {
          name: `Fiddle Leaf Fig Tree ${Date.now()}`,
          slug: `fiddle-leaf-${Date.now()}`,
          sku: `FLF-${Date.now()}`,
          shortDescription: 'Large indoor fiddle leaf fig',
          description: 'Dramatic violin-shaped foliage',
          categoryId: category.id,
          basePrice: 2800,
          published: true,
          available: true,
          variants: {
            create: {
              name: '4-Foot Floor Specimen',
              sku: `VAR-FLF-${Date.now()}`,
              price: 2800,
              stock: 10,
              isAvailable: true,
              inventory: {
                create: {
                  stockQuantity: 10,
                  reservedQuantity: 0,
                  availableQuantity: 10,
                },
              },
            },
          },
        },
        include: { variants: true },
      });

      testProductId = product.id;
      testVariantId = product.variants[0].id;

      // Create order
      const order = await OrderService.createOrder(
        {
          customerName: 'Order State Customer',
          customerEmail: 'order_customer@ktmtest.com',
          customerPhone: '9841998877',
          deliveryAddress: 'Sanepa Heights, Lalitpur',
          deliveryCity: 'Lalitpur',
          paymentMethod: PaymentMethod.CASH,
          items: [{ productId: testProductId, variantId: testVariantId, quantity: 2 }],
        },
        testUserId
      );

      orderId = order.id;
      expect(order.status).toBe(OrderStatus.CONFIRMED);
    });

    it('2. Should advance order through valid state transitions: CONFIRMED -> PROCESSING -> READY -> OUT_FOR_DELIVERY', async () => {
      // 1. Move to PROCESSING
      await OrderService.updateOrderStatus(
        orderId,
        {
          orderStatus: OrderStatus.PROCESSING,
          comment: 'Greenhouse team is packing plant in protective sleeve',
        },
        adminUserId
      );

      let order = await OrderService.getOrderById(orderId, adminUserId, true);
      expect(order.status).toBe(OrderStatus.PROCESSING);

      // 2. Move to READY
      await OrderService.updateOrderStatus(
        orderId,
        {
          orderStatus: OrderStatus.READY,
          comment: 'Order staged at dispatch dock',
        },
        adminUserId
      );
      order = await OrderService.getOrderById(orderId, adminUserId, true);
      expect(order.status).toBe(OrderStatus.READY);

      // 3. Move to OUT_FOR_DELIVERY
      await OrderService.updateOrderStatus(
        orderId,
        {
          orderStatus: OrderStatus.OUT_FOR_DELIVERY,
          riderName: 'Bikram Shrestha',
          riderPhone: '9812345678',
          comment: 'Rider dispatched with temperature-controlled box',
        },
        adminUserId
      );
      order = await OrderService.getOrderById(orderId, adminUserId, true);
      expect(order.status).toBe(OrderStatus.OUT_FOR_DELIVERY);
      expect(order.riderName).toBe('Bikram Shrestha');
    });

    it('3. Should reject invalid state backwards transition (OUT_FOR_DELIVERY -> PENDING)', async () => {
      let threw = false;
      try {
        await OrderService.updateOrderStatus(
          orderId,
          {
            orderStatus: OrderStatus.PENDING,
          },
          adminUserId
        );
      } catch (err: any) {
        threw = true;
        expect(err.statusCode).toBe(400);
      }
      expect(threw).toBe(true);
    });

    it('4. Should complete order: OUT_FOR_DELIVERY -> DELIVERED -> COMPLETED', async () => {
      await OrderService.updateOrderStatus(
        orderId,
        {
          orderStatus: OrderStatus.DELIVERED,
          comment: 'Handed over to customer at Sanepa',
        },
        adminUserId
      );

      await OrderService.updateOrderStatus(
        orderId,
        {
          orderStatus: OrderStatus.COMPLETED,
          comment: 'Payment reconciled and transaction closed',
        },
        adminUserId
      );

      const order = await OrderService.getOrderById(orderId, adminUserId, true);
      expect(order.status).toBe(OrderStatus.COMPLETED);
      expect(order.statusHistory.length).toBeGreaterThan(3);
    });

    it('5. Should test cancellation on new order and verify automatic inventory restoration', async () => {
      // Create a fresh order for 3 plants
      const cancelOrder = await OrderService.createOrder(
        {
          customerName: 'Cancel Test Customer',
          customerEmail: 'cancel@ktmtest.com',
          customerPhone: '9841998877',
          deliveryAddress: 'Jhamsikhel, Lalitpur',
          deliveryCity: 'Lalitpur',
          paymentMethod: PaymentMethod.CASH,
          items: [{ productId: testProductId, variantId: testVariantId, quantity: 3 }],
        },
        testUserId
      );

      const stockAfterOrder = await prisma.inventory.findUnique({ where: { variantId: testVariantId } });
      const prevAvailable = stockAfterOrder?.availableQuantity || 0;

      // Cancel the order
      await OrderService.cancelOrder(cancelOrder.id, 'Customer changed landscaping plan', testUserId, false);

      const orderRecord = await OrderService.getOrderById(cancelOrder.id, testUserId, false);
      expect(orderRecord.status).toBe(OrderStatus.CANCELLED);

      // Verify inventory was returned
      const stockAfterCancel = await prisma.inventory.findUnique({ where: { variantId: testVariantId } });
      expect(stockAfterCancel?.availableQuantity).toBe(prevAvailable + 3);
    });
  });
}
