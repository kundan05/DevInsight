import React, { useRef } from 'react';

interface OrganicCardProps {
    children: React.ReactNode;
    variant?: 'paper' | 'glass' | 'outline';
    className?: string;
    hoverEffect?: 'lift' | 'tilt' | 'static';
    shape?: 'rounded' | 'blob' | 'jagged';
}

const OrganicCard: React.FC<OrganicCardProps> = ({
    children,
    variant = 'paper',
    className = '',
    hoverEffect = 'tilt',
    shape = 'rounded'
}) => {
    const cardRef = useRef<HTMLDivElement>(null);

    const handleMouseMove = (e: React.MouseEvent<HTMLDivElement>) => {
        if (hoverEffect !== 'tilt' || !cardRef.current) return;

        const card = cardRef.current;
        const rect = card.getBoundingClientRect();
        const x = e.clientX - rect.left;
        const y = e.clientY - rect.top;

        const centerX = rect.width / 2;
        const centerY = rect.height / 2;

        const rotateX = ((y - centerY) / centerY) * -5; // Max 5deg rotation
        const rotateY = ((x - centerX) / centerX) * 5;

        card.style.transform = `perspective(1000px) rotateX(${rotateX}deg) rotateY(${rotateY}deg)`;
    };

    const handleMouseLeave = () => {
        if (cardRef.current) {
            cardRef.current.style.transform = 'perspective(1000px) rotateX(0) rotateY(0)';
        }
    };

    const baseStyles = "relative p-6 transition-all duration-300 ease-out";

    const variants = {
        paper: "bg-white shadow-lg text-organic-charcoal",
        glass: "bg-white/80 backdrop-blur-md border border-white/20 shadow-xl",
        outline: "border-2 border-organic-charcoal bg-transparent hover:bg-organic-sand"
    };

    const shapes = {
        rounded: "rounded-2xl",
        blob: "rounded-organic-3",
        jagged: "rounded-none [clip-path:polygon(0%_0%,100%_2%,98%_100%,2%_98%)]"
    };

    const hoverStyles = {
        lift: "hover:-translate-y-2 hover:shadow-2xl",
        tilt: "preserve-3d",
        static: ""
    };

    return (
        <div
            ref={cardRef}
            className={`${baseStyles} ${variants[variant]} ${shapes[shape]} ${hoverStyles[hoverEffect]} ${className}`}
            onMouseMove={handleMouseMove}
            onMouseLeave={handleMouseLeave}
        >
            {children}
        </div>
    );
};

export default OrganicCard;
