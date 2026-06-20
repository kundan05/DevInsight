import { BaseRepository, PaginatedResult } from './BaseRepository';
import { Prisma } from '@prisma/client';

type Assessment = any;

export class AssessmentRepository extends BaseRepository<
  Assessment,
  any,
  any
> {
  protected get model() {
    return this.prisma.assessment;
  }

  protected getEntityName(): string {
    return 'Assessment';
  }

  async findWithFilters(filters: {
    difficulty?: string;
    category?: string;
    page?: number;
    limit?: number;
  }): Promise<PaginatedResult<Assessment>> {
    const where: any = { isActive: true };
    if (filters.difficulty) where.difficulty = filters.difficulty;
    if (filters.category) where.category = filters.category;

    const page = filters.page || 1;
    const limit = filters.limit || 10;
    const skip = (page - 1) * limit;

    const [data, total] = await Promise.all([
      this.model.findMany({
        where,
        skip,
        take: limit,
        include: { _count: { select: { questions: true } } },
        orderBy: { createdAt: 'desc' },
      }),
      this.model.count({ where }),
    ]);

    return {
      data,
      pagination: {
        page,
        limit,
        total,
        totalPages: Math.ceil(total / limit),
      },
    };
  }

  async findByIdWithQuestions(id: string): Promise<Assessment | null> {
    return this.model.findUnique({
      where: { id },
      include: {
        questions: { orderBy: { orderIndex: 'asc' } },
        author: {
          select: { id: true, username: true, avatar: true },
        },
      },
    });
  }

  async findQuestionById(id: string): Promise<any | null> {
    return this.prisma.assessmentQuestion.findUnique({ where: { id } });
  }

  async createWithQuestions(data: {
    title: string;
    description: string;
    difficulty: string;
    category: string;
    timeLimit: number;
    passingScore: number;
    authorId: string;
    questions: Array<{
      title: string;
      description: string;
      difficulty: string;
      starterCode?: string;
      testCases: any[];
      points: number;
    }>;
  }): Promise<Assessment> {
    return this.prisma.$transaction(async (tx: any) => {
      const assessment = await tx.assessment.create({
        data: {
          title: data.title,
          description: data.description,
          difficulty: data.difficulty,
          category: data.category,
          timeLimit: data.timeLimit,
          passingScore: data.passingScore,
          authorId: data.authorId,
          questions: {
            create: data.questions.map((q, idx) => ({
              title: q.title,
              description: q.description,
              difficulty: q.difficulty,
              starterCode: q.starterCode,
              testCases: q.testCases,
              points: q.points,
              orderIndex: idx,
            })),
          },
        },
        include: {
          questions: { orderBy: { orderIndex: 'asc' } },
        },
      });
      return assessment;
    });
  }

  async createSubmission(data: {
    assessmentId: string;
    questionId: string;
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
  }): Promise<any> {
    return this.prisma.assessmentSubmission.create({ data: data as any });
  }

  async getUserSubmissionsForAssessment(
    assessmentId: string,
    userId: string,
  ): Promise<any[]> {
    return this.prisma.assessmentSubmission.findMany({
      where: { assessmentId, userId },
      include: {
        question: { select: { id: true, title: true, points: true } },
      },
      orderBy: { submittedAt: 'desc' },
    });
  }

  async getUserAssessmentResults(userId: string): Promise<any[]> {
    const submissions = await this.prisma.assessmentSubmission.findMany({
      where: { userId },
      include: {
        assessment: {
          select: {
            id: true,
            title: true,
            difficulty: true,
            passingScore: true,
          },
        },
        question: {
          select: { id: true, title: true, points: true },
        },
      },
      orderBy: { submittedAt: 'desc' },
    });

    const grouped = new Map<string, any>();
    for (const sub of submissions) {
      const key = sub.assessmentId;
      if (!grouped.has(key)) {
        grouped.set(key, {
          assessment: sub.assessment,
          totalScore: 0,
          maxScore: 0,
          submissions: [],
        });
      }
      const group = grouped.get(key)!;
      group.totalScore += sub.score;
      group.maxScore += (sub.question as any).points || 0;
      group.submissions.push(sub);
    }

    return Array.from(grouped.values());
  }
}
