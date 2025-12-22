import logger from '../utils/logger';

// Mock implementation for local testing without Redis
class MockRedis {
    private cache: Map<string, string>;

    constructor() {
        this.cache = new Map();
        logger.info('Using Mock Redis (In-Memory)');
    }

    on(event: string, callback: any) {
        if (event === 'connect' || event === 'ready') {
            callback();
        }
    }

    async get(key: string) {
        return this.cache.get(key) || null;
    }

    async set(key: string, value: string, mode?: string, duration?: number) {
        this.cache.set(key, value);
        return 'OK';
    }

    async del(key: string) {
        return this.cache.delete(key) ? 1 : 0;
    }

    async exists(key: string) {
        return this.cache.has(key) ? 1 : 0;
    }

    async keys(pattern: string) {
        return Array.from(this.cache.keys()); // Simplified pattern matching
    }

    async flushall() {
        this.cache.clear();
        return 'OK';
    }
}

const redis = new MockRedis();

export const cacheService = {
    get: async (key: string) => redis.get(key),
    set: async (key: string, value: string, ttl?: number) => redis.set(key, value),
    del: async (key: string) => redis.del(key),
    exists: async (key: string) => redis.exists(key),
    keys: async (pattern: string) => redis.keys(pattern),
    flushAll: async () => redis.flushall(),
};

export default redis as any;
