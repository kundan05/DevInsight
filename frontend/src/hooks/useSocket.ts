import { useEffect, useRef } from 'react';
import { useSelector } from 'react-redux';
import { RootState } from '../store';
import socketService from '../services/socket.service';

export const useSocket = () => {
    const { token, isAuthenticated } = useSelector((state: RootState) => state.auth);
    const connected = useRef(false);

    useEffect(() => {
        if (isAuthenticated && token && !connected.current) {
            socketService.connect(token);
            connected.current = true;
        }

        return () => {
            if (connected.current) {
                // Typically we might not want to disconnect on every unmount if we want persistent connection
                // But for now, we can manage it at the App level or specific features
                // socketService.disconnect(); 
                // connected.current = false;
            }
        };
    }, [isAuthenticated, token]);

    return socketService;
};
