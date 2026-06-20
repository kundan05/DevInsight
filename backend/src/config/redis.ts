import Redis from 'ioredis';
import logger from '../utils/logger';

class MockRedis {
  private cache: Map<string, { value: string; expiry: number | null }>;

  constructor() {
    this.cache = new Map();
    logger.info('Using Mock Redis (In-Memory)');
  }

  on(event: string, callback: any) {
    if (event === 'connect' || event === 'ready') {
      callback();
    }
    return this;
  }

  async get(key: string): Promise<string | null> {
    const entry = this.cache.get(key);
    if (!entry) return null;
    if (entry.expiry && Date.now() > entry.expiry) {
      this.cache.delete(key);
      return null;
    }
    return entry.value;
  }

  async set(key: string, value: string, mode?: string, duration?: number): Promise<'OK'> {
    let expiry: number | null = null;
    if (mode === 'EX' && duration) {
      expiry = Date.now() + duration * 1000;
    }
    this.cache.set(key, { value, expiry });
    return 'OK';
  }

  async del(key: string): Promise<number> {
    return this.cache.delete(key) ? 1 : 0;
  }

  async exists(key: string): Promise<number> {
    return this.cache.has(key) ? 1 : 0;
  }

  async keys(pattern: string): Promise<string[]> {
    const allKeys = Array.from(this.cache.keys());
    if (pattern === '*') return allKeys;
    const regex = new RegExp('^' + pattern.replace(/\*/g, '.*') + '$');
    return allKeys.filter(k => regex.test(k));
  }

  async flushall(): Promise<'OK'> {
    this.cache.clear();
    return 'OK';
  }
}

let redisInstance: any;

const REDIS_URL = process.env.REDIS_URL;

if (REDIS_URL) {
  try {
    redisInstance = new Redis(REDIS_URL, {
      maxRetriesPerRequest: 3,
      retryStrategy: (times) => Math.min(times * 50, 2000),
      lazyConnect: true,
    });

    redisInstance.on('connect', () => logger.info('Redis connected'));
    redisInstance.on('error', (err: Error) => logger.error('Redis error:', err));
    redisInstance.on('ready', () => logger.info('Redis ready'));
  } catch (error) {
    logger.warn('Redis connection failed, falling back to mock:', error);
    redisInstance = new MockRedis();
  }
} else {
  logger.info('No REDIS_URL configured, using mock Redis');
  redisInstance = new MockRedis();
}

export const cacheService = {
  async get<T = string>(key: string): Promise<T | null> {
    const value = await redisInstance.get(key);
    if (!value) return null;
    try {
      return JSON.parse(value) as T;
    } catch {
      return value as unknown as T;
    }
  },

  async set(key: string, value: any, ttlSeconds?: number): Promise<void> {
    const stringValue = typeof value === 'string' ? value : JSON.stringify(value);
    if (ttlSeconds) {
      await redisInstance.set(key, stringValue, 'EX', ttlSeconds);
    } else {
      await redisInstance.set(key, stringValue);
    }
  },

  async del(key: string): Promise<void> {
    await redisInstance.del(key);
  },

  async exists(key: string): Promise<boolean> {
    const result = await redisInstance.exists(key);
    return result === 1;
  },

  async keys(pattern: string): Promise<string[]> {
    return redisInstance.keys(pattern);
  },

  async flushAll(): Promise<void> {
    await redisInstance.flushall();
  },
};

export default redisInstance;
