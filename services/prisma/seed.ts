import { 
  PrismaClient, 
  UserRole, 
  SunlightRequirement, 
  WateringRequirement, 
  DifficultyLevel, 
  OrderStatus, 
  PaymentMethod, 
  PaymentStatus,
  DeliveryStatus,
  BillStatus,
  DiscountType,
  InventoryTransactionType
} from '@prisma/client';
import bcrypt from 'bcryptjs';

const prisma = new PrismaClient();

async function main() {
  console.log('🌱 Starting KtmBotanica realistic nursery database seed...');

  // 1. Safe cleanup in reverse dependency order
  await prisma.auditLog.deleteMany();
  await prisma.notification.deleteMany();
  await prisma.pushSubscription.deleteMany();
  await prisma.couponUsage.deleteMany();
  await prisma.coupon.deleteMany();
  await prisma.wishlistItem.deleteMany();
  await prisma.wishlist.deleteMany();
  await prisma.productReview.deleteMany();
  await prisma.payment.deleteMany();
  await prisma.bill.deleteMany();
  await prisma.delivery.deleteMany();
  await prisma.deliveryZone.deleteMany();
  await prisma.orderStatusHistory.deleteMany();
  await prisma.orderItem.deleteMany();
  await prisma.order.deleteMany();
  await prisma.cartItem.deleteMany();
  await prisma.cart.deleteMany();
  await prisma.inventoryTransaction.deleteMany();
  await prisma.inventory.deleteMany();
  await prisma.productAttribute.deleteMany();
  await prisma.productImage.deleteMany();
  await prisma.productVariant.deleteMany();
  await prisma.product.deleteMany();
  await prisma.category.deleteMany();
  await prisma.staffProfile.deleteMany();
  await prisma.address.deleteMany();
  await prisma.refreshToken.deleteMany();
  await prisma.user.deleteMany();

  // 2. Users & Roles (Development-Only Credentials)
  const adminPassword = await bcrypt.hash('Admin@12345', 10);
  const staffPassword = await bcrypt.hash('Staff@12345', 10);
  const customerPassword = await bcrypt.hash('Customer@12345', 10);

  const admin = await prisma.user.create({
    data: {
      email: 'admin@ktmbotanica.com',
      passwordHash: adminPassword,
      name: 'Sujan Shrestha (Admin)',
      phoneNumber: '+977-9841234567',
      role: UserRole.ADMIN,
    },
  });

  const staff = await prisma.user.create({
    data: {
      email: 'staff@ktmbotanica.com',
      passwordHash: staffPassword,
      name: 'Dr. Aarav Joshi (Horticulturist)',
      phoneNumber: '+977-9851098765',
      role: UserRole.STAFF,
      staffProfile: {
        create: {
          designation: 'Head Botanist & Studio Manager',
          department: 'Plant Care & Dispatch',
          shift: 'Morning & Afternoon',
        },
      },
    },
  });

  const customer = await prisma.user.create({
    data: {
      email: 'customer@ktmbotanica.com',
      passwordHash: customerPassword,
      name: 'Prashant Adhikari',
      phoneNumber: '+977-9801234999',
      role: UserRole.CUSTOMER,
      addresses: {
        create: [
          {
            label: 'Home',
            fullName: 'Prashant Adhikari',
            phoneNumber: '+977-9801234999',
            streetAddress: 'House 42, Baluwatar near Russian Embassy',
            city: 'Kathmandu',
            area: 'Baluwatar',
            isDefault: true,
          },
          {
            label: 'Office',
            fullName: 'Prashant Adhikari',
            phoneNumber: '+977-9801234999',
            streetAddress: 'Trade Tower 5th Floor, Thapathali',
            city: 'Kathmandu',
            area: 'Thapathali',
            isDefault: false,
          },
        ],
      },
    },
  });

  console.log('✅ Created Demo Admin, Staff, and Customer users');

  // 3. Delivery Zones
  const zoneKtm = await prisma.deliveryZone.create({
    data: {
      name: 'Kathmandu Ring Road Core',
      code: 'KTM_RING',
      description: 'Standard inside Ring Road delivery (Baluwatar, Lazimpat, Baneshwor, Thamel, Kapan)',
      baseDeliveryCharge: 100.00,
      minimumOrder: 300.00,
      estimatedHours: 4,
      estimatedDeliveryTime: 'Same Day (2-4 Hours)',
      isActive: true,
    },
  });

  const zoneLalitpur = await prisma.deliveryZone.create({
    data: {
      name: 'Lalitpur Core (Sanepa, Jhamsikhel, Patan, Kupondole)',
      code: 'LLP_CORE',
      description: 'Lalitpur metropolitan core botanical dispatch',
      baseDeliveryCharge: 100.00,
      minimumOrder: 300.00,
      estimatedHours: 4,
      estimatedDeliveryTime: 'Same Day (2-4 Hours)',
      isActive: true,
    },
  });

  const zoneBhaktapur = await prisma.deliveryZone.create({
    data: {
      name: 'Bhaktapur & Valley Suburbs (Sallaghari, Suryabinayak, Thimi)',
      code: 'BKT_SUB',
      description: 'Bhaktapur valley and surrounding foothills',
      baseDeliveryCharge: 150.00,
      minimumOrder: 500.00,
      estimatedHours: 8,
      estimatedDeliveryTime: 'Next Day Delivery',
      isActive: true,
    },
  });

  const zoneOutside = await prisma.deliveryZone.create({
    data: {
      name: 'Pokhara, Chitwan & Major Cities Express',
      code: 'VALLEY_OUT',
      description: 'Inter-city express courier service with climate-buffered packaging',
      baseDeliveryCharge: 250.00,
      minimumOrder: 1000.00,
      estimatedHours: 48,
      estimatedDeliveryTime: '1-2 Days Courier',
      isActive: true,
    },
  });

  console.log('✅ Created 4 Delivery Zones');

  // 4. Categories (11 Explicit Categories)
  const catIndoor = await prisma.category.create({
    data: {
      name: 'Indoor Plants',
      slug: 'indoor-plants',
      description: 'Air-purifying, low-light, and aesthetic indoor foliage for apartments and living spaces.',
      imageUrl: 'https://images.unsplash.com/photo-1545241047-6083a3684587?auto=format&fit=crop&w=800&q=80',
      displayOrder: 1,
    },
  });

  const catOutdoor = await prisma.category.create({
    data: {
      name: 'Outdoor Plants',
      slug: 'outdoor-plants',
      description: 'Hardy landscape shrubs, privacy hedges, climbers, and terrace garden foliage.',
      imageUrl: 'https://images.unsplash.com/photo-1585320806297-9794b3e4eeae?auto=format&fit=crop&w=800&q=80',
      displayOrder: 2,
    },
  });

  const catFlowering = await prisma.category.create({
    data: {
      name: 'Flowering Plants',
      slug: 'flowering-plants',
      description: 'Vibrant blooming perennial and seasonal flowering varieties that brighten any space.',
      imageUrl: 'https://images.unsplash.com/photo-1508615039623-a25605d2b022?auto=format&fit=crop&w=800&q=80',
      displayOrder: 3,
    },
  });

  const catSucculents = await prisma.category.create({
    data: {
      name: 'Succulents',
      slug: 'succulents',
      description: 'Drought-tolerant fleshy succulents, rosettes, and low-maintenance desk companions.',
      imageUrl: 'https://images.unsplash.com/photo-1459411552884-841db9b3cc2a?auto=format&fit=crop&w=800&q=80',
      displayOrder: 4,
    },
  });

  const catCactus = await prisma.category.create({
    data: {
      name: 'Cactus',
      slug: 'cactus',
      description: 'Sculptural desert cacti, moon cactus grafts, and prickly beauties for sunny windows.',
      imageUrl: 'https://images.unsplash.com/photo-1509223197845-458d87318791?auto=format&fit=crop&w=800&q=80',
      displayOrder: 5,
    },
  });

  const catBouquets = await prisma.category.create({
    data: {
      name: 'Flower Bouquets',
      slug: 'flower-bouquets',
      description: 'Hand-tied fresh cut flower arrangements, celebration roses, and gift-ready floral wraps.',
      imageUrl: 'https://images.unsplash.com/photo-1561181286-d3fee7d55364?auto=format&fit=crop&w=800&q=80',
      displayOrder: 6,
    },
  });

  const catPots = await prisma.category.create({
    data: {
      name: 'Pots & Planters',
      slug: 'pots-planters',
      description: 'Handcrafted terracotta, ceramic glazed pots, and lightweight eco-fiber containers.',
      imageUrl: 'https://images.unsplash.com/photo-1485955900006-10f4d324d411?auto=format&fit=crop&w=800&q=80',
      displayOrder: 7,
    },
  });

  const catSeeds = await prisma.category.create({
    data: {
      name: 'Seeds',
      slug: 'seeds',
      description: 'High-germination organic vegetable, culinary herb, and vibrant flower seeds for home gardeners.',
      imageUrl: 'https://images.unsplash.com/photo-1523348837708-15d4a09cfac2?auto=format&fit=crop&w=800&q=80',
      displayOrder: 8,
    },
  });

  const catTools = await prisma.category.create({
    data: {
      name: 'Gardening Tools',
      slug: 'gardening-tools',
      description: 'Ergonomic stainless bypass pruners, precision watering cans, trowels, and protective gloves.',
      imageUrl: 'https://images.unsplash.com/photo-1617576683096-00fc8eecb3af?auto=format&fit=crop&w=800&q=80',
      displayOrder: 9,
    },
  });

  const catFertilizers = await prisma.category.create({
    data: {
      name: 'Soil & Fertilizers',
      slug: 'soil-fertilizers',
      description: 'Organic vermicompost, perlite potting mixes, neem oil pest spray, and seaweed growth boosters.',
      imageUrl: 'https://images.unsplash.com/photo-1628352081506-83c43123ed6d?auto=format&fit=crop&w=800&q=80',
      displayOrder: 10,
    },
  });

  const catGifts = await prisma.category.create({
    data: {
      name: 'Gifts',
      slug: 'gifts',
      description: 'Botanical gift sets, self-watering desk kits, plant parent starter bundles, and greeting cards.',
      imageUrl: 'https://images.unsplash.com/photo-1513519245088-0e12902e5a38?auto=format&fit=crop&w=800&q=80',
      displayOrder: 11,
    },
  });

  console.log('✅ Created 11 Core Categories');

  // Helper to create product with variants and inventory
  async function createBotanicalProduct(data: {
    name: string;
    slug: string;
    sku: string;
    shortDescription: string;
    description: string;
    categoryId: string;
    basePrice: number;
    compareAtPrice?: number;
    costPrice?: number;
    featured?: boolean;
    seasonal?: boolean;
    sunlightRequirement?: SunlightRequirement;
    wateringRequirement?: WateringRequirement;
    difficultyLevel?: DifficultyLevel;
    dimensions?: string;
    weight?: number;
    careInstructions?: string;
    images: Array<{ url: string; isPrimary: boolean; sortOrder: number }>;
    attributes: Array<{ name: string; value: string }>;
    variants: Array<{ name: string; sku: string; price: number; stock: number; weight?: number; sortOrder: number }>;
  }) {
    return prisma.product.create({
      data: {
        name: data.name,
        slug: data.slug,
        sku: data.sku,
        shortDescription: data.shortDescription,
        description: data.description,
        categoryId: data.categoryId,
        basePrice: data.basePrice,
        compareAtPrice: data.compareAtPrice,
        costPrice: data.costPrice || data.basePrice * 0.5,
        available: true,
        featured: data.featured || false,
        published: true,
        seasonal: data.seasonal || false,
        lowStockThreshold: 5,
        sunlightRequirement: data.sunlightRequirement,
        wateringRequirement: data.wateringRequirement,
        difficultyLevel: data.difficultyLevel,
        dimensions: data.dimensions || '20x20x40 cm',
        weight: data.weight || 1.5,
        careInstructions: data.careInstructions,
        images: {
          create: data.images.map((img) => ({
            url: img.url,
            isPrimary: img.isPrimary,
            sortOrder: img.sortOrder,
            altText: data.name,
          })),
        },
        attributes: {
          create: data.attributes.map((attr) => ({
            name: attr.name,
            value: attr.value,
          })),
        },
        variants: {
          create: data.variants.map((v) => ({
            name: v.name,
            sku: v.sku,
            price: v.price,
            stock: v.stock,
            weight: v.weight || 1.0,
            sortOrder: v.sortOrder,
            isAvailable: true,
            inventory: {
              create: {
                stockQuantity: v.stock,
                reservedQuantity: 0,
                availableQuantity: v.stock,
              },
            },
          })),
        },
      },
      include: { variants: true },
    });
  }

  // 5. Products — Explicit Realistic Inventory

  // 1. Snake Plant (Sansevieria)
  const snakePlant = await createBotanicalProduct({
    name: 'Snake Plant Laurentii (Sansevieria Trifasciata)',
    slug: 'snake-plant-laurentii',
    sku: 'PLN-SNK-001',
    shortDescription: 'Indestructible architectural plant. Top NASA oxygen generator day and night.',
    description: 'Featuring sword-like upright leaves banded in rich yellow and emerald green. Thrives in dry apartment air and low light conditions throughout Nepal.',
    categoryId: catIndoor.id,
    basePrice: 650.00,
    compareAtPrice: 800.00,
    featured: true,
    sunlightRequirement: SunlightRequirement.LOW_LIGHT,
    wateringRequirement: WateringRequirement.BIWEEKLY,
    difficultyLevel: DifficultyLevel.EASY,
    careInstructions: 'Water once every 2-3 weeks. Allow soil to dry out completely. Tolerates low light effortlessly.',
    images: [
      { url: 'https://images.unsplash.com/photo-1593482892290-f54927ae1bf6?auto=format&fit=crop&w=800&q=80', isPrimary: true, sortOrder: 1 },
      { url: 'https://images.unsplash.com/photo-1545241047-6083a3684587?auto=format&fit=crop&w=800&q=80', isPrimary: false, sortOrder: 2 },
    ],
    attributes: [
      { name: 'Scientific Name', value: 'Dracaena trifasciata' },
      { name: 'Air Purifying', value: 'Releases Oxygen at Night (NASA)' },
      { name: 'Pet Friendly', value: 'Toxic if ingested by pets' },
    ],
    variants: [
      { name: 'Small (5" Grower Pot)', sku: 'PLN-SNK-001-SM', price: 650.00, stock: 35, sortOrder: 1 },
      { name: 'Medium (7" Matte Ceramic Planter)', sku: 'PLN-SNK-001-MED-CER', price: 1250.00, stock: 20, sortOrder: 2 },
      { name: 'Large (10" Architectural Terracotta)', sku: 'PLN-SNK-001-LG-TER', price: 1950.00, stock: 10, sortOrder: 3 },
    ],
  });

  // 2. Money Plant (Golden Pothos)
  const moneyPlant = await createBotanicalProduct({
    name: 'Golden Money Plant (Pothos Vine)',
    slug: 'golden-money-plant-pothos',
    sku: 'PLN-MTH-002',
    shortDescription: 'Prosperity symbol with fast-growing golden variegated cascading foliage.',
    description: 'Believed to bring good fortune and clean energy into Nepali households. Versatile climber that can trail from hanging pots or climb a coco-moss pole.',
    categoryId: catIndoor.id,
    basePrice: 450.00,
    compareAtPrice: 550.00,
    featured: true,
    sunlightRequirement: SunlightRequirement.MEDIUM_LIGHT,
    wateringRequirement: WateringRequirement.WEEKLY_ONCE,
    difficultyLevel: DifficultyLevel.EASY,
    careInstructions: 'Water weekly when top inch dries. Mist leaves in summer. Propagates easily in clean water.',
    images: [
      { url: 'https://images.unsplash.com/photo-1596724817796-7c98c1d5ce5f?auto=format&fit=crop&w=800&q=80', isPrimary: true, sortOrder: 1 },
    ],
    attributes: [
      { name: 'Scientific Name', value: 'Epipremnum aureum' },
      { name: 'Growth Habit', value: 'Trailing & Climbing Vine' },
      { name: 'Feng Shui / Vastu', value: 'Wealth & Positive Vibe' },
    ],
    variants: [
      { name: '6" Hanging Basket', sku: 'PLN-MTH-002-HNG', price: 450.00, stock: 40, sortOrder: 1 },
      { name: '8" Tabletop Pot with 2ft Moss Pole', sku: 'PLN-MTH-002-POLE', price: 950.00, stock: 18, sortOrder: 2 },
    ],
  });

  // 3. Peace Lily (Spathiphyllum)
  const peaceLily = await createBotanicalProduct({
    name: 'Peace Lily (Spathiphyllum Sweet Chico)',
    slug: 'peace-lily-spathiphyllum',
    sku: 'PLN-LIL-003',
    shortDescription: 'Glossy emerald foliage crowned by graceful pure white flower spathes.',
    description: 'One of the best houseplants for filtering formaldehyde, benzene, and carbon monoxide. Tells you when it needs water by slightly drooping its leaves.',
    categoryId: catIndoor.id,
    basePrice: 750.00,
    compareAtPrice: 900.00,
    featured: true,
    sunlightRequirement: SunlightRequirement.MEDIUM_LIGHT,
    wateringRequirement: WateringRequirement.TWICE_WEEKLY,
    difficultyLevel: DifficultyLevel.EASY,
    careInstructions: 'Keep soil lightly moist. Avoid direct scorching sun which burns delicate white blooms.',
    images: [
      { url: 'https://images.unsplash.com/photo-1593691509543-c55fb32e7355?auto=format&fit=crop&w=800&q=80', isPrimary: true, sortOrder: 1 },
    ],
    attributes: [
      { name: 'Scientific Name', value: 'Spathiphyllum wallisii' },
      { name: 'Air Purifying Score', value: '9.5 / 10' },
    ],
    variants: [
      { name: '6" Grower Pot', sku: 'PLN-LIL-003-6IN', price: 750.00, stock: 25, sortOrder: 1 },
      { name: '8" Self-Watering Glazed Ceramic', sku: 'PLN-LIL-003-8CER', price: 1450.00, stock: 12, sortOrder: 2 },
    ],
  });

  // 4. Monstera Deliciosa
  const monstera = await createBotanicalProduct({
    name: 'Swiss Cheese Monstera (Monstera Deliciosa)',
    slug: 'swiss-cheese-monstera-deliciosa',
    sku: 'PLN-MON-004',
    shortDescription: 'Iconic split leaves. The ultimate statement indoor plant for modern living spaces.',
    description: 'The Monstera Deliciosa is revered for its natural leaf fenestrations and lush tropical aesthetic. Adapts remarkably well to indoor humidity in Kathmandu.',
    categoryId: catIndoor.id,
    basePrice: 1050.00,
    compareAtPrice: 1250.00,
    featured: true,
    sunlightRequirement: SunlightRequirement.BRIGHT_INDIRECT,
    wateringRequirement: WateringRequirement.WEEKLY_ONCE,
    difficultyLevel: DifficultyLevel.EASY,
    careInstructions: 'Water once top 2 inches dry. Keep in bright indirect light. Wipe leaves with damp cloth periodically.',
    images: [
      { url: 'https://images.unsplash.com/photo-1614594975525-e45190c55d0b?auto=format&fit=crop&w=800&q=80', isPrimary: true, sortOrder: 1 },
    ],
    attributes: [
      { name: 'Scientific Name', value: 'Monstera deliciosa' },
      { name: 'Foliage Feature', value: 'Deeply Fenestrated Mature Leaves' },
    ],
    variants: [
      { name: 'Small (5" Nursery Pot)', sku: 'PLN-MON-004-SM', price: 1050.00, stock: 30, sortOrder: 1 },
      { name: 'Medium (7" White Ceramic Planter)', sku: 'PLN-MON-004-MED', price: 1750.00, stock: 15, sortOrder: 2 },
      { name: 'Large (10" Specimen with Coco Pole)', sku: 'PLN-MON-004-LG', price: 2850.00, stock: 8, sortOrder: 3 },
    ],
  });

  // 5. Aloe Vera
  const aloeVera = await createBotanicalProduct({
    name: 'Medicinal Aloe Vera (Barbadensis Miller)',
    slug: 'medicinal-aloe-vera',
    sku: 'PLN-ALV-005',
    shortDescription: 'Healing succulent packed with soothing medicinal gel for skin, hair and wellness.',
    description: 'Thick succulent spears filled with fresh cooling gel. Hardy, drought-proof, and thrives on Kathmandu sunny balconies.',
    categoryId: catSucculents.id,
    basePrice: 350.00,
    compareAtPrice: 450.00,
    sunlightRequirement: SunlightRequirement.FULL_SUN,
    wateringRequirement: WateringRequirement.BIWEEKLY,
    difficultyLevel: DifficultyLevel.EASY,
    careInstructions: 'Needs plenty of direct sunshine. Water sparingly only when soil is bone dry.',
    images: [
      { url: 'https://images.unsplash.com/photo-1567689265664-1c48de61db0b?auto=format&fit=crop&w=800&q=80', isPrimary: true, sortOrder: 1 },
    ],
    attributes: [
      { name: 'Scientific Name', value: 'Aloe barbadensis miller' },
      { name: 'Medicinal Use', value: 'Skin burn relief, organic hair gel' },
    ],
    variants: [
      { name: '5" Earthen Clay Pot', sku: 'PLN-ALV-005-5CL', price: 350.00, stock: 50, sortOrder: 1 },
      { name: '7" Terracotta Clump with 3+ Pups', sku: 'PLN-ALV-005-7TER', price: 650.00, stock: 25, sortOrder: 2 },
    ],
  });

  // 6. ZZ Plant (Zamioculcas Zamiifolia)
  const zzPlant = await createBotanicalProduct({
    name: 'ZZ Plant Emerald (Zamioculcas Zamiifolia)',
    slug: 'zz-plant-emerald',
    sku: 'PLN-ZZP-006',
    shortDescription: 'Glossy feather-like waxy foliage. Survives extreme neglect and fluorescent office lighting.',
    description: 'Features potato-like underground rhizomes that store water for months. Ideal for dark corners, bedroom tables, and busy professionals.',
    categoryId: catIndoor.id,
    basePrice: 850.00,
    compareAtPrice: 1000.00,
    featured: true,
    sunlightRequirement: SunlightRequirement.LOW_LIGHT,
    wateringRequirement: WateringRequirement.MONTHLY,
    difficultyLevel: DifficultyLevel.EASY,
    careInstructions: 'Water once every 3-4 weeks. Do not overwater. Tolerates lowest light levels.',
    images: [
      { url: 'https://images.unsplash.com/photo-1632207691143-643e2a9a9361?auto=format&fit=crop&w=800&q=80', isPrimary: true, sortOrder: 1 },
    ],
    attributes: [
      { name: 'Scientific Name', value: 'Zamioculcas zamiifolia' },
      { name: 'Light Tolerance', value: 'Lowest light of any indoor plant' },
    ],
    variants: [
      { name: '6" Nursery Pot', sku: 'PLN-ZZP-006-6NP', price: 850.00, stock: 28, sortOrder: 1 },
      { name: '8" Nordic Ceramic Cylinder', sku: 'PLN-ZZP-006-8CER', price: 1650.00, stock: 14, sortOrder: 2 },
    ],
  });

  // 7. Spider Plant (Chlorophytum)
  const spiderPlant = await createBotanicalProduct({
    name: 'Variegated Spider Plant (Ribbon Plant)',
    slug: 'variegated-spider-plant',
    sku: 'PLN-SPD-007',
    shortDescription: '100% Pet-safe air purifier with cascading runners producing miniature spiderettes.',
    description: 'Safe for curious cats and dogs. Arched green and white striped leaves that continuously send off trailing baby plants for propagation.',
    categoryId: catIndoor.id,
    basePrice: 380.00,
    compareAtPrice: 480.00,
    sunlightRequirement: SunlightRequirement.BRIGHT_INDIRECT,
    wateringRequirement: WateringRequirement.WEEKLY_ONCE,
    difficultyLevel: DifficultyLevel.EASY,
    careInstructions: 'Water when top 50% soil dries. Provide bright indirect morning light for vibrant variegation.',
    images: [
      { url: 'https://images.unsplash.com/photo-1572688484438-313a6e50c333?auto=format&fit=crop&w=800&q=80', isPrimary: true, sortOrder: 1 },
    ],
    attributes: [
      { name: 'Scientific Name', value: 'Chlorophytum comosum' },
      { name: 'Pet Friendly', value: '100% Non-Toxic to Cats & Dogs' },
    ],
    variants: [
      { name: '6" Hanging Hook Pot', sku: 'PLN-SPD-007-HNG', price: 380.00, stock: 35, sortOrder: 1 },
      { name: '7" Tabletop Ceramic Planter', sku: 'PLN-SPD-007-CER', price: 780.00, stock: 20, sortOrder: 2 },
    ],
  });

  // 8. Jade Plant (Crassula Ovata)
  const jadePlant = await createBotanicalProduct({
    name: 'Good Luck Jade Plant (Crassula Ovata)',
    slug: 'good-luck-jade-plant-crassula',
    sku: 'PLN-JAD-008',
    shortDescription: 'Miniature succulent tree symbolizing wealth, friendship, and resilience.',
    description: 'Fleshy jade-green coin shaped leaves on woody stems that can live for decades and be trained into exquisite bonsai styles.',
    categoryId: catSucculents.id,
    basePrice: 450.00,
    compareAtPrice: 550.00,
    featured: true,
    sunlightRequirement: SunlightRequirement.FULL_SUN,
    wateringRequirement: WateringRequirement.BIWEEKLY,
    difficultyLevel: DifficultyLevel.EASY,
    careInstructions: 'Keep on sunny windowsill or balcony. Water only when fleshy leaves feel slightly soft to touch.',
    images: [
      { url: 'https://images.unsplash.com/photo-1509423350716-97f9360b4e09?auto=format&fit=crop&w=800&q=80', isPrimary: true, sortOrder: 1 },
    ],
    attributes: [
      { name: 'Scientific Name', value: 'Crassula ovata' },
      { name: 'Vastu Direction', value: 'South-East or Main Entrance' },
    ],
    variants: [
      { name: '5" Terracotta Pot', sku: 'PLN-JAD-008-5TER', price: 450.00, stock: 30, sortOrder: 1 },
      { name: '8" Bonsai Ceramic Shallow Dish', sku: 'PLN-JAD-008-BONSAI', price: 1200.00, stock: 15, sortOrder: 2 },
    ],
  });

  // 9. Rose (Kathmandu Royal Crimson Rose Bouquet)
  const roseBouquet = await createBotanicalProduct({
    name: 'Kathmandu Royal Crimson Rose Bouquet',
    slug: 'kathmandu-royal-crimson-rose-bouquet',
    sku: 'BQT-ROS-009',
    shortDescription: 'Velvety long-stem Dutch roses paired with baby\'s breath and fresh eucalyptus foliage.',
    description: 'Hand-crafted by master florists in Sanepa. Wrapped in eco-friendly parchment paper with silk satin ribbons. Includes personalized handwritten gift card.',
    categoryId: catBouquets.id,
    basePrice: 1350.00,
    compareAtPrice: 1500.00,
    featured: true,
    careInstructions: 'Trim stems at 45 degree angle and replace cold water in vase every 2 days.',
    images: [
      { url: 'https://images.unsplash.com/photo-1561181286-d3fee7d55364?auto=format&fit=crop&w=800&q=80', isPrimary: true, sortOrder: 1 },
    ],
    attributes: [
      { name: 'Flower Type', value: 'Fresh Dutch Hybrid Roses' },
      { name: 'Occasion', value: 'Anniversary, Birthday, Romance, Apology' },
    ],
    variants: [
      { name: 'Classic 12 Fresh Stems Wrap', sku: 'BQT-ROS-009-12', price: 1350.00, stock: 25, sortOrder: 1 },
      { name: 'Deluxe 24 Stems Grand Romance', sku: 'BQT-ROS-009-24', price: 2550.00, stock: 15, sortOrder: 2 },
      { name: 'Luxury 50 Stems VIP Flower Box', sku: 'BQT-ROS-009-50', price: 4950.00, stock: 5, sortOrder: 3 },
    ],
  });

  // 10. Marigold (Nepali Sayapatri)
  const sayapatri = await createBotanicalProduct({
    name: 'Nepali Golden Sayapatri (Festive Marigold Pot)',
    slug: 'nepali-golden-sayapatri-marigold',
    sku: 'PLN-SAY-010',
    shortDescription: 'Heavy-blooming golden yellow & orange marigolds for festive Nepali balconies.',
    description: 'Grown locally in Kathmandu valley nurseries, these compact heavy-blooming Marigold pots produce dozens of dense, fragrant blossoms.',
    categoryId: catFlowering.id,
    basePrice: 200.00,
    compareAtPrice: 250.00,
    featured: true,
    seasonal: true,
    sunlightRequirement: SunlightRequirement.FULL_SUN,
    wateringRequirement: WateringRequirement.DAILY,
    difficultyLevel: DifficultyLevel.EASY,
    careInstructions: 'Provide 5-6 hours of direct sun daily. Deadhead spent flowers to stimulate continuous blooms.',
    images: [
      { url: 'https://images.unsplash.com/photo-1508615039623-a25605d2b022?auto=format&fit=crop&w=800&q=80', isPrimary: true, sortOrder: 1 },
    ],
    attributes: [
      { name: 'Scientific Name', value: 'Tagetes erecta' },
      { name: 'Festive Season', value: 'Dashain / Tihar / Autumn / Puja' },
    ],
    variants: [
      { name: 'Single Bloom 6" Clay Pot', sku: 'PLN-SAY-010-SGL', price: 200.00, stock: 60, sortOrder: 1 },
      { name: 'Pair Pack (2x 6" Golden & Orange Pots)', sku: 'PLN-SAY-010-PAIR', price: 380.00, stock: 30, sortOrder: 2 },
    ],
  });

  // 11. Bougainvillea (Paper Flower Vine)
  const bougainvillea = await createBotanicalProduct({
    name: 'Magenta Bougainvillea Climbing Vine',
    slug: 'magenta-bougainvillea-vine',
    sku: 'PLN-BOU-011',
    shortDescription: 'Explosion of vibrant magenta paper flowers. Drought-proof outdoor climber.',
    description: 'Hardy woody climber that cascades over Kathmandu balcony railings and boundary walls with continuous dazzling magenta floral bracts.',
    categoryId: catOutdoor.id,
    basePrice: 550.00,
    compareAtPrice: 700.00,
    sunlightRequirement: SunlightRequirement.FULL_SUN,
    wateringRequirement: WateringRequirement.WEEKLY_ONCE,
    difficultyLevel: DifficultyLevel.EASY,
    careInstructions: 'Loves blistering full sunshine and low water. Prune after each flush of flowering.',
    images: [
      { url: 'https://images.unsplash.com/photo-1585320806297-9794b3e4eeae?auto=format&fit=crop&w=800&q=80', isPrimary: true, sortOrder: 1 },
    ],
    attributes: [
      { name: 'Scientific Name', value: 'Bougainvillea spectabilis' },
      { name: 'Growth Form', value: 'Perennial Outdoor Climber' },
    ],
    variants: [
      { name: '8" Nursery Bag Plant', sku: 'PLN-BOU-011-8NP', price: 550.00, stock: 25, sortOrder: 1 },
      { name: '10" Terracotta Pot with Trellis', sku: 'PLN-BOU-011-10TER', price: 1100.00, stock: 12, sortOrder: 2 },
    ],
  });

  // 12. Orchid (Phalaenopsis Moth Orchid)
  const orchid = await createBotanicalProduct({
    name: 'Royal Purple Phalaenopsis Moth Orchid',
    slug: 'royal-purple-phalaenopsis-orchid',
    sku: 'PLN-ORC-012',
    shortDescription: 'Exquisite exotic blooms that last for 2-3 months on graceful arching spikes.',
    description: 'Epiphytic luxury orchid potted in pine bark and sphagnum moss. Perfect corporate gift and dining room centerpiece.',
    categoryId: catFlowering.id,
    basePrice: 1850.00,
    compareAtPrice: 2200.00,
    featured: true,
    sunlightRequirement: SunlightRequirement.BRIGHT_INDIRECT,
    wateringRequirement: WateringRequirement.WEEKLY_ONCE,
    difficultyLevel: DifficultyLevel.MODERATE,
    careInstructions: 'Water once a week by soaking roots for 10 minutes. Drain completely. Avoid standing water in crown.',
    images: [
      { url: 'https://images.unsplash.com/photo-1525310072745-f49212b5ac6d?auto=format&fit=crop&w=800&q=80', isPrimary: true, sortOrder: 1 },
    ],
    attributes: [
      { name: 'Scientific Name', value: 'Phalaenopsis amabilis' },
      { name: 'Bloom Duration', value: '8 to 12 Weeks' },
    ],
    variants: [
      { name: 'Single Spike in 5" Clear Pot', sku: 'PLN-ORC-012-SGL', price: 1850.00, stock: 15, sortOrder: 1 },
      { name: 'Double Spike in White Ceramic Cachepot', sku: 'PLN-ORC-012-DBL', price: 2850.00, stock: 8, sortOrder: 2 },
    ],
  });

  // 13. Cactus: Moon Cactus Graft
  const moonCactus = await createBotanicalProduct({
    name: 'Ruby Moon Cactus (Gymnocalycium Mihanovichii)',
    slug: 'ruby-moon-cactus',
    sku: 'CAC-MOO-013',
    shortDescription: 'Neon red and yellow grafted globe cactus atop green desert rootstock.',
    description: 'Bright vivid colored cactus that never needs watering more than once a month. Fun desk companion.',
    categoryId: catCactus.id,
    basePrice: 400.00,
    compareAtPrice: 500.00,
    sunlightRequirement: SunlightRequirement.BRIGHT_INDIRECT,
    wateringRequirement: WateringRequirement.MONTHLY,
    difficultyLevel: DifficultyLevel.EASY,
    careInstructions: 'Water once a month. Provide bright sunny windowsill spot.',
    images: [
      { url: 'https://images.unsplash.com/photo-1509223197845-458d87318791?auto=format&fit=crop&w=800&q=80', isPrimary: true, sortOrder: 1 },
    ],
    attributes: [{ name: 'Variety', value: 'Neon Ruby Graft' }],
    variants: [
      { name: '3.5" Mini Terracotta Pot', sku: 'CAC-MOO-013-MINI', price: 400.00, stock: 40, sortOrder: 1 },
      { name: 'Set of 3 Trio (Red, Yellow, Orange)', sku: 'CAC-MOO-013-TRIO', price: 1100.00, stock: 15, sortOrder: 2 },
    ],
  });

  // 14. Pots: Glazed Ceramic & Terracotta Set
  const ceramicPots = await createBotanicalProduct({
    name: 'Handmade Bhaktapur Terracotta Planter Duo',
    slug: 'bhaktapur-terracotta-planter-duo',
    sku: 'POT-BKT-014',
    shortDescription: 'Traditional breathable porous clay planters crafted by master potters of Bhaktapur.',
    description: 'Promotes healthy root aeration and prevents root rot. Includes drainage holes and matching drip saucers.',
    categoryId: catPots.id,
    basePrice: 550.00,
    compareAtPrice: 700.00,
    images: [
      { url: 'https://images.unsplash.com/photo-1485955900006-10f4d324d411?auto=format&fit=crop&w=800&q=80', isPrimary: true, sortOrder: 1 },
    ],
    attributes: [
      { name: 'Material', value: '100% Organic Clay' },
      { name: 'Origin', value: 'Pottery Square, Bhaktapur' },
    ],
    variants: [
      { name: '6" + 8" Dual Set with Saucers', sku: 'POT-BKT-014-SET', price: 550.00, stock: 35, sortOrder: 1 },
      { name: '10" Large Patio Planter Single', sku: 'POT-BKT-014-10IN', price: 650.00, stock: 20, sortOrder: 2 },
    ],
  });

  // 15. Seeds: Organic Nepali Kitchen Herb Seeds
  const herbSeeds = await createBotanicalProduct({
    name: 'Himalayan Organic Herb Seed Combo Pack (5 Varieties)',
    slug: 'himalayan-organic-herb-seeds-pack',
    sku: 'SED-HRB-015',
    shortDescription: 'High-germination seeds for Coriander, Basil, Mint, Rosemary & Chamomile.',
    description: '100% non-GMO heirloom seeds tested for high germination rates in Nepali soil conditions.',
    categoryId: catSeeds.id,
    basePrice: 350.00,
    compareAtPrice: 450.00,
    images: [
      { url: 'https://images.unsplash.com/photo-1523348837708-15d4a09cfac2?auto=format&fit=crop&w=800&q=80', isPrimary: true, sortOrder: 1 },
    ],
    attributes: [
      { name: 'Purity', value: '99% Organic Heirloom' },
      { name: 'Germination Rate', value: '88%+' },
    ],
    variants: [
      { name: '5-Seed Starter Pack', sku: 'SED-HRB-015-5PK', price: 350.00, stock: 50, sortOrder: 1 },
      { name: '10-Variety Master Kitchen Garden Kit', sku: 'SED-HRB-015-10KIT', price: 650.00, stock: 30, sortOrder: 2 },
    ],
  });

  // 16. Gardening Tools: Bypass Pruner
  const prunerTool = await createBotanicalProduct({
    name: 'Ergonomic Japanese Stainless Bypass Pruning Shears',
    slug: 'ergonomic-bypass-pruning-shears',
    sku: 'TOL-PRN-016',
    shortDescription: 'Razor-sharp carbon steel blade for clean stem pruning and bouquet arranging.',
    description: 'Precision pruning tool with shock-absorbing rubber grips, safety thumb lock, and rust-resistant blade.',
    categoryId: catTools.id,
    basePrice: 850.00,
    compareAtPrice: 1100.00,
    images: [
      { url: 'https://images.unsplash.com/photo-1617576683096-00fc8eecb3af?auto=format&fit=crop&w=800&q=80', isPrimary: true, sortOrder: 1 },
    ],
    attributes: [
      { name: 'Blade Material', value: 'SK-5 High Carbon Steel' },
      { name: 'Cutting Capacity', value: 'Up to 20mm Stems' },
    ],
    variants: [
      { name: '8" Standard Bypass Pruner', sku: 'TOL-PRN-016-STD', price: 850.00, stock: 30, sortOrder: 1 },
    ],
  });

  // 17. Soil & Fertilizers: Organic Vermicompost
  const vermicompost = await createBotanicalProduct({
    name: 'Pure Organic Himalayan Vermicompost (Black Gold Fertilizer)',
    slug: 'pure-organic-vermicompost-fertilizer',
    sku: 'FRT-VRM-017',
    shortDescription: '100% Earthworm castings enriched with bio-active micronutrients for root growth.',
    description: 'Odorless, weed-seed-free organic compost that enriches soil structure, retains moisture, and boosts floral blooming.',
    categoryId: catFertilizers.id,
    basePrice: 250.00,
    compareAtPrice: 300.00,
    images: [
      { url: 'https://images.unsplash.com/photo-1628352081506-83c43123ed6d?auto=format&fit=crop&w=800&q=80', isPrimary: true, sortOrder: 1 },
    ],
    attributes: [
      { name: 'Composition', value: '100% Natural Earthworm Castings' },
      { name: 'NPK Ratio', value: 'Balanced Organic Bio-NPK' },
    ],
    variants: [
      { name: '5 kg Heavy Bag', sku: 'FRT-VRM-017-5KG', price: 250.00, stock: 60, sortOrder: 1 },
      { name: '15 kg Garden Master Sack', sku: 'FRT-VRM-017-15KG', price: 650.00, stock: 30, sortOrder: 2 },
    ],
  });

  // 18. Gifts: Plant Parent Starter Kit
  const giftKit = await createBotanicalProduct({
    name: 'KtmBotanica Green Haven Starter Gift Box',
    slug: 'ktmbotanica-green-haven-starter-gift-box',
    sku: 'GFT-BOX-018',
    shortDescription: 'Curated gift set: Potted Jade plant, brass mist sprayer, organic fertilizer & handwritten card.',
    description: 'The ultimate housewarming, birthday or corporate appreciation gift packaged in a luxury botanical kraft box.',
    categoryId: catGifts.id,
    basePrice: 1950.00,
    compareAtPrice: 2400.00,
    featured: true,
    images: [
      { url: 'https://images.unsplash.com/photo-1513519245088-0e12902e5a38?auto=format&fit=crop&w=800&q=80', isPrimary: true, sortOrder: 1 },
    ],
    attributes: [
      { name: 'Box Contents', value: 'Jade Plant in Terracotta + Vintage Sprayer + Fertilizer + Card' },
    ],
    variants: [
      { name: 'Complete Deluxe Gift Hamper', sku: 'GFT-BOX-018-DLX', price: 1950.00, stock: 20, sortOrder: 1 },
    ],
  });

  console.log('✅ Created 18 Botanical Products with Multi-Variants and Live Inventory');

  // 6. Sample Marketing Coupons
  const coupon10 = await prisma.coupon.create({
    data: {
      code: 'BOTANICA10',
      description: '10% off on all live plants & flower bouquets across Kathmandu Valley',
      discountType: DiscountType.PERCENTAGE,
      discountValue: 10.00,
      minimumOrderAmount: 1000.00,
      maxDiscountAmount: 500.00,
      startDate: new Date(),
      expiryDate: new Date('2028-12-31'),
      usageLimit: 500,
      perUserLimit: 3,
      isActive: true,
    },
  });

  const couponWelcome = await prisma.coupon.create({
    data: {
      code: 'WELCOME100',
      description: 'Flat Rs. 100 discount for first-time plant parents',
      discountType: DiscountType.FIXED_AMOUNT,
      discountValue: 100.00,
      minimumOrderAmount: 500.00,
      startDate: new Date(),
      expiryDate: new Date('2028-12-31'),
      usageLimit: 1000,
      perUserLimit: 1,
      isActive: true,
    },
  });

  const couponMonsoon = await prisma.coupon.create({
    data: {
      code: 'MONSOON20',
      description: '20% off on monsoon garden soil, seeds, and outdoor flowering vines',
      discountType: DiscountType.PERCENTAGE,
      discountValue: 20.00,
      minimumOrderAmount: 2000.00,
      maxDiscountAmount: 800.00,
      startDate: new Date(),
      expiryDate: new Date('2028-12-31'),
      usageLimit: 200,
      perUserLimit: 1,
      isActive: true,
    },
  });

  console.log('✅ Created 3 Promotional Coupons (BOTANICA10, WELCOME100, MONSOON20)');

  // 7. Initial Inventory Transactions Log
  const allInventories = await prisma.inventory.findMany();
  for (const inv of allInventories) {
    await prisma.inventoryTransaction.create({
      data: {
        inventoryId: inv.id,
        variantId: inv.variantId,
        type: InventoryTransactionType.RESTOCK,
        quantity: inv.stockQuantity,
        previousStock: 0,
        newStock: inv.stockQuantity,
        referenceType: 'InitialSeeding',
        note: 'Initial seasonal nursery greenhouse stock intake',
        performedByUserId: admin.id,
      },
    });
  }

  // 8. Demo Completed Order with Full Snapshot & Delivery
  const vMonstera = monstera.variants[0];
  const order = await prisma.order.create({
    data: {
      orderNumber: 'KTM-2026-0001',
      userId: customer.id,
      status: OrderStatus.CONFIRMED,
      subtotal: 1050.00,
      discountAmount: 0.00,
      deliveryFee: 100.00,
      totalAmount: 1150.00,
      customerNotes: 'Please deliver before 3 PM. Call upon arrival at gate.',
      items: {
        create: [
          {
            productId: monstera.id,
            variantId: vMonstera.id,
            productName: monstera.name,
            variantName: vMonstera.name,
            sku: vMonstera.sku,
            unitPrice: 1050.00,
            quantity: 1,
            lineTotal: 1050.00,
          },
        ],
      },
      delivery: {
        create: {
          recipientName: 'Prashant Adhikari',
          recipientPhone: '+977-9801234999',
          deliveryAddress: 'House 42, Baluwatar near Russian Embassy',
          city: 'Kathmandu',
          area: 'Baluwatar',
          deliveryCharge: 100.00,
          status: DeliveryStatus.PENDING,
          zoneId: zoneKtm.id,
        },
      },
      bill: {
        create: {
          billNumber: 'INV-2026-0001',
          subtotal: 1050.00,
          discountAmount: 0.00,
          deliveryCharge: 100.00,
          grandTotal: 1150.00,
          status: BillStatus.UNPAID,
        },
      },
      payments: {
        create: [
          {
            paymentMethod: PaymentMethod.CASH,
            paymentStatus: PaymentStatus.PENDING,
            amount: 1150.00,
          },
        ],
      },
    },
  });

  // 9. Demo Customer Reviews
  await prisma.productReview.create({
    data: {
      productId: monstera.id,
      userId: customer.id,
      rating: 5,
      title: 'Healthy and thriving in Kathmandu weather!',
      comment: 'Arrived in Baluwatar in perfect packaging with moist soil. A new fenestrated leaf is already unfurling. Highly recommended!',
      isVerifiedBuyer: true,
      isApproved: true,
    },
  });

  await prisma.productReview.create({
    data: {
      productId: snakePlant.id,
      userId: customer.id,
      rating: 5,
      title: 'Perfect air purifier for bedroom desk',
      comment: 'Lush golden edges and very low maintenance. Exactly as shown in the photos.',
      isVerifiedBuyer: true,
      isApproved: true,
    },
  });

  // 10. Audit Log
  await prisma.auditLog.create({
    data: {
      userId: admin.id,
      action: 'SYSTEM_SEED',
      resource: 'Database',
      details: { 
        message: 'Normalized Nursery database initialized with 11 categories, 18 products, delivery zones, and coupons.',
        timestamp: new Date().toISOString(),
      },
    },
  });

  console.log('========================================================');
  console.log('🌿 KtmBotanica Realistic Nursery Seeding Completed!');
  console.log('========================================================');
  console.log('🔑 Development-Only Credentials:');
  console.log('   Admin:    admin@ktmbotanica.com    / Admin@12345');
  console.log('   Staff:    staff@ktmbotanica.com    / Staff@12345');
  console.log('   Customer: customer@ktmbotanica.com / Customer@12345');
  console.log('🎟️ Sample Coupons:');
  console.log('   BOTANICA10 (10% off, min Rs. 1000)');
  console.log('   WELCOME100 (Flat Rs. 100 off, min Rs. 500)');
  console.log('   MONSOON20  (20% off, min Rs. 2000)');
  console.log('========================================================');
}

main()
  .catch((e) => {
    console.error('❌ Seed error:', e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
