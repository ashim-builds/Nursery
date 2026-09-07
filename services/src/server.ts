import express, { Request, Response } from 'express';
import cors from 'cors';
import helmet from 'helmet';
import morgan from 'morgan';
import rateLimit from 'express-rate-limit';
import { ENV } from './config/env.js';
import { connectDB, prisma } from './config/database.js';
import { errorHandler } from './middlewares/error.middleware.js';

// Route Imports
import { authRoutes } from './modules/auth/auth.routes.js';
import { productRoutes } from './modules/products/product.routes.js';
import { categoryRoutes } from './modules/categories/category.routes.js';
import { inventoryRoutes } from './modules/inventory/inventory.routes.js';
import { cartRoutes } from './modules/cart/cart.routes.js';
import { wishlistRoutes } from './modules/wishlist/wishlist.routes.js';
import { orderRoutes } from './modules/orders/order.routes.js';
import { paymentRoutes } from './modules/payments/payment.routes.js';
import { deliveryRoutes } from './modules/delivery/delivery.routes.js';
import { careRoutes } from './modules/care-guides/care.routes.js';
import { reviewRoutes } from './modules/reviews/review.routes.js';
import { adminRoutes } from './modules/admin/admin.routes.js';
import { uploadRoutes } from './modules/upload/upload.routes.js';
import { notificationRoutes } from './modules/notifications/notification.routes.js';

const app = express();

// Trust reverse proxy (Nginx) for accurate client IP in rate limiting & logs
app.set('trust proxy', 1);

// 1. Security Middlewares: Helmet with CSP and strict headers
app.use(
  helmet({
    contentSecurityPolicy: {
      directives: {
        defaultSrc: ["'self'"],
        imgSrc: ["'self'", 'data:', 'blob:', 'https://res.cloudinary.com', 'https://images.unsplash.com'],
        scriptSrc: ["'self'", "'unsafe-inline'"],
        styleSrc: ["'self'", "'unsafe-inline'", 'https://fonts.googleapis.com'],
        fontSrc: ["'self'", 'https://fonts.gstatic.com'],
        connectSrc: ["'self'", ENV.FRONTEND_URL || 'http://localhost:5173', 'https://api.cloudinary.com'],
      },
    },
    crossOriginResourcePolicy: { policy: 'cross-origin' },
    frameguard: { action: 'deny' }, // Anti-clickjacking
    referrerPolicy: { policy: 'strict-origin-when-cross-origin' },
  })
);

// 2. CORS Configuration (Strict Allowed Origins)
const allowedOrigins = [
  ENV.FRONTEND_URL,
  'http://localhost:5173',
  'http://localhost:3000',
  'http://localhost',
  'https://ktmbotanica.com',
].filter(Boolean) as string[];

app.use(
  cors({
    origin: (origin, callback) => {
      if (!origin || allowedOrigins.some(o => origin.startsWith(o))) {
        callback(null, true);
      } else {
        callback(new Error('Blocked by CORS security policy'));
      }
    },
    credentials: true,
    methods: ['GET', 'POST', 'PUT', 'PATCH', 'DELETE', 'OPTIONS'],
    allowedHeaders: ['Content-Type', 'Authorization', 'x-session-id'],
  })
);

// Request Logging
app.use(morgan(ENV.NODE_ENV === 'development' ? 'dev' : 'combined'));

// 3. Request Body Size Limits (Protection against memory payload exhaustion)
app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true, limit: '10mb' }));

// 4. Rate Limiting Strategies
// General API Limiter (300 requests per 15 minutes)
const globalLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: 300,
  standardHeaders: true,
  legacyHeaders: false,
  message: {
    success: false,
    message: 'Too many requests from this IP, please try again after 15 minutes.',
    errors: [],
  },
});
app.use('/api', globalLimiter);

// Strict Auth Rate Limiter (15 attempts per 15 minutes to prevent brute-force attacks)
const authLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: 15,
  standardHeaders: true,
  legacyHeaders: false,
  message: {
    success: false,
    message: 'Too many authentication attempts, please try again after 15 minutes.',
    errors: [],
  },
});
app.use(['/api/auth/login', '/api/auth/register', '/api/admin/login', '/api/v1/auth/login'], authLimiter);

// Checkout & Order Creation Limiter (30 orders per 15 minutes)
const checkoutLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: 30,
  standardHeaders: true,
  legacyHeaders: false,
  message: {
    success: false,
    message: 'Too many checkout requests, please wait a moment.',
    errors: [],
  },
});
app.use(['/api/orders', '/api/v1/orders'], checkoutLimiter);

// Health Endpoint
app.get('/api/health', (req: Request, res: Response) => {
  res.status(200).json({
    success: true,
    message: 'Nursery API is running',
  });
});

// Dynamic Robots.txt Handler
app.get(['/robots.txt', '/api/robots.txt'], (req: Request, res: Response) => {
  const robots = `# KtmBotanica Robots.txt
User-agent: *
Allow: /
Allow: /product/
Allow: /products/
Allow: /category/
Allow: /categories/
Allow: /catalog
Allow: /plant-doctor/
Allow: /search
Disallow: /admin/
Disallow: /checkout
Disallow: /cart
Disallow: /orders/
Disallow: /wishlist
Disallow: /profile
Disallow: /api/

Sitemap: https://ktmbotanica.com/sitemap.xml
`;
  res.header('Content-Type', 'text/plain');
  res.send(robots);
});

