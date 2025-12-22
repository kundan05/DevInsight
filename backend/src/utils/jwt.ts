import jwt from 'jsonwebtoken';
import { User } from '@prisma/client';
// import { v4 as uuidv4 } from 'uuid';
// import prisma from '../config/database';

const JWT_SECRET = process.env.JWT_SECRET;
const JWT_REFRESH_SECRET = process.env.JWT_REFRESH_SECRET;

if (!JWT_SECRET || !JWT_REFRESH_SECRET) {
    // Only allow default secrets in development mode
    if (process.env.NODE_ENV === 'production') {
        throw new Error('JWT_SECRET and JWT_REFRESH_SECRET must be defined in production environment');
    }
}

// Fallbacks for development ONLY
const DEV_SECRET = 'dev-secret-key-change-in-prod';
const DEV_REFRESH_SECRET = 'dev-refresh-secret-key-change-in-prod';
const JWT_EXPIRES_IN = process.env.JWT_EXPIRES_IN || '15m';
const JWT_REFRESH_EXPIRES_IN = process.env.JWT_REFRESH_EXPIRES_IN || '7d';

export interface TokenPayload {
    userId: string;
    email: string;
    role: string;
}

export const generateAccessToken = (payload: TokenPayload): string => {
    return jwt.sign(payload, (JWT_SECRET || DEV_SECRET) as string, { expiresIn: JWT_EXPIRES_IN as any });
};

export const generateRefreshToken = (payload: TokenPayload): string => {
    return jwt.sign(payload, (JWT_REFRESH_SECRET || DEV_REFRESH_SECRET) as string, { expiresIn: JWT_REFRESH_EXPIRES_IN as any });
};

export const verifyAccessToken = (token: string): TokenPayload => {
    return jwt.verify(token, (JWT_SECRET || DEV_SECRET) as string) as TokenPayload;
};

export const verifyRefreshToken = (token: string): TokenPayload => {
    return jwt.verify(token, (JWT_REFRESH_SECRET || DEV_REFRESH_SECRET) as string) as TokenPayload;
};

export const generateTokenPair = async (user: User) => {
    const payload: TokenPayload = {
        userId: user.id,
        email: user.email,
        role: user.role,
    };

    const accessToken = generateAccessToken(payload);
    const refreshToken = generateRefreshToken(payload);

    // In a real app, store refresh token or hash of it in DB
    // await prisma.refreshToken.create({
    //   data: {
    //     token: refreshToken,
    //     userId: user.id,
    //     expiresAt: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000), // 7 days
    //   },
    // });

    return { accessToken, refreshToken };
};
