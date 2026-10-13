process.env.TOKIO_WORKER_THREADS = process.env.TOKIO_WORKER_THREADS || '1';
process.env.UV_THREADPOOL_SIZE = process.env.UV_THREADPOOL_SIZE || '2';

import { PrismaClient } from '@prisma/client';

// 1. Resolve raw DATABASE_URL with production fallback
let rawUrl = (
  process.env.DATABASE_URL ||
  'mysql://rjflower_rjflowers:Rjflowers%402026!@localhost:3306/rjflower_nurserydb'
).trim();

// 2. If rawUrl is missing, attempt to construct from individual DB_* or MYSQL_* variables
if (!rawUrl && (process.env.DB_NAME || process.env.MYSQL_DATABASE)) {
  const user = process.env.DB_USER || process.env.MYSQL_USER || 'rjflowe_dbuser';
  const pass = process.env.DB_PASSWORD || process.env.DB_PASS || process.env.MYSQL_PASSWORD || '';
  const host = process.env.DB_HOST || process.env.MYSQL_HOST || 'localhost';
  const port = process.env.DB_PORT || process.env.MYSQL_PORT || '3306';
  const name = process.env.DB_NAME || process.env.MYSQL_DATABASE || 'rjflowe_nurserydb';
  rawUrl = `mysql://${encodeURIComponent(user)}:${encodeURIComponent(pass)}@${host}:${port}/${name}`;
}

// 3. Strip accidental surrounding single or double quotes
if ((rawUrl.startsWith('"') && rawUrl.endsWith('"')) || (rawUrl.startsWith("'") && rawUrl.endsWith("'"))) {
  rawUrl = rawUrl.slice(1, -1).trim();
}

// 4. Validate, parse, and enforce CloudLinux low-resource pool limits
export const POOL_CONFIG = {
  connectionLimit: 3,
  maxIdle: 2,
  idleTimeout: 30000, // 30 seconds idle timeout to prevent connection leaks
  pool_timeout: 10,
  queueLimit: 20,
};

let finalDbUrl = '';
if (rawUrl && rawUrl.startsWith('mysql://')) {
  try {
    const parsed = new URL(rawUrl);
    // Hard cap connection_limit to max 3
    const existingLimit = parseInt(parsed.searchParams.get('connection_limit') || '0', 10);
    const cappedLimit = existingLimit > 0 ? Math.min(existingLimit, POOL_CONFIG.connectionLimit) : POOL_CONFIG.connectionLimit;
    parsed.searchParams.set('connection_limit', String(cappedLimit));
    parsed.searchParams.set('pool_timeout', String(POOL_CONFIG.pool_timeout));
    finalDbUrl = parsed.toString();
  } catch {
    // Fallback URL string formatting if URL parsing fails
    finalDbUrl = rawUrl;
    if (finalDbUrl.includes('connection_limit=')) {
      finalDbUrl = finalDbUrl.replace(/connection_limit=\d+/, `connection_limit=${POOL_CONFIG.connectionLimit}`);
    } else {
      finalDbUrl += (finalDbUrl.includes('?') ? '&' : '?') + `connection_limit=${POOL_CONFIG.connectionLimit}`;
    }
    if (!finalDbUrl.includes('pool_timeout=')) {
      finalDbUrl += `&pool_timeout=${POOL_CONFIG.pool_timeout}`;
    }
  }
  process.env.DATABASE_URL = finalDbUrl;
} else {
  console.error('❌ [DATABASE_URL CONFIG ERROR] DATABASE_URL is missing or does not start with mysql://');
}

const globalForPrisma = globalThis as unknown as { prismaGlobal?: PrismaClient };

export const prisma =
  globalForPrisma.prismaGlobal ??
  new PrismaClient({
    datasources: finalDbUrl
      ? {
          db: {
            url: finalDbUrl,
          },
        }
      : undefined,
    log: process.env.NODE_ENV === 'development' ? ['warn', 'error'] : ['error'],
  });

globalForPrisma.prismaGlobal = prisma;

export async function connectDB(): Promise<boolean> {
  if (!finalDbUrl || !finalDbUrl.startsWith('mysql://')) {
    console.error('❌ [DB] Cannot connect to MySQL: DATABASE_URL is not configured or invalid.');
    return false;
  }
  try {
    await prisma.$connect();
    console.log('🌲 Successfully connected to MySQL database via Prisma');
    return true;
  } catch (error: any) {
    console.error('❌ Failed to connect to MySQL database:', error.message);
    return false;
  }
}

/**
 * Cleanly close all connections in the database pool.
 * Prevents orphaned/zombie connection accumulation on CloudLinux / cPanel.
 */
export async function closePool(): Promise<void> {
  try {
    await prisma.$disconnect();
    console.log('📦 Successfully closed database connection pool.');
  } catch (err: any) {
    console.error('❌ Error closing database connection pool:', err?.message || err);
  }
}

