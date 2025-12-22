import { PrismaClient } from '@prisma/client';
import logger from '../utils/logger';

let prisma: PrismaClient;

export const getPrismaClient = (): PrismaClient => {
    if (!prisma) {
        prisma = new PrismaClient({
            log: process.env.NODE_ENV === 'development' ? ['query', 'error', 'warn'] : ['error'],
        });
    }
    return prisma;
};

export const connectDatabase = async (): Promise<void> => {
    try {
        const client = getPrismaClient();
        await client.$connect();
        logger.info('PostgreSQL connected successfully');
    } catch (error) {
        logger.error('PostgreSQL connection error:', error);
        throw error;
    }
};

export const disconnectDatabase = async (): Promise<void> => {
    try {
        if (prisma) {
            await prisma.$disconnect();
            logger.info('PostgreSQL disconnected');
        }
    } catch (error) {
        logger.error('Error disconnecting from PostgreSQL:', error);
        throw error;
    }
};

export default getPrismaClient();
