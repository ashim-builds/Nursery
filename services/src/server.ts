import path from 'path';
import http from 'http';
import express, { Request, Response } from 'express';
import cors from 'cors';
import helmet from 'helmet';
import morgan from 'morgan';
import compression from 'compression';
import rateLimit from 'express-rate-limit';
import { ENV } from './config/env.js';
import { connectDB, prisma } from './config/database.js';
import { errorHandler } from './middlewares/error.middleware.js';
import { appCache } from './utils/cache.js';
import { initSocketIO } from './utils/socket.js';

import { authRoutes } from './modules/auth/auth.routes.js';
import { productRoutes } from './modules/products/product.routes.js';
import { inventoryRoutes } from './modules/inventory/inventory.routes.js';
import { cartRoutes } from './modules/cart/cart.routes.js';
import { orderRoutes } from './modules/orders/order.routes.js';
import { deliveryRoutes } from './modules/delivery/delivery.routes.js';
import { adminRoutes } from './modules/admin/admin.routes.js';
import { uploadRoutes } from './modules/upload/upload.routes.js';
import { notificationRoutes } from './modules/notifications/notification.routes.js';
import { siteSettingsRoutes } from './modules/site-settings/site-settings.routes.js';

const app = express();

// Trust reverse proxy (Nginx / cPanel Apache) for accurate client IP in rate limiting & logs
app.set('trust proxy', 1);

// High-Efficiency Gzip/Deflate Response Compression
app.use((compression as any)({ threshold: 1024 }));

// Dedicated Static Image Serving (High-Performance Caching with Cross-Origin Resource Sharing)
app.use(
  '/uploads',
  express.static(path.resolve(process.cwd(), 'uploads'), {
    maxAge: '365d',
    immutable: true,
    setHeaders: (res) => {
      res.setHeader('X-Content-Type-Options', 'nosniff');
      res.setHeader('Access-Control-Allow-Origin', '*');
      res.setHeader('Cross-Origin-Resource-Policy', 'cross-origin');
    },
  })
);

// Cache-Busting Headers for Dynamic API Routes
app.use('/api', (_req, res, next) => {
  res.setHeader('Cache-Control', 'no-cache, no-store, must-revalidate');
  res.setHeader('Pragma', 'no-cache');
  res.setHeader('Expires', '0');
  next();
});

// 1. Security Middlewares: Helmet with CSP and strict headers
app.use(
  helmet({
    contentSecurityPolicy: {
      directives: {
        defaultSrc: ["'self'"],
        imgSrc: ["'self'", 'data:', 'blob:', 'https://images.unsplash.com', 'https://*.tile.openstreetmap.org', 'https://unpkg.com'],
        scriptSrc: ["'self'", "'unsafe-inline'", 'https://unpkg.com'],
        styleSrc: ["'self'", "'unsafe-inline'", 'https://fonts.googleapis.com', 'https://unpkg.com'],
        fontSrc: ["'self'", 'https://fonts.gstatic.com'],
        connectSrc: ["'self'", ENV.FRONTEND_URL || 'http://localhost:5173', 'https://*.tile.openstreetmap.org'],
      },
    },
    crossOriginResourcePolicy: { policy: 'cross-origin' },
    frameguard: { action: 'deny' }, // Anti-clickjacking
    referrerPolicy: { policy: 'strict-origin-when-cross-origin' },
  })
);

// 2. CORS Configuration (Dynamic Allowed Origins & Credentials)
app.use(
  cors({
    origin: true, // Echo origin to allow localhost, staging, and production domains with cookies
    credentials: true,
    methods: ['GET', 'POST', 'PUT', 'PATCH', 'DELETE', 'OPTIONS'],
    allowedHeaders: [
      'Content-Type',
      'Authorization',
      'x-session-id',
      'x-refresh-token',
      'Accept',
      'Origin',
      'X-Requested-With',
    ],
    exposedHeaders: ['set-cookie'],
  })
);

// Explicit preflight handler
app.options('*', cors());

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

// Health Endpoint with Memory & Cache Diagnostics
app.get(['/health', '/api/health'], (req: Request, res: Response) => {
  const memoryUsage = process.memoryUsage();
  res.status(200).json({
    status: 'ok',
    success: true,
    message: 'Nursery API is running',
    timestamp: new Date().toISOString(),
    process: {
      uptime: process.uptime(),
      pid: process.pid,
      memory: {
        rssMb: Math.round(memoryUsage.rss / 1024 / 1024),
        heapUsedMb: Math.round(memoryUsage.heapUsed / 1024 / 1024),
        heapTotalMb: Math.round(memoryUsage.heapTotal / 1024 / 1024),
      },
    },
    cache: appCache.getStats(),
  });
});

// Dynamic Robots.txt Handler (Cached)
app.get(['/robots.txt', '/api/robots.txt'], async (_req: Request, res: Response) => {
  const robots = await appCache.getOrSet(
    'system:robots.txt',
    async () => `# RJ Flowers Robots.txt
User-agent: *
Allow: /
Allow: /product/
Allow: /products/
Allow: /category/
Allow: /categories/
Allow: /catalog
Allow: /search
Disallow: /admin/
Disallow: /checkout
Disallow: /cart
Disallow: /orders/
Disallow: /wishlist
Disallow: /profile
Disallow: /api/

Sitemap: https://rjflowers.com/sitemap.xml
`,
    3600 // Cache for 1 hour
  );

  res.header('Content-Type', 'text/plain');
  res.send(robots);
});

