import { BaseRepository } from './BaseRepository';
import { Prisma } from '@prisma/client';

type Collaboration = any;
type CreateCollaborationInput = Prisma.CollaborationCreateInput;
type UpdateCollaborationInput = Prisma.CollaborationUpdateInput;

export class RoomRepository extends BaseRepository<Collaboration, CreateCollaborationInput, UpdateCollaborationInput> {
  protected get model() {
    return this.prisma.collaboration;
  }

  protected getEntityName(): string {
    return 'Collaboration';
  }

  async findByRoomId(roomId: string): Promise<Collaboration | null> {
    return this.model.findUnique({ where: { roomId } });
  }

  async upsertRoom(
    roomId: string,
    documentState: Buffer | null,
    language: string,
  ): Promise<Collaboration> {
    const existing = await this.findByRoomId(roomId);
    if (existing) {
      return this.model.update({
        where: { roomId },
        data: {
          activeUsers: Array.from(
            // approximated; actual count maintained in-memory
            { length: (existing as any).activeUsers || 0 },
            () => 1,
          ).length,
        },
      });
    }
    return this.model.create({
      data: {
        roomId,
        code: '',
        language,
        documentState: documentState?.toString('base64') ?? null,
      },
    });
  }

  async updateCode(
    roomId: string,
    documentState: string,
  ): Promise<Collaboration> {
    return this.model.update({
      where: { roomId },
      data: { documentState },
    });
  }

  async incrementActiveUsers(roomId: string): Promise<void> {
    await this.model.update({
      where: { roomId },
      data: { activeUsers: { increment: 1 } },
    });
  }

  async decrementActiveUsers(roomId: string): Promise<void> {
    await this.model.update({
      where: { roomId },
      data: { activeUsers: { decrement: 1 } },
    });
  }
}
