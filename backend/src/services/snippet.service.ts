import { SnippetRepository } from '../repositories/SnippetRepository';
import { NotFoundError, ForbiddenError } from '../errors/AppError';

export class SnippetService {
  private snippetRepo: SnippetRepository;

  constructor() {
    this.snippetRepo = new SnippetRepository();
  }

  async getAll(filters: {
    language?: string;
    tag?: string;
    authorId?: string;
    search?: string;
    page?: number;
    limit?: number;
  }) {
    const result = await this.snippetRepo.findWithFilters(filters);
    return {
      ...result,
      data: this.snippetRepo.parseTagsBulk(result.data),
    };
  }

  async getById(id: string) {
    const snippet = await this.snippetRepo.findByIdWithDetails(id);
    if (!snippet) {
      throw new NotFoundError('Snippet');
    }

    this.snippetRepo.incrementViewCount(id);
    return this.snippetRepo.parseTags(snippet);
  }

  async create(userId: string, data: {
    title: string;
    description: string;
    code: string;
    language: string;
    tags?: string[];
    isPublic?: boolean;
  }) {
    const snippet = await this.snippetRepo.create({
      title: data.title,
      description: data.description,
      code: data.code,
      language: data.language,
      tags: data.tags || [],
      isPublic: data.isPublic !== undefined ? data.isPublic : true,
      author: { connect: { id: userId } },
    });

    return this.snippetRepo.parseTags(snippet);
  }

  async update(id: string, userId: string, userRole: string, data: {
    title?: string;
    description?: string;
    code?: string;
    language?: string;
    tags?: string[];
    isPublic?: boolean;
  }) {
    const snippet = await this.snippetRepo.findById(id);
    if (!snippet) {
      throw new NotFoundError('Snippet');
    }

    if (snippet.authorId !== userId && userRole !== 'ADMIN') {
      throw new ForbiddenError();
    }

    const updateData: any = { ...data };
    const updated = await this.snippetRepo.update(id, updateData);
    return this.snippetRepo.parseTags(updated);
  }

  async delete(id: string, userId: string, userRole: string) {
    const snippet = await this.snippetRepo.findById(id);
    if (!snippet) {
      throw new NotFoundError('Snippet');
    }

    if (snippet.authorId !== userId && userRole !== 'ADMIN') {
      throw new ForbiddenError();
    }

    await this.snippetRepo.delete(id);
  }

  async toggleLike(snippetId: string, userId: string) {
    const snippet = await this.snippetRepo.findById(snippetId);
    if (!snippet) {
      throw new NotFoundError('Snippet');
    }

    const liked = await this.snippetRepo.toggleLike(snippetId, userId);
    return liked;
  }

  async addComment(snippetId: string, userId: string, content: string) {
    const snippet = await this.snippetRepo.findById(snippetId);
    if (!snippet) {
      throw new NotFoundError('Snippet');
    }

    return this.snippetRepo.addComment(snippetId, userId, content);
  }
}
