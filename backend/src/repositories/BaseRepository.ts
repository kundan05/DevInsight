import { PrismaClient, Prisma } from '@prisma/client';
import { getPrismaClient } from '../config/database';
import { NotFoundError } from '../errors/AppError';

export interface PaginationParams {
  page?: number;
  limit?: number;
  sortBy?: string;
  sortOrder?: 'asc' | 'desc';
}

export interface PaginatedResult<T> {
  data: T[];
  pagination: {
    page: number;
    limit: number;
    total: number;
    totalPages: number;
  };
}

export abstract class BaseRepository<T, CreateInput, UpdateInput> {
  protected prisma: PrismaClient;

  constructor() {
    this.prisma = getPrismaClient();
  }

  protected abstract get model(): any;

  async findById(id: string, include?: Prisma.SelectSubset<object, any>): Promise<T | null> {
    return this.model.findUnique({
      where: { id } as any,
      include,
    }) as Promise<T | null>;
  }

  async findByIdOrThrow(id: string, include?: Prisma.SelectSubset<object, any>): Promise<T> {
    const entity = await this.findById(id, include);
    if (!entity) {
      throw new NotFoundError(this.getEntityName());
    }
    return entity;
  }

  async findMany(params?: {
    where?: any;
    include?: any;
    orderBy?: any;
    skip?: number;
    take?: number;
  }): Promise<T[]> {
    return this.model.findMany(params) as Promise<T[]>;
  }

  async findWithPagination(
    params: PaginationParams & { where?: any; include?: any; select?: any; orderBy?: any },
  ): Promise<PaginatedResult<T>> {
    const { page = 1, limit = 10, where, include, select, orderBy } = params;
    const skip = (page - 1) * limit;

    const [data, total] = await Promise.all([
      this.model.findMany({
        where,
        include,
        select,
        skip,
        take: limit,
        orderBy: orderBy || { createdAt: 'desc' },
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

  async create(data: CreateInput): Promise<T> {
    return this.model.create({ data }) as Promise<T>;
  }

  async update(id: string, data: UpdateInput): Promise<T> {
    const entity = await this.findById(id);
    if (!entity) {
      throw new NotFoundError(this.getEntityName());
    }
    return this.model.update({
      where: { id } as any,
      data,
    }) as Promise<T>;
  }

  async delete(id: string): Promise<void> {
    const entity = await this.findById(id);
    if (!entity) {
      throw new NotFoundError(this.getEntityName());
    }
    await this.model.delete({ where: { id } as any });
  }

  async count(where?: any): Promise<number> {
    return this.model.count({ where });
  }

  async exists(where: any): Promise<boolean> {
    const count = await this.model.count({ where });
    return count > 0;
  }

  protected abstract getEntityName(): string;

  async executeInTransaction<T>(fn: (prisma: any) => Promise<T>): Promise<T> {
    return this.prisma.$transaction(fn);
  }
}
