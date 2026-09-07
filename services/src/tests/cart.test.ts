import { describe, it, expect } from './test-framework.js';
import { CartService } from '../modules/cart/cart.service.js';
import { prisma } from '../config/database.js';

export function registerCartTests() {
  describe('Cart & Shopping Flow Tests', () => {
    let testUserId: string;
    let testProductId: string;
    let testVariantId: string;

    it('1. Setup test user and product with available stock', async () => {
      const user = await prisma.user.create({
        data: {
          name: 'Cart Tester Customer',
          email: `cart_tester_${Date.now()}@ktmtest.com`,
          passwordHash: 'hash123',
          role: 'CUSTOMER',
        },
      });
      testUserId = user.id;

      let category = await prisma.category.findFirst();
      if (!category) {
        category = await prisma.category.create({
          data: { name: 'Indoor Foliage', slug: `indoor-${Date.now()}` },
        });
      }

      const product = await prisma.product.create({
        data: {
          name: `Peace Lily Test Specimen ${Date.now()}`,
          slug: `peace-lily-${Date.now()}`,
          sku: `PL-${Date.now()}`,
          shortDescription: 'Air purifying peace lily',
          description: 'Glossy leaves with white spath flowers',
          categoryId: category.id,
          basePrice: 800,
          published: true,
          available: true,
          variants: {
            create: {
              name: 'Medium 8" Pot',
              sku: `VAR-PL-${Date.now()}`,
              price: 800,
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
      expect(testVariantId).toBeTruthy();
    });

    it('2. Should create an empty cart and add item with live price snapshot', async () => {
      const cart = await CartService.addItem(testUserId, undefined, {
        productId: testProductId,
        variantId: testVariantId,
        quantity: 2,
      });

      expect(cart.items.length).toBe(1);
      expect(cart.items[0].variantId).toBe(testVariantId);
      expect(cart.items[0].quantity).toBe(2);
      expect(cart.items[0].unitPrice).toBe(800);
      expect(cart.items[0].totalPrice).toBe(1600);
      expect(cart.subtotal).toBe(1600);
      // Below 2000 NPR threshold, standard delivery fee of 100 NPR applies
      expect(cart.deliveryFee).toBe(100);
      expect(cart.total).toBe(1700);
    });

    it('3. Should update item quantity and calculate free delivery when subtotal >= 2000', async () => {
      // Add 1 more item to bring quantity to 3 (3 * 800 = 2400)
      const cart = await CartService.addItem(testUserId, undefined, {
        productId: testProductId,
        variantId: testVariantId,
        quantity: 1,
      });

      expect(cart.items[0].quantity).toBe(3);
      expect(cart.subtotal).toBe(2400);
      expect(cart.deliveryFee).toBe(0); // FREE DELIVERY!
      expect(cart.total).toBe(2400);
    });

    it('4. Should reject adding item quantity exceeding live inventory', async () => {
      let threw = false;
      try {
        // Only 10 available, cart already has 3, requesting 15 more
        await CartService.addItem(testUserId, undefined, {
          productId: testProductId,
          variantId: testVariantId,
          quantity: 15,
        });
      } catch (err: any) {
        threw = true;
        expect(err.message.toLowerCase()).toContain('stock');
      }
      expect(threw).toBe(true);
    });
  });
}
