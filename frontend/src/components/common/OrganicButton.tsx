import React, { useRef, useState } from 'react';

interface OrganicButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
    variant?: 'primary' | 'secondary' | 'ghost';
    shape?: 'pill' | 'blob' | 'sharp';
    children: React.ReactNode;
}

const OrganicButton: React.FC<OrganicButtonProps> = ({
    variant = 'primary',
    shape = 'pill',
    children,
    className = '',
    ...props
}) => {
    const btnRef = useRef<HTMLButtonElement>(null);
    const [position, setPosition] = useState({ x: 0, y: 0 });

    const handleMouseMove = (e: React.MouseEvent<HTMLButtonElement>) => {
        if (!btnRef.current) return;
        const rect = btnRef.current.getBoundingClientRect();
        const x = e.clientX - rect.left - rect.width / 2;
        const y = e.clientY - rect.top - rect.height / 2;
        // Magnetic effect strength
        setPosition({ x: x * 0.2, y: y * 0.2 });
    };

    const handleMouseLeave = () => {
        setPosition({ x: 0, y: 0 });
    };

    const baseStyles = "relative px-8 py-3 font-semibold transition-all duration-300 ease-out transform active:scale-95 group overflow-hidden z-10";

    const variants = {
        primary: "bg-organic-charcoal text-organic-sand hover:bg-black",
        secondary: "bg-organic-moss text-white hover:bg-green-900",
        ghost: "bg-transparent text-organic-charcoal border-2 border-organic-charcoal hover:bg-organic-charcoal hover:text-white"
    };

    const shapes = {
        pill: "rounded-full",
        blob: "rounded-organic-2",
        sharp: "rounded-none"
    };

    return (
        <button
            ref={btnRef}
            className={`${baseStyles} ${variants[variant]} ${shapes[shape]} ${className}`}
            onMouseMove={handleMouseMove}
            onMouseLeave={handleMouseLeave}
            style={{
                transform: `translate(${position.x}px, ${position.y}px)`,
            }}
            {...props}
        >
            <span className="relative z-10 flex items-center justify-center gap-2">
                {children}
            </span>
            {/* Hover spill effect */}
            <div className="absolute inset-0 translate-y-full group-hover:translate-y-0 transition-transform duration-300 bg-white/10 ease-in-out" />
        </button>
    );
};

export default OrganicButton;
