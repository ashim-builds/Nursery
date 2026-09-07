import { prisma } from '../../config/database.js';
import { ApiError } from '../../utils/ApiError.js';

export class CartService {
  /**
   * Get or create active cart for a user (or session)
   */
  static async getOrCreateCart(userId?: string, sessionId?: string) {
    if (!userId && !sessionId) {
      throw ApiError.badRequest('User ID or Session ID required to access cart');
    }

    let cart = null;

    if (userId) {
      cart = await prisma.cart.findUnique({
        where: { userId },
      });
      if (!cart) {
        cart = await prisma.cart.create({
          data: { userId },
        });
      }
    } else if (sessionId) {
      cart = await prisma.cart.findUnique({
        where: { sessionId },
      });
      if (!cart) {
        cart = await prisma.cart.create({
          data: { sessionId },
        });
      }
    }

    return cart!;
  }

  /**
   * Fetch customer cart with dynamic revalidation of availability, price, and live stock
   */
  static async getCart(userId?: string, sessionId?: string) {
    const cart = await this.getOrCreateCart(userId, sessionId);

    const cartItems = await prisma.cartItem.findMany({
      where: { cartId: cart.id },
      include: {
        product: {
          select: {
            id: true,
            name: true,
            slug: true,
            sku: true,
            published: true,
            available: true,
            basePrice: true,
            compareAtPrice: true,
            images: {
              where: { isPrimary: true },
              take: 1,
              select: { url: true, altText: true },
            },
            category: { select: { id: true, name: true, slug: true } },
          },
        },
        variant: {
          include: {
            inventory: {
              select: {
                availableQuantity: true,
                stockQuantity: true,
              },
            },
          },
        },
      },
      orderBy: { createdAt: 'desc' },
    });

    let subtotal = 0;
    let itemCount = 0;
    let hasUnavailableItems = false;
    let hasPriceChanges = false;

    const formattedItems = cartItems.map((item) => {
      const currentPrice = Number(item.variant.price);
      const originalCartPrice = Number(item.unitPrice);
      const isPriceChanged = currentPrice !== originalCartPrice;

      if (isPriceChanged) {
        hasPriceChanges = true;
      }

      const availableStock = item.variant.inventory?.availableQuantity ?? item.variant.stock;
      const isProductAvailable = item.product.published && item.product.available;
      const isVariantAvailable = item.variant.isAvailable;
      const isAvailable = isProductAvailable && isVariantAvailable && availableStock > 0;
      const isSufficientStock = availableStock >= item.quantity;

      if (!isAvailable || !isSufficientStock) {
        hasUnavailableItems = true;
      }

      const lineTotal = currentPrice * item.quantity;
      if (isAvailable) {
        subtotal += lineTotal;
        itemCount += item.quantity;
      }

      return {
        id: item.id,
        productId: item.productId,
        variantId: item.variantId,
        productName: item.product.name,
        productSlug: item.product.slug,
        variantName: item.variant.name,
        sku: item.variant.sku,
        imageUrl: item.product.images[0]?.url || null,
        category: item.product.category,
        unitPrice: currentPrice,
        previousPrice: isPriceChanged ? originalCartPrice : null,
        quantity: item.quantity,
        totalPrice: lineTotal,
        availableStock,
        isAvailable,
        isSufficientStock,
        validationIssues: {
          productUnavailable: !isProductAvailable,
          variantUnavailable: !isVariantAvailable,
          outOfStock: availableStock <= 0,
          insufficientStock: availableStock > 0 && !isSufficientStock,
          priceChanged: isPriceChanged,
        },
        createdAt: item.createdAt,
      };
    });

    const deliveryFee = subtotal === 0 ? 0 : subtotal >= 2000 ? 0 : 100;
    const total = subtotal + deliveryFee;

    return {
      cartId: cart.id,
      items: formattedItems,
      itemCount,
      subtotal,
      deliveryFee,
      freeDeliveryThreshold: 2000,
      amountNeededForFreeDelivery: Math.max(0, 2000 - subtotal),
      total,
      hasUnavailableItems,
      hasPriceChanges,
    };
  }

