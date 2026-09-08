import { prisma } from '../../config/database.js';
import { ApiError } from '../../utils/ApiError.js';
import { SunlightRequirement, WateringRequirement, DifficultyLevel, Prisma } from '@prisma/client';

export class ProductService {
  static async getAll(query: {
    page?: string;
    limit?: string;
    search?: string;
    q?: string;
    category?: string;
    sort?: 'price_asc' | 'price_desc' | 'newest' | 'rating' | 'popular' | 'name_asc' | 'relevance';
    sortBy?: 'price_asc' | 'price_desc' | 'newest' | 'rating' | 'popular' | 'name_asc' | 'relevance';
    minPrice?: string;
    maxPrice?: string;
    featured?: string;
    isFeatured?: string;
    seasonal?: string;
    isSeasonal?: string;
    inStock?: string;
    size?: string;
    plantType?: string;
    productType?: string;
    sunlight?: SunlightRequirement;
    watering?: WateringRequirement;
    difficulty?: DifficultyLevel;
  }) {
    const page = Math.max(1, parseInt(query.page || '1', 10));
    const limit = Math.max(1, Math.min(100, parseInt(query.limit || '12', 10)));
    const skip = (page - 1) * limit;

    const where: Prisma.ProductWhereInput = {
          published: true,
    };

    const searchTerm = query.search || query.q;
    if (searchTerm && searchTerm.trim()) {
      const term = searchTerm.trim();
      where.OR = [
        { name: { contains: term } },
        { sku: { contains: term } },
        { shortDescription: { contains: term } },
        { description: { contains: term } },
        { dimensions: { contains: term } },
        { category: { name: { contains: term } } },
        { category: { slug: { contains: term } } },
        { variants: { some: { name: { contains: term } } } },
        { variants: { some: { sku: { contains: term } } } },
      ];
    }

    if (query.category) {
      where.category = {
        OR: [
          { slug: query.category },
          { id: query.category },
          { name: { contains: query.category } },
        ],
      };
    }

    if (query.sunlight) {
      where.sunlightRequirement = query.sunlight;
    }

    if (query.watering) {
      where.wateringRequirement = query.watering;
    }

    if (query.difficulty) {
      where.difficultyLevel = query.difficulty;
    }

    const featuredFlag = query.featured ?? query.isFeatured;
    if (featuredFlag !== undefined) {
      where.featured = featuredFlag === 'true';
    }

    const seasonalFlag = query.seasonal ?? query.isSeasonal;
    if (seasonalFlag !== undefined) {
      where.seasonal = seasonalFlag === 'true';
    }

    if (query.inStock === 'true') {
      where.variants = {
        some: {
          isAvailable: true,
          OR: [
            { stock: { gt: 0 } },
            { inventory: { availableQuantity: { gt: 0 } } },
          ],
        },
      };
    }

    if (query.size) {
      where.OR = [
        ...(where.OR || []),
        { dimensions: { contains: query.size } },
        { variants: { some: { isAvailable: true, name: { contains: query.size } } } },
      ];
    }

    if (query.minPrice || query.maxPrice) {
      where.basePrice = {};
      if (query.minPrice) where.basePrice.gte = parseFloat(query.minPrice);
      if (query.maxPrice) where.basePrice.lte = parseFloat(query.maxPrice);
    }

    const sortOption = query.sort || query.sortBy || (searchTerm ? 'relevance' : 'newest');
    let orderBy: Prisma.ProductOrderByWithRelationInput | Prisma.ProductOrderByWithRelationInput[] = { createdAt: 'desc' };

    if (sortOption === 'price_asc') orderBy = { basePrice: 'asc' };
    else if (sortOption === 'price_desc') orderBy = { basePrice: 'desc' };
    else if (sortOption === 'name_asc') orderBy = { name: 'asc' };
    else if (sortOption === 'popular') orderBy = [{ featured: 'desc' }, { createdAt: 'desc' }];
    else if (sortOption === 'newest' || sortOption === 'relevance') orderBy = { createdAt: 'desc' };

    const [productsRaw, total] = await Promise.all([
      prisma.product.findMany({
        where,
        select: {
          id: true,
          name: true,
          slug: true,
          sku: true,
          shortDescription: true,
          description: true,
          basePrice: true,
          compareAtPrice: true,
          available: true,
          featured: true,
          published: true,
          seasonal: true,
          lowStockThreshold: true,
          careInstructions: true,
          sunlightRequirement: true,
          wateringRequirement: true,
          difficultyLevel: true,
          dimensions: true,
          weight: true,
          createdAt: true,
          updatedAt: true,
          category: { select: { id: true, name: true, slug: true } },
          images: {
            select: { id: true, url: true, altText: true, isPrimary: true, sortOrder: true },
            orderBy: { sortOrder: 'asc' },
          },
          attributes: { select: { name: true, value: true } },
          variants: {
            where: { isAvailable: true },
            select: {
              id: true,
              name: true,
              sku: true,
              price: true,
              stock: true,
              weight: true,
              isAvailable: true,
              sortOrder: true,
              inventory: { select: { availableQuantity: true, stockQuantity: true } },
            },
            orderBy: { sortOrder: 'asc' },
          },
          reviews: {
            where: { isApproved: true },
            select: { rating: true },
          },
        },
        orderBy,
        skip,
        take: limit,
      }),
      prisma.product.count({ where }),
    ]);

    const products = productsRaw.map((p) => {
      const avgRating =
        p.reviews.length > 0
          ? p.reviews.reduce((acc, r) => acc + r.rating, 0) / p.reviews.length
          : 5.0;

      const totalStock = p.variants.reduce((acc, v) => acc + (v.inventory?.availableQuantity ?? v.stock), 0);

      return {
        id: p.id,
        name: p.name,
        title: p.name,
        slug: p.slug,
        sku: p.sku,
        shortDescription: p.shortDescription,
        description: p.description,
        fullDescription: p.description,
        pricing: {
          basePrice: Number(p.basePrice),
          compareAtPrice: p.compareAtPrice ? Number(p.compareAtPrice) : null,
          hasDiscount: !!p.compareAtPrice && Number(p.compareAtPrice) > Number(p.basePrice),
        },
        basePrice: p.basePrice,
        discountPrice: p.compareAtPrice ? p.basePrice : null,
        availability: {
          isAvailable: p.available && totalStock > 0,
          totalStock,
          inStock: totalStock > 0,
        },
        isAvailable: p.available,
        featured: p.featured,
        isFeatured: p.featured,
        seasonal: p.seasonal,
        isSeasonal: p.seasonal,
        sunlightRequirement: p.sunlightRequirement,
        sunlight: p.sunlightRequirement,
        wateringRequirement: p.wateringRequirement,
        watering: p.wateringRequirement,
        difficultyLevel: p.difficultyLevel,
        difficulty: p.difficultyLevel,
        careInstructions: p.careInstructions,
        dimensions: p.dimensions,
        weight: p.weight,
        category: p.category,
        images: p.images.map((img) => ({
          id: img.id,
          url: img.url,
          altText: img.altText,
          alt: img.altText,
          isPrimary: img.isPrimary,
          sortOrder: img.sortOrder,
        })),
        variants: p.variants.map((v) => ({
          id: v.id,
          name: v.name,
          sku: v.sku,
          price: Number(v.price),
          priceAdjustment: Number(v.price) - Number(p.basePrice),
          stockQuantity: v.inventory?.availableQuantity ?? v.stock,
          isAvailable: v.isAvailable,
          isDefault: v.sortOrder === 1 || v.sortOrder === 0,
          sortOrder: v.sortOrder,
        })),
        attributes: p.attributes,
        rating: avgRating,
        averageRating: avgRating,
        reviewCount: p.reviews.length,
        createdAt: p.createdAt,
      };
    });

    return {
      products,
      meta: {
        page,
        limit,
        total,
        totalPages: Math.ceil(total / limit),
      },
    };
  }

