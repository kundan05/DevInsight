import { Server, Socket } from 'socket.io';
import { CollaborationService } from '../services/collaboration.service';
import { AuthenticatedSocket } from './index';
import logger from '../utils/logger';

const collaborationService = new CollaborationService();

interface JoinRoomPayload {
  roomId: string;
}

interface CodeUpdatePayload {
  roomId: string;
  update: number[];
}

interface CursorMovePayload {
  roomId: string;
  position: {
    line: number;
    column: number;
    selectionStart?: { line: number; column: number };
    selectionEnd?: { line: number; column: number };
  };
}

interface TerminalPayload {
  roomId: string;
  data: string;
}

export const registerCollaborationHandlers = (io: Server, socket: Socket): void => {
  const user: AuthenticatedSocket = (socket as any).data.user;

  socket.on('room:join', async (payload: JoinRoomPayload) => {
    try {
      const { roomId } = payload;
      const username = user.username;

      await socket.join(roomId);
      const roomState = await collaborationService.joinRoom(
        roomId, user.userId, username, socket.id,
      );

      socket.emit('room:joined', {
        roomId,
        code: roomState.code,
        language: roomState.language,
        users: roomState.activeUsers,
      });

      socket.to(roomId).emit('room:user-joined', {
        userId: user.userId,
        username,
        activeUsers: roomState.activeUsers,
      });

      logger.info(`User ${username} joined room ${roomId}`);
    } catch (error) {
      logger.error('room:join error:', error);
      socket.emit('room:error', { message: 'Failed to join room' });
    }
  });

  socket.on('room:leave', async (payload: JoinRoomPayload) => {
    try {
      const { roomId } = payload;
      const result = collaborationService.leaveRoom(roomId, socket.id);

      if (result) {
        socket.to(roomId).emit('room:user-left', {
          userId: user.userId,
          username: user.username,
          activeUsers: result.activeUsers,
        });

        if (result.isEmpty) {
          await collaborationService.persistRoomCode(roomId);
        }
      }

      socket.leave(roomId);
      logger.info(`User ${user.username} left room ${roomId}`);
    } catch (error) {
      logger.error('room:leave error:', error);
    }
  });

  socket.on('code:update', (payload: CodeUpdatePayload) => {
    try {
      const { roomId, update } = payload;
      collaborationService.updateCode(roomId, update, socket.id);

      socket.to(roomId).emit('code:sync', {
        userId: user.userId,
        update,
      });
    } catch (error) {
      logger.error('code:update error:', error);
    }
  });

  socket.on('cursor:move', (payload: CursorMovePayload) => {
    try {
      const { roomId, position } = payload;

      socket.to(roomId).emit('cursor:update', {
        userId: user.userId,
        username: user.username,
        position,
      });
    } catch (error) {
      logger.error('cursor:move error:', error);
    }
  });

  socket.on('terminal:output', (payload: TerminalPayload) => {
    try {
      const { roomId, data } = payload;
      socket.to(roomId).emit('terminal:output', {
        userId: user.userId,
        data,
      });
    } catch (error) {
      logger.error('terminal:output error:', error);
    }
  });

  socket.on('language:change', (payload: { roomId: string; language: string }) => {
    try {
      const { roomId, language } = payload;
      collaborationService.updateLanguage(roomId, language);
      socket.to(roomId).emit('language:updated', {
        userId: user.userId,
        language,
      });
    } catch (error) {
      logger.error('language:change error:', error);
    }
  });

  socket.on('disconnecting', async () => {
    try {
      const rooms = Array.from(socket.rooms);
      for (const room of rooms) {
        if (room === socket.id) continue;
        const result = collaborationService.leaveRoom(room, socket.id);
        if (result) {
          socket.to(room).emit('room:user-left', {
            userId: user.userId,
            username: user.username,
            activeUsers: result.activeUsers,
          });
          if (result.isEmpty) {
            await collaborationService.persistRoomCode(room);
          }
        }
      }
    } catch (error) {
      logger.error('disconnecting cleanup error:', error);
    }
  });
};
