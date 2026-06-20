import React from 'react';
import Editor, { OnMount } from '@monaco-editor/react';

interface CodeEditorProps {
    code: string;
    language: string;
    onChange?: (value: string | undefined) => void;
    readOnly?: boolean;
    showHeader?: boolean;
    onLanguageChange?: (language: string) => void;
    height?: string;
}

const LANGUAGES = ['javascript', 'typescript', 'python', 'java', 'cpp', 'html', 'css'];

const CodeEditor: React.FC<CodeEditorProps> = ({
    code,
    language,
    onChange,
    readOnly = false,
    showHeader = false,
    onLanguageChange,
    height,
}) => {
    return (
        <div
            className="border border-border rounded-lg overflow-hidden flex flex-col h-full w-full"
            style={height ? { height } : undefined}
        >
            {showHeader && (
                <div className="flex items-center justify-between px-4 py-2 bg-deep-surface border-b border-border flex-shrink-0">
                    <div className="flex items-center gap-2">
                        {onLanguageChange ? (
                            <select
                                value={language}
                                onChange={(e) => onLanguageChange(e.target.value)}
                                className="bg-deep-elevated text-text-primary text-xs border border-border rounded px-2 py-1 focus:outline-none focus:border-accent-copper select"
                            >
                                {LANGUAGES.map((lang) => (
                                    <option key={lang} value={lang}>
                                        {lang.charAt(0).toUpperCase() + lang.slice(1)}
                                    </option>
                                ))}
                            </select>
                        ) : (
                            <span className="text-xs text-text-muted font-mono uppercase">
                                {language}
                            </span>
                        )}
                    </div>
                </div>
            )}
            <div className="flex-1 min-h-0 relative">
                <Editor
                    height={height || (readOnly ? '100%' : '400px')}
                    language={language}
                    value={code}
                    theme="vs-dark"
                    onChange={onChange}
                    options={{
                        readOnly,
                        minimap: { enabled: false },
                        scrollBeyondLastLine: false,
                        fontSize: 14,
                        fontFamily: '"JetBrains Mono", monospace',
                        fontLigatures: true,
                        lineNumbers: 'on',
                        renderLineHighlight: 'none',
                        padding: { top: 16, bottom: 16 },
                        automaticLayout: true,
                    }}
                />
            </div>
        </div>
    );
};

export default CodeEditor;
