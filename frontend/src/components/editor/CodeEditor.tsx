import React, { useState } from 'react';
import Editor, { OnMount } from '@monaco-editor/react';

interface CodeEditorProps {
    value: string;
    language: string;
    onChange: (value: string | undefined) => void;
    theme?: string;
    readOnly?: boolean;
    onLanguageChange?: (language: string) => void;
}

const CodeEditor: React.FC<CodeEditorProps> = ({ value, language, onChange, theme = 'vs-dark', readOnly = false, onLanguageChange }) => {
    const [editorRef, setEditorRef] = useState<any>(null);

    const handleEditorDidMount: OnMount = (editor, monaco) => {
        setEditorRef(editor);
    };

    const languages = ['javascript', 'python', 'java'];

    return (
        <div className="relative h-full flex flex-col">
            <div className="flex justify-between items-center bg-gray-900 p-2 border-b border-gray-700">
                <div className="flex items-center">
                    {onLanguageChange && !readOnly ? (
                        <select
                            value={language}
                            onChange={(e) => onLanguageChange(e.target.value)}
                            className="bg-gray-800 text-gray-300 text-sm border border-gray-600 rounded p-1 ml-2 focus:outline-none focus:border-indigo-500"
                        >
                            {languages.map(lang => (
                                <option key={lang} value={lang}>{lang.toUpperCase()}</option>
                            ))}
                        </select>
                    ) : (
                        <span className="text-gray-400 text-sm ml-2">{language.toUpperCase()}</span>
                    )}
                </div>
            </div>

            <div className="flex-1 w-full h-full relative">
                <Editor
                    height="100%"
                    width="100%"
                    language={language}
                    value={value}
                    theme={theme}
                    onChange={onChange}
                    onMount={handleEditorDidMount}
                    options={{
                        minimap: { enabled: false },
                        fontSize: 14,
                        readOnly,
                        scrollBeyondLastLine: false,
                    }}
                />
            </div>
        </div>
    );
};

export default CodeEditor;
