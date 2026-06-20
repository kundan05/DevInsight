import React from 'react';
import { FiGithub, FiTwitter, FiLinkedin } from 'react-icons/fi';
import { Link } from 'react-router-dom';

const Footer: React.FC = () => {
    return (
        <footer className="border-t border-border mt-16">
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
                <div className="grid grid-cols-1 md:grid-cols-12 gap-8">
                    <div className="md:col-span-5 space-y-4">
                        <div className="flex items-center gap-2">
                            <span className="font-display text-lg font-bold text-text-primary">
                                Dev<span className="text-accent-copper">Insight</span>
                            </span>
                        </div>
                        <p className="text-text-muted text-sm max-w-sm leading-relaxed">
                            Developer collaboration platform. Share code, pair program, and solve challenges.
                        </p>
                        <div className="flex gap-3 pt-2">
                            {[FiGithub, FiTwitter, FiLinkedin].map((Icon, idx) => (
                                <a
                                    key={idx}
                                    href="#"
                                    className="p-2 rounded-md bg-deep-surface border border-border text-text-muted hover:text-text-primary hover:border-text-muted transition-all"
                                >
                                    <Icon className="w-4 h-4" />
                                </a>
                            ))}
                        </div>
                    </div>

                    <div className="md:col-span-3">
                        <h4 className="text-sm font-semibold text-text-primary mb-4">Platform</h4>
                        <ul className="space-y-2">
                            {['Snippets', 'Challenges', 'Dashboard'].map((item) => (
                                <li key={item}>
                                    <Link to="#" className="text-sm text-text-muted hover:text-text-primary transition-colors">
                                        {item}
                                    </Link>
                                </li>
                            ))}
                        </ul>
                    </div>

                    <div className="md:col-span-4">
                        <h4 className="text-sm font-semibold text-text-primary mb-4">Connect</h4>
                        <p className="text-sm text-text-muted mb-4">
                            Get updates and be part of the community.
                        </p>
                        <div className="flex">
                            <input
                                type="email"
                                placeholder="your@email.com"
                                className="input rounded-r-none text-sm flex-1"
                            />
                            <button className="btn bg-accent-copper text-deep-base rounded-l-none px-4 hover:bg-accent-copper-dim">
                                Join
                            </button>
                        </div>
                    </div>
                </div>

                <div className="mt-10 pt-6 border-t border-border flex flex-col sm:flex-row items-center justify-between gap-4">
                    <p className="text-xs text-text-muted font-mono">
                        Built by developers, for developers.
                    </p>
                    <p className="text-xs text-text-muted font-mono">
                        &copy; {new Date().getFullYear()} DevInsight
                    </p>
                </div>
            </div>
        </footer>
    );
};

export default Footer;
