import { io, Socket } from 'socket.io-client';

class SocketService {
    public socket: Socket | null = null;

    connect(token: string) {
        if (this.socket) return;

        this.socket = io(process.env.REACT_APP_WS_URL || 'http://localhost:5000', {
            auth: { token },
            transports: ['websocket'],
        });

        this.socket.on('connect', () => {
            console.log('Socket connected');
        });

        this.socket.on('disconnect', () => {
            console.log('Socket disconnected');
        });
    }

    disconnect() {
        if (this.socket) {
            this.socket.disconnect();
            this.socket = null;
        }
    }

    joinRoom(snippetId: string) {
        this.socket?.emit('join-room', { snippetId });
    }

    leaveRoom(snippetId: string) {
        this.socket?.emit('leave-room', { snippetId });
    }

    emitCodeChange(snippetId: string, code: string, cursorPosition: any) {
        this.socket?.emit('code-change', { snippetId, code, cursorPosition });
    }

    onCodeUpdate(callback: (data: any) => void) {
        this.socket?.on('code-update', callback);
    }

    onUserJoined(callback: (data: any) => void) {
        this.socket?.on('user-joined', callback);
    }

    onUserLeft(callback: (data: any) => void) {
        this.socket?.on('user-left', callback);
    }

    off(event: string) {
        this.socket?.off(event);
    }
}

export default new SocketService();
