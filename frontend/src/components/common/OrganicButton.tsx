import React from 'react';

interface ButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
    variant?: 'primary' | 'ghost' | 'danger';
    size?: 'sm' | 'md' | 'lg';
    children: React.ReactNode;
}

const Button: React.FC<ButtonProps> = ({
    variant = 'primary',
    size = 'md',
    children,
    className = '',
    ...props
}) => {
    const sizeClasses = {
        sm: 'px-3 py-1.5 text-xs',
        md: 'px-5 py-2.5 text-sm',
        lg: 'px-7 py-3 text-base',
    };

    const variantClass = variant === 'primary' ? 'btn-primary' :
                         variant === 'danger' ? 'btn-danger' : 'btn-ghost';

    return (
        <button
            className={`btn ${variantClass} ${sizeClasses[size]} ${className}`}
            {...props}
        >
            {children}
        </button>
    );
};

export default Button;