  static async getBySlug(slug: string) {
    const product = await prisma.product.findUnique({
          where: { slug, published: true },
          select: {
        id: true,
        name: true,
        slug: true,
        sku: true,
        shortDescription: true,
        description: true,
        basePrice: true,
        compareAtPrice: true,
        available: true,
        featured: true,
        published: true,
        seasonal: true,
        lowStockThreshold: true,
        careInstructions: true,
        sunlightRequirement: true,
        wateringRequirement: true,
        difficultyLevel: true,
        dimensions: true,
        weight: true,
        createdAt: true,
        updatedAt: true,
        category: true,
        images: {
          select: { id: true, url: true, altText: true, isPrimary: true, sortOrder: true },
          orderBy: { sortOrder: 'asc' },
        },
        attributes: { select: { name: true, value: true } },
        variants: {
          where: { isAvailable: true },
          select: {
            id: true,
            name: true,
            sku: true,
            price: true,
            stock: true,
            weight: true,
            isAvailable: true,
            sortOrder: true,
            inventory: { select: { availableQuantity: true, stockQuantity: true } },
          },
          orderBy: { sortOrder: 'asc' },
        },
        reviews: {
          where: { isApproved: true },
          select: {
            id: true,
            rating: true,
            title: true,
            comment: true,
            plantPhotoUrl: true,
            isVerifiedBuyer: true,
            createdAt: true,
            user: { select: { name: true } },
          },
          orderBy: { createdAt: 'desc' },
        },
      },
    });

    if (!product || !product.published) {
      throw ApiError.notFound('Product not found');
    }

    const avgRating =
      product.reviews.length > 0
        ? product.reviews.reduce((acc, r) => acc + r.rating, 0) / product.reviews.length
        : 5.0;

    const totalStock = product.variants.reduce((acc, v) => acc + (v.inventory?.availableQuantity ?? v.stock), 0);

    return {
      id: product.id,
      name: product.name,
      title: product.name,
      slug: product.slug,
      sku: product.sku,
      shortDescription: product.shortDescription,
      description: product.description,
      fullDescription: product.description,
      pricing: {
        basePrice: Number(product.basePrice),
        compareAtPrice: product.compareAtPrice ? Number(product.compareAtPrice) : null,
        hasDiscount: !!product.compareAtPrice && Number(product.compareAtPrice) > Number(product.basePrice),
      },
      basePrice: product.basePrice,
      discountPrice: product.compareAtPrice ? product.basePrice : null,
      availability: {
        isAvailable: product.available && totalStock > 0,
        totalStock,
        inStock: totalStock > 0,
      },
      isAvailable: product.available,
      featured: product.featured,
      isFeatured: product.featured,
      seasonal: product.seasonal,
      isSeasonal: product.seasonal,
      sunlightRequirement: product.sunlightRequirement,
      sunlight: product.sunlightRequirement,
      wateringRequirement: product.wateringRequirement,
      watering: product.wateringRequirement,
      difficultyLevel: product.difficultyLevel,
      difficulty: product.difficultyLevel,
      careInstructions: product.careInstructions,
      careSummary: product.careInstructions,
      dimensions: product.dimensions,
      weight: product.weight,
      category: product.category,
      images: product.images.map((img) => ({
        id: img.id,
        url: img.url,
        altText: img.altText,
        alt: img.altText,
        isPrimary: img.isPrimary,
        sortOrder: img.sortOrder,
      })),
      variants: product.variants.map((v) => ({
        id: v.id,
        name: v.name,
        sku: v.sku,
        price: Number(v.price),
        priceAdjustment: Number(v.price) - Number(product.basePrice),
        stockQuantity: v.inventory?.availableQuantity ?? v.stock,
        isAvailable: v.isAvailable,
        isDefault: v.sortOrder === 1 || v.sortOrder === 0,
        sortOrder: v.sortOrder,
      })),
      attributes: product.attributes,
      reviews: product.reviews.map((r) => ({
        id: r.id,
        customerName: r.user?.name || 'Customer',
        rating: r.rating,
        title: r.title,
        comment: r.comment,
        plantPhotoUrl: r.plantPhotoUrl,
        isVerifiedBuyer: r.isVerifiedBuyer,
        createdAt: r.createdAt,
      })),
      rating: avgRating,
      averageRating: avgRating,
      reviewCount: product.reviews.length,
      createdAt: product.createdAt,
    };
  }

