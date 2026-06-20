jest.mock('../../../src/repositories/ChallengeRepository');
jest.mock('../../../src/repositories/UserRepository');

import { ChallengeService } from '../../../src/services/challenge.service';
import { ChallengeRepository } from '../../../src/repositories/ChallengeRepository';
import { UserRepository } from '../../../src/repositories/UserRepository';

const MockChallengeRepo = ChallengeRepository as jest.MockedClass<typeof ChallengeRepository>;
const MockUserRepo = UserRepository as jest.MockedClass<typeof UserRepository>;

describe('ChallengeService', () => {
  let challengeService: ChallengeService;
  let mockRepo: jest.Mocked<ChallengeRepository>;

  const mockChallenge = {
    id: 'challenge-1',
    title: 'Two Sum',
    description: 'Find two numbers that add up to target',
    difficulty: 'EASY',
    category: 'algorithms',
    starterCode: 'function twoSum(nums, target) { }',
    testCases: JSON.stringify([
      { input: [[1, 2, 3], 5], expectedOutput: [1, 2] },
    ]),
    solution: null,
    points: 10,
    isActive: true,
    tags: JSON.stringify(['array', 'hash-map']),
    createdAt: new Date(),
    updatedAt: new Date(),
  };

  beforeEach(() => {
    MockChallengeRepo.mockClear();
    MockUserRepo.mockClear();
    challengeService = new ChallengeService();
    mockRepo = (challengeService as any).challengeRepo;
  });

  describe('getAll', () => {
    it('should return filtered challenges', async () => {
      (mockRepo.findWithFilters as jest.Mock).mockResolvedValue({
        data: [mockChallenge],
        pagination: { page: 1, limit: 10, total: 1, totalPages: 1 },
      });
      (mockRepo.parseChallengesBulk as jest.Mock).mockReturnValue([
        { ...mockChallenge, tags: ['array', 'hash-map'], testCases: [{ input: [[1, 2, 3], 5], expectedOutput: [1, 2] }] },
      ]);

      const result = await challengeService.getAll({ difficulty: 'EASY' });

      expect(result.data).toHaveLength(1);
      expect(result.pagination.total).toBe(1);
    });
  });

  describe('getById', () => {
    it('should return parsed challenge', async () => {
      (mockRepo.findById as jest.Mock).mockResolvedValue(mockChallenge);
      (mockRepo.parseChallenge as jest.Mock).mockReturnValue({
        ...mockChallenge,
        tags: ['array', 'hash-map'],
        testCases: [{ input: [[1, 2, 3], 5], expectedOutput: [1, 2] }],
      });

      const result = await challengeService.getById('challenge-1');

      expect(result).toBeDefined();
      expect(result!.tags).toHaveLength(2);
    });

    it('should return null for missing challenge', async () => {
      (mockRepo.findById as jest.Mock).mockResolvedValue(null);

      const result = await challengeService.getById('nonexistent');

      expect(result).toBeNull();
    });
  });

  describe('getLeaderboard', () => {
    it('should return leaderboard from user repo', async () => {
      const mockLeaderboard = [
        { userId: 'user-1', _sum: { score: 100 }, user: { username: 'topuser', avatar: null }, totalScore: 100 },
      ];
      (MockUserRepo.prototype.getLeaderboard as jest.Mock).mockResolvedValue(mockLeaderboard);

      const result = await challengeService.getLeaderboard(10);

      expect(result).toHaveLength(1);
      expect(result[0].totalScore).toBe(100);
    });
  });

  describe('getUserSubmissions', () => {
    it('should return user submissions', async () => {
      const submissions = [
        { id: 'sub-1', challengeId: 'challenge-1', status: 'ACCEPTED', score: 10 },
      ];
      (mockRepo.getUserSubmissions as jest.Mock).mockResolvedValue(submissions);

      const result = await challengeService.getUserSubmissions('user-1');

      expect(result).toHaveLength(1);
    });
  });

  describe('submit', () => {
    it('should execute and return submission result', async () => {
      (mockRepo.findById as jest.Mock).mockResolvedValue(mockChallenge);
      (mockRepo.parseChallenge as jest.Mock).mockReturnValue({
        ...mockChallenge,
        testCases: [{ input: [[1, 2, 3], 5], expectedOutput: [1, 2] }],
      });
      (mockRepo.createSubmission as jest.Mock).mockResolvedValue({
        id: 'sub-1',
        challengeId: 'challenge-1',
        userId: 'user-1',
        code: 'function twoSum(nums, target) {}',
        language: 'javascript',
        status: 'ACCEPTED',
        score: 10,
        testsPassed: 1,
        totalTests: 1,
        feedback: JSON.stringify([{ passed: true, output: [1, 2], executionTime: 0.5 }]),
        submittedAt: new Date(),
      });
      (mockRepo.safeJsonParse as jest.Mock).mockReturnValue([{ passed: true, output: [1, 2], executionTime: 0.5 }]);

      const result = await challengeService.submit('challenge-1', 'user-1', 'function twoSum(nums, target) { return [1, 2]; }', 'javascript');

      expect(result.passed).toBe(true);
      expect(result.submission.status).toBe('ACCEPTED');
    });
  });
});
