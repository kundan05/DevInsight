import { Server, Socket } from 'socket.io';
import { AuthenticatedSocket } from './index';
import logger from '../utils/logger';

interface SignalPayload {
  roomId: string;
  signal: any;
  destinationUserId?: string;
}

export const registerWebRtcHandlers = (io: Server, socket: Socket): void => {
  const user: AuthenticatedSocket = (socket as any).data.user;

  socket.on('voice-video:signal', (payload: SignalPayload) => {
    try {
      const { roomId, signal, destinationUserId } = payload;

      if (destinationUserId) {
        io.to(destinationUserId).emit('voice-video:signal', {
          userId: user.userId,
          username: user.username,
          signal,
        });
      } else {
        socket.to(roomId).emit('voice-video:signal', {
          userId: user.userId,
          username: user.username,
          signal,
        });
      }
    } catch (error) {
      logger.error('voice-video:signal error:', error);
    }
  });

  socket.on('voice-video:join', (payload: { roomId: string }) => {
    try {
      const { roomId } = payload;
      socket.to(roomId).emit('voice-video:user-joined', {
        userId: user.userId,
        username: user.username,
      });
      logger.info(`User ${user.username} joined voice/video in room ${roomId}`);
    } catch (error) {
      logger.error('voice-video:join error:', error);
    }
  });

  socket.on('voice-video:leave', (payload: { roomId: string }) => {
    try {
      const { roomId } = payload;
      socket.to(roomId).emit('voice-video:user-left', {
        userId: user.userId,
        username: user.username,
      });
    } catch (error) {
      logger.error('voice-video:leave error:', error);
    }
  });

  socket.on('voice-video:media-state', (payload: {
    roomId: string;
    mediaType: 'audio' | 'video';
    enabled: boolean;
  }) => {
    try {
      const { roomId, mediaType, enabled } = payload;
      socket.to(roomId).emit('voice-video:media-state', {
        userId: user.userId,
        username: user.username,
        mediaType,
        enabled,
      });
    } catch (error) {
      logger.error('voice-video:media-state error:', error);
    }
  });
};
