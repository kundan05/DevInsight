jest.mock('../../../src/repositories/SnippetRepository');

import { SnippetService } from '../../../src/services/snippet.service';
import { SnippetRepository } from '../../../src/repositories/SnippetRepository';
import { NotFoundError, ForbiddenError } from '../../../src/errors/AppError';

const MockSnippetRepo = SnippetRepository as jest.MockedClass<typeof SnippetRepository>;

describe('SnippetService', () => {
  let snippetService: SnippetService;
  let mockRepo: jest.Mocked<SnippetRepository>;

  const mockSnippet = {
    id: 'snippet-1',
    title: 'Test Snippet',
    description: 'A test',
    code: 'console.log("hello")',
    language: 'javascript',
    tags: '["test"]',
    isPublic: true,
    authorId: 'user-1',
    viewCount: 0,
    createdAt: new Date(),
    updatedAt: new Date(),
  };

  beforeEach(() => {
    MockSnippetRepo.mockClear();
    snippetService = new SnippetService();
    mockRepo = (snippetService as any).snippetRepo;
  });

  describe('getById', () => {
    it('should return parsed snippet', async () => {
      (mockRepo.findByIdWithDetails as jest.Mock).mockResolvedValue(mockSnippet);
      (mockRepo.parseTags as jest.Mock).mockReturnValue({ ...mockSnippet, tags: ['test'] });

      const result = await snippetService.getById('snippet-1');

      expect(result).toBeDefined();
      expect(result.tags).toEqual(['test']);
    });

    it('should throw NotFoundError for missing snippet', async () => {
      (mockRepo.findByIdWithDetails as jest.Mock).mockResolvedValue(null);

      await expect(snippetService.getById('nonexistent')).rejects.toThrow(NotFoundError);
    });
  });

  describe('create', () => {
    it('should create and return parsed snippet', async () => {
      const createData = {
        title: 'New Snippet',
        description: 'Description',
        code: 'const x = 1;',
        language: 'javascript',
      };

      (mockRepo.create as jest.Mock).mockResolvedValue(mockSnippet);
      (mockRepo.parseTags as jest.Mock).mockReturnValue({ ...mockSnippet, tags: ['test'] });

      const result = await snippetService.create('user-1', createData);

      expect(result).toBeDefined();
      expect(mockRepo.create).toHaveBeenCalled();
    });
  });

  describe('delete', () => {
    it('should delete snippet owned by user', async () => {
      (mockRepo.findById as jest.Mock).mockResolvedValue(mockSnippet);
      (mockRepo.delete as jest.Mock).mockResolvedValue(undefined);

      await snippetService.delete('snippet-1', 'user-1', 'USER');

      expect(mockRepo.delete).toHaveBeenCalledWith('snippet-1');
    });

    it('should throw ForbiddenError for non-owner', async () => {
      (mockRepo.findById as jest.Mock).mockResolvedValue(mockSnippet);

      await expect(snippetService.delete('snippet-1', 'user-2', 'USER')).rejects.toThrow(ForbiddenError);
    });

    it('should allow admin to delete any snippet', async () => {
      (mockRepo.findById as jest.Mock).mockResolvedValue(mockSnippet);
      (mockRepo.delete as jest.Mock).mockResolvedValue(undefined);

      await snippetService.delete('snippet-1', 'user-2', 'ADMIN');

      expect(mockRepo.delete).toHaveBeenCalledWith('snippet-1');
    });

    it('should throw NotFoundError for missing snippet', async () => {
      (mockRepo.findById as jest.Mock).mockResolvedValue(null);

      await expect(snippetService.delete('nonexistent', 'user-1', 'USER')).rejects.toThrow(NotFoundError);
    });
  });

  describe('toggleLike', () => {
    it('should toggle like on existing snippet', async () => {
      (mockRepo.findById as jest.Mock).mockResolvedValue(mockSnippet);
      (mockRepo.toggleLike as jest.Mock).mockResolvedValue(true);

      const result = await snippetService.toggleLike('snippet-1', 'user-1');

      expect(result).toBe(true);
    });

    it('should throw NotFoundError for missing snippet', async () => {
      (mockRepo.findById as jest.Mock).mockResolvedValue(null);

      await expect(snippetService.toggleLike('nonexistent', 'user-1')).rejects.toThrow(NotFoundError);
    });
  });
});
