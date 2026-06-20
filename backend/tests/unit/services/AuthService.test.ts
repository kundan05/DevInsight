jest.mock('../../../src/repositories/UserRepository');
jest.mock('../../../src/utils/password');
jest.mock('../../../src/utils/jwt');
jest.mock('../../../src/config/database');

import { AuthService } from '../../../src/services/auth.service';
import { UserRepository } from '../../../src/repositories/UserRepository';
import { hashPassword, comparePassword } from '../../../src/utils/password';
import { generateTokenPair } from '../../../src/utils/jwt';
import { AuthError, ConflictError } from '../../../src/errors/AppError';

const MockUserRepo = UserRepository as jest.MockedClass<typeof UserRepository>;
const mockHashPassword = hashPassword as jest.MockedFunction<typeof hashPassword>;
const mockComparePassword = comparePassword as jest.MockedFunction<typeof comparePassword>;
const mockGenerateTokenPair = generateTokenPair as jest.MockedFunction<typeof generateTokenPair>;

describe('AuthService', () => {
  let authService: AuthService;
  let mockRepo: jest.Mocked<UserRepository>;

  beforeEach(() => {
    MockUserRepo.mockClear();
    authService = new AuthService();
    mockRepo = (authService as any).userRepo;
  });

  describe('register', () => {
    const registerData = {
      email: 'test@test.com',
      username: 'testuser',
      password: 'Password123',
    };

    it('should register a new user', async () => {
      mockRepo.assertEmailOrUsernameUnique.mockResolvedValue();
      mockHashPassword.mockResolvedValue('hashedPass123');
      mockRepo.create.mockResolvedValue({
        id: 'user-1',
        email: 'test@test.com',
        username: 'testuser',
        role: 'USER',
        password: 'hashedPass123',
      });
      mockGenerateTokenPair.mockResolvedValue({
        accessToken: 'access-token',
        refreshToken: 'refresh-token',
      });

      const result = await authService.register(registerData);

      expect(result.user.email).toBe('test@test.com');
      expect(result.accessToken).toBe('access-token');
      expect(mockRepo.assertEmailOrUsernameUnique).toHaveBeenCalledWith('test@test.com', 'testuser');
    });

    it('should throw ConflictError on duplicate email', async () => {
      mockRepo.assertEmailOrUsernameUnique.mockRejectedValue(
        new ConflictError('Email already exists')
      );

      await expect(authService.register(registerData)).rejects.toThrow(ConflictError);
    });
  });

  describe('login', () => {
    it('should login with valid credentials', async () => {
      mockRepo.findByEmail.mockResolvedValue({
        id: 'user-1',
        email: 'test@test.com',
        username: 'testuser',
        password: 'hashedPass123',
        role: 'USER',
        avatar: null,
      });
      mockComparePassword.mockResolvedValue(true);
      mockGenerateTokenPair.mockResolvedValue({
        accessToken: 'access-token',
        refreshToken: 'refresh-token',
      });

      const result = await authService.login('test@test.com', 'Password123');

      expect(result.user.email).toBe('test@test.com');
      expect(result.accessToken).toBe('access-token');
    });

    it('should throw AuthError with invalid password', async () => {
      mockRepo.findByEmail.mockResolvedValue({
        id: 'user-1',
        email: 'test@test.com',
        username: 'testuser',
        password: 'hashedPass123',
        role: 'USER',
      });
      mockComparePassword.mockResolvedValue(false);

      await expect(authService.login('test@test.com', 'wrong')).rejects.toThrow(AuthError);
    });

    it('should throw AuthError for non-existent user', async () => {
      mockRepo.findByEmail.mockResolvedValue(null);

      await expect(authService.login('nonexistent@test.com', 'pass')).rejects.toThrow(AuthError);
    });
  });
});
