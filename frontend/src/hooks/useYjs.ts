import { useCallback, useRef, useEffect } from 'react';
import * as Y from 'yjs';
import { WebsocketProvider } from 'y-websocket';
import { MonacoBinding } from 'y-monaco';
import { editor } from 'monaco-editor';

interface UseYjsOptions {
  roomId: string;
  wsUrl: string;
  token: string;
  username: string;
}

interface UseYjsReturn {
  ydoc: Y.Doc;
  ytext: Y.Text;
  provider: WebsocketProvider;
  awareness: any;
  undoManager: Y.UndoManager;
  bindEditor: (editor: editor.IStandaloneCodeEditor) => void;
  unbindEditor: () => void;
  destroy: () => void;
}

export const useYjs = ({
  roomId,
  wsUrl,
  token,
  username,
}: UseYjsOptions): UseYjsReturn => {
  const ydocRef = useRef<Y.Doc>(new Y.Doc());
  const ytextRef = useRef<Y.Text>(ydocRef.current.getText('code'));
  const providerRef = useRef<WebsocketProvider>(
    new WebsocketProvider(
      wsUrl.replace(/^http/, 'ws'),
      `room-${roomId}`,
      ydocRef.current,
      {
        params: { token },
      },
    ),
  );
  const awarenessRef = useRef(providerRef.current.awareness);
  const bindingRef = useRef<MonacoBinding | null>(null);
  const undoManagerRef = useRef<Y.UndoManager>(
    new Y.UndoManager(ytextRef.current),
  );

  useEffect(() => {
    const provider = providerRef.current;
    awarenessRef.current.setLocalStateField('user', {
      name: username,
      color: '#5B8DEC',
    });

    return () => {
      provider.disconnect();
    };
  }, [username]);

  const bindEditorFn = useCallback(
    (editor: editor.IStandaloneCodeEditor) => {
      if (bindingRef.current) {
        bindingRef.current.destroy();
      }

      const binding = new MonacoBinding(
        ytextRef.current,
        editor.getModel()!,
        new Set([editor]),
        awarenessRef.current,
      );
      bindingRef.current = binding;

      editor.onDidChangeCursorPosition((e) => {
        const pos = e.position;
        awarenessRef.current.setLocalStateField('cursor', {
          line: pos.lineNumber,
          column: pos.column,
        });
      });
    },
    [],
  );

  const unbindEditorFn = useCallback(() => {
    if (bindingRef.current) {
      bindingRef.current.destroy();
      bindingRef.current = null;
    }
  }, []);

  const destroy = useCallback(() => {
    unbindEditorFn();
    providerRef.current.disconnect();
    providerRef.current.destroy();
    ydocRef.current.destroy();
  }, [unbindEditorFn]);

  return {
    ydoc: ydocRef.current,
    ytext: ytextRef.current,
    provider: providerRef.current,
    awareness: awarenessRef.current,
    undoManager: undoManagerRef.current,
    bindEditor: bindEditorFn,
    unbindEditor: unbindEditorFn,
    destroy,
  };
};
