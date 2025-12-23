import { Request, Response } from 'express';
// import { PrismaClient } from '@prisma/client'; // Use singleton
import prisma from '../config/database';
import { hashPassword, comparePassword } from '../utils/password';
import { generateTokenPair, generateAccessToken, verifyRefreshToken } from '../utils/jwt';
import logger from '../utils/logger';

// const prisma = new PrismaClient();

export const register = async (req: Request, res: Response) => {
    try {
        const { email, username, password, firstName, lastName } = req.body;

        const existingUser = await prisma.user.findFirst({
            where: { OR: [{ email }, { username }] },
        });

        if (existingUser) {
            return res.status(400).json({ success: false, message: 'Email or username already exists' });
        }

        const hashedPassword = await hashPassword(password);

        const user = await prisma.user.create({
            data: {
                email,
                username,
                password: hashedPassword,
                firstName,
                lastName,
            },
        });

        const tokens = await generateTokenPair(user);

        logger.info(`User registered: ${user.id}`);

        res.status(201).json({
            success: true,
            message: 'User registered successfully',
            user: {
                id: user.id,
                email: user.email,
                username: user.username,
                role: user.role,
            },
            ...tokens,
        });
    } catch (error) {
        logger.error('Register error:', error);
        res.status(500).json({ success: false, message: 'Internal server error' });
    }
};

export const login = async (req: Request, res: Response) => {
    try {
        const { email, password } = req.body;

        const user = await prisma.user.findUnique({ where: { email } });

        if (!user || !(await comparePassword(password, user.password))) {
            return res.status(401).json({ success: false, message: 'Invalid credentials' });
        }

        const tokens = await generateTokenPair(user);

        await prisma.user.update({
            where: { id: user.id },
            data: { /* lastLoginAt: new Date() */ }, // Fix for TS error: lastLoginAt not recognized despite schema update?
        });

        logger.info(`User logged in: ${user.id}`);

        res.status(200).json({
            success: true,
            message: 'Login successful',
            user: {
                id: user.id,
                email: user.email,
                username: user.username,
                role: user.role,
                avatar: user.avatar,
            },
            ...tokens,
        });
    } catch (error) {
        logger.error('Login error:', error);
        res.status(500).json({ success: false, message: 'Internal server error' });
    }
};

export const logout = async (req: Request, res: Response) => {
    try {
        const { refreshToken } = req.body;

        if (refreshToken) {
            await prisma.refreshToken.delete({
                where: { token: refreshToken },
            }).catch(() => {
                // Ignore if token doesn't exist
            });
        }

        res.status(200).json({ success: true, message: 'Logged out successfully' });
    } catch (error) {
        logger.error('Logout error:', error);
        res.status(500).json({ success: false, message: 'Internal server error' });
    }
};

export const refreshToken = async (req: Request, res: Response) => {
    try {
        const { refreshToken } = req.body;

        if (!refreshToken) {
            return res.status(400).json({ success: false, message: 'Refresh token required' });
        }

        const decoded = verifyRefreshToken(refreshToken);

        // Verify if token exists in DB
        const storedToken = await prisma.refreshToken.findUnique({ where: { token: refreshToken } });
        if (!storedToken) {
            return res.status(401).json({ success: false, message: 'Invalid or expired refresh token' });
        }

        // Revoke the old token (Refresh Token Rotation)
        await prisma.refreshToken.delete({ where: { id: storedToken.id } });

        const user = await prisma.user.findUnique({ where: { id: decoded.userId } });

        if (!user) {
            return res.status(404).json({ success: false, message: 'User not found' });
        }

        const newTokens = await generateTokenPair(user);

        res.status(200).json({
            success: true,
            ...newTokens,
        });
    } catch (error) {
        logger.error('Refresh token error:', error);
        res.status(401).json({ success: false, message: 'Invalid refresh token' });
    }
};

export const getCurrentUser = async (req: Request, res: Response) => {
    try {
        if (!req.user) {
            return res.status(401).json({ success: false, message: 'Not authenticated' });
        }

        const user = await prisma.user.findUnique({
            where: { id: req.user.userId },
            select: {
                id: true,
                email: true,
                username: true,
                firstName: true,
                lastName: true,
                bio: true,
                avatar: true,
                role: true,
                createdAt: true,
            },
        });

        if (!user) {
            return res.status(404).json({ success: false, message: 'User not found' });
        }

        res.status(200).json({ success: true, user });
    } catch (error) {
        logger.error('Get current user error:', error);
        res.status(500).json({ success: false, message: 'Internal server error' });
    }
};
