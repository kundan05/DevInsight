import request from 'supertest';
import { app } from '../../src/server'; // We need to export app from server.ts
import prisma from '../../src/config/database';

describe('Auth Integration Tests', () => {
    beforeAll(async () => {
        // Clean up database before tests - delete in order of checking constraints
        await prisma.refreshToken.deleteMany();
        await prisma.userAchievement.deleteMany();
        await prisma.challengeSubmission.deleteMany();
        await prisma.like.deleteMany();
        await prisma.comment.deleteMany();
        await prisma.snippet.deleteMany();
        await prisma.user.deleteMany();
    });

    afterAll(async () => {
        await prisma.$disconnect();
    });

    describe('POST /api/auth/register', () => {
        it('should register a new user', async () => {
            const res = await request(app)
                .post('/api/auth/register')
                .send({
                    username: 'testuser',
                    email: 'test@example.com',
                    password: 'password123',
                    firstName: 'Test',
                    lastName: 'User'
                });

            expect(res.status).toBe(201);
            expect(res.body.success).toBe(true);
            expect(res.body.user).toHaveProperty('id');
            expect(res.body).toHaveProperty('accessToken');
            expect(res.body).toHaveProperty('refreshToken');
        });

        it('should fail with duplicate email', async () => {
            const res = await request(app)
                .post('/api/auth/register')
                .send({
                    username: 'testuser2',
                    email: 'test@example.com', // Duplicate email
                    password: 'password123',
                });

            expect(res.status).toBe(400); // Or 500 if caught by global error handler without specific check
        });
    });

    describe('POST /api/auth/login', () => {
        it('should login with correct credentials', async () => {
            const res = await request(app)
                .post('/api/auth/login')
                .send({
                    email: 'test@example.com',
                    password: 'password123',
                });

            expect(res.status).toBe(200);
            expect(res.body.success).toBe(true);
            expect(res.body).toHaveProperty('accessToken');
        });

        it('should fail with incorrect password', async () => {
            const res = await request(app)
                .post('/api/auth/login')
                .send({
                    email: 'test@example.com',
                    password: 'wrongpassword',
                });

            expect(res.status).toBe(401);
        });
    });
});
