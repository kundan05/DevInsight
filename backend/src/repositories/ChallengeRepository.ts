import { Prisma } from '@prisma/client';
import { BaseRepository, PaginationParams, PaginatedResult } from './BaseRepository';

type Challenge = any;
type CreateChallengeInput = Prisma.ChallengeCreateInput;
type UpdateChallengeInput = Prisma.ChallengeUpdateInput;

interface ChallengeFilter extends PaginationParams {
  difficulty?: string;
  category?: string;
  status?: string;
  search?: string;
}

export class ChallengeRepository extends BaseRepository<Challenge, CreateChallengeInput, UpdateChallengeInput> {
  protected get model() {
    return this.prisma.challenge;
  }

  protected getEntityName(): string {
    return 'Challenge';
  }

  async findWithFilters(filters: ChallengeFilter): Promise<PaginatedResult<Challenge>> {
    const { difficulty, category, status, search, page = 1, limit = 10 } = filters;

    const where: any = {};
    if (status !== 'archived') where.isActive = true;
    if (status === 'archived') where.isActive = false;
    if (difficulty) where.difficulty = difficulty;
    if (category) where.category = category;
    if (search) {
      where.OR = [
        { title: { contains: search } },
        { description: { contains: search } },
      ];
    }

    return this.findWithPagination({
      page,
      limit,
      where,
      select: {
        id: true,
        title: true,
        difficulty: true,
        category: true,
        points: true,
        tags: true,
        createdAt: true,
        _count: {
          select: { submissions: true },
        },
      },
    });
  }

  async findByIdWithDetails(id: string) {
    return this.model.findUnique({ where: { id } });
  }

  async createSubmission(data: {
    challengeId: string;
    userId: string;
    code: string;
    language: string;
    status: string;
    executionTime: number;
    memoryUsed: number;
    testsPassed: number;
    totalTests: number;
    score: number;
    feedback: string;
  }) {
    return this.prisma.challengeSubmission.create({ data: data as any });
  }

  async getUserSubmissions(userId: string) {
    return this.prisma.challengeSubmission.findMany({
      where: { userId },
      include: { challenge: { select: { title: true } } },
      orderBy: { submittedAt: 'desc' },
    });
  }

  parseChallenge(challenge: any): any {
    if (!challenge) return challenge;
    return {
      ...challenge,
      tags: Array.isArray(challenge.tags) ? challenge.tags : this.safeJsonParse(challenge.tags, []),
      testCases: typeof challenge.testCases === 'string' ? this.safeJsonParse(challenge.testCases, []) : (challenge.testCases ?? []),
    };
  }

  parseChallengesBulk(challenges: any[]): any[] {
    return challenges.map(c => this.parseChallenge(c));
  }

  safeJsonParse(value: string, fallback: any): any {
    try {
      return JSON.parse(value);
    } catch {
      return fallback;
    }
  }
}