  static async getById(id: string, includeCostPrice = false) {
    const product = await prisma.product.findUnique({
      where: { id },
      include: {
        category: true,
        images: { orderBy: { sortOrder: 'asc' } },
        attributes: true,
        variants: {
          include: { inventory: true },
          orderBy: { sortOrder: 'asc' },
        },
      },
    });

    if (!product) throw ApiError.notFound('Product not found');

    if (!includeCostPrice) {
      delete (product as any).costPrice;
    }

    return product;
  }

  // Admin Methods
  static async createProduct(data: any, userId?: string) {
    const name = data.name || data.title || 'Botanical Plant';
    const slug = name
      .toLowerCase()
      .replace(/[^\w\s-]/g, '')
      .replace(/[\s_-]+/g, '-') + '-' + Date.now().toString().slice(-4);

    let categoryId = data.categoryId;
    if (!categoryId) {
      const existingCategory = await prisma.category.findFirst();
      if (existingCategory) {
        categoryId = existingCategory.id;
      } else {
        const newCat = await prisma.category.create({
          data: {
            name: 'Plants & Flora',
            slug: 'plants',
            description: 'Nursery plants and foliage',
          },
        });
        categoryId = newCat.id;
      }
    }

    const sku = data.sku || ('PLT-' + Date.now().toString().slice(-6));
    const rawVariants = (data.variants && data.variants.length > 0)
      ? data.variants
      : [
          {
            name: 'Standard Plant Pot',
            sku: sku,
            price: Number(data.basePrice),
            stock: data.available !== false ? 100 : 0,
            isAvailable: data.available !== false,
          },
        ];

    const product = await prisma.product.create({
      data: {
        name,
        slug,
        sku,
        shortDescription: data.shortDescription || name,
        description: data.description || data.fullDescription || `${name} - Fresh and healthy nursery plant from Kathmandu nursery.`,
        categoryId,
        basePrice: Number(data.basePrice),
        compareAtPrice: data.compareAtPrice ? Number(data.compareAtPrice) : null,
        costPrice: data.costPrice ? Number(data.costPrice) : null,
        available: data.available !== undefined ? data.available : true,
        featured: data.featured || false,
        published: data.published !== undefined ? data.published : true,
        seasonal: data.seasonal || false,
        lowStockThreshold: data.lowStockThreshold || 5,
        careInstructions: data.careInstructions,
        sunlightRequirement: data.sunlightRequirement || data.sunlight,
        wateringRequirement: data.wateringRequirement || data.watering,
        difficultyLevel: data.difficultyLevel || data.difficulty,
        dimensions: data.dimensions,
        weight: data.weight,
        images: data.images?.length
          ? {
              create: data.images.map((img: any, i: number) => ({
                url: img.url,
                altText: img.altText || name,
                isPrimary: img.isPrimary || i === 0,
                sortOrder: img.sortOrder || i + 1,
              })),
            }
          : undefined,
        attributes: data.attributes?.length
          ? {
              create: data.attributes.map((attr: any) => ({
                name: attr.name,
                value: attr.value,
              })),
            }
          : undefined,
        variants: {
          create: rawVariants.map((v: any, i: number) => ({
            name: v.name || 'Standard Pot',
            sku: v.sku || `${sku}-${i + 1}`,
            price: v.price ? Number(v.price) : Number(data.basePrice),
            stock: v.stockStatus === 'OUT_OF_STOCK' ? 0 : (v.stock !== undefined ? v.stock : 100),
            weight: v.weight,
            isAvailable: v.stockStatus === 'OUT_OF_STOCK' ? false : (v.isAvailable !== undefined ? v.isAvailable : true),
            sortOrder: v.sortOrder || i + 1,
            inventory: {
              create: {
                stockQuantity: v.stockStatus === 'OUT_OF_STOCK' ? 0 : (v.stock !== undefined ? v.stock : 100),
                reservedQuantity: 0,
                availableQuantity: v.stockStatus === 'OUT_OF_STOCK' ? 0 : (v.stock !== undefined ? v.stock : 100),
              },
            },
          })),
        },
      },
      include: {
        images: true,
        variants: { include: { inventory: true } },
        category: true,
      },
    });

    await prisma.auditLog.create({
      data: {
        userId,
        action: 'PRODUCT_CREATE',
        resource: 'Product',
        resourceId: product.id,
        details: { name: product.name, sku: product.sku },
      },
    });

    return product;
  }

