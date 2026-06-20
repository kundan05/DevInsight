jest.mock('../../../src/repositories/UserRepository');

import { UserService } from '../../../src/services/user.service';
import { UserRepository } from '../../../src/repositories/UserRepository';
import { NotFoundError } from '../../../src/errors/AppError';

const MockUserRepo = UserRepository as jest.MockedClass<typeof UserRepository>;

describe('UserService', () => {
  let userService: UserService;
  let mockRepo: jest.Mocked<UserRepository>;

  const mockUser = {
    id: 'user-1',
    email: 'test@test.com',
    username: 'testuser',
    password: 'hashed',
    firstName: 'Test',
    lastName: 'User',
    bio: 'A dev',
    avatar: null,
    githubUrl: null,
    linkedinUrl: null,
    role: 'USER',
    createdAt: new Date(),
    updatedAt: new Date(),
  };

  const mockStats = {
    snippetCount: 5,
    likesReceived: 10,
    challengesSolved: 3,
  };

  beforeEach(() => {
    MockUserRepo.mockClear();
    userService = new UserService();
    mockRepo = (userService as any).userRepo;
  });

  describe('getProfile', () => {
    it('should return user profile with counts', async () => {
      (mockRepo.findByUsername as jest.Mock).mockResolvedValue(mockUser);
      (mockRepo.getUserStats as jest.Mock).mockResolvedValue(mockStats);

      const result = await userService.getProfile('testuser');

      expect(result.username).toBe('testuser');
      expect(result._count.snippets).toBe(5);
      expect(result._count.challengeSubmissions).toBe(3);
    });

    it('should throw NotFoundError for missing user', async () => {
      (mockRepo.findByUsername as jest.Mock).mockResolvedValue(null);

      await expect(userService.getProfile('nobody')).rejects.toThrow(NotFoundError);
    });
  });

  describe('updateProfile', () => {
    it('should update and return user profile', async () => {
      const updateData = { firstName: 'Updated', bio: 'New bio' };
      (mockRepo.update as jest.Mock).mockResolvedValue({ ...mockUser, ...updateData });

      const result = await userService.updateProfile('user-1', updateData);

      expect(result.firstName).toBe('Updated');
      expect(mockRepo.update).toHaveBeenCalledWith('user-1', updateData);
    });
  });

  describe('getUserStats', () => {
    it('should return user stats', async () => {
      (mockRepo.getUserStats as jest.Mock).mockResolvedValue(mockStats);

      const result = await userService.getUserStats('user-1');

      expect(result.snippetCount).toBe(5);
      expect(result.challengesSolved).toBe(3);
    });
  });

  describe('getLeaderboard', () => {
    it('should return leaderboard entries', async () => {
      const leaderboard = [
        { userId: 'user-1', _sum: { score: 100 }, user: { username: 'testuser', avatar: null }, totalScore: 100 },
      ];
      (mockRepo.getLeaderboard as jest.Mock).mockResolvedValue(leaderboard);

      const result = await userService.getLeaderboard(10);

      expect(result).toHaveLength(1);
      expect(result[0].totalScore).toBe(100);
    });
  });
});
