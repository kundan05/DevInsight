import React from 'react';

interface CardProps {
    children: React.ReactNode;
    className?: string;
    hover?: boolean;
    accent?: boolean;
}

const Card: React.FC<CardProps> = ({ children, className = '', hover = true, accent = false }) => {
    return (
        <div
            className={`card p-6 ${accent ? 'card-accent' : ''} ${hover ? '' : ''} ${className}`}
        >
            {children}
        </div>
    );
};

export default Card;
