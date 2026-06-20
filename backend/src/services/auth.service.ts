import { UserRepository } from '../repositories/UserRepository';
import { hashPassword, comparePassword } from '../utils/password';
import { generateTokenPair, verifyRefreshToken } from '../utils/jwt';
import { AuthError, ValidationError } from '../errors/AppError';
import logger from '../utils/logger';
import { getPrismaClient } from '../config/database';

export class AuthService {
  private userRepo: UserRepository;

  constructor() {
    this.userRepo = new UserRepository();
  }

  async register(data: {
    email: string;
    username: string;
    password: string;
    firstName?: string;
    lastName?: string;
  }) {
    await this.userRepo.assertEmailOrUsernameUnique(data.email, data.username);

    const hashedPassword = await hashPassword(data.password);

    const user = await this.userRepo.create({
      email: data.email,
      username: data.username,
      password: hashedPassword,
      firstName: data.firstName,
      lastName: data.lastName,
    });

    const tokens = await generateTokenPair(user);

    logger.info(`User registered: ${user.id}`);

    return {
      user: {
        id: user.id,
        email: user.email,
        username: user.username,
        role: user.role,
      },
      ...tokens,
    };
  }

  async login(email: string, password: string) {
    const user = await this.userRepo.findByEmail(email);

    if (!user || !(await comparePassword(password, user.password))) {
      throw new AuthError('Invalid credentials');
    }

    const tokens = await generateTokenPair(user);

    logger.info(`User logged in: ${user.id}`);

    return {
      user: {
        id: user.id,
        email: user.email,
        username: user.username,
        role: user.role,
        avatar: user.avatar,
      },
      ...tokens,
    };
  }

  async logout(refreshToken: string) {
    if (refreshToken) {
      const prisma = getPrismaClient();
      await prisma.refreshToken.delete({
        where: { token: refreshToken },
      }).catch(() => { });
    }
  }

  async refreshTokens(refreshToken: string) {
    if (!refreshToken) {
      throw new ValidationError('Refresh token required');
    }

    verifyRefreshToken(refreshToken);
    const prisma = getPrismaClient();

    const storedToken = await prisma.refreshToken.findUnique({
      where: { token: refreshToken },
    });

    if (!storedToken) {
      throw new AuthError('Invalid or expired refresh token');
    }

    await prisma.refreshToken.delete({ where: { id: storedToken.id } });

    const user = await this.userRepo.findById(storedToken.userId);
    if (!user) {
      throw new AuthError('User not found');
    }

    const newTokens = await generateTokenPair(user);

    return { ...newTokens };
  }

  async getCurrentUser(userId: string) {
    const user = await this.userRepo.findById(userId);
    if (!user) {
      throw new AuthError('User not found');
    }

    return {
      id: user.id,
      email: user.email,
      username: user.username,
      firstName: user.firstName,
      lastName: user.lastName,
      bio: user.bio,
      avatar: user.avatar,
      role: user.role,
      createdAt: user.createdAt,
    };
  }
}
