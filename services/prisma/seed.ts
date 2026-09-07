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
  console.log('🌱 Starting KtmBotanica normalized database seed...');

  // 1. Safe cleanup
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

  // 2. Users & Staff
  const adminPassword = await bcrypt.hash('Admin@12345', 10);
  const staffPassword = await bcrypt.hash('Staff@12345', 10);
  const customerPassword = await bcrypt.hash('Customer@12345', 10);

  const admin = await prisma.user.create({
    data: {
      email: 'admin@ktmbotanica.com',
      passwordHash: adminPassword,
      name: 'Sujan Shrestha',
      phoneNumber: '+977-9841234567',
      role: UserRole.ADMIN,
    },
  });

  const staff = await prisma.user.create({
    data: {
      email: 'staff@ktmbotanica.com',
      passwordHash: staffPassword,
      name: 'Dr. Aarav Joshi',
      phoneNumber: '+977-9851098765',
      role: UserRole.STAFF,
      staffProfile: {
        create: {
          designation: 'Head Botanist & Florist',
          department: 'Plant Care & Studio',
          shift: 'Full-time',
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
        ],
      },
    },
  });

  console.log('✅ Created Admin, Staff, and Customer users');

  // 3. Delivery Zones
  const zoneKtm = await prisma.deliveryZone.create({
    data: {
      name: 'Kathmandu Ring Road Core',
      code: 'KTM_RING',
      baseDeliveryCharge: 100.00,
      estimatedHours: 4,
    },
  });

  const zoneLalitpur = await prisma.deliveryZone.create({
    data: {
      name: 'Lalitpur City (Sanepa, Jhamsikhel, Patan)',
      code: 'LLP_CORE',
      baseDeliveryCharge: 100.00,
      estimatedHours: 4,
    },
  });

  const zoneBhaktapur = await prisma.deliveryZone.create({
    data: {
      name: 'Bhaktapur & Suburbs',
      code: 'BKT_SUB',
      baseDeliveryCharge: 150.00,
      estimatedHours: 8,
    },
  });

  // 4. Categories
  const catIndoor = await prisma.category.create({
    data: {
      name: 'Indoor Plants',
      slug: 'indoor-plants',
      description: 'Air-purifying, low-light, and aesthetic indoor foliage for apartments and living spaces.',
      imageUrl: 'https://images.unsplash.com/photo-1545241047-6083a3684587?auto=format&fit=crop&w=800&q=80',
      displayOrder: 1,
    },
  });

  const catFlowering = await prisma.category.create({
    data: {
      name: 'Flowering Plants',
      slug: 'flowering-plants',
      description: 'Vibrant blooming perennial and seasonal flowering varieties that brighten any space.',
      imageUrl: 'https://images.unsplash.com/photo-1508615039623-a25605d2b022?auto=format&fit=crop&w=800&q=80',
      displayOrder: 2,
    },
  });

  const catBouquets = await prisma.category.create({
    data: {
      name: 'Flower Bouquets & Gifts',
      slug: 'flower-bouquets',
      description: 'Hand-tied fresh cut flower arrangements, celebration roses, and gift-ready botanical baskets.',
      imageUrl: 'https://images.unsplash.com/photo-1561181286-d3fee7d55364?auto=format&fit=crop&w=800&q=80',
      displayOrder: 3,
    },
  });

  const catPots = await prisma.category.create({
    data: {
      name: 'Pots & Planters',
      slug: 'pots-planters',
      description: 'Handcrafted terracotta, ceramic glazed pots, and lightweight eco-fiber containers.',
      imageUrl: 'https://images.unsplash.com/photo-1485955900006-10f4d324d411?auto=format&fit=crop&w=800&q=80',
      displayOrder: 4,
    },
  });

  const catCare = await prisma.category.create({
    data: {
      name: 'Soil & Plant Nutrition',
      slug: 'soil-fertilizers',
      description: 'Organic vermicompost, perlite potting mixes, neem oil spray, and growth boosters.',
      imageUrl: 'https://images.unsplash.com/photo-1628352081506-83c43123ed6d?auto=format&fit=crop&w=800&q=80',
      displayOrder: 5,
    },
  });

  // 5. Products with relational Variants, Inventory, and Images
  
  // Product 1: Monstera Deliciosa
  const p1 = await prisma.product.create({
    data: {
      name: 'Swiss Cheese Monstera (Monstera Deliciosa)',
      slug: 'swiss-cheese-monstera-deliciosa',
      sku: 'PLN-MON-001',
      shortDescription: 'Iconic split leaves. The ultimate statement indoor plant for modern living spaces.',
      description: 'The Monstera Deliciosa is revered for its natural leaf fenestrations and lush tropical aesthetic. It adapts remarkably well to indoor humidity in Kathmandu.',
      categoryId: catIndoor.id,
      basePrice: 1050.00,
      compareAtPrice: 1200.00,
      costPrice: 500.00,
      available: true,
      featured: true,
      published: true,
      seasonal: false,
      lowStockThreshold: 5,
      sunlightRequirement: SunlightRequirement.BRIGHT_INDIRECT,
      wateringRequirement: WateringRequirement.WEEKLY_ONCE,
      difficultyLevel: DifficultyLevel.EASY,
      dimensions: '20x20x50 cm',
      weight: 2.50,
      careInstructions: 'Water once top 2 inches dry. Keep in bright indirect light. Wipe leaves with neem oil periodically.',
      images: {
        create: [
          { url: 'https://images.unsplash.com/photo-1614594975525-e45190c55d0b?auto=format&fit=crop&w=800&q=80', isPrimary: true, sortOrder: 1 },
          { url: 'https://images.unsplash.com/photo-1545241047-6083a3684587?auto=format&fit=crop&w=800&q=80', isPrimary: false, sortOrder: 2 },
        ],
      },
      attributes: {
        create: [
          { name: 'Scientific Name', value: 'Monstera deliciosa' },
          { name: 'Air Purifying', value: 'Yes (NASA Clean Air)' },
          { name: 'Pet Friendly', value: 'No (Keep away from pets)' },
        ],
      },
      variants: {
        create: [
          {
            name: 'Small (5" Nursery Pot)',
            sku: 'PLN-MON-001-SM',
            price: 1050.00,
            stock: 25,
            weight: 1.5,
            sortOrder: 1,
            inventory: {
              create: {
                stockQuantity: 25,
                reservedQuantity: 0,
                availableQuantity: 25,
              },
            },
          },
          {
            name: 'Medium (7" White Ceramic Glazed Planter)',
            sku: 'PLN-MON-001-MED-CER',
            price: 1700.00,
            stock: 12,
            weight: 3.5,
            sortOrder: 2,
            inventory: {
              create: {
                stockQuantity: 12,
                reservedQuantity: 0,
                availableQuantity: 12,
              },
            },
          },
        ],
      },
    },
  });

  // Product 2: Sayapatri Marigold
  const p2 = await prisma.product.create({
    data: {
      name: 'Nepali Sayapatri (Golden Festive Marigold)',
      slug: 'nepali-sayapatri-marigold',
      sku: 'PLN-SAY-002',
      shortDescription: 'Vibrant golden-orange blooms essential for festive Nepali decor and rooftop gardens.',
      description: 'Grown locally in Kathmandu valley nurseries, these compact heavy-blooming Marigold pots produce dozens of dense, aromatic blossoms.',
      categoryId: catFlowering.id,
      basePrice: 200.00,
      compareAtPrice: 250.00,
      costPrice: 80.00,
      available: true,
      featured: true,
      published: true,
      seasonal: true,
      lowStockThreshold: 10,
      sunlightRequirement: SunlightRequirement.FULL_SUN,
      wateringRequirement: WateringRequirement.DAILY,
      difficultyLevel: DifficultyLevel.EASY,
      dimensions: '15x15x30 cm',
      weight: 1.20,
      careInstructions: 'Provide 5-6 hours of direct sun daily. Deadhead spent flowers to stimulate continuous blooms.',
      images: {
        create: [
          { url: 'https://images.unsplash.com/photo-1508615039623-a25605d2b022?auto=format&fit=crop&w=800&q=80', isPrimary: true, sortOrder: 1 },
        ],
      },
      attributes: {
        create: [
          { name: 'Scientific Name', value: 'Tagetes erecta' },
          { name: 'Festive Season', value: 'Dashain / Tihar / Autumn' },
        ],
      },
      variants: {
        create: [
          {
            name: 'Single Bloom 6" Earthen Pot',
            sku: 'PLN-SAY-002-SGL',
            price: 200.00,
            stock: 50,
            weight: 1.2,
            sortOrder: 1,
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

  // Product 3: Red Rose Bouquet
  const p3 = await prisma.product.create({
    data: {
      name: 'Kathmandu Royal Crimson Rose Bouquet',
      slug: 'kathmandu-royal-crimson-rose-bouquet',
      sku: 'BQT-ROS-003',
      shortDescription: 'Velvety long-stem Dutch roses paired with baby\'s breath and fresh eucalyptus foliage.',
      description: 'Hand-crafted by master florists in Sanepa. Wrapped in eco-friendly parchment paper and silk ribbons. Includes handwritten greeting card.',
      categoryId: catBouquets.id,
      basePrice: 1350.00,
      compareAtPrice: 1500.00,
      costPrice: 600.00,
      available: true,
      featured: true,
      published: true,
      seasonal: false,
      lowStockThreshold: 5,
      weight: 0.80,
      careInstructions: 'Trim stems at 45 degree angle and replace cold water every 2 days.',
      images: {
        create: [
          { url: 'https://images.unsplash.com/photo-1561181286-d3fee7d55364?auto=format&fit=crop&w=800&q=80', isPrimary: true, sortOrder: 1 },
        ],
      },
      variants: {
        create: [
          {
            name: 'Classic 12 Fresh Stems',
            sku: 'BQT-ROS-003-12',
            price: 1350.00,
            stock: 30,
            weight: 0.8,
            sortOrder: 1,
            inventory: {
              create: {
                stockQuantity: 30,
                reservedQuantity: 0,
                availableQuantity: 30,
              },
            },
          },
          {
            name: 'Deluxe 24 Stems Grand Romance',
            sku: 'BQT-ROS-003-24',
            price: 2550.00,
            stock: 15,
            weight: 1.5,
            sortOrder: 2,
            inventory: {
              create: {
                stockQuantity: 15,
                reservedQuantity: 0,
                availableQuantity: 15,
              },
            },
          },
        ],
      },
    },
  });

  // 6. Marketing Coupon
  const coupon = await prisma.coupon.create({
    data: {
      code: 'BOTANICA10',
      description: '10% off on all live plants & flower bouquets',
      discountType: DiscountType.PERCENTAGE,
      discountValue: 10.00,
      minimumOrderAmount: 1000.00,
      maxDiscountAmount: 500.00,
      expiryDate: new Date('2027-12-31'),
      usageLimit: 500,
      isActive: true,
    },
  });

  // 7. Initial Inventory Transactions
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
        note: 'Initial seasonal nursery stock intake',
        performedByUserId: admin.id,
      },
    });
  }

  // 8. Demo Order with Snapshot & Delivery
  const v1 = await prisma.productVariant.findFirst({ where: { productId: p1.id } });
  if (v1) {
    const order = await prisma.order.create({
      data: {
        orderNumber: 'KTM-2026-0001',
        userId: customer.id,
        status: OrderStatus.CONFIRMED,
        subtotal: 1050.00,
        deliveryFee: 100.00,
        totalAmount: 1150.00,
        items: {
          create: [
            {
              productId: p1.id,
              variantId: v1.id,
              productName: p1.name,
              variantName: v1.name,
              sku: v1.sku,
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
            deliveryCharge: 100.00,
            status: DeliveryStatus.PENDING,
            zoneId: zoneKtm.id,
          },
        },
        bill: {
          create: {
            billNumber: 'INV-2026-0001',
            subtotal: 1050.00,
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
  }

  // 9. Demo Review (Prevent duplicate: unique productId + userId)
  await prisma.productReview.create({
    data: {
      productId: p1.id,
      userId: customer.id,
      rating: 5,
      title: 'Healthy and thriving in Kathmandu weather!',
      comment: 'Arrived in Baluwatar in perfect packaging with moist soil. A new fenestrated leaf is already opening.',
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
      details: { message: 'Normalized Nursery database initialized with catalog, inventory, and delivery zones.' },
    },
  });

  console.log('🌿 Normalized database seed completed successfully!');
}

main()
  .catch((e) => {
    console.error('❌ Seed error:', e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
