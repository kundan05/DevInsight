import React from 'react';
import Editor from '@monaco-editor/react';

interface CodeEditorProps {
    code: string;
    language: string;
    onChange?: (value: string | undefined) => void;
    readOnly?: boolean;
}

const CodeEditor: React.FC<CodeEditorProps> = ({ code, language, onChange, readOnly = false }) => {
    return (
        <div className="h-[500px] border border-gray-300 dark:border-gray-700 rounded-md overflow-hidden">
            <Editor
                height="100%"
                language={language}
                value={code}
                theme="vs-dark"
                onChange={onChange}
                options={{
                    readOnly,
                    minimap: { enabled: false },
                    scrollBeyondLastLine: false,
                    fontSize: 14,
                    automaticLayout: true,
                }}
            />
        </div>
    );
};

export default CodeEditor;
