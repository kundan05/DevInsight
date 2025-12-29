import React, { useState } from 'react';

interface OrganicInputProps extends React.InputHTMLAttributes<HTMLInputElement> {
    label: string;
    error?: string;
}

const OrganicInput: React.FC<OrganicInputProps> = ({ label, error, className = '', ...props }) => {
    const [isFocused, setIsFocused] = useState(false);
    const [hasValue, setHasValue] = useState(false);

    return (
        <div className={`relative group mb-6 ${className}`}>
            <input
                {...props}
                className={`w-full bg-organic-sand border-b-2 border-organic-charcoal/20 px-0 py-2 text-organic-charcoal focus:outline-none focus:border-organic-moss transition-colors duration-300 placeholder-transparent ${className}`}
                onFocus={(e) => {
                    setIsFocused(true);
                    props.onFocus?.(e);
                }}
                onBlur={(e) => {
                    setIsFocused(false);
                    setHasValue(e.target.value.length > 0);
                    props.onBlur?.(e);
                }}
                onChange={(e) => {
                    setHasValue(e.target.value.length > 0);
                    props.onChange?.(e);
                }}
            />
            <label
                className={`absolute left-0 transition-all duration-300 pointer-events-none font-hand text-xl
                    ${(isFocused || hasValue)
                        ? '-top-6 text-sm text-organic-moss'
                        : 'top-1 text-organic-charcoal/50'
                    }
                `}
            >
                {label.split('').map((char, index) => (
                    <span
                        key={index}
                        style={{ transitionDelay: `${index * 30}ms` }}
                        className={`inline-block transition-all duration-300 ${isFocused ? 'animate-wiggle' : ''}`}
                    >
                        {char === ' ' ? '\u00A0' : char}
                    </span>
                ))}
            </label>
            <div className={`absolute bottom-0 left-0 h-0.5 bg-organic-moss transition-all duration-500 ease-in-out
                ${isFocused ? 'w-full' : 'w-0'}
            `} />
            {error && (
                <span className="text-red-500 text-xs mt-1 block font-mono animate-pulse">
                    ! {error}
                </span>
            )}
        </div>
    );
};

export default OrganicInput;
