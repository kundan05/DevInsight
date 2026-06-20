import React from 'react';
import { Link } from 'react-router-dom';
import { FiCode, FiUsers, FiAward, FiArrowRight } from 'react-icons/fi';

const codeSnippet = `// DevInsight is where code becomes collaborative.
// Share. Pair. Solve. Grow.

interface Developer {
    name: string;
    skills: Skill[];
    collaborators: Developer[];
}

const platform = new Platform<Developer>({
    name: "DevInsight",
    principles: [
        "Code wants to be shared",
        "Great devs build together",
        "Learning never stops"
    ]
});`;

const features = [
    {
        icon: FiCode,
        title: 'Code Snippets',
        description: 'Share and discover useful code. Save favorites, organize your library, and learn from the community.',
    },
    {
        icon: FiUsers,
        title: 'Pair Programming',
        description: 'Real-time collaborative editing with instant sync. Code together like you\'re in the same room.',
    },
    {
        icon: FiAward,
        title: 'Coding Challenges',
        description: 'Sharpen your skills with curated challenges. Track progress, compare solutions, earn reputation.',
    },
];

const stats = [
    { label: 'Snippets Shared', value: '12,400+' },
    { label: 'Challenges Solved', value: '8,200+' },
    { label: 'Active Developers', value: '3,600+' },
];

const Home: React.FC = () => {
    return (
        <div>
            {/* Hero */}
            <section className="relative pt-20 pb-32 overflow-hidden">
                <div className="absolute top-0 right-0 w-1/2 h-full opacity-[0.04] pointer-events-none select-none">
                    <pre className="font-mono text-xs leading-relaxed p-8 text-text-primary overflow-hidden">
                        {Array(60).fill(null).map((_, i) => (
                            <div key={i} className="whitespace-pre">
                                {'// ' + Math.random().toString(36).substring(2, 15)}
                            </div>
                        ))}
                    </pre>
                </div>

                <div className="relative max-w-4xl mx-auto px-4 sm:px-6 text-center">
                    <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-accent-copper/10 border border-accent-copper/20 text-xs text-accent-copper font-mono mb-8 animate-fade-in">
                        v2.0 — Now in public beta
                    </div>
                    <h1 className="heading text-5xl sm:text-6xl md:text-7xl lg:text-8xl text-text-primary mb-6 animate-slide-up">
                        Code together,{' '}
                        <br />
                        <span className="text-accent-copper">better together</span>
                    </h1>
                    <p className="text-lg sm:text-xl text-text-muted max-w-2xl mx-auto mb-10 leading-relaxed animate-slide-up animate-delay-100">
                        A developer collaboration platform built for real-time pair programming, 
                        code sharing, and friendly challenges. No friction, just flow.
                    </p>
                    <div className="flex flex-wrap items-center justify-center gap-4 animate-slide-up animate-delay-200">
                        <Link
                            to="/register"
                            className="btn btn-primary text-base px-8 py-3"
                        >
                            Get Started
                            <FiArrowRight className="w-4 h-4" />
                        </Link>
                        <Link
                            to="/snippets"
                            className="btn btn-ghost text-base px-8 py-3"
                        >
                            Explore Snippets
                        </Link>
                    </div>
                </div>

                {/* Code block */}
                <div className="mt-16 max-w-3xl mx-auto px-4 sm:px-6 animate-fade-in animate-delay-300">
                    <div className="card p-0 overflow-hidden">
                        <div className="flex items-center gap-2 px-4 py-3 bg-deep-surface border-b border-border">
                            <div className="w-3 h-3 rounded-full bg-status-danger/80" />
                            <div className="w-3 h-3 rounded-full bg-status-warning/80" />
                            <div className="w-3 h-3 rounded-full bg-status-success/80" />
                            <span className="text-xs text-text-muted font-mono ml-2">manifesto.ts</span>
                        </div>
                        <pre className="font-mono text-sm p-6 overflow-x-auto">
                            <code className="text-text-primary/90 leading-relaxed">
                                {codeSnippet.split('\n').map((line, i) => (
                                    <div key={i} className="whitespace-pre">
                                        {line.startsWith('//') ? (
                                            <span className="text-text-muted/60">{line}</span>
                                        ) : line.includes('interface') || line.includes('const') || line.includes('new') ? (
                                            <span>
                                                <span className="text-accent-teal">{line.match(/^\s*\w+/)?.[0]}</span>
                                                <span>{line.slice(line.match(/^\s*\w+/)?.[0].length)}</span>
                                            </span>
                                        ) : (
                                            <span>{line}</span>
                                        )}
                                    </div>
                                ))}
                            </code>
                        </pre>
                    </div>
                </div>
            </section>

            {/* Stats */}
            <section className="py-20 border-t border-border">
                <div className="max-w-5xl mx-auto px-4 sm:px-6">
                    <div className="grid grid-cols-1 sm:grid-cols-3 gap-8">
                        {stats.map((stat) => (
                            <div key={stat.label} className="text-center">
                                <div className="heading text-3xl sm:text-4xl text-accent-copper mb-1">
                                    {stat.value}
                                </div>
                                <div className="text-sm text-text-muted font-mono">
                                    {stat.label}
                                </div>
                            </div>
                        ))}
                    </div>
                </div>
            </section>

            {/* Features */}
            <section className="py-20">
                <div className="max-w-6xl mx-auto px-4 sm:px-6">
                    <div className="text-center mb-16">
                        <h2 className="heading text-3xl sm:text-4xl text-text-primary mb-4">
                            Everything a dev team needs
                        </h2>
                        <p className="text-text-muted max-w-xl mx-auto">
                            Three tools, one platform. No context switching, no complexity.
                        </p>
                    </div>
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                        {features.map((feature) => {
                            const Icon = feature.icon;
                            return (
                                <div key={feature.title} className="card p-8 hover:border-text-muted/30 transition-all">
                                    <div className="w-10 h-10 rounded-lg bg-accent-copper/10 border border-accent-copper/20 flex items-center justify-center mb-5">
                                        <Icon className="w-5 h-5 text-accent-copper" />
                                    </div>
                                    <h3 className="heading text-xl text-text-primary mb-3">
                                        {feature.title}
                                    </h3>
                                    <p className="text-sm text-text-muted leading-relaxed">
                                        {feature.description}
                                    </p>
                                </div>
                            );
                        })}
                    </div>
                </div>
            </section>

            {/* CTA */}
            <section className="py-20 border-t border-border">
                <div className="max-w-3xl mx-auto px-4 sm:px-6 text-center">
                    <h2 className="heading text-3xl sm:text-4xl text-text-primary mb-4">
                        Ready to ship together?
                    </h2>
                    <p className="text-text-muted mb-8 max-w-lg mx-auto">
                        Join thousands of developers already building better together on DevInsight.
                    </p>
                    <Link
                        to="/register"
                        className="btn btn-primary text-base px-10 py-3"
                    >
                        Start Building — Free
                    </Link>
                </div>
            </section>
        </div>
    );
};

export default Home;
