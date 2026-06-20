import React, { useEffect, useRef, useState, useCallback } from 'react';
import { Terminal as XTerm } from 'xterm';
import { FitAddon } from 'xterm-addon-fit';
import { WebLinksAddon } from 'xterm-addon-web-links';
import 'xterm/css/xterm.css';
import { useSocket } from '../../hooks/useSocket';

const Terminal: React.FC = () => {
  const terminalRef = useRef<HTMLDivElement>(null);
  const xtermRef = useRef<XTerm | null>(null);
  const fitAddonRef = useRef<FitAddon | null>(null);
  const [inputBuffer, setInputBuffer] = useState('');
  const socketRef = useRef(useSocket());
  const promptRef = useRef('$ ');

  const writeOutput = useCallback((data: string) => {
    if (xtermRef.current) {
      xtermRef.current.write(data);
    }
  }, []);

  const handleCommand = useCallback(
    (command: string) => {
      const trimmed = command.trim();
      if (!trimmed) {
        writeOutput(`\r\n${promptRef.current}`);
        return;
      }

      writeOutput(`\r\n`);

      if (trimmed === 'clear') {
        xtermRef.current?.clear();
        writeOutput(promptRef.current);
        return;
      }

      if (trimmed === 'help') {
        writeOutput(
          'Available commands:\r\n' +
            '  clear        Clear terminal\r\n' +
            '  run          Execute the current code\r\n' +
            '  submit       Submit solution for evaluation\r\n' +
            '  help         Show this help\r\n',
        );
        writeOutput(`\r\n${promptRef.current}`);
        return;
      }

      writeOutput(
        `Command not found: ${trimmed}\r\n`,
      );
      writeOutput(promptRef.current);
    },
    [writeOutput],
  );

  useEffect(() => {
    if (!terminalRef.current || xtermRef.current) return;

    const term = new XTerm({
      cursorBlink: true,
      cursorStyle: 'block',
      fontSize: 13,
      fontFamily: '"JetBrains Mono", "Fira Code", "Cascadia Code", monospace',
      theme: {
        background: '#0d0f1a',
        foreground: '#abb2bf',
        cursor: '#5B8DEC',
        selectionBackground: '#3e4452',
        black: '#1e2030',
        red: '#e66a6a',
        green: '#7fb87a',
        yellow: '#e8a87c',
        blue: '#5B8DEC',
        magenta: '#c39bd3',
        cyan: '#76d7c4',
        white: '#abb2bf',
        brightBlack: '#3b4055',
        brightRed: '#e66a6a',
        brightGreen: '#7fb87a',
        brightYellow: '#e8a87c',
        brightBlue: '#5B8DEC',
        brightMagenta: '#c39bd3',
        brightCyan: '#76d7c4',
        brightWhite: '#e8ebf0',
      },
      allowTransparency: true,
      allowProposedApi: true,
    });

    const fitAddon = new FitAddon();
    term.loadAddon(fitAddon);
    term.loadAddon(new WebLinksAddon());
    fitAddonRef.current = fitAddon;

    term.open(terminalRef.current);

    const resizeObserver = new ResizeObserver(() => {
      try {
        fitAddon.fit();
      } catch {
        // container may not be mounted
      }
    });
    resizeObserver.observe(terminalRef.current);

    term.write(`\x1b[32mDevInsight Terminal\x1b[0m\r\n`);
    term.write(`Type 'help' for commands\r\n\r\n`);
    term.write(promptRef.current);

    let currentLine = '';

    term.onKey(({ key, domEvent }) => {
      const charCode = domEvent.keyCode;

      if (domEvent.ctrlKey && key === 'c') {
        term.write('^C\r\n');
        currentLine = '';
        term.write(promptRef.current);
        return;
      }

      if (domEvent.ctrlKey && key === 'l') {
        term.clear();
        term.write(promptRef.current);
        return;
      }

      if (charCode === 13) {
        const command = currentLine;
        currentLine = '';
        handleCommand(command);
      } else if (charCode === 8) {
        if (currentLine.length > 0) {
          currentLine = currentLine.slice(0, -1);
          term.write('\b \b');
        }
      } else if (charCode === 9) {
        // Tab completion placeholder
        domEvent.preventDefault();
      } else if (!domEvent.ctrlKey && !domEvent.altKey && key.length === 1) {
        currentLine += key;
        term.write(key);
      }
    });

    xtermRef.current = term;

    setTimeout(() => {
      try {
        fitAddon.fit();
      } catch {
        // noop
      }
    }, 100);

    return () => {
      resizeObserver.disconnect();
      term.dispose();
      xtermRef.current = null;
    };
  }, [handleCommand]);

  useEffect(() => {
    if (!socketRef.current.socket) return;

    const handleOutput = (data: { data: string }) => {
      writeOutput(data.data);
    };

    socketRef.current.socket?.on('terminal:output', handleOutput);

    return () => {
      socketRef.current.socket?.off('terminal:output', handleOutput);
    };
  }, [writeOutput]);

  return (
    <div className="h-full bg-[#0d0f1a] flex flex-col">
      <div className="flex items-center justify-between px-3 py-1.5 bg-[#141620] border-b border-[#25283b] flex-shrink-0">
        <span className="text-xs text-text-muted font-mono">Terminal</span>
        <div className="flex items-center gap-2">
          <span className="text-[10px] text-text-muted/50 font-mono">stdin/stdout</span>
        </div>
      </div>
      <div
        ref={terminalRef}
        className="flex-1 p-1"
        style={{ minHeight: 0 }}
      />
    </div>
  );
};

export default Terminal;
