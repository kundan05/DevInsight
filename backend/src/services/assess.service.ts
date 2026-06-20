import { AssessmentRepository } from '../repositories/AssessmentRepository';
import { SandboxService, SubmissionResult } from './sandbox.service';
import { NotFoundError } from '../errors/AppError';
import logger from '../utils/logger';

export class AssessService {
  private assessRepo: AssessmentRepository;
  private sandbox: SandboxService;

  constructor() {
    this.assessRepo = new AssessmentRepository();
    this.sandbox = new SandboxService();
  }

  async getAssessments(filters: {
    difficulty?: string;
    category?: string;
    page?: number;
    limit?: number;
  }) {
    return this.assessRepo.findWithFilters(filters);
  }

  async getAssessmentById(id: string) {
    const assessment = await this.assessRepo.findByIdWithQuestions(id);
    if (!assessment) throw new NotFoundError('Assessment');
    return assessment;
  }

  async createAssessment(data: {
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
  }) {
    return this.assessRepo.createWithQuestions(data);
  }

  async submitAnswer(
    assessmentId: string,
    questionId: string,
    userId: string,
    code: string,
    language: string,
  ) {
    const question = await this.assessRepo.findQuestionById(questionId);
    if (!question) throw new NotFoundError('Question');
    if (question.assessmentId !== assessmentId) {
      throw new Error('Question does not belong to this assessment');
    }

    const testCases = (question as any).testCases as any[];
    const result: SubmissionResult = await this.sandbox.execute(
      code,
      language,
      testCases,
      {
        timeout: (question as any).timeLimit ?? 5000,
        memoryLimit: ((question as any).memoryLimit ?? 128) * 1024 * 1024,
      },
    );

    const passed = result.testsPassed === result.totalTests;
    const status = passed
      ? 'ACCEPTED'
      : result.testsPassed > 0
        ? 'WRONG_ANSWER'
        : 'WRONG_ANSWER';

    const score = passed ? (question as any).points : 0;
    const maxExecTime = result.results.reduce(
      (max, r) => Math.max(max, r.executionTime),
      0,
    );

    const submission = await this.assessRepo.createSubmission({
      assessmentId,
      questionId,
      userId,
      code,
      language,
      status,
      executionTime: Math.floor(maxExecTime),
      memoryUsed: 0,
      testsPassed: result.testsPassed,
      totalTests: result.totalTests,
      score,
      feedback: JSON.stringify(result),
    });

    return { submission, passed, result };
  }

  async evaluateAssessment(assessmentId: string, userId: string) {
    const assessment = await this.assessRepo.findByIdWithQuestions(assessmentId);
    if (!assessment) throw new NotFoundError('Assessment');

    const submissions = await this.assessRepo.getUserSubmissionsForAssessment(
      assessmentId,
      userId,
    );

    const questions = (assessment as any).questions || [];
    const totalPoints = questions.reduce(
      (sum: number, q: any) => sum + q.points,
      0,
    );
    const earnedPoints = submissions.reduce(
      (sum: number, s: any) => sum + s.score,
      0,
    );
    const percentage = totalPoints > 0 ? Math.round((earnedPoints / totalPoints) * 100) : 0;
    const passed = percentage >= (assessment as any).passingScore;

    return {
      assessmentId,
      userId,
      totalPoints,
      earnedPoints,
      percentage,
      passed,
      passingScore: (assessment as any).passingScore,
      questionCount: questions.length,
      answeredCount: submissions.length,
      submissions,
    };
  }

  async getUserAssessments(userId: string) {
    return this.assessRepo.getUserAssessmentResults(userId);
  }
}