  static async updateProduct(id: string, data: any, userId?: string) {
    const product = await prisma.product.findUnique({ where: { id } });
    if (!product) throw ApiError.notFound('Product not found');

    const updated = await prisma.product.update({
      where: { id },
      data,
      include: {
        images: true,
        variants: { include: { inventory: true } },
        category: true,
      },
    });

    await prisma.auditLog.create({
      data: {
        userId,
        action: 'PRODUCT_UPDATE',
        resource: 'Product',
        resourceId: id,
        details: { fields: Object.keys(data) },
      },
    });

    return updated;
  }

  static async deleteProduct(id: string, userId?: string) {
    const product = await prisma.product.findUnique({
      where: { id },
      include: { orderItems: { take: 1 } },
    });

    if (!product) throw ApiError.notFound('Product not found');

    // Soft delete / unpublish if historical order items exist
    if (product.orderItems.length > 0) {
      await prisma.product.update({
        where: { id },
        data: {
          published: false,
          available: false,
        },
      });

      await prisma.auditLog.create({
        data: {
          userId,
          action: 'PRODUCT_SOFT_DELETE',
          resource: 'Product',
          resourceId: id,
          details: { note: 'Unpublished due to historical order dependencies' },
        },
      });

      return { message: 'Product unpublished and archived successfully (historical orders preserved)' };
    } else {
      await prisma.product.delete({ where: { id } });

      await prisma.auditLog.create({
        data: {
          userId,
          action: 'PRODUCT_DELETE',
          resource: 'Product',
          resourceId: id,
          details: { name: product.name },
        },
      });

      return { message: 'Product permanently deleted' };
    }
  }

