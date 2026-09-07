import { prisma } from '../../config/database.js';
import { ApiError } from '../../utils/ApiError.js';

export class WishlistService {
  /**
   * Get or create active wishlist for a customer
   */
  static async getOrCreateWishlist(userId: string) {
    let wishlist = await prisma.wishlist.findUnique({
      where: { userId },
    });

    if (!wishlist) {
      wishlist = await prisma.wishlist.create({
        data: { userId },
      });
    }

    return wishlist;
  }

  /**
   * Retrieve customer's full wishlist with product details
   */
  static async getWishlist(userId: string) {
    const wishlist = await this.getOrCreateWishlist(userId);

    const items = await prisma.wishlistItem.findMany({
      where: { wishlistId: wishlist.id },
      include: {
        product: {
          select: {
            id: true,
            name: true,
            slug: true,
            sku: true,
            shortDescription: true,
            basePrice: true,
            compareAtPrice: true,
            available: true,
            published: true,
            category: { select: { id: true, name: true, slug: true } },
            images: {
              where: { isPrimary: true },
              take: 1,
              select: { url: true, altText: true },
            },
            variants: {
              where: { isAvailable: true },
              select: {
                id: true,
                name: true,
                price: true,
                stock: true,
                inventory: { select: { availableQuantity: true } },
              },
            },
          },
        },
      },
      orderBy: { createdAt: 'desc' },
    });

    const products = items.map((item) => {
      const p = item.product;
      const totalStock = p.variants.reduce(
        (acc, v) => acc + (v.inventory?.availableQuantity ?? v.stock),
        0
      );

      return {
        wishlistItemId: item.id,
        productId: p.id,
        name: p.name,
        slug: p.slug,
        sku: p.sku,
        shortDescription: p.shortDescription,
        category: p.category,
        imageUrl: p.images[0]?.url || null,
        basePrice: Number(p.basePrice),
        compareAtPrice: p.compareAtPrice ? Number(p.compareAtPrice) : null,
        inStock: p.available && p.published && totalStock > 0,
        isAvailable: p.available && p.published,
        addedAt: item.createdAt,
      };
    });

    return {
      wishlistId: wishlist.id,
      items: products,
      totalCount: products.length,
    };
  }

  /**
   * Add a product to wishlist
   */
  static async addToWishlist(userId: string, productId: string) {
    const wishlist = await this.getOrCreateWishlist(userId);

    const product = await prisma.product.findUnique({
      where: { id: productId },
    });

    if (!product) {
      throw ApiError.notFound('Product not found');
    }

    const existing = await prisma.wishlistItem.findUnique({
      where: {
        wishlistId_productId: {
          wishlistId: wishlist.id,
          productId,
        },
      },
    });

    if (!existing) {
      await prisma.wishlistItem.create({
        data: {
          wishlistId: wishlist.id,
          productId,
        },
      });
    }

    return this.getWishlist(userId);
  }

  /**
   * Remove a product from wishlist
   */
  static async removeFromWishlist(userId: string, productId: string) {
    const wishlist = await this.getOrCreateWishlist(userId);

    await prisma.wishlistItem.deleteMany({
      where: {
        wishlistId: wishlist.id,
        productId,
      },
    });

    return this.getWishlist(userId);
  }

  /**
   * Toggle product in wishlist (Add if missing, remove if present)
   */
  static async toggleWishlist(userId: string, productId: string) {
    const wishlist = await this.getOrCreateWishlist(userId);

    const product = await prisma.product.findUnique({
      where: { id: productId },
    });

    if (!product) {
      throw ApiError.notFound('Product not found');
    }

    const existing = await prisma.wishlistItem.findUnique({
      where: {
        wishlistId_productId: {
          wishlistId: wishlist.id,
          productId,
        },
      },
    });

    let inWishlist: boolean;

    if (existing) {
      await prisma.wishlistItem.delete({
        where: { id: existing.id },
      });
      inWishlist = false;
    } else {
      await prisma.wishlistItem.create({
        data: {
          wishlistId: wishlist.id,
          productId,
        },
      });
      inWishlist = true;
    }

    const updated = await this.getWishlist(userId);

    return {
      inWishlist,
      wishlist: updated,
    };
  }
}
