import { describe, it, expect } from './test-framework.js';
import { PaymentService } from '../modules/payments/payment.service.js';
import { OrderService } from '../modules/orders/order.service.js';
import { prisma } from '../config/database.js';
import { PaymentMethod, PaymentStatus } from '@prisma/client';

export function registerPaymentTests() {
  describe('Payment Gateways & Verification Tests', () => {
    let testUserId: string;
    let testOrderId: string;
    let orderTotal: number;

    it('1. Setup customer and order for payment testing', async () => {
      const user = await prisma.user.create({
        data: {
          name: 'Payment Tester',
          email: `payment_tester_${Date.now()}@ktmtest.com`,
          passwordHash: 'hash123',
          role: 'CUSTOMER',
        },
      });
      testUserId = user.id;

      let category = await prisma.category.findFirst();
      if (!category) {
        category = await prisma.category.create({
          data: { name: 'Succulents', slug: `succulents-${Date.now()}` },
        });
      }

      const product = await prisma.product.create({
        data: {
          name: `Haworthia Zebra ${Date.now()}`,
          slug: `zebra-succulent-${Date.now()}`,
          sku: `ZEB-${Date.now()}`,
          shortDescription: 'Striped succulent',
          description: 'Hardy drought-tolerant succulent',
          categoryId: category.id,
          basePrice: 400,
          published: true,
          available: true,
          variants: {
            create: {
              name: '4" Terracotta',
              sku: `VAR-ZEB-${Date.now()}`,
              price: 400,
              stock: 20,
              isAvailable: true,
              inventory: {
                create: {
                  stockQuantity: 20,
                  reservedQuantity: 0,
                  availableQuantity: 20,
                },
              },
            },
          },
        },
        include: { variants: true },
      });

      const order = await OrderService.createOrder(
        {
          customerName: 'Payment Tester',
          customerEmail: 'payment_tester@ktmtest.com',
          customerPhone: '9801122334',
          deliveryAddress: 'Lazimpat, Kathmandu',
          deliveryCity: 'Kathmandu',
          paymentMethod: PaymentMethod.FONEPAY_QR,
          items: [{ productId: product.id, variantId: product.variants[0].id, quantity: 2 }],
        },
        testUserId
      );

      testOrderId = order.id;
      orderTotal = order.totalAmount;
      expect(order.id).toBeTruthy();
    });

  });
}
