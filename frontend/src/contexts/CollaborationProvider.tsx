import React, {
  createContext,
  useContext,
  useCallback,
  useRef,
  useState,
  useEffect,
} from 'react';
import * as Y from 'yjs';
import { WebsocketProvider } from 'y-websocket';
import { MonacoBinding } from 'y-monaco';
import { editor } from 'monaco-editor';
import { io, Socket } from 'socket.io-client';
import { useSelector } from 'react-redux';
import { RootState } from '../store';
import { RemoteCursor, CursorPosition } from '../types';

const WS_URL = process.env.REACT_APP_WS_URL || 'http://localhost:5000';

const USER_COLORS = [
  '#5B8DEC',
  '#E66A6A',
  '#7FB87A',
  '#E8A87C',
  '#C39BD3',
  '#76D7C4',
  '#F7DC6F',
  '#85C1E9',
];

interface CollaborationContextValue {
  connected: boolean;
  users: RemoteCursor[];
  language: string;
  roomId: string | null;
  joinRoom: (roomId: string) => void;
  leaveRoom: () => void;
  bindEditor: (editor: editor.IStandaloneCodeEditor) => void;
  unbindEditor: () => void;
  setLanguage: (lang: string) => void;
  emitTerminalOutput: (data: string) => void;
  sendWebRtcSignal: (signal: any, destinationUserId?: string) => void;
  joinVoiceVideo: () => void;
  leaveVoiceVideo: () => void;
}

const CollaborationContext = createContext<CollaborationContextValue | null>(null);

export const useCollaboration = () => {
  const ctx = useContext(CollaborationContext);
  if (!ctx) {
    throw new Error('useCollaboration must be used within CollaborationProvider');
  }
  return ctx;
};

interface Props {
  children: React.ReactNode;
}

