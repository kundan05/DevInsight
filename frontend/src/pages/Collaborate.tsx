import React, { useEffect, useState, useRef } from 'react';
import { useParams } from 'react-router-dom';
import CodeEditor from '../components/common/CodeEditor';
import { useSocket } from '../hooks/useSocket';
import api from '../services/api';
import { FiUsers } from 'react-icons/fi';

const Collaborate: React.FC = () => {
    const { sessionId } = useParams<{ sessionId: string }>();
    const socket = useSocket();
    const [code, setCode] = useState('');
    const [language, setLanguage] = useState('javascript');
    const [activeUsers, setActiveUsers] = useState<string[]>([]);
    const isRemoteUpdate = useRef(false);

    useEffect(() => {
        const fetchSnippet = async () => {
            try {
                const response = await api.get(`/snippets/${sessionId}`);
                setCode(response.data.snippet.code);
                setLanguage(response.data.snippet.language);
            } catch (err) {
                console.error(err);
            }
        };
        fetchSnippet();
    }, [sessionId]);

    useEffect(() => {
        if (socket.socket?.connected && sessionId) {
            socket.joinRoom(sessionId);
            socket.onCodeUpdate((data) => {
                isRemoteUpdate.current = true;
                setCode(data.code);
                setTimeout(() => { isRemoteUpdate.current = false; }, 100);
            });
            socket.onUserJoined((data) => {
                setActiveUsers((prev) => [...prev, data.userId]);
            });
            socket.onUserLeft((data) => {
                setActiveUsers((prev) => prev.filter((id) => id !== data.userId));
            });
            return () => {
                socket.leaveRoom(sessionId);
                socket.off('code-update');
                socket.off('user-joined');
                socket.off('user-left');
            };
        }
    }, [socket, sessionId]);

    const handleCodeChange = (newCode: string | undefined) => {
        if (newCode !== undefined) {
            setCode(newCode);
            if (!isRemoteUpdate.current && sessionId) {
                socket.emitCodeChange(sessionId, newCode, {});
            }
        }
    };

    return (
        <div className="flex flex-col h-[calc(100vh-8rem)] -mx-4 sm:-mx-6 lg:-mx-8 animate-fade-in">
            <div className="flex items-center justify-between px-6 py-3 border-b border-border bg-deep-surface">
                <div className="flex items-center gap-3">
                    <span className="font-mono text-sm text-text-muted">
                        Session:
                    </span>
                    <span className="text-sm text-text-primary font-mono">
                        {sessionId}
                    </span>
                </div>
                <div className="flex items-center gap-2 text-sm text-text-muted">
                    <FiUsers className="w-4 h-4" />
                    <span>{activeUsers.length + 1} active</span>
                </div>
            </div>
            <div className="flex-1 overflow-hidden">
                <CodeEditor
                    code={code}
                    language={language}
                    onChange={handleCodeChange}
                    showHeader
                    onLanguageChange={setLanguage}
                    height="100%"
                />
            </div>
        </div>
    );
};

export default Collaborate;
