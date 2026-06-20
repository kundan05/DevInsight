import React from 'react';

interface InputProps extends React.InputHTMLAttributes<HTMLInputElement> {
    label: string;
    error?: string;
}

const Input: React.FC<InputProps> = ({ label, error, className = '', ...props }) => {
    return (
        <div className="space-y-1.5">
            <label className="block text-sm text-text-muted font-medium">{label}</label>
            <input
                {...props}
                className={`input ${error ? '!border-status-danger' : ''} ${className}`}
            />
            {error && (
                <p className="text-xs text-status-danger font-mono">{error}</p>
            )}
        </div>
    );
};

export default Input;
