import { describe, it, expect } from './test-framework.js';
import { OrderService } from '../modules/orders/order.service.js';
import { prisma } from '../config/database.js';
import { DiscountType, PaymentMethod } from '@prisma/client';

export function registerCheckoutTests() {
  describe('Checkout, Coupons & Delivery Calculation Tests', () => {
    let testUserId: string;
    let testProductId: string;
    let testVariantId: string;
    let zoneCode: string;
    let percentCouponCode: string;

    it('1. Setup test customer, botanical product and delivery zone with custom rates', async () => {
      const user = await prisma.user.create({
        data: {
          name: 'Pooja Thapa',
          email: `pooja_${Date.now()}@ktmtest.com`,
          passwordHash: 'hash123',
          role: 'CUSTOMER',
        },
      });
      testUserId = user.id;

      zoneCode = `ZONE-PKR-${Date.now().toString().slice(-4)}`;
      await prisma.deliveryZone.create({
        data: {
          name: 'Pokhara Lakeside Express',
          code: zoneCode,
          baseDeliveryCharge: 250,
          estimatedDeliveryTime: '1-2 days',
          isActive: true,
        },
      });

      let category = await prisma.category.findFirst();
      if (!category) {
        category = await prisma.category.create({
          data: { name: 'Herbs & Edibles', slug: `herbs-${Date.now()}` },
        });
      }

      const product = await prisma.product.create({
        data: {
          name: `Himalayan Rosemary ${Date.now()}`,
          slug: `himalayan-rosemary-${Date.now()}`,
          sku: `ROSE-${Date.now()}`,
          shortDescription: 'Fragrant culinary rosemary',
          description: 'Aromatic herb bush in clay pot',
          categoryId: category.id,
          basePrice: 500,
          published: true,
          available: true,
          variants: {
            create: {
              name: '8" Clay Pot',
              sku: `VAR-ROSE-${Date.now()}`,
              price: 500,
              stock: 50,
              isAvailable: true,
              inventory: {
                create: {
                  stockQuantity: 50,
                  reservedQuantity: 0,
                  availableQuantity: 50,
                },
              },
            },
          },
        },
        include: { variants: true },
      });

      testProductId = product.id;
      testVariantId = product.variants[0].id;
    });

    it('2. Should create percentage discount coupon (10% off, max Rs. 200, min order Rs. 1000)', async () => {
      percentCouponCode = `SPRING10_${Date.now().toString().slice(-4)}`;
      const coupon = await prisma.coupon.create({
        data: {
          code: percentCouponCode,
          description: '10% off spring garden sale',
          discountType: DiscountType.PERCENTAGE,
          discountValue: 10,
          maxDiscountAmount: 200,
          minimumOrderAmount: 1000,
          startDate: new Date(Date.now() - 3600000),
          expiryDate: new Date(Date.now() + 86400000 * 30),
          usageLimit: 100,
          perUserLimit: 1,
          isActive: true,
        },
      });

      expect(coupon.code).toBe(percentCouponCode);
    });

    it('3. Should reject coupon when order subtotal is below minimum order amount', async () => {
      let threw = false;
      try {
        // Buy 1 rosemary (Rs. 500), but coupon requires Rs. 1000
        await OrderService.createOrder(
          {
            customerName: 'Pooja Thapa',
            customerEmail: 'pooja@ktmtest.com',
            customerPhone: '9841223344',
            deliveryAddress: 'Lakeside Ward 6, Pokhara',
            deliveryCity: 'Pokhara',
            deliveryZoneCode: zoneCode,
            couponCode: percentCouponCode,
            paymentMethod: PaymentMethod.CASH,
            items: [{ productId: testProductId, variantId: testVariantId, quantity: 1 }],
          },
          testUserId
        );
      } catch (err: any) {
        threw = true;
        expect(err.message).toContain('minimum order');
      }
      expect(threw).toBe(true);
    });

    it('4. Should successfully checkout with percentage coupon discount & zone delivery calculation', async () => {
      // Buy 3 rosemary items = 3 * 500 = Rs. 1500 subtotal
      // 10% of 1500 = Rs. 150 discount
      // Subtotal 1500 < 2000 free threshold -> Pokhara Zone charge = Rs. 250
      // Total = 1500 - 150 + 250 = Rs. 1600
      const order = await OrderService.createOrder(
        {
          customerName: 'Pooja Thapa',
          customerEmail: 'pooja@ktmtest.com',
          customerPhone: '9841223344',
          deliveryAddress: 'Lakeside Ward 6, Pokhara',
          deliveryCity: 'Pokhara',
          deliveryZoneCode: zoneCode,
          couponCode: percentCouponCode,
          paymentMethod: PaymentMethod.CASH,
          items: [{ productId: testProductId, variantId: testVariantId, quantity: 3 }],
        },
        testUserId
      );

      expect(order.subtotal).toBe(1500);
      expect(order.discountAmount).toBe(150);
      expect(order.deliveryFee).toBe(250);
      expect(order.totalAmount).toBe(1600);
    });

    it('5. Should prevent same customer from reusing single-use coupon (perUserLimit = 1)', async () => {
      let threw = false;
      try {
        await OrderService.createOrder(
          {
            customerName: 'Pooja Thapa',
            customerEmail: 'pooja@ktmtest.com',
            customerPhone: '9841223344',
            deliveryAddress: 'Lakeside Ward 6, Pokhara',
            deliveryCity: 'Pokhara',
            deliveryZoneCode: zoneCode,
            couponCode: percentCouponCode,
            paymentMethod: PaymentMethod.CASH,
            items: [{ productId: testProductId, variantId: testVariantId, quantity: 3 }],
          },
          testUserId
        );
      } catch (err: any) {
        threw = true;
        expect(err.message).toContain('redeemed');
      }
      expect(threw).toBe(true);
    });
  });
}
