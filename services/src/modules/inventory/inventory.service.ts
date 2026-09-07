import { prisma } from '../../config/database.js';
import { ApiError } from '../../utils/ApiError.js';
import { InventoryTransactionType } from '@prisma/client';

export class InventoryService {
  /**
   * Admin: Get all inventory items with search, low-stock detection, and pagination
   */
  static async getInventoryList(query: {
    page?: string;
    limit?: string;
    search?: string;
    lowStockOnly?: string;
    categoryId?: string;
  }) {
    const page = Math.max(1, parseInt(query.page || '1', 10));
    const limit = Math.max(1, Math.min(100, parseInt(query.limit || '20', 10)));
    const skip = (page - 1) * limit;

    const whereVariant: any = {
      isAvailable: true,
      product: {
        published: true,
      },
    };

    if (query.search) {
      whereVariant.OR = [
        { name: { contains: query.search } },
        { sku: { contains: query.search } },
        { product: { name: { contains: query.search } } },
      ];
    }

    if (query.categoryId) {
      whereVariant.product.categoryId = query.categoryId;
    }

    const [variantsRaw, total] = await Promise.all([
      prisma.productVariant.findMany({
        where: whereVariant,
        include: {
          product: {
            select: {
              id: true,
              name: true,
              sku: true,
              lowStockThreshold: true,
              category: { select: { id: true, name: true } },
              images: { take: 1, select: { url: true } },
            },
          },
          inventory: true,
        },
        orderBy: { updatedAt: 'desc' },
        skip,
        take: limit,
      }),
      prisma.productVariant.count({ where: whereVariant }),
    ]);

    const inventoryItems = variantsRaw.map((v) => {
      const stockQty = v.inventory?.stockQuantity ?? v.stock;
      const reservedQty = v.inventory?.reservedQuantity ?? 0;
      const availableQty = v.inventory?.availableQuantity ?? Math.max(0, stockQty - reservedQty);
      const isLowStock = availableQty <= v.product.lowStockThreshold;

      return {
        variantId: v.id,
        variantName: v.name,
        variantSku: v.sku,
        productId: v.product.id,
        productName: v.product.name,
        productSku: v.product.sku,
        category: v.product.category,
        imageUrl: v.product.images[0]?.url,
        stockQuantity: stockQty,
        reservedQuantity: reservedQty,
        availableQuantity: availableQty,
        lowStockThreshold: v.product.lowStockThreshold,
        isLowStock,
        price: Number(v.price),
        updatedAt: v.inventory?.updatedAt || v.updatedAt,
      };
    });

    const filtered = query.lowStockOnly === 'true'
      ? inventoryItems.filter((i) => i.isLowStock)
      : inventoryItems;

    return {
      items: filtered,
      meta: {
        page,
        limit,
        total: query.lowStockOnly === 'true' ? filtered.length : total,
        totalPages: Math.ceil((query.lowStockOnly === 'true' ? filtered.length : total) / limit),
      },
    };
  }

  /**
   * Admin: Get all variants and inventory for a specific product
   */
  static async getProductInventory(productId: string) {
    const product = await prisma.product.findUnique({
      where: { id: productId },
      include: {
        category: true,
        variants: {
          include: {
            inventory: {
              include: {
                transactions: {
                  take: 5,
                  orderBy: { createdAt: 'desc' },
                  include: { performedByUser: { select: { name: true, email: true } } },
                },
              },
            },
          },
          orderBy: { sortOrder: 'asc' },
        },
      },
    });

    if (!product) throw ApiError.notFound('Product not found');

    return {
      productId: product.id,
      productName: product.name,
      sku: product.sku,
      lowStockThreshold: product.lowStockThreshold,
      category: product.category,
      variants: product.variants.map((v) => {
        const stockQty = v.inventory?.stockQuantity ?? v.stock;
        const reservedQty = v.inventory?.reservedQuantity ?? 0;
        const availableQty = v.inventory?.availableQuantity ?? (stockQty - reservedQty);

        return {
          variantId: v.id,
          variantName: v.name,
          sku: v.sku,
          price: Number(v.price),
          stockQuantity: stockQty,
          reservedQuantity: reservedQty,
          availableQuantity: availableQty,
          isLowStock: availableQty <= product.lowStockThreshold,
          recentTransactions: v.inventory?.transactions || [],
        };
      }),
    };
  }

