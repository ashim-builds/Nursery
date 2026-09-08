import { describe, it, expect } from './test-framework.js';
import { ProductService } from '../modules/products/product.service.js';
import { prisma } from '../config/database.js';

export function registerProductTests() {
  describe('Product Creation & Catalog Tests', () => {
    let testCategoryId: string;
    let createdProductId: string;
    let createdProductSlug: string;

    it('1. Should create a botanical category', async () => {
      const category = await prisma.category.create({
        data: {
          name: `Flowering Perennials ${Date.now()}`,
          slug: `flowering-perennials-${Date.now()}`,
          description: 'Vibrant outdoor and indoor blooming plants for Kathmandu Valley gardens',
        },
      });

      expect(category.id).toBeTruthy();
      expect(category.name).toContain('Flowering Perennials');
      testCategoryId = category.id;
    });

    it('2. Should create a complete product with variants, attributes, and image snapshots', async () => {
      const product = await ProductService.createProduct({
        name: `Kathmandu Jasmine Star Bloom ${Date.now()}`,
        sku: `JASM-${Date.now()}`,
        shortDescription: 'Fragrant climbing jasmine with star-shaped white flowers.',
        description: 'Ideal for balconies, trellises, and sunny Kathmandu gardens.',
        categoryId: testCategoryId,
        basePrice: 650,
        compareAtPrice: 850,
        costPrice: 350,
        sunlightRequirement: 'FULL_SUN',
        wateringRequirement: 'MODERATE',
        difficultyLevel: 'EASY',
        dimensions: 'Height: 30-40cm in 6" grower pot',
        variants: [
          {
            name: '6" Nursery Pot',
            sku: `VAR-JAS-6-${Date.now()}`,
            price: 650,
            stock: 25,
            isAvailable: true,
          },
          {
            name: '10" Glazed Ceramic Planter',
            sku: `VAR-JAS-10-${Date.now()}`,
            price: 1450,
            stock: 10,
            isAvailable: true,
          },
        ],
        images: [
          {
            url: '/hero-plant.jpg',
            altText: 'Kathmandu Jasmine Star Bloom in nursery pot',
            isPrimary: true,
          },
        ],
      });

      expect(product.id).toBeTruthy();
      expect(product.variants.length).toBe(2);
      expect(product.images.length).toBe(1);
      createdProductId = product.id;
      createdProductSlug = product.slug;
    });

    it('3. Should fetch product by slug with calculated review averages and variants', async () => {
      const product = await ProductService.getBySlug(createdProductSlug);
      expect(product.id).toBe(createdProductId);
      expect(product.name).toContain('Kathmandu Jasmine Star Bloom');
      expect(product.variants.length).toBe(2);
      expect(product.pricing.basePrice).toBe(650);
      expect(product.pricing.compareAtPrice).toBe(850);
      expect(product.pricing.hasDiscount).toBe(true);
    });

    it('4. Should list catalog products and filter by sunlightRequirement', async () => {
      const result = await ProductService.getAll({
        sunlight: 'FULL_SUN' as any,
        page: '1',
        limit: '10',
      });

      expect(result.products.length).toBeGreaterThan(0);
      const matched = result.products.find((p) => p.id === createdProductId);
      expect(matched).toBeTruthy();
      expect(matched?.sunlightRequirement).toBe('FULL_SUN');
    });
  });
}
