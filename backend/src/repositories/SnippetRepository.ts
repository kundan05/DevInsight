import { Prisma } from '@prisma/client';
import { BaseRepository, PaginationParams, PaginatedResult } from './BaseRepository';
import { ValidationError } from '../errors/AppError';

type Snippet = any;
type CreateSnippetInput = Prisma.SnippetCreateInput;
type UpdateSnippetInput = Prisma.SnippetUpdateInput;

interface SnippetFilter extends PaginationParams {
  language?: string;
  tag?: string;
  authorId?: string;
  search?: string;
  isPublic?: boolean;
}

export class SnippetRepository extends BaseRepository<Snippet, CreateSnippetInput, UpdateSnippetInput> {
  protected get model() {
    return this.prisma.snippet;
  }

  protected getEntityName(): string {
    return 'Snippet';
  }

  async findWithFilters(filters: SnippetFilter): Promise<PaginatedResult<Snippet>> {
    const { language, tag, authorId, search, page = 1, limit = 10 } = filters;

    const where: any = {};
    if (authorId) {
      where.isPublic = true;
      where.authorId = authorId;
    } else {
      where.isPublic = true;
    }

    if (language) where.language = language;
    if (authorId) where.authorId = authorId;
    if (tag) where.tags = { hasSome: [tag] };
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
      include: {
        author: {
          select: { id: true, username: true, avatar: true },
        },
        _count: {
          select: { likes: true, comments: true },
        },
      },
    });
  }

  async findByIdWithDetails(id: string) {
    return this.model.findUnique({
      where: { id },
      include: {
        author: {
          select: { id: true, username: true, avatar: true },
        },
        comments: {
          include: {
            author: { select: { id: true, username: true, avatar: true } },
          },
          orderBy: { createdAt: 'desc' },
        },
        _count: {
          select: { likes: true },
        },
      },
    });
  }

  async incrementViewCount(id: string): Promise<void> {
    await this.model.update({
      where: { id },
      data: { viewCount: { increment: 1 } },
    }).catch(() => { });
  }

  async toggleLike(snippetId: string, userId: string): Promise<boolean> {
    const existingLike = await this.prisma.like.findUnique({
      where: { userId_snippetId: { userId, snippetId } },
    });

    if (existingLike) {
      await this.prisma.like.delete({
        where: { userId_snippetId: { userId, snippetId } },
      });
      return false;
    }

    await this.prisma.like.create({
      data: { userId, snippetId },
    });
    return true;
  }

  async addComment(snippetId: string, userId: string, content: string) {
    if (!content?.trim()) {
      throw new ValidationError('Content is required');
    }

    return this.prisma.comment.create({
      data: {
        content,
        snippetId,
        authorId: userId,
      },
      include: {
        author: {
          select: { id: true, username: true, avatar: true },
        },
      },
    });
  }

  parseTags(snippet: any): any {
    if (!snippet) return snippet;
    return {
      ...snippet,
      tags: Array.isArray(snippet.tags) ? snippet.tags : this.safeJsonParse(snippet.tags, []),
    };
  }

  parseTagsBulk(snippets: any[]): any[] {
    return snippets.map(s => this.parseTags(s));
  }

  private safeJsonParse(value: string, fallback: any): any {
    try {
      return JSON.parse(value);
    } catch {
      return fallback;
    }
  }
}
