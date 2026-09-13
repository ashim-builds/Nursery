import { PrismaClient } from '@prisma/client';

export const prisma = new PrismaClient({
  log: process.env.NODE_ENV === 'development' ? ['warn', 'error'] : ['error'],
});

export async function connectDB() {
  try {
    await prisma.$connect();
    console.log('🌲 Successfully connected to MySQL database via Prisma');
  } catch (error: any) {
    console.error('❌ Failed to connect to MySQL database:', error.message);
  }
}
