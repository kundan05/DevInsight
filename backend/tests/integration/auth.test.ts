import request from 'supertest';
import { createServer, DevInsightServer } from '../../src/server';
import { getPrismaClient, disconnectDatabase } from '../../src/config/database';

describe('Auth Integration Tests', () => {
  let server: DevInsightServer;

  beforeAll(async () => {
    server = await createServer();
    const prisma = getPrismaClient();
    await prisma.refreshToken.deleteMany();
    await prisma.userAchievement.deleteMany();
    await prisma.challengeSubmission.deleteMany();
    await prisma.like.deleteMany();
    await prisma.comment.deleteMany();
    await prisma.snippet.deleteMany();
    await prisma.user.deleteMany();
  });

  afterAll(async () => {
    await disconnectDatabase();
  });

  describe('POST /api/auth/register', () => {
    it('should register a new user', async () => {
      const res = await request(server.app)
        .post('/api/auth/register')
        .send({
          username: 'testuser',
          email: 'test@example.com',
          password: 'Password123',
          firstName: 'Test',
          lastName: 'User',
        });

      expect(res.status).toBe(201);
      expect(res.body.success).toBe(true);
      expect(res.body.user).toHaveProperty('id');
      expect(res.body).toHaveProperty('accessToken');
      expect(res.body).toHaveProperty('refreshToken');
    });

    it('should fail with duplicate email', async () => {
      const res = await request(server.app)
        .post('/api/auth/register')
        .send({
          username: 'testuser2',
          email: 'test@example.com',
          password: 'Password123',
        });

      expect(res.status).toBe(409);
    });

    it('should fail with weak password', async () => {
      const res = await request(server.app)
        .post('/api/auth/register')
        .send({
          username: 'testuser3',
          email: 'test3@example.com',
          password: 'weak',
        });

      expect(res.status).toBe(400);
      expect(res.body.errors).toBeDefined();
    });
  });

  describe('POST /api/auth/login', () => {
    it('should login with correct credentials', async () => {
      const res = await request(server.app)
        .post('/api/auth/login')
        .send({
          email: 'test@example.com',
          password: 'Password123',
        });

      expect(res.status).toBe(200);
      expect(res.body.success).toBe(true);
      expect(res.body).toHaveProperty('accessToken');
    });

    it('should fail with incorrect password', async () => {
      const res = await request(server.app)
        .post('/api/auth/login')
        .send({
          email: 'test@example.com',
          password: 'wrongpassword',
        });

      expect(res.status).toBe(401);
    });

    it('should fail with non-existent email', async () => {
      const res = await request(server.app)
        .post('/api/auth/login')
        .send({
          email: 'nonexistent@example.com',
          password: 'Password123',
        });

      expect(res.status).toBe(401);
    });
  });

  describe('POST /api/auth/refresh', () => {
    it('should refresh tokens', async () => {
      const loginRes = await request(server.app)
        .post('/api/auth/login')
        .send({
          email: 'test@example.com',
          password: 'Password123',
        });

      const res = await request(server.app)
        .post('/api/auth/refresh')
        .send({ refreshToken: loginRes.body.refreshToken });

      expect(res.status).toBe(200);
      expect(res.body).toHaveProperty('accessToken');
      expect(res.body).toHaveProperty('refreshToken');
    });
  });
});