  // Variant CRUD
  static async createVariant(productId: string, data: any, userId?: string) {
    const product = await prisma.product.findUnique({ where: { id: productId } });
    if (!product) throw ApiError.notFound('Parent product not found');

    const variant = await prisma.productVariant.create({
      data: {
        productId,
        name: data.name,
        sku: data.sku,
        price: data.price,
        stock: data.stock || 0,
        weight: data.weight,
        isAvailable: data.isAvailable !== undefined ? data.isAvailable : true,
        sortOrder: data.sortOrder || 0,
        inventory: {
          create: {
            stockQuantity: data.stock || 0,
            reservedQuantity: 0,
            availableQuantity: data.stock || 0,
          },
        },
      },
      include: { inventory: true },
    });

    await prisma.auditLog.create({
      data: {
        userId,
        action: 'VARIANT_CREATE',
        resource: 'ProductVariant',
        resourceId: variant.id,
        details: { product: product.name, variant: variant.name },
      },
    });

    return variant;
  }

  static async updateVariant(id: string, data: any, userId?: string) {
    const variant = await prisma.productVariant.findUnique({ where: { id } });
    if (!variant) throw ApiError.notFound('Product variant not found');

    const updated = await prisma.productVariant.update({
      where: { id },
      data,
      include: { inventory: true },
    });

    await prisma.auditLog.create({
      data: {
        userId,
        action: 'VARIANT_UPDATE',
        resource: 'ProductVariant',
        resourceId: id,
        details: { fields: Object.keys(data) },
      },
    });

    return updated;
  }

