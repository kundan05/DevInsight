import { Prisma } from '@prisma/client';
import { BaseRepository } from './BaseRepository';
import { ConflictError } from '../errors/AppError';

type User = any;
type CreateUserInput = Prisma.UserCreateInput;
type UpdateUserInput = Prisma.UserUpdateInput;

export class UserRepository extends BaseRepository<User, CreateUserInput, UpdateUserInput> {
  protected get model() {
    return this.prisma.user;
  }

  protected getEntityName(): string {
    return 'User';
  }

  async findByEmail(email: string): Promise<User | null> {
    return this.model.findUnique({ where: { email } });
  }

  async findByUsername(username: string): Promise<User | null> {
    return this.model.findUnique({ where: { username } });
  }

  async findByIdWithCounts(id: string) {
    return this.model.findUnique({
      where: { id },
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
  }

  async findByEmailOrUsername(email: string, username: string): Promise<User | null> {
    return this.model.findFirst({
      where: { OR: [{ email }, { username }] },
    });
  }

  async assertEmailOrUsernameUnique(email: string, username: string): Promise<void> {
    const existing = await this.findByEmailOrUsername(email, username);
    if (existing) {
      if (existing.email === email) {
        throw new ConflictError('Email already exists');
      }
      throw new ConflictError('Username already exists');
    }
  }

  async getUserStats(userId: string) {
    const [snippetCount, likesReceived, challengesSolved] = await Promise.all([
      this.prisma.snippet.count({ where: { authorId: userId } }),
      this.prisma.like.count({ where: { snippet: { authorId: userId } } }),
      this.prisma.challengeSubmission.count({
        where: { userId, status: 'ACCEPTED' },
      }),
    ]);

    return { snippetCount, likesReceived, challengesSolved };
  }

  async getLeaderboard(limit = 10) {
    const leaderboard = await this.prisma.challengeSubmission.groupBy({
      by: ['userId'],
      where: { status: 'ACCEPTED' },
      _sum: { score: true },
      orderBy: { _sum: { score: 'desc' } },
      take: limit,
    });

    const userIds = leaderboard.map((l: any) => l.userId);
    const users = await this.prisma.user.findMany({
      where: { id: { in: userIds } },
      select: { id: true, username: true, avatar: true },
    });

    return leaderboard.map((entry: any) => ({
      ...entry,
      user: users.find((u: any) => u.id === entry.userId),
      totalScore: entry._sum.score,
    }));
  }
}
