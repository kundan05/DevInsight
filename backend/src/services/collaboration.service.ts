import { RoomRepository } from '../repositories/RoomRepository';
import logger from '../utils/logger';

interface UserPresence {
  userId: string;
  username: string;
  socketId: string;
  joinedAt: Date;
}

interface RoomState {
  roomId: string;
  documentState: Buffer | null;
  language: string;
  users: Map<string, UserPresence>;
  createdAt: Date;
}

export class CollaborationService {
  private roomRepo: RoomRepository;
  private rooms: Map<string, RoomState>;

  constructor() {
    this.roomRepo = new RoomRepository();
    this.rooms = new Map();
  }

  getRoomState(roomId: string): RoomState | undefined {
    return this.rooms.get(roomId);
  }

  async joinRoom(
    roomId: string,
    userId: string,
    username: string,
    socketId: string,
  ): Promise<{ code: Buffer | null; language: string; activeUsers: UserPresence[] }> {
    let room = this.rooms.get(roomId);

    if (!room) {
      const persisted = await this.roomRepo.findByRoomId(roomId);
      room = {
        roomId,
        documentState: persisted?.documentState
          ? Buffer.from(persisted.documentState, 'base64')
          : null,
        language: persisted?.language ?? 'javascript',
        users: new Map(),
        createdAt: new Date(),
      };
      this.rooms.set(roomId, room);
    }

    room.users.set(socketId, { userId, username, socketId, joinedAt: new Date() });

    await this.roomRepo.upsertRoom(roomId, null, room.language);
    const activeUsers = Array.from(room.users.values());

    return {
      code: room.documentState,
      language: room.language,
      activeUsers,
    };
  }

  leaveRoom(
    roomId: string,
    socketId: string,
  ): { activeUsers: UserPresence[]; isEmpty: boolean } | null {
    const room = this.rooms.get(roomId);
    if (!room) return null;

    room.users.delete(socketId);
    const activeUsers = Array.from(room.users.values());

    const isEmpty = room.users.size === 0;
    if (isEmpty) {
      this.rooms.delete(roomId);
    }

    return { activeUsers, isEmpty };
  }

  updateCode(
    roomId: string,
    update: number[],
    socketId: string,
  ): RoomState | null {
    const room = this.rooms.get(roomId);
    if (!room) return null;

    if (!room.documentState) {
      room.documentState = Buffer.from(update);
    } else {
      room.documentState = Buffer.from(update);
    }

    return room;
  }

  updateLanguage(roomId: string, language: string): void {
    const room = this.rooms.get(roomId);
    if (room) {
      room.language = language;
    }
  }

  getOnlineUsers(roomId: string): UserPresence[] {
    const room = this.rooms.get(roomId);
    if (!room) return [];
    return Array.from(room.users.values());
  }

  async persistRoomCode(roomId: string): Promise<void> {
    try {
      const room = this.rooms.get(roomId);
      if (room?.documentState) {
        await this.roomRepo.updateCode(
          roomId,
          room.documentState.toString('base64'),
        );
        logger.info(`Persisted room code for ${roomId}`);
      }
    } catch (error) {
      logger.error(`Failed to persist room code for ${roomId}:`, error);
    }
  }
}
