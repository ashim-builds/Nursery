import { prisma } from '../../config/database.js';
import { ApiError } from '../../utils/ApiError.js';

export class CareGuideService {
  static async getAll() {
    const products = await prisma.product.findMany({
      where: { published: true, careInstructions: { not: null } },
      select: {
        id: true,
        name: true,
        slug: true,
        careInstructions: true,
        sunlightRequirement: true,
        wateringRequirement: true,
        difficultyLevel: true,
        images: { take: 1 },
        attributes: true,
      },
    });

    return products.map((p) => {
      const species = p.attributes.find((a) => a.name.toLowerCase().includes('scientific'))?.value;
      return {
        id: p.id,
        title: `${p.name} Care & Growth Manual`,
        slug: p.slug,
        species,
        summary: p.careInstructions || 'Botanical plant care tips and watering guide.',
        sunlightTips: p.sunlightRequirement ? `Requires ${p.sunlightRequirement.replace(/_/g, ' ').toLowerCase()}` : 'Moderate light',
        wateringTips: p.wateringRequirement ? `Watering schedule: ${p.wateringRequirement.replace(/_/g, ' ').toLowerCase()}` : 'Water when topsoil dries',
        soilTips: 'Well-draining rich organic aroid or loam potting mix with vermicompost.',
        difficulty: p.difficultyLevel || 'EASY',
        imageUrl: p.images[0]?.url,
        isPublished: true,
      };
    });
  }

  static async getBySlug(slug: string) {
    const product = await prisma.product.findUnique({
      where: { slug },
      include: {
        images: true,
        attributes: true,
      },
    });

    if (!product) throw ApiError.notFound('Plant care guide not found');

    const species = product.attributes.find((a) => a.name.toLowerCase().includes('scientific'))?.value;

    return {
      id: product.id,
      title: `${product.name} Care Guide`,
      slug: product.slug,
      species,
      summary: product.careInstructions || 'Botanical care instructions for Kathmandu homes.',
      sunlightTips: product.sunlightRequirement ? `Place in ${product.sunlightRequirement.replace(/_/g, ' ').toLowerCase()}` : 'Bright indirect light',
      wateringTips: product.wateringRequirement ? `Hydration frequency: ${product.wateringRequirement.replace(/_/g, ' ').toLowerCase()}` : 'Water when top 2 inches dry',
      soilTips: 'Use well-aerated organic soil with 30% vermicompost and perlite.',
      repottingTips: 'Repot every 1-2 years during spring active growing season.',
      pestControlTips: 'Spray cold-pressed organic neem oil spray once a month to prevent mites and fungus.',
      difficulty: product.difficultyLevel || 'EASY',
      imageUrl: product.images[0]?.url,
      isPublished: true,
    };
  }

  static async create(data: any) {
    return data;
  }

  static async update(id: string, data: any) {
    return data;
  }

  static async delete(id: string) {
    return null;
  }
}
