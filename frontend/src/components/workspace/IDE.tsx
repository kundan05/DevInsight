import React, { useState, useCallback, useEffect, useRef } from 'react';
import {
  Panel,
  PanelGroup,
  PanelResizeHandle,
} from 'react-resizable-panels';
import MonacoEditor from '@monaco-editor/react';
import { useParams } from 'react-router-dom';
import { useSelector } from 'react-redux';
import { RootState } from '../../store';
import { useCollaboration } from '../../contexts/CollaborationProvider';
import { RemoteCursor } from '../../types';
import Terminal from './Terminal';
import VideoBubble from './VideoBubble';

const LANGUAGES = [
  'javascript', 'typescript', 'python', 'java',
  'cpp', 'go', 'rust', 'html', 'css',
];

interface RemoteCursorDecoration {
  userId: string;
  username: string;
  color: string;
  line: number;
}

const CursorOverlay: React.FC<{ cursors: RemoteCursor[] }> = ({ cursors }) => {
  const active = cursors.filter((c) => c.position);
  if (active.length === 0) return null;

  return (
    <div className="pointer-events-none absolute inset-0 z-10">
      {active.map((cursor) => (
        <div
          key={cursor.userId}
          className="absolute flex items-center gap-1 transition-all duration-100"
          style={{
            left: `${(cursor.position?.column || 0) * 8.5}px`,
            top: `${((cursor.position?.line || 1) - 1) * 20 + 4}px`,
          }}
        >
          <svg width="10" height="14" viewBox="0 0 10 14" fill={cursor.color}>
            <path d="M0 0 L10 6 L6 6 L10 14 L4 8 L0 8 Z" />
          </svg>
          <span
            className="text-[10px] font-mono px-1 py-0.5 rounded-sm whitespace-nowrap leading-none"
            style={{ backgroundColor: cursor.color, color: '#0d0f1a' }}
          >
            {cursor.username}
          </span>
        </div>
      ))}
    </div>
  );
};

