import { prisma } from '../../config/database.js';
import { ApiError } from '../../utils/ApiError.js';
import { appCache } from '../../utils/cache.js';

const CATEGORIES_ALL_CACHE_KEY = 'categories:all';
const CATEGORIES_CACHE_TTL = 600; // 10 minutes

export class CategoryService {
  static async getAll() {
    return appCache.getOrSet(
      CATEGORIES_ALL_CACHE_KEY,
      async () => {
        return prisma.category.findMany({
          where: { isActive: true },
          orderBy: { displayOrder: 'asc' },
          include: {
            _count: {
              select: { products: true },
            },
          },
        });
      },
      CATEGORIES_CACHE_TTL
    );
  }

  static async getBySlug(slug: string) {
    const category = await prisma.category.findUnique({
      where: { slug },
      include: {
        products: {
          where: { published: true, available: true },
          include: {
            variants: true,
            images: true,
          },
        },
      },
    });

    if (!category) throw ApiError.notFound('Category not found');
    return category;
  }

  static async create(data: any) {
    const slug = data.name
      .toLowerCase()
      .replace(/[^\w\s-]/g, '')
      .replace(/[\s_-]+/g, '-');

    const created = await prisma.category.create({
      data: {
        ...data,
        slug,
      },
    });

    appCache.del(CATEGORIES_ALL_CACHE_KEY);
    appCache.clearPattern('system:sitemap.xml');
    return created;
  }

  static async update(id: string, data: any) {
    const updated = await prisma.category.update({
      where: { id },
      data,
    });

    appCache.del(CATEGORIES_ALL_CACHE_KEY);
    appCache.clearPattern('system:sitemap.xml');
    return updated;
  }

  static async delete(id: string) {
    const category = await prisma.category.findUnique({
      where: { id },
      include: { _count: { select: { products: true, children: true } } },
    });

    if (!category) throw ApiError.notFound('Category not found');
    if (category._count.products > 0) {
      throw ApiError.conflict(
        `Cannot delete "${category.name}" while ${category._count.products} product(s) use it. Move or delete those products first.`
      );
    }
    if (category._count.children > 0) {
      throw ApiError.conflict(
        `Cannot delete "${category.name}" while it has child categories. Move or delete the child categories first.`
      );
    }

    const deleted = await prisma.category.delete({
      where: { id },
    });

    appCache.del(CATEGORIES_ALL_CACHE_KEY);
    appCache.clearPattern('system:sitemap.xml');
    return deleted;
  }
}

