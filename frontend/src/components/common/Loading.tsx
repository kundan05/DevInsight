import React from 'react';
import { FiTerminal } from 'react-icons/fi';

const Loading: React.FC = () => {
    return (
        <div className="flex items-center justify-center min-h-[60vh]">
            <div className="flex flex-col items-center gap-4">
                <FiTerminal className="w-8 h-8 text-accent-copper animate-pulse-slow" />
                <div className="flex gap-1.5">
                    {[0, 1, 2].map((i) => (
                        <div
                            key={i}
                            className="w-2 h-2 rounded-full bg-accent-copper/50"
                            style={{
                                animation: `pulse 1.2s ease-in-out infinite`,
                                animationDelay: `${i * 0.2}s`,
                            }}
                        />
                    ))}
                </div>
            </div>
        </div>
    );
};

export default Loading;