const IDE: React.FC = () => {
  const { roomId: paramRoomId } = useParams<{ roomId: string }>();
  const { user, token } = useSelector((state: RootState) => state.auth);

  const {
    connected,
    users,
    language,
    roomId,
    joinRoom,
    leaveRoom,
    bindEditor,
    setLanguage,
  } = useCollaboration();

  const [code, setCode] = useState('// Start coding here...\n');
  const [showVideo, setShowVideo] = useState(false);
  const editorRef = useRef<any>(null);

  useEffect(() => {
    if (!token) return;

    const targetRoom = paramRoomId || `room-${Date.now()}`;
    joinRoom(targetRoom);

    return () => {
      leaveRoom();
    };
  }, [paramRoomId, token]);

  const handleEditorMount = useCallback(
    (editor: any, monaco: any) => {
      editorRef.current = editor;

      monaco.editor.defineTheme('devinsight', {
        base: 'vs-dark',
        inherit: true,
        rules: [
          { token: 'comment', foreground: '5C6370' },
          { token: 'keyword', foreground: 'C678DD' },
          { token: 'string', foreground: '98C379' },
          { token: 'number', foreground: 'D19A66' },
          { token: 'function', foreground: '61AFEF' },
          { token: 'type', foreground: 'E5C07B' },
        ],
        colors: {
          'editor.background': '#0d0f1a',
          'editor.foreground': '#abb2bf',
          'editor.lineHighlightBackground': '#1e2030',
          'editor.selectionBackground': '#3e4452',
          'editorCursor.foreground': '#5B8DEC',
          'editorLineNumber.foreground': '#3b4055',
          'editorLineNumber.activeForeground': '#636d8e',
        },
      });
      monaco.editor.setTheme('devinsight');

      if (roomId && token) {
        try {
          bindEditor(editor);
        } catch {
          // Yjs provider not yet ready; editor works standalone
        }
      }
    },
    [roomId, token, bindEditor],
  );

  const handleLanguageChange = useCallback(
    (e: React.ChangeEvent<HTMLSelectElement>) => {
      setLanguage(e.target.value);
    },
    [setLanguage],
  );

  const handleCodeChange = useCallback(
    (value: string | undefined) => {
      if (value !== undefined) {
        setCode(value);
      }
    },
    [],
  );

  return (
    <div className="h-screen w-full bg-[#0d0f1a] flex flex-col">
      <header className="flex items-center justify-between px-4 py-2 bg-[#141620] border-b border-[#25283b] flex-shrink-0">
        <div className="flex items-center gap-3">
          <div className="flex items-center gap-2">
            <div
              className={`w-2 h-2 rounded-full ${
                connected ? 'bg-green-500' : 'bg-red-500'
              }`}
            />
            <span className="text-xs text-text-muted font-mono">
              {connected ? 'Connected' : 'Disconnected'}
            </span>
          </div>
          <select
            value={language}
            onChange={handleLanguageChange}
            className="bg-[#1e2030] text-text-primary text-xs border border-[#25283b] rounded px-2 py-1 focus:outline-none focus:border-accent-copper"
          >
            {LANGUAGES.map((lang) => (
              <option key={lang} value={lang}>
                {lang.charAt(0).toUpperCase() + lang.slice(1)}
              </option>
            ))}
          </select>
        </div>

        <div className="flex items-center gap-2">
          {users.slice(0, 5).map((u) => (
            <div
              key={u.userId}
              className="w-6 h-6 rounded-full flex items-center justify-center text-[10px] font-bold"
              style={{ backgroundColor: u.color, color: '#0d0f1a' }}
              title={u.username}
            >
              {u.username.charAt(0).toUpperCase()}
            </div>
          ))}
          {users.length > 5 && (
            <span className="text-xs text-text-muted font-mono">
              +{users.length - 5}
            </span>
          )}
        </div>
      </header>

      <PanelGroup direction="horizontal" className="flex-1">
        <Panel defaultSize={25} minSize={15} maxSize={40}>
          <div className="h-full bg-[#141620] border-r border-[#25283b] p-4 overflow-y-auto">
            <h2 className="text-sm font-semibold text-text-primary mb-4 font-mono">
              Challenge
            </h2>
            <div className="prose prose-invert prose-sm max-w-none text-text-muted">
              <p className="text-sm leading-relaxed">
                Solve the coding challenge below. Write a function that meets
                the specified requirements and passes all test cases.
              </p>
            </div>
          </div>
        </Panel>

        <PanelResizeHandle className="w-1 bg-[#25283b] hover:bg-accent-copper/50 transition-colors cursor-col-resize" />

        <Panel defaultSize={50} minSize={30}>
          <div className="h-full relative">
            <CursorOverlay cursors={users} />
            <MonacoEditor
              height="100%"
              language={language}
              value={code}
              theme="devinsight"
              onChange={handleCodeChange}
              onMount={handleEditorMount}
              options={{
                minimap: { enabled: false },
                scrollBeyondLastLine: false,
                fontSize: 14,
                fontFamily: '"JetBrains Mono", "Fira Code", monospace',
                fontLigatures: true,
                lineNumbers: 'on',
                renderLineHighlight: 'all',
                padding: { top: 16, bottom: 16 },
                automaticLayout: true,
                cursorBlinking: 'smooth',
                cursorSmoothCaretAnimation: 'on',
                smoothScrolling: true,
                bracketPairColorization: { enabled: true },
                guides: { bracketPairs: true },
              }}
            />
          </div>
        </Panel>

        <PanelResizeHandle className="w-1 bg-[#25283b] hover:bg-accent-copper/50 transition-colors cursor-col-resize" />

        <Panel defaultSize={25} minSize={15} maxSize={40}>
          <PanelGroup direction="vertical">
            <Panel defaultSize={60} minSize={30}>
              <Terminal />
            </Panel>
            <PanelResizeHandle className="h-1 bg-[#25283b] hover:bg-accent-copper/50 transition-colors cursor-row-resize" />
            <Panel defaultSize={40} minSize={20}>
              <div className="h-full bg-[#141620] p-4 overflow-y-auto">
                <h3 className="text-xs font-semibold text-text-muted font-mono mb-3 uppercase tracking-wider">
                  Test Results
                </h3>
                <div className="text-xs text-text-muted font-mono space-y-2">
                  <div className="flex items-center gap-2">
                    <span className="w-2 h-2 rounded-full bg-status-success" />
                    <span>Test case 1: Passed (2.3ms)</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <span className="w-2 h-2 rounded-full bg-status-success" />
                    <span>Test case 2: Passed (1.1ms)</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <span className="w-2 h-2 rounded-full bg-status-danger" />
                    <span>Test case 3: Failed</span>
                  </div>
                </div>
              </div>
            </Panel>
          </PanelGroup>
        </Panel>
      </PanelGroup>

      {showVideo && <VideoBubble />}

      <button
        onClick={() => setShowVideo(!showVideo)}
        className="fixed bottom-6 right-6 w-12 h-12 rounded-full bg-accent-copper flex items-center justify-center shadow-lg hover:bg-accent-copper-dim transition-colors z-50"
      >
        <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="#0d0f1a" strokeWidth="2">
          <path d="M23 7l-7 5 7 5V7z" />
          <rect x="1" y="5" width="15" height="14" rx="2" ry="2" />
        </svg>
      </button>
    </div>
  );
};

export default IDE;