// Dynamic Sitemap.xml Handler (Cached with 30-minute TTL)
app.get(['/sitemap.xml', '/api/sitemap.xml'], async (_req: Request, res: Response) => {
  try {
    const xml = await appCache.getOrSet(
      'system:sitemap.xml',
      async () => {
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

        const baseUrl = process.env.FRONTEND_URL || 'https://rjflowers.com';

        let xmlContent = `<?xml version="1.0" encoding="UTF-8"?>\n`;
        xmlContent += `<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">\n`;

        // Static Pages
        const staticPages = [
          { loc: `${baseUrl}/`, priority: '1.0', changefreq: 'daily' },
          { loc: `${baseUrl}/catalog`, priority: '0.9', changefreq: 'daily' },
          { loc: `${baseUrl}/categories`, priority: '0.8', changefreq: 'weekly' },
          { loc: `${baseUrl}/search`, priority: '0.7', changefreq: 'weekly' },
          { loc: `${baseUrl}/contact`, priority: '0.5', changefreq: 'monthly' },
          { loc: `${baseUrl}/privacy`, priority: '0.3', changefreq: 'yearly' },
          { loc: `${baseUrl}/terms`, priority: '0.3', changefreq: 'yearly' },
        ];

        staticPages.forEach((p) => {
          xmlContent += `  <url>\n    <loc>${p.loc}</loc>\n    <changefreq>${p.changefreq}</changefreq>\n    <priority>${p.priority}</priority>\n  </url>\n`;
        });

        // Categories
        categories.forEach((c) => {
          xmlContent += `  <url>\n    <loc>${baseUrl}/category/${c.slug}</loc>\n    <lastmod>${c.updatedAt.toISOString().split('T')[0]}</lastmod>\n    <changefreq>weekly</changefreq>\n    <priority>0.85</priority>\n  </url>\n`;
        });

        // Products
        products.forEach((p) => {
          xmlContent += `  <url>\n    <loc>${baseUrl}/product/${p.slug}</loc>\n    <lastmod>${p.updatedAt.toISOString().split('T')[0]}</lastmod>\n    <changefreq>daily</changefreq>\n    <priority>0.8</priority>\n  </url>\n`;
        });

        xmlContent += `</urlset>`;
        return xmlContent;
      },
      1800 // Cache for 30 minutes
    );

    res.header('Content-Type', 'application/xml');
    res.send(xml);
  } catch (err) {
    res.status(500).send('Error generating sitemap');
  }
});

// Direct `/api/...` Routes
app.use('/api/auth', authRoutes);
app.use('/api/products', productRoutes);
app.use('/api/cart', cartRoutes);
app.use('/api/admin', adminRoutes);
app.use('/api/orders', orderRoutes);
app.use('/api/delivery-zones', deliveryRoutes);
app.use('/api/admin/delivery-zones', deliveryRoutes);
app.use('/api/inventory', inventoryRoutes);
app.use('/api/upload', uploadRoutes);
app.use('/api/notifications', notificationRoutes);
app.use('/api/site-settings', siteSettingsRoutes);

// Versioned `/api/v1/...` Routes
app.use('/api/v1/auth', authRoutes);
app.use('/api/v1/products', productRoutes);
app.use('/api/v1/cart', cartRoutes);
app.use('/api/v1/admin', adminRoutes);
app.use('/api/v1/orders', orderRoutes);
app.use('/api/v1/delivery-zones', deliveryRoutes);
app.use('/api/v1/admin/delivery-zones', deliveryRoutes);
app.use('/api/v1/inventory', inventoryRoutes);
app.use('/api/v1/upload', uploadRoutes);
app.use('/api/v1/notifications', notificationRoutes);
app.use('/api/v1/site-settings', siteSettingsRoutes);

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
let httpServer: http.Server;

async function startServer() {
  try {
    await connectDB();
  } catch (err: any) {
    console.error('⚠️ [DB] Connection warning on startup:', err.message);
  }

  const port = process.env.PORT || ENV.PORT || 5000;
  httpServer = http.createServer(app);
  initSocketIO(httpServer);

  if (typeof (global as any).PhusionPassenger !== 'undefined') {
    httpServer.listen('passenger');
    console.log('🌿 RJ Flowers API running under Phusion Passenger with WebSocket support');
  } else {
    server = httpServer.listen(port, () => {
      console.log(`🌿 RJ Flowers API is flourishing on port ${port}`);
      console.log(`🚀 Health Check: http://localhost:${port}/api/health`);
    });

    // Configure connection keep-alive timeouts for high reverse-proxy throughput & minimal process contention
    if (server) {
      server.keepAliveTimeout = 65000;
      server.headersTimeout = 66000;
    }
  }
}

// Graceful Shutdown
const handleGracefulShutdown = async (signal: string) => {
  console.log(`\n🛑 Received ${signal}. Starting graceful shutdown...`);
  const activeServer = server || httpServer;
  if (activeServer) {
    activeServer.close(async () => {
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

