import { Server } from 'socket.io';
import { verifyAccessToken } from '../utils/jwt';
import { registerCollaborationHandlers } from './collaboration.handler';
import { registerWebRtcHandlers } from './webrtc.handler';
import logger from '../utils/logger';

export interface AuthenticatedSocket {
  userId: string;
  username: string;
  role: string;
}

export const initializeSocketHandlers = (io: Server): void => {
  io.use((socket, next) => {
    const token = socket.handshake.auth.token;
    if (!token) {
      return next(new Error('Authentication required'));
    }
    try {
      const decoded = verifyAccessToken(token);
      (socket as any).data.user = {
        userId: decoded.userId,
        username: decoded.username,
        role: decoded.role,
      } satisfies AuthenticatedSocket;
      next();
    } catch (error) {
      next(new Error('Invalid or expired token'));
    }
  });

  io.on('connection', (socket) => {
    const user: AuthenticatedSocket = (socket as any).data.user;
    logger.info(`User connected: ${user.username} (${socket.id})`);

    registerCollaborationHandlers(io, socket);
    registerWebRtcHandlers(io, socket);

    socket.on('disconnect', () => {
      logger.info(`User disconnected: ${user.username} (${socket.id})`);
    });
  });
};
