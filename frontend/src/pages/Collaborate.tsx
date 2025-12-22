import React, { useEffect, useState, useRef } from 'react';
import { useParams } from 'react-router-dom';
import CodeEditor from '../components/common/CodeEditor';
import { useSocket } from '../hooks/useSocket';
import api from '../services/api';

const Collaborate: React.FC = () => {
    const { sessionId } = useParams<{ sessionId: string }>();
    const socket = useSocket();
    const [code, setCode] = useState('');
    const [language, setLanguage] = useState('javascript'); // Should fetch from snippet
    const [activeUsers, setActiveUsers] = useState<string[]>([]);
    const isRemoteUpdate = useRef(false);

    useEffect(() => {
        // Fetch initial snippet code
        const fetchSnippet = async () => {
            try {
                // For now assuming sessionId is snippetId
                const response = await api.get(`/snippets/${sessionId}`);
                setCode(response.data.snippet.code);
                setLanguage(response.data.snippet.language);
            } catch (err) {
                console.error(err);
            }
        }
        fetchSnippet();
    }, [sessionId]);

    useEffect(() => {
        if (socket.socket?.connected && sessionId) {
            socket.joinRoom(sessionId);

            socket.onCodeUpdate((data) => {
                // Prevent loop
                isRemoteUpdate.current = true;
                setCode(data.code);
                setTimeout(() => isRemoteUpdate.current = false, 100);
            });

            socket.onUserJoined((data) => {
                console.log('User joined', data);
                setActiveUsers(prev => [...prev, data.userId]);
            });

            socket.onUserLeft((data) => {
                setActiveUsers(prev => prev.filter(id => id !== data.userId));
            })

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
        <div className="h-[calc(100vh-100px)] flex flex-col">
            <div className="flex justify-between items-center mb-4 px-4 py-2 bg-white dark:bg-gray-800 shadow rounded">
                <h2 className="text-xl font-bold">Collaborating on Room: {sessionId}</h2>
                <div className="flex items-center space-x-2">
                    <span className="text-sm text-gray-500">Active Users: {activeUsers.length + 1}</span>
                    {/* Self + others */}
                </div>
            </div>
            <div className="flex-1 overflow-hidden p-4">
                <CodeEditor
                    code={code}
                    language={language}
                    onChange={handleCodeChange}
                />
            </div>
        </div>
    );
};

export default Collaborate;
