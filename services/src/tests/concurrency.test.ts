import { describe, it, expect } from './test-framework.js';
import { OrderService } from '../modules/orders/order.service.js';
import { prisma } from '../config/database.js';
import { PaymentMethod } from '@prisma/client';

export function registerConcurrencyTests() {
  describe('Critical Concurrency Race-Condition Test', () => {
    let customerAId: string;
    let customerBId: string;
    let scarceProductId: string;
    let scarceVariantId: string;
    let zoneId: string;

    it('1. Setup two distinct customers and a scarce plant with EXACTLY 1 item in stock', async () => {
      // 1. Create two test customers
      const userA = await prisma.user.create({
        data: {
          name: 'Customer Alice (Speedy)',
          email: `alice_${Date.now()}@ktmtest.com`,
          passwordHash: 'hashed123',
          role: 'CUSTOMER',
        },
      });
      customerAId = userA.id;

      const userB = await prisma.user.create({
        data: {
          name: 'Customer Bob (Simultaneous)',
          email: `bob_${Date.now()}@ktmtest.com`,
          passwordHash: 'hashed123',
          role: 'CUSTOMER',
        },
      });
      customerBId = userB.id;

      // 2. Find or create delivery zone
      let zone = await prisma.deliveryZone.findFirst({ where: { isActive: true } });
      if (!zone) {
        zone = await prisma.deliveryZone.create({
          data: {
            name: 'Kathmandu Valley Core',
            code: `ZONE-RACE-${Date.now()}`,
            baseDeliveryCharge: 100,
            estimatedDeliveryTime: '1-2 days',
            isActive: true,
          },
        });
      }
      zoneId = zone.id;

      // 3. Find or create category
      let category = await prisma.category.findFirst({ where: { slug: 'rare-plants' } });
      if (!category) {
        category = await prisma.category.create({
          data: {
            name: 'Rare Plants',
            slug: 'rare-plants',
          },
        });
      }

      // 4. Create Scarce Botanical Product with EXACTLY 1 stock!
      const product = await prisma.product.create({
        data: {
          name: `Variegated Monstera Albo — Rare Clone #${Date.now()}`,
          slug: `monstera-albo-${Date.now()}`,
          sku: `ALBO-${Date.now()}`,
          shortDescription: 'Ultra rare collector plant. Only 1 exists.',
          description: 'Single leaf specimen with verified root system.',
          categoryId: category.id,
          basePrice: 15000,
          published: true,
          available: true,
          variants: {
            create: {
              name: 'Specimen Rooted Cutting',
              sku: `VAR-ALBO-${Date.now()}`,
              price: 15000,
              stock: 1, // EXACTLY 1!
              isAvailable: true,
              inventory: {
                create: {
                  stockQuantity: 1,
                  reservedQuantity: 0,
                  availableQuantity: 1,
                },
              },
            },
          },
        },
        include: { variants: true },
      });

      scarceProductId = product.id;
      scarceVariantId = product.variants[0].id;

      const initialStock = await prisma.inventory.findUnique({ where: { variantId: scarceVariantId } });
      expect(initialStock?.stockQuantity).toBe(1);
      expect(initialStock?.availableQuantity).toBe(1);
    });

    it('2. CRITICAL: Simultaneous checkout of last item — Exactly 1 succeeds, 1 fails with out-of-stock', async () => {
      const orderPayloadAlice = {
        customerName: 'Alice Garden',
        customerEmail: 'alice@ktmtest.com',
        customerPhone: '9800000001',
        deliveryAddress: 'Baluwatar Botanical Lane 4, Kathmandu',
        deliveryCity: 'Kathmandu',
        deliveryZoneId: zoneId,
        paymentMethod: PaymentMethod.CASH,
        items: [
          {
            productId: scarceProductId,
            variantId: scarceVariantId,
            quantity: 1,
          },
        ],
      };

      const orderPayloadBob = {
        customerName: 'Bob Greenhouse',
        customerEmail: 'bob@ktmtest.com',
        customerPhone: '9800000002',
        deliveryAddress: 'Jhamsikhel Row 7, Lalitpur',
        deliveryCity: 'Lalitpur',
        deliveryZoneId: zoneId,
        paymentMethod: PaymentMethod.CASH,
        items: [
          {
            productId: scarceProductId,
            variantId: scarceVariantId,
            quantity: 1,
          },
        ],
      };

      // Fire both checkout requests simultaneously at the exact same millisecond!
      const results = await Promise.allSettled([
        OrderService.createOrder(orderPayloadAlice, customerAId),
        OrderService.createOrder(orderPayloadBob, customerBId),
      ]);

      const fulfilled = results.filter((r) => r.status === 'fulfilled');
      const rejected = results.filter((r) => r.status === 'rejected');

      // ASSERTION: Exactly one order succeeded
      expect(fulfilled.length).toBe(1, 'Expected exactly 1 simultaneous checkout to succeed');
      // ASSERTION: Exactly one order failed
      expect(rejected.length).toBe(1, 'Expected exactly 1 simultaneous checkout to fail');

      // Verify the rejected reason is insufficient stock
      const failureReason = (rejected[0] as PromiseRejectedResult).reason;
      expect(failureReason.message.toLowerCase()).toContain('stock');
    });

    it('3. Final Inventory Integrity: stockQuantity=0, availableQuantity=0 (NO negative inventory!)', async () => {
      const finalStock = await prisma.inventory.findUnique({ where: { variantId: scarceVariantId } });
      expect(finalStock?.stockQuantity).toBe(0);
      expect(finalStock?.availableQuantity).toBe(0);
      expect((finalStock?.stockQuantity ?? 0) >= 0).toBe(true);
    });
  });
}