  /**
   * Add item to Cart with strict server-side validation of stock and current price
   */
  static async addItem(
    userId: string | undefined,
    sessionId: string | undefined,
    data: { productId: string; variantId: string; quantity: number }
  ) {
    const cart = await this.getOrCreateCart(userId, sessionId);

    // 1. Verify product
    const product = await prisma.product.findUnique({
      where: { id: data.productId },
      select: { id: true, name: true, published: true, available: true },
    });

    if (!product || !product.published || !product.available) {
      throw ApiError.badRequest('Product is currently unavailable or out of stock');
    }

    // 2. Verify variant and stock
    const variant = await prisma.productVariant.findUnique({
      where: { id: data.variantId },
      include: { inventory: true },
    });

    if (!variant || variant.productId !== data.productId || !variant.isAvailable) {
      throw ApiError.badRequest('Selected product variant is not available');
    }

    const availableStock = variant.inventory?.availableQuantity ?? variant.stock;
    if (availableStock < data.quantity) {
      throw ApiError.badRequest(
        `Insufficient stock for "${variant.name}". Available: ${availableStock}, Requested: ${data.quantity}`
      );
    }

    // 3. Check existing item in cart
    const existingItem = await prisma.cartItem.findUnique({
      where: {
        cartId_variantId: {
          cartId: cart.id,
          variantId: data.variantId,
        },
      },
    });

    if (existingItem) {
      const newQuantity = existingItem.quantity + data.quantity;
      if (newQuantity > availableStock) {
        throw ApiError.badRequest(
          `Cannot add ${data.quantity} more. Only ${availableStock} in stock and you already have ${existingItem.quantity} in cart.`
        );
      }

      await prisma.cartItem.update({
        where: { id: existingItem.id },
        data: {
          quantity: newQuantity,
          unitPrice: variant.price, // Refresh price
        },
      });
    } else {
      await prisma.cartItem.create({
        data: {
          cartId: cart.id,
          productId: data.productId,
          variantId: data.variantId,
          quantity: data.quantity,
          unitPrice: variant.price,
        },
      });
    }

    return this.getCart(userId, sessionId);
  }

  /**
   * Update quantity of a cart item
   */
  static async updateItem(
    userId: string | undefined,
    sessionId: string | undefined,
    cartItemId: string,
    quantity: number
  ) {
    const cart = await this.getOrCreateCart(userId, sessionId);

    const item = await prisma.cartItem.findUnique({
      where: { id: cartItemId },
      include: {
        variant: { include: { inventory: true } },
      },
    });

    if (!item || item.cartId !== cart.id) {
      throw ApiError.notFound('Cart item not found');
    }

    const availableStock = item.variant.inventory?.availableQuantity ?? item.variant.stock;
    if (quantity > availableStock) {
      throw ApiError.badRequest(
        `Requested quantity (${quantity}) exceeds available stock (${availableStock})`
      );
    }

    await prisma.cartItem.update({
      where: { id: cartItemId },
      data: {
        quantity,
        unitPrice: item.variant.price, // Update unit price snapshot
      },
    });

    return this.getCart(userId, sessionId);
  }

  /**
   * Remove item from cart
   */
  static async removeItem(userId: string | undefined, sessionId: string | undefined, cartItemId: string) {
    const cart = await this.getOrCreateCart(userId, sessionId);

    const item = await prisma.cartItem.findUnique({
      where: { id: cartItemId },
    });

    if (!item || item.cartId !== cart.id) {
      throw ApiError.notFound('Cart item not found');
    }

    await prisma.cartItem.delete({
      where: { id: cartItemId },
    });

    return this.getCart(userId, sessionId);
  }

  /**
   * Clear all items in cart
   */
  static async clearCart(userId?: string, sessionId?: string) {
    const cart = await this.getOrCreateCart(userId, sessionId);

    await prisma.cartItem.deleteMany({
      where: { cartId: cart.id },
    });

    return this.getCart(userId, sessionId);
  }

  /**
   * Merge Guest Local/Session Cart into Authenticated Customer Cart on Login
   */
  static async mergeGuestCart(
    userId: string,
    guestItems: Array<{ productId: string; variantId: string; quantity: number }>
  ) {
    const userCart = await this.getOrCreateCart(userId);

    for (const item of guestItems) {
      try {
        if (!item.productId || !item.variantId || item.quantity <= 0) continue;

        // Verify variant & product
        const variant = await prisma.productVariant.findUnique({
          where: { id: item.variantId },
          include: { product: true, inventory: true },
        });

        if (!variant || !variant.isAvailable || !variant.product.available || !variant.product.published) {
          continue; // Skip inactive/deleted items
        }

        const availableStock = variant.inventory?.availableQuantity ?? variant.stock;
        if (availableStock <= 0) continue;

        const existingItem = await prisma.cartItem.findUnique({
          where: {
            cartId_variantId: {
              cartId: userCart.id,
              variantId: item.variantId,
            },
          },
        });

        if (existingItem) {
          const mergedQty = Math.min(existingItem.quantity + item.quantity, availableStock);
          await prisma.cartItem.update({
            where: { id: existingItem.id },
            data: {
              quantity: mergedQty,
              unitPrice: variant.price,
            },
          });
        } else {
          const qtyToAdd = Math.min(item.quantity, availableStock);
          await prisma.cartItem.create({
            data: {
              cartId: userCart.id,
              productId: item.productId,
              variantId: item.variantId,
              quantity: qtyToAdd,
              unitPrice: variant.price,
            },
          });
        }
      } catch (err) {
        console.error('Error merging cart item:', err);
      }
    }

    return this.getCart(userId);
  }
}
