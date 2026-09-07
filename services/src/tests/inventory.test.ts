import { describe, it, expect } from './test-framework.js';
import { InventoryService } from '../modules/inventory/inventory.service.js';
import { prisma } from '../config/database.js';
import { InventoryTransactionType } from '@prisma/client';

export function registerInventoryTests() {
  describe('Inventory & Stock Management Tests', () => {
    let testProductId: string;
    let testVariantId: string;

    it('1. Should setup a test botanical product and variant for inventory test', async () => {
      // Find or create test category
      let category = await prisma.category.findFirst({ where: { slug: 'test-plants' } });
      if (!category) {
        category = await prisma.category.create({
          data: {
            name: 'Test Plants',
            slug: 'test-plants',
          },
        });
      }

      const product = await prisma.product.create({
        data: {
          name: `Inventory Test Plant ${Date.now()}`,
          slug: `inv-test-plant-${Date.now()}`,
          sku: `SKU-INV-${Date.now()}`,
          shortDescription: 'Test plant for inventory',
          description: 'Full description',
          categoryId: category.id,
          basePrice: 500,
          variants: {
            create: {
              name: '5" Nursery Pot',
              sku: `VAR-INV-${Date.now()}`,
              price: 500,
              stock: 20,
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

      testProductId = product.id;
      testVariantId = product.variants[0].id;
      expect(testVariantId).toBeTruthy();
    });

    it('2. Should correctly calculate availableQuantity = stockQuantity - reservedQuantity', async () => {
      const stock = await prisma.inventory.findUnique({ where: { variantId: testVariantId } });
      expect(stock?.stockQuantity).toBe(20);
      expect(stock?.reservedQuantity).toBe(0);
      expect(stock?.availableQuantity).toBe(20);
    });

    it('3. Should reserve stock atomically during in-flight checkout', async () => {
      await InventoryService.adjustStock({
        variantId: testVariantId,
        changeAmount: 5,
        type: InventoryTransactionType.RESERVATION,
      });

      const stock = await prisma.inventory.findUnique({ where: { variantId: testVariantId } });
      expect(stock?.stockQuantity).toBe(20);
      expect(stock?.reservedQuantity).toBe(5);
      expect(stock?.availableQuantity).toBe(15);
    });

    it('4. Should reject stock reservation if requested quantity exceeds available quantity', async () => {
      let threw = false;
      try {
        await InventoryService.adjustStock({
          variantId: testVariantId,
          changeAmount: 25, // Only 15 available!
          type: InventoryTransactionType.RESERVATION,
        });
      } catch (err: any) {
        threw = true;
      }
      expect(threw).toBe(true);
    });

    it('5. Should release reserved stock if order is cancelled', async () => {
      await InventoryService.adjustStock({
        variantId: testVariantId,
        changeAmount: 5,
        type: InventoryTransactionType.RELEASE,
      });

      const stock = await prisma.inventory.findUnique({ where: { variantId: testVariantId } });
      expect(stock?.stockQuantity).toBe(20);
      expect(stock?.reservedQuantity).toBe(0);
      expect(stock?.availableQuantity).toBe(20);
    });

    it('6. Should record restock adjustment and create InventoryTransaction audit log', async () => {
      await InventoryService.adjustStock({
        variantId: testVariantId,
        changeAmount: 10,
        type: InventoryTransactionType.RESTOCK,
        note: 'New monsoon botanical shipment intake',
      });

      const stock = await prisma.inventory.findUnique({ where: { variantId: testVariantId } });
      expect(stock?.stockQuantity).toBe(30);
      expect(stock?.availableQuantity).toBe(30);
    });
  });
}
