process.env.TOKIO_WORKER_THREADS = process.env.TOKIO_WORKER_THREADS || '1';
process.env.UV_THREADPOOL_SIZE = process.env.UV_THREADPOOL_SIZE || '2';

import { PrismaClient } from '@prisma/client';

let dbUrl = process.env.DATABASE_URL || '';
if (!dbUrl.includes('connection_limit')) {
  dbUrl += (dbUrl.includes('?') ? '&' : '?') + 'connection_limit=3&pool_timeout=10';
}
process.env.DATABASE_URL = dbUrl;

const globalForPrisma = globalThis as unknown as { prismaGlobal?: PrismaClient };

export const prisma =
  globalForPrisma.prismaGlobal ??
  new PrismaClient({
    datasources: {
      db: {
        url: dbUrl,
      },
    },
    log: process.env.NODE_ENV === 'development' ? ['warn', 'error'] : ['error'],
  });

globalForPrisma.prismaGlobal = prisma;

export async function connectDB() {
  try {
    await prisma.$connect();
    console.log('🌲 Successfully connected to MySQL database via Prisma');
  } catch (error: any) {
    console.error('❌ Failed to connect to MySQL database:', error.message);
  }
}
