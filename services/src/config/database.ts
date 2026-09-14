import { PrismaClient } from '@prisma/client';

const globalForPrisma = globalThis as unknown as { prismaGlobal?: PrismaClient };

export const prisma =
  globalForPrisma.prismaGlobal ??
  new PrismaClient({
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