export const CollaborationProvider: React.FC<Props> = ({ children }) => {
  const { token, isAuthenticated } = useSelector((state: RootState) => state.auth);

  const [connected, setConnected] = useState(false);
  const [users, setUsers] = useState<RemoteCursor[]>([]);
  const [language, setLanguageState] = useState('javascript');
  const [roomId, setRoomId] = useState<string | null>(null);

  const socketRef = useRef<Socket | null>(null);
  const ydocRef = useRef<Y.Doc | null>(null);
  const providerRef = useRef<WebsocketProvider | null>(null);
  const bindingRef = useRef<MonacoBinding | null>(null);
  const awarenessRef = useRef<any>(null);
  const editorRef = useRef<editor.IStandaloneCodeEditor | null>(null);
  const undoManagerRef = useRef<Y.UndoManager | null>(null);

  useEffect(() => {
    if (!isAuthenticated || !token) return;

    const socket = io(WS_URL, {
      auth: { token },
      transports: ['websocket'],
    });

    socket.on('connect', () => setConnected(true));
    socket.on('disconnect', () => setConnected(false));

    socket.on('room:user-joined', (data) => {
      setUsers((prev) => {
        const exists = prev.find((u) => u.userId === data.userId);
        if (exists) return prev;
        const colorIdx = prev.length % USER_COLORS.length;
        return [
          ...prev,
          {
            userId: data.userId,
            username: data.username,
            position: null,
            color: USER_COLORS[colorIdx],
          },
        ];
      });
    });

    socket.on('room:user-left', (data) => {
      setUsers((prev) => prev.filter((u) => u.userId !== data.userId));
    });

    socket.on('cursor:update', (data) => {
      setUsers((prev) =>
        prev.map((u) =>
          u.userId === data.userId
            ? { ...u, position: data.position as CursorPosition }
            : u,
        ),
      );
    });

    socket.on('language:updated', (data) => {
      setLanguageState(data.language);
    });

    socketRef.current = socket;

    return () => {
      socket.disconnect();
      socketRef.current = null;
    };
  }, [isAuthenticated, token]);

  const joinRoom = useCallback(
    (newRoomId: string) => {
      if (!socketRef.current || !token) return;

      const ydoc = new Y.Doc();
      ydocRef.current = ydoc;

      const provider = new WebsocketProvider(
        WS_URL.replace(/^http/, 'ws'),
        `room-${newRoomId}`,
        ydoc,
      );

      const awareness = provider.awareness;
      awarenessRef.current = awareness;

      awareness.setLocalStateField('user', {
        name: 'Anonymous',
        color: USER_COLORS[0],
      });

      provider.on('status', (event: any) => {
        setConnected(event.status === 'connected');
      });

      providerRef.current = provider;
      setRoomId(newRoomId);

      const ytext = ydoc.getText('code');

      const undoManager = new Y.UndoManager(ytext);
      undoManagerRef.current = undoManager;

      socketRef.current.emit('room:join', { roomId: newRoomId });

      socketRef.current.once('room:joined', (data) => {
        setLanguageState(data.language);
        setUsers(
          (data.users || []).map((u: any, idx: number) => ({
            userId: u.userId,
            username: u.username,
            position: null,
            color: USER_COLORS[idx % USER_COLORS.length],
          })),
        );
      });

      const handleCodeUpdate = (data: any) => {
        socketRef.current?.emit('code:update', {
          roomId: newRoomId,
          update: Array.from(data),
        });
      };

      ytext.observe((event: Y.YTextEvent) => {
        const update = Y.encodeStateAsUpdate(ydoc);
        socketRef.current?.emit('code:update', {
          roomId: newRoomId,
          update: Array.from(update),
        });
      });

      socketRef.current.on('code:sync', (data: any) => {
        const update = new Uint8Array(data.update);
        Y.applyUpdate(ydoc, update);
      });

      awareness.on('change', () => {
        const states = awareness.getStates();
        const remoteUsers: RemoteCursor[] = [];
        states.forEach((state: any, clientId: number) => {
          if (clientId === awareness.clientID) return;
          if (state.cursor) {
            remoteUsers.push({
              userId: String(clientId),
              username: state.user?.name || 'Unknown',
              position: state.cursor as CursorPosition,
              color: state.user?.color || USER_COLORS[0],
            });
          }
        });
        setUsers(remoteUsers);
      });
    },
    [token],
  );

  const leaveRoom = useCallback(() => {
    if (socketRef.current && roomId) {
      socketRef.current.emit('room:leave', { roomId });
    }

    if (bindingRef.current) {
      bindingRef.current.destroy();
      bindingRef.current = null;
    }

    if (providerRef.current) {
      providerRef.current.disconnect();
      providerRef.current.destroy();
      providerRef.current = null;
    }

    if (ydocRef.current) {
      ydocRef.current.destroy();
      ydocRef.current = null;
    }

    undoManagerRef.current = null;
    editorRef.current = null;
    setRoomId(null);
    setUsers([]);
  }, [roomId]);

  const bindEditor = useCallback(
    (editor: editor.IStandaloneCodeEditor) => {
      if (!ydocRef.current || !providerRef.current) return;

      editorRef.current = editor;
      const ytext = ydocRef.current.getText('code');

      const binding = new MonacoBinding(
        ytext,
        editor.getModel()!,
        new Set([editor]),
        providerRef.current.awareness,
      );

      bindingRef.current = binding;

      editor.onDidChangeCursorPosition((e) => {
        const position = e.position;
        providerRef.current?.awareness.setLocalStateField('cursor', {
          line: position.lineNumber,
          column: position.column,
        });

        socketRef.current?.emit('cursor:move', {
          roomId,
          position: {
            line: position.lineNumber,
            column: position.column,
          },
        });
      });

      editor.onDidChangeModelContent(() => {
        if (undoManagerRef.current) {
          undoManagerRef.current.stopCapturing();
        }
      });
    },
    [roomId],
  );

  const unbindEditor = useCallback(() => {
    if (bindingRef.current) {
      bindingRef.current.destroy();
      bindingRef.current = null;
    }
  }, []);

  const setLanguage = useCallback(
    (lang: string) => {
      setLanguageState(lang);
      socketRef.current?.emit('language:change', { roomId, language: lang });
    },
    [roomId],
  );

  const emitTerminalOutput = useCallback(
    (data: string) => {
      socketRef.current?.emit('terminal:output', { roomId, data });
    },
    [roomId],
  );

  const sendWebRtcSignal = useCallback(
    (signal: any, destinationUserId?: string) => {
      socketRef.current?.emit('voice-video:signal', {
        roomId,
        signal,
        destinationUserId,
      });
    },
    [roomId],
  );

  const joinVoiceVideo = useCallback(() => {
    socketRef.current?.emit('voice-video:join', { roomId });
  }, [roomId]);

  const leaveVoiceVideo = useCallback(() => {
    socketRef.current?.emit('voice-video:leave', { roomId });
  }, [roomId]);

  const value: CollaborationContextValue = {
    connected,
    users,
    language,
    roomId,
    joinRoom,
    leaveRoom,
    bindEditor,
    unbindEditor,
    setLanguage,
    emitTerminalOutput,
    sendWebRtcSignal,
    joinVoiceVideo,
    leaveVoiceVideo,
  };

  return (
    <CollaborationContext.Provider value={value}>
      {children}
    </CollaborationContext.Provider>
  );
};
