import { prisma } from '../../config/database.js';
import { ApiError } from '../../utils/ApiError.js';

export class CategoryService {
  static async getAll() {
    return prisma.category.findMany({
      where: { isActive: true },
      orderBy: { displayOrder: 'asc' },
      include: {
        _count: {
          select: { products: true },
        },
      },
    });
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

    return prisma.category.create({
      data: {
        ...data,
        slug,
      },
    });
  }

  static async update(id: string, data: any) {
    return prisma.category.update({
      where: { id },
      data,
    });
  }

  static async delete(id: string) {
    return prisma.category.delete({
      where: { id },
    });
  }
}
