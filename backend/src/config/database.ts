import { PrismaClient } from '@prisma/client';
import logger from '../utils/logger';

let prisma: PrismaClient | null = null;

export const getPrismaClient = (): PrismaClient => {
  if (!prisma) {
    prisma = new PrismaClient({
      log: process.env.NODE_ENV === 'development' ? ['error', 'warn'] : ['error'],
    });
  }
  return prisma;
};

export const connectDatabase = async (): Promise<void> => {
  try {
    const client = getPrismaClient();
    await client.$connect();
    logger.info('Database connected successfully');
  } catch (error) {
    logger.error('Database connection error:', error);
    throw error;
  }
};

export const disconnectDatabase = async (): Promise<void> => {
  try {
    if (prisma) {
      await prisma.$disconnect();
      prisma = null;
      logger.info('Database disconnected');
    }
  } catch (error) {
    logger.error('Error disconnecting from database:', error);
    throw error;
  }
};

export const resetPrismaClient = (): void => {
  prisma = null;
};

export default getPrismaClient();