// Dynamic Sitemap.xml Handler
app.get(['/sitemap.xml', '/api/sitemap.xml'], async (req: Request, res: Response) => {
  try {
    const [products, categories] = await Promise.all([
      prisma.product.findMany({
        where: { published: true, available: true },
        select: { slug: true, updatedAt: true },
      }),
      prisma.category.findMany({
        where: { isActive: true },
        select: { slug: true, updatedAt: true },
      }),
    ]);

    const baseUrl = process.env.FRONTEND_URL || 'https://ktmbotanica.com';

    let xml = `<?xml version="1.0" encoding="UTF-8"?>\n`;
    xml += `<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">\n`;

    // Static Pages
    const staticPages = [
      { loc: `${baseUrl}/`, priority: '1.0', changefreq: 'daily' },
      { loc: `${baseUrl}/catalog`, priority: '0.9', changefreq: 'daily' },
      { loc: `${baseUrl}/categories`, priority: '0.8', changefreq: 'weekly' },
      { loc: `${baseUrl}/plant-doctor`, priority: '0.8', changefreq: 'weekly' },
      { loc: `${baseUrl}/search`, priority: '0.7', changefreq: 'weekly' },
      { loc: `${baseUrl}/contact`, priority: '0.5', changefreq: 'monthly' },
      { loc: `${baseUrl}/privacy`, priority: '0.3', changefreq: 'yearly' },
      { loc: `${baseUrl}/terms`, priority: '0.3', changefreq: 'yearly' },
    ];

    staticPages.forEach((p) => {
      xml += `  <url>\n    <loc>${p.loc}</loc>\n    <changefreq>${p.changefreq}</changefreq>\n    <priority>${p.priority}</priority>\n  </url>\n`;
    });

    // Categories
    categories.forEach((c) => {
      xml += `  <url>\n    <loc>${baseUrl}/category/${c.slug}</loc>\n    <lastmod>${c.updatedAt.toISOString().split('T')[0]}</lastmod>\n    <changefreq>weekly</changefreq>\n    <priority>0.85</priority>\n  </url>\n`;
    });

    // Products
    products.forEach((p) => {
      xml += `  <url>\n    <loc>${baseUrl}/product/${p.slug}</loc>\n    <lastmod>${p.updatedAt.toISOString().split('T')[0]}</lastmod>\n    <changefreq>daily</changefreq>\n    <priority>0.8</priority>\n  </url>\n`;
    });

    xml += `</urlset>`;

    res.header('Content-Type', 'application/xml');
    res.send(xml);
  } catch (err) {
    res.status(500).send('Error generating sitemap');
  }
});

// Direct `/api/...` Routes
app.use('/api/auth', authRoutes);
app.use('/api/products', productRoutes);
app.use('/api/categories', categoryRoutes);
app.use('/api/cart', cartRoutes);
app.use('/api/wishlist', wishlistRoutes);
app.use('/api/admin', adminRoutes);
app.use('/api/orders', orderRoutes);
app.use('/api/payments', paymentRoutes);
app.use('/api/delivery-zones', deliveryRoutes);
app.use('/api/admin/delivery-zones', deliveryRoutes);
app.use('/api/inventory', inventoryRoutes);
app.use('/api/care-guides', careRoutes);
app.use('/api/reviews', reviewRoutes);
app.use('/api/upload', uploadRoutes);
app.use('/api/notifications', notificationRoutes);

// Versioned `/api/v1/...` Routes
app.use('/api/v1/auth', authRoutes);
app.use('/api/v1/products', productRoutes);
app.use('/api/v1/categories', categoryRoutes);
app.use('/api/v1/cart', cartRoutes);
app.use('/api/v1/wishlist', wishlistRoutes);
app.use('/api/v1/admin', adminRoutes);
app.use('/api/v1/orders', orderRoutes);
app.use('/api/v1/payments', paymentRoutes);
app.use('/api/v1/delivery-zones', deliveryRoutes);
app.use('/api/v1/admin/delivery-zones', deliveryRoutes);
app.use('/api/v1/inventory', inventoryRoutes);
app.use('/api/v1/care-guides', careRoutes);
app.use('/api/v1/reviews', reviewRoutes);
app.use('/api/v1/upload', uploadRoutes);
app.use('/api/v1/notifications', notificationRoutes);

// 404 API Handler for unmatched routes
app.use((req: Request, res: Response) => {
  res.status(404).json({
    success: false,
    message: `API endpoint not found: ${req.method} ${req.originalUrl}`,
    errors: [],
  });
});

// Centralized Express Error Handler
app.use(errorHandler);

// Server startup & Graceful Shutdown
let server: any;

async function startServer() {
  await connectDB();
  server = app.listen(ENV.PORT, () => {
    console.log(`🌿 Nursery API is flourishing on port ${ENV.PORT}`);
    console.log(`🚀 Health Check: http://localhost:${ENV.PORT}/api/health`);
    console.log(`🚀 Products API: http://localhost:${ENV.PORT}/api/products`);
    console.log(`🚀 Categories API: http://localhost:${ENV.PORT}/api/categories`);
  });
}

// Graceful Shutdown
const handleGracefulShutdown = async (signal: string) => {
  console.log(`\n🛑 Received ${signal}. Starting graceful shutdown...`);
  if (server) {
    server.close(async () => {
      console.log('🔒 Closed HTTP server connections.');
      try {
        await prisma.$disconnect();
        console.log('📦 Disconnected Prisma / MySQL connection.');
      } catch (err) {
        console.error('Error disconnecting database:', err);
      }
      process.exit(0);
    });
  } else {
    process.exit(0);
  }
};

process.on('SIGTERM', () => handleGracefulShutdown('SIGTERM'));
process.on('SIGINT', () => handleGracefulShutdown('SIGINT'));

startServer();

export default app;
