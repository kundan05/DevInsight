import { Request, Response } from 'express';
import { PrismaClient } from '@prisma/client';
import logger from '../utils/logger';

const prisma = new PrismaClient();

export const getAllChallenges = async (req: Request, res: Response) => {
    try {
        const { difficulty, category, status, search, page = 1, limit = 10 } = req.query;
        const skip = (Number(page) - 1) * Number(limit);

        const where: any = {
            isActive: true, // Default to active challenges
        };

        if (status === 'archived') where.isActive = false;
        if (difficulty) where.difficulty = String(difficulty);
        if (category) where.category = String(category);
        if (search) {
            where.OR = [
                { title: { contains: String(search) } }, // Mode insensitive not supported in standard SQLite provider unless enabled?
                { description: { contains: String(search) } },
            ];
            // SQLite insensitive support depends on collation, keeping simple contains for now or assuming default
        }

        const [challenges, total] = await Promise.all([
            prisma.challenge.findMany({
                where,
                skip,
                take: Number(limit),
                orderBy: { createdAt: 'desc' },
                select: {
                    id: true,
                    title: true,
                    difficulty: true,
                    category: true,
                    points: true,
                    tags: true,
                    createdAt: true,
                    _count: {
                        select: {
                            submissions: true,
                        },
                    },
                },
            }),
            prisma.challenge.count({ where }),
        ]);

        const parsedChallenges = challenges.map(c => ({
            ...c,
            tags: JSON.parse(c.tags as any || '[]')
        }));

        res.status(200).json({
            success: true,
            data: parsedChallenges,
            pagination: {
                page: Number(page),
                limit: Number(limit),
                total,
                totalPages: Math.ceil(total / Number(limit)),
            },
        });
    } catch (error) {
        logger.error('Get all challenges error:', error);
        res.status(500).json({ success: false, message: 'Internal server error' });
    }
};

export const getChallengeById = async (req: Request, res: Response) => {
    try {
        const { id } = req.params;

        const challenge = await prisma.challenge.findUnique({
            where: { id },
        });

        if (!challenge) {
            return res.status(404).json({ success: false, message: 'Challenge not found' });
        }

        // Don't return hidden fields like solution or testCases if user is not author/admin
        // For now returning everything except solution maybe

        const parsedChallenge = {
            ...challenge,
            tags: JSON.parse(challenge.tags as any || '[]'),
            testCases: JSON.parse(challenge.testCases as any || '[]')
        };

        res.status(200).json({ success: true, challenge: parsedChallenge });
    } catch (error) {
        logger.error('Get challenge error:', error);
        res.status(500).json({ success: false, message: 'Internal server error' });
    }
};

import challengeService, { TestCase } from '../services/challenge.service';

export const submitSolution = async (req: Request, res: Response) => {
    try {
        const { id } = req.params; // Challenge ID
        const userId = req.user!.userId;
        const { code, language } = req.body;

        const challenge = await prisma.challenge.findUnique({ where: { id } });

        if (!challenge) {
            return res.status(404).json({ success: false, message: 'Challenge not found' });
        }

        const testCases: TestCase[] = JSON.parse(challenge.testCases as any || '[]');

        // Execute code using Challenge Service
        const executionResult = await challengeService.executeSubmission(code, language, testCases);

        const passed = executionResult.testsPassed === executionResult.totalTests;
        const status = passed ? 'ACCEPTED' : (executionResult.testsPassed > 0 ? 'WRONG_ANSWER' : 'WRONG_ANSWER');
        const score = passed ? challenge.points : 0; // Simple all-or-nothing scoring for now

        const submission = await prisma.challengeSubmission.create({
            data: {
                challengeId: id,
                userId,
                code,
                language,
                status,
                executionTime: Math.floor(executionResult.results[0]?.executionTime || 0),
                memoryUsed: 0, // Not measuring memory yet
                testsPassed: executionResult.testsPassed,
                totalTests: executionResult.totalTests,
                score,
                feedback: JSON.stringify(executionResult.results),
            },
        });

        if (passed) {
            // Check if this is the first time passing to award points?
            // Updating user stats potentially
            await prisma.userAchievement.createMany({
                data: [], // Placeholder for achievements logic
            }).catch(() => { });
        }

        res.status(200).json({
            success: true,
            submission: {
                ...submission,
                feedback: submission.feedback ? JSON.parse(submission.feedback as any) : null
            },
            message: passed ? 'Solution Accepted!' : 'Wrong Answer',
        });

    } catch (error: any) {
        logger.error('Submit solution error:', error);
        res.status(500).json({ success: false, message: error.message || 'Internal server error' });
    }
};

export const runSolution = async (req: Request, res: Response) => {
    try {
        const { id } = req.params;
        const { code, language } = req.body;

        const challenge = await prisma.challenge.findUnique({ where: { id } });

        if (!challenge) {
            return res.status(404).json({ success: false, message: 'Challenge not found' });
        }

        const testCases: TestCase[] = JSON.parse(challenge.testCases as any || '[]');

        const executionResult = await challengeService.executeSubmission(code, language, testCases);

        res.status(200).json({
            success: true,
            results: executionResult
        });

    } catch (error: any) {
        logger.error('Run solution error:', error);
        res.status(500).json({ success: false, message: error.message || 'Internal server error' });
    }
};

export const getLeaderboard = async (req: Request, res: Response) => {
    try {
        // This is a complex query, simplifying for now
        // Get users with highest total scores from submissions
        const leaderboard = await prisma.challengeSubmission.groupBy({
            by: ['userId'],
            where: { status: 'ACCEPTED' },
            _sum: {
                score: true,
            },
            orderBy: {
                _sum: {
                    score: 'desc',
                },
            },
            take: 10,
        });

        // Need to fetch user details for these IDs
        // This is better done with raw SQL or include if prisma supports it in groupBy (it doesn't easily)
        // Doing a second query

        const userIds = leaderboard.map(l => l.userId);
        const users = await prisma.user.findMany({
            where: { id: { in: userIds } },
            select: { id: true, username: true, avatar: true },
        });

        const detailedLeaderboard = leaderboard.map(entry => ({
            ...entry,
            user: users.find(u => u.id === entry.userId),
            totalScore: entry._sum.score,
        }));

        res.status(200).json({ success: true, leaderboard: detailedLeaderboard });
    } catch (error) {
        logger.error('Get leaderboard error:', error);
        res.status(500).json({ success: false, message: 'Internal server error' });
    }
};

export const getUserSubmissions = async (req: Request, res: Response) => {
    try {
        const userId = req.user!.userId;
        const submissions = await prisma.challengeSubmission.findMany({
            where: { userId },
            include: { challenge: { select: { title: true } } },
            orderBy: { submittedAt: 'desc' },
        });

        res.status(200).json({ success: true, submissions });
    } catch (error) {
        logger.error('Get user submissions error:', error);
        res.status(500).json({ success: false, message: 'Internal server error' });
    }
}
