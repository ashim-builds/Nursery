import { PrismaClient, UserRole } from '@prisma/client';
import bcrypt from 'bcryptjs';

const prisma = new PrismaClient();

async function main() {
  console.log('🌱 Clearing database for completely clean start...');

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

  console.log('✅ Cleared all previous products, orders, reviews, and test accounts');

  // 2. Create Single Admin User (Password: admin123)
  const adminPassword = await bcrypt.hash('admin123', 10);

  const admin = await prisma.user.create({
    data: {
      email: 'admin@ktmbotanica.com',
      passwordHash: adminPassword,
      name: 'Nursery Admin',
      phoneNumber: '9841234567',
      role: UserRole.ADMIN,
    },
  });

  console.log('✅ Created Admin user (password: admin123)');

  // 3. Create Delivery Zones
  await prisma.deliveryZone.createMany({
    data: [
      {
        name: 'Kathmandu Ring Road Core',
        code: 'KTM_RING',
        description: 'Standard inside Ring Road delivery',
        baseDeliveryCharge: 100.0,
        minimumOrder: 300.0,
        estimatedHours: 4,
        estimatedDeliveryTime: 'Same Day (2-4 Hours)',
        isActive: true,
      },
      {
        name: 'Lalitpur Core (Sanepa, Jhamsikhel, Patan)',
        code: 'LLP_CORE',
        description: 'Lalitpur metropolitan delivery',
        baseDeliveryCharge: 100.0,
        minimumOrder: 300.0,
        estimatedHours: 4,
        estimatedDeliveryTime: 'Same Day (2-4 Hours)',
        isActive: true,
      },
      {
        name: 'Bhaktapur & Valley Suburbs',
        code: 'BKT_SUB',
        description: 'Bhaktapur valley delivery',
        baseDeliveryCharge: 150.0,
        minimumOrder: 500.0,
        estimatedHours: 8,
        estimatedDeliveryTime: 'Next Day Delivery',
        isActive: true,
      },
      {
        name: 'Major Cities Express (Pokhara, Chitwan)',
        code: 'VALLEY_OUT',
        description: 'Inter-city express delivery',
        baseDeliveryCharge: 250.0,
        minimumOrder: 1000.0,
        estimatedHours: 48,
        estimatedDeliveryTime: '1-2 Days Courier',
        isActive: true,
      },
    ],
  });

  console.log('✅ Created 4 Delivery Zones');

  // 4. Create Core Product Categories
  await prisma.category.createMany({
    data: [
      { name: 'Indoor Plants', slug: 'indoor-plants', displayOrder: 1 },
      { name: 'Outdoor Plants', slug: 'outdoor-plants', displayOrder: 2 },
      { name: 'Flowering Plants', slug: 'flowering-plants', displayOrder: 3 },
      { name: 'Succulents', slug: 'succulents', displayOrder: 4 },
      { name: 'Cactus', slug: 'cactus', displayOrder: 5 },
      { name: 'Flower Bouquets', slug: 'flower-bouquets', displayOrder: 6 },
      { name: 'Pots & Planters', slug: 'pots-planters', displayOrder: 7 },
      { name: 'Seeds', slug: 'seeds', displayOrder: 8 },
      { name: 'Gardening Products', slug: 'gardening', displayOrder: 9 },
      { name: 'Plant Gifts', slug: 'gifts', displayOrder: 10 },
    ],
  });

  console.log('✅ Created Product Categories');

  // 5. Seed 8 Automatic Featured Nursery Plants
  const indoorCategory = await prisma.category.findUnique({ where: { slug: 'indoor-plants' } });
  const catId = indoorCategory?.id || (await prisma.category.findFirst())?.id!;

  const initialProducts = [
    {
      name: 'Monstera Deliciosa (Swiss Cheese Plant)',
      slug: 'monstera-deliciosa',
      sku: 'NUR-MON-01',
      basePrice: 1200,
      shortDescription: 'Lush tropical indoor foliage with iconic split leaves.',
    },
    {
      name: 'Fiddle Leaf Fig (Ficus Lyrata)',
      slug: 'fiddle-leaf-fig',
      sku: 'NUR-FID-02',
      basePrice: 1800,
      shortDescription: 'Stately violin-shaped green foliage for bright living rooms.',
    },
    {
      name: 'Golden Money Plant (Epipremnum)',
      slug: 'golden-money-plant',
      sku: 'NUR-POT-03',
      basePrice: 450,
      shortDescription: 'Hardy trailing plant that brings lush green vibrancy.',
    },
    {
      name: 'Snake Plant (Sansevieria Trifasciata)',
      slug: 'snake-plant-sansevieria',
      sku: 'NUR-SNK-04',
      basePrice: 750,
      shortDescription: 'Top-rated NASA air purifier that thrives on neglect.',
    },
    {
      name: 'Peace Lily (Spathiphyllum)',
      slug: 'peace-lily-plant',
      sku: 'NUR-LIL-05',
      basePrice: 850,
      shortDescription: 'Deep emerald leaves with elegant white blooms.',
    },
    {
      name: 'Areca Palm (Chrysalidocarpus)',
      slug: 'areca-palm',
      sku: 'NUR-PLM-06',
      basePrice: 1100,
      shortDescription: 'Feathery tropical fronds that naturally humidify room air.',
    },
    {
      name: 'Rubber Plant (Ficus Elastica Burgundy)',
      slug: 'rubber-plant-burgundy',
      sku: 'NUR-RUB-07',
      basePrice: 950,
      shortDescription: 'Glossy dark burgundy foliage with bold modern presence.',
    },
    {
      name: 'Flowering Rose Plant (Red Bloom)',
      slug: 'flowering-rose-plant',
      sku: 'NUR-ROS-08',
      basePrice: 650,
      shortDescription: 'Fragrant perennial blooming roses for balconies and gardens.',
    },
  ];

  // Products are created only through the admin upload workflow.
  for (const item of initialProducts.slice(0, 0)) {
    await prisma.product.create({
      data: {
        name: item.name,
        slug: item.slug,
        sku: item.sku,
        shortDescription: item.shortDescription,
        description: `${item.name} - Acclimatized nursery plant delivered safely across Kathmandu Valley.`,
        categoryId: catId,
        basePrice: item.basePrice,
        available: true,
        featured: true,
        published: true,
        variants: {
          create: [
            {
              name: 'Standard Grower Pot',
              sku: `${item.sku}-STD`,
              price: item.basePrice,
              stock: 50,
              isAvailable: true,
              inventory: {
                create: {
                  stockQuantity: 50,
                  reservedQuantity: 0,
                  availableQuantity: 50,
                },
              },
            },
          ],
        },
      },
    });
  }

  console.log('✅ Skipped automatic product seed; add plants from the admin panel');

  // 6. Initial Audit Log
  await prisma.auditLog.create({
    data: {
      userId: admin.id,
      action: 'DATABASE_INITIALIZED',
      resource: 'Database',
      details: {
        message: 'Fresh database initialized without automatic products or images.',
        timestamp: new Date().toISOString(),
      },
    },
  });

  console.log('========================================================');
  console.log('🌿 Database reset complete! Clean slate ready.');
  console.log('🔑 Admin Password: admin123');
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
