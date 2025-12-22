import { Server, Socket } from 'socket.io';
import prisma from '../config/database';

export default (io: Server, socket: Socket) => {
    // Join collaboration room
    socket.on('join-room', async (data: { snippetId: string }) => {
        const { snippetId } = data;
        // const userId = socket.data.user.userId;

        socket.join(snippetId);

        // In a real app we might verify permissions here

        // Create collaboration record
        // await prisma.collaboration.create({
        //   data: {
        //     snippetId,
        //     userId,
        //     sessionId: socket.id,
        //   },
        // });

        // Get active users in room (simplified for now without DB)
        // const activeUsers = await prisma.collaboration.findMany({
        //   where: { snippetId, isActive: true },
        //   include: { user: { select: { id: true, username: true, avatar: true } } },
        // });

        // Mock active users for now
        const activeUsers: any[] = [];

        // Notify others
        socket.to(snippetId).emit('user-joined', {
            //   user: socket.data.user,
            //   activeUsers,
            userId: socket.id // simplified
        });

        socket.emit('room-joined', { activeUsers });
    });

    // Leave collaboration room
    socket.on('leave-room', async (data: { snippetId: string }) => {
        const { snippetId } = data;

        // await prisma.collaboration.updateMany({
        //   where: { sessionId: socket.id },
        //   data: { isActive: false, leftAt: new Date() },
        // });

        socket.to(snippetId).emit('user-left', {
            //   userId: socket.data.user.userId,
            userId: socket.id
        });

        socket.leave(snippetId);
    });

    // Code change
    socket.on('code-change', (data: { snippetId: string; code: string; cursorPosition: any }) => {
        socket.to(data.snippetId).emit('code-update', {
            //   userId: socket.data.user.userId,
            userId: socket.id,
            code: data.code,
            cursorPosition: data.cursorPosition,
        });
    });

    // Cursor position
    socket.on('cursor-position', (data: { snippetId: string; position: any }) => {
        socket.to(data.snippetId).emit('cursor-update', {
            //   userId: socket.data.user.userId,
            userId: socket.id,
            position: data.position,
        });
    });
};
