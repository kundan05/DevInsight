"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const client_1 = require("@prisma/client");
const bcryptjs_1 = __importDefault(require("bcryptjs"));
const prisma = new client_1.PrismaClient();
// Mock password hashing for seed to avoid dependency issues if utils not fully ready
// But since we are creating password util next, we can try to use it or just inline bcrypt here
const hashPasswordLocal = async (password) => {
    const salt = await bcryptjs_1.default.genSalt(10);
    return bcryptjs_1.default.hash(password, salt);
};
async function main() {
    // Create sample users
    const user1 = await prisma.user.create({
        data: {
            email: 'kundan2@example.com',
            username: 'kundan2',
            password: await hashPasswordLocal('password123'),
            firstName: 'Kundan',
            lastName: 'gowda',
            bio: 'Full-stack developer',
            isEmailVerified: true,
            role: 'USER',
        },
    });
    const admin = await prisma.user.create({
        data: {
            email: 'admin@devinsight.com',
            username: 'admin',
            password: await hashPasswordLocal('admin123'),
            firstName: 'Admin',
            lastName: 'User',
            bio: 'System Administrator',
            isEmailVerified: true,
            role: 'ADMIN',
        },
    });
    // Create sample snippets
    await prisma.snippet.create({
        data: {
            title: 'React Custom Hook for API Calls',
            description: 'A reusable custom hook for making API calls with loading and error states',
            code: `import { useState, useEffect } from 'react';

export const useApi = (url) => {
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    fetch(url)
      .then(res => res.json())
      .then(setData)
      .catch(setError)
      .finally(() => setLoading(false));
  }, [url]);

  return { data, loading, error };
};`,
            language: 'javascript',
            tags: ['react', 'hooks', 'api'],
            authorId: user1.id,
        },
    });
    // Create sample challenges
    await prisma.challenge.create({
        data: {
            title: 'Two Sum',
            description: 'Given an array of integers and a target, return indices of two numbers that add up to target',
            difficulty: 'EASY',
            category: 'Arrays',
            starterCode: 'function twoSum(nums, target) {\n  // Your code here\n}',
            testCases: JSON.stringify([
                { input: [[2, 7, 11, 15], 9], output: [0, 1] },
                { input: [[3, 2, 4], 6], output: [1, 2] },
            ]),
            points: 100,
            tags: ['arrays', 'hash-table'],
        },
    });
    // Create achievements
    await prisma.achievement.create({
        data: {
            name: 'First Snippet',
            description: 'Create your first code snippet',
            icon: '🎉',
            category: 'milestone',
            points: 10,
        },
    });
    console.log('Database seeded successfully');
}
main()
    .catch(console.error)
    .finally(() => prisma.$disconnect());