  /**
   * Admin: Atomic Stock Adjustment (Restock, Damage, Return, Adjustment)
   */
  static async adjustStock(data: {
    variantId: string;
    changeAmount: number;
    type: InventoryTransactionType;
    note?: string;
    referenceType?: string;
    referenceId?: string;
    userId?: string;
  }) {
    return prisma.$transaction(async (tx) => {
      // 1. Fetch and lock variant row
      const variant = await tx.productVariant.findUnique({
        where: { id: data.variantId },
        include: { product: true, inventory: true },
      });

      if (!variant) throw ApiError.notFound('Product variant not found');

      // 2. Ensure Inventory record exists
      let inventory = variant.inventory;
      if (!inventory) {
        inventory = await tx.inventory.create({
          data: {
            variantId: data.variantId,
            stockQuantity: variant.stock,
            reservedQuantity: 0,
            availableQuantity: variant.stock,
          },
        });
      }

      const previousStock = inventory.stockQuantity;
      const previousAvailable = inventory.availableQuantity;
      const previousReserved = inventory.reservedQuantity;

      let newStock = previousStock;
      let newReserved = previousReserved;
      let newAvailable = previousAvailable;

      if (data.type === InventoryTransactionType.RESERVATION) {
        newReserved += Math.abs(data.changeAmount);
        newAvailable = newStock - newReserved;
      } else if (data.type === InventoryTransactionType.RELEASE) {
        newReserved = Math.max(0, newReserved - Math.abs(data.changeAmount));
        newAvailable = newStock - newReserved;
      } else {
        // Direct physical adjustments (RESTOCK, PURCHASE, DAMAGE, RETURN, ADJUSTMENT, SALE)
        newStock += data.changeAmount;
        newAvailable = newStock - newReserved;
      }

      if (newStock < 0 || newAvailable < 0) {
        throw ApiError.badRequest(
          `Adjustment rejected: Insufficient stock for "${variant.product.name} (${variant.name})". Current available: ${previousAvailable}, Requested change: ${data.changeAmount}`
        );
      }

      // 3. Atomically update inventory
      const updatedInventory = await tx.inventory.update({
        where: { id: inventory.id },
        data: {
          stockQuantity: newStock,
          reservedQuantity: newReserved,
          availableQuantity: newAvailable,
        },
      });

      // Keep productVariant.stock in sync
      await tx.productVariant.update({
        where: { id: data.variantId },
        data: { stock: newStock },
      });

      // 4. Create immutable inventory audit transaction
      const transaction = await tx.inventoryTransaction.create({
        data: {
          inventoryId: inventory.id,
          variantId: data.variantId,
          type: data.type,
          quantity: data.changeAmount,
          previousStock,
          newStock,
          referenceType: data.referenceType || 'ManualAdjustment',
          referenceId: data.referenceId,
          note: data.note,
          performedByUserId: data.userId,
        },
      });

      // 5. System Audit Log
      await tx.auditLog.create({
        data: {
          userId: data.userId,
          action: `INVENTORY_${data.type}`,
          resource: 'Inventory',
          resourceId: inventory.id,
          details: {
            product: variant.product.name,
            variant: variant.name,
            changeAmount: data.changeAmount,
            previousStock,
            newStock,
            note: data.note,
          },
        },
      });

      return {
        success: true,
        variantId: data.variantId,
        productName: variant.product.name,
        variantName: variant.name,
        stockQuantity: newStock,
        reservedQuantity: newReserved,
        availableQuantity: newAvailable,
        transaction,
      };
    });
  }

  /**
   * Admin: Get audit transaction history
   */
  static async getTransactions(query: {
    variantId?: string;
    type?: InventoryTransactionType;
    limit?: string;
  }) {
    const limit = Math.max(1, Math.min(100, parseInt(query.limit || '50', 10)));
    const where: any = {};

    if (query.variantId) where.variantId = query.variantId;
    if (query.type) where.type = query.type;

    const transactions = await prisma.inventoryTransaction.findMany({
      where,
      include: {
        variant: {
          include: {
            product: { select: { id: true, name: true, sku: true } },
          },
        },
        performedByUser: { select: { id: true, name: true, email: true, role: true } },
      },
      orderBy: { createdAt: 'desc' },
      take: limit,
    });

    return transactions.map((t) => ({
      id: t.id,
      type: t.type,
      quantity: t.quantity,
      previousStock: t.previousStock,
      newStock: t.newStock,
      referenceType: t.referenceType,
      referenceId: t.referenceId,
      note: t.note,
      productName: t.variant?.product?.name,
      variantName: t.variant?.name,
      sku: t.variant?.sku,
      performedBy: t.performedByUser ? `${t.performedByUser.name} (${t.performedByUser.role})` : 'System',
      createdAt: t.createdAt,
    }));
  }
}
