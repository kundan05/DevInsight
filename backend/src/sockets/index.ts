import { Server } from 'socket.io';
import { verifyAccessToken } from '../utils/jwt';
import collaborationHandler from './collaboration.handler';
import logger from '../utils/logger';

export const initializeSocketHandlers = (io: Server): void => {
    io.use((socket, next) => {
        const token = socket.handshake.auth.token;
        if (!token) {
            return next(new Error('Authentication error'));
        }

        try {
            const decoded = verifyAccessToken(token);
            socket.data.user = decoded;
            next();
        } catch (error) {
            // Allow connection for public features or handle gracefully
            // For now enforcing auth
            next(new Error('Authentication error'));
        }
    });

    io.on('connection', (socket) => {
        logger.info(`User connected: ${socket.data.user?.userId || 'Unknown'}`);

        collaborationHandler(io, socket);

        socket.on('disconnect', () => {
            logger.info(`User disconnected: ${socket.data.user?.userId || 'Unknown'}`);
        });
    });
};
