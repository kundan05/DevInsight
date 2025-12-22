import { Request, Response } from 'express';
import { PrismaClient } from '@prisma/client';
import logger from '../utils/logger';

const prisma = new PrismaClient();

export const getProfile = async (req: Request, res: Response) => {
    try {
        const { username } = req.params;

        const user = await prisma.user.findUnique({
            where: { username },
            select: {
                id: true,
                email: true,
                username: true,
                firstName: true,
                lastName: true,
                bio: true,
                avatar: true,
                githubUrl: true,
                linkedinUrl: true,
                role: true,
                createdAt: true,
                _count: {
                    select: {
                        snippets: true,
                        challengeSubmissions: true,
                        achievements: true,
                    },
                },
            },
        });

        if (!user) {
            return res.status(404).json({ success: false, message: 'User not found' });
        }

        res.status(200).json({ success: true, user });
    } catch (error) {
        logger.error('Get profile error:', error);
        res.status(500).json({ success: false, message: 'Internal server error' });
    }
};

export const updateProfile = async (req: Request, res: Response) => {
    try {
        const userId = req.user!.userId;
        const { firstName, lastName, bio, avatar, githubUrl, linkedinUrl } = req.body;

        const user = await prisma.user.update({
            where: { id: userId },
            data: {
                firstName,
                lastName,
                bio,
                avatar,
                githubUrl,
                linkedinUrl,
            },
            select: {
                id: true,
                email: true,
                username: true,
                firstName: true,
                lastName: true,
                bio: true,
                avatar: true,
                githubUrl: true,
                linkedinUrl: true,
                role: true,
            },
        });

        res.status(200).json({ success: true, message: 'Profile updated successfully', user });
    } catch (error) {
        logger.error('Update profile error:', error);
        res.status(500).json({ success: false, message: 'Internal server error' });
    }
};

export const getUserStats = async (req: Request, res: Response) => {
    try {
        const userId = req.user!.userId;

        const [snippetCount, likesReceived, challengesSolved] = await Promise.all([
            prisma.snippet.count({ where: { authorId: userId } }),
            prisma.like.count({ where: { snippet: { authorId: userId } } }), // Likes on user's snippets
            prisma.challengeSubmission.count({
                where: {
                    userId,
                    status: 'ACCEPTED'
                }
            }),
        ]);

        res.status(200).json({
            success: true,
            stats: {
                snippetCount,
                likesReceived,
                challengesSolved,
            },
        });
    } catch (error) {
        logger.error('Get stats error:', error);
        res.status(500).json({ success: false, message: 'Internal server error' });
    }
};
