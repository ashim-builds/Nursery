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

// 4. Validate and append connection limit pool options only if it's a valid mysql URL
let finalDbUrl = '';
if (rawUrl && rawUrl.startsWith('mysql://')) {
  finalDbUrl = rawUrl;
  if (!finalDbUrl.includes('connection_limit')) {
    finalDbUrl += (finalDbUrl.includes('?') ? '&' : '?') + 'connection_limit=3&pool_timeout=10';
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