  static async deleteVariant(id: string, userId?: string) {
    const variant = await prisma.productVariant.findUnique({
      where: { id },
      include: { orderItems: { take: 1 } },
    });

    if (!variant) throw ApiError.notFound('Product variant not found');

    if (variant.orderItems.length > 0) {
      await prisma.productVariant.update({
        where: { id },
        data: { isAvailable: false },
      });

      return { message: 'Variant marked inactive (historical order dependencies preserved)' };
    } else {
      await prisma.productVariant.delete({ where: { id } });
      return { message: 'Variant permanently deleted' };
    }
  }

  // ==========================================
  // Product Image Management
  // ==========================================
  static async addProductImage(
    productId: string,
    imageData: { url: string; altText?: string; isPrimary?: boolean; sortOrder?: number },
    userId?: string
  ) {
    const product = await prisma.product.findUnique({
      where: { id: productId },
      include: { images: true },
    });
    if (!product) throw ApiError.notFound('Product not found');

    const isFirstImage = product.images.length === 0;
    const isPrimary = imageData.isPrimary ?? isFirstImage;

    // If marked as primary, unmark any previous primary images
    if (isPrimary && product.images.length > 0) {
      await prisma.productImage.updateMany({
        where: { productId },
        data: { isPrimary: false },
      });
    }

    const sortOrder = imageData.sortOrder ?? product.images.length + 1;

    const newImage = await prisma.productImage.create({
      data: {
        productId,
        url: imageData.url,
        altText: imageData.altText || product.name,
        isPrimary,
        sortOrder,
      },
    });

    await prisma.auditLog.create({
      data: {
        userId,
        action: 'PRODUCT_IMAGE_ADD',
        resource: 'ProductImage',
        resourceId: newImage.id,
        details: { productId, url: newImage.url, isPrimary },
      },
    });

    return newImage;
  }

  static async deleteProductImage(productId: string, imageId: string, userId?: string) {
    const image = await prisma.productImage.findFirst({
      where: { id: imageId, productId },
    });
    if (!image) throw ApiError.notFound('Image not found for this product');

    await prisma.productImage.delete({ where: { id: imageId } });

    // If this was primary, promote the first remaining image to primary
    if (image.isPrimary) {
      const remainingFirst = await prisma.productImage.findFirst({
        where: { productId },
        orderBy: { sortOrder: 'asc' },
      });
      if (remainingFirst) {
        await prisma.productImage.update({
          where: { id: remainingFirst.id },
          data: { isPrimary: true },
        });
      }
    }

    await prisma.auditLog.create({
      data: {
        userId,
        action: 'PRODUCT_IMAGE_DELETE',
        resource: 'ProductImage',
        resourceId: imageId,
        details: { productId },
      },
    });

    return { message: 'Product image deleted successfully' };
  }

  static async setPrimaryImage(productId: string, imageId: string, userId?: string) {
    const image = await prisma.productImage.findFirst({
      where: { id: imageId, productId },
    });
    if (!image) throw ApiError.notFound('Image not found for this product');

    // Unmark other images
    await prisma.productImage.updateMany({
      where: { productId },
      data: { isPrimary: false },
    });

    // Set this image primary
    const updated = await prisma.productImage.update({
      where: { id: imageId },
      data: { isPrimary: true },
    });

    await prisma.auditLog.create({
      data: {
        userId,
        action: 'PRODUCT_IMAGE_PRIMARY_SET',
        resource: 'ProductImage',
        resourceId: imageId,
        details: { productId },
      },
    });

    return updated;
  }

  static async reorderProductImages(
    productId: string,
    orders: Array<{ id: string; sortOrder: number }>,
    userId?: string
  ) {
    const updates = orders.map((item) =>
      prisma.productImage.updateMany({
        where: { id: item.id, productId },
        data: { sortOrder: item.sortOrder },
      })
    );

    await prisma.$transaction(updates);

    await prisma.auditLog.create({
      data: {
        userId,
        action: 'PRODUCT_IMAGE_REORDER',
        resource: 'Product',
        resourceId: productId,
        details: { orderCount: orders.length },
      },
    });

    return prisma.productImage.findMany({
      where: { productId },
      orderBy: { sortOrder: 'asc' },
    });
  }
}
