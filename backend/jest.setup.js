process.env.DATABASE_URL = process.env.DATABASE_URL || 'file:./dev.db';
process.env.JWT_SECRET = 'test-jwt-secret-key-for-testing';
process.env.JWT_REFRESH_SECRET = 'test-jwt-refresh-secret-key-for-test';
process.env.NODE_ENV = 'test';
