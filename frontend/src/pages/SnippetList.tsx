import React, { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import api from '../services/api';
import { FiHeart, FiMessageSquare, FiPlus, FiCode } from 'react-icons/fi';

interface Snippet {
    id: string;
    title: string;
    description: string;
    language: string;
    author: { username: string; avatar: string };
    _count: { likes: number; comments: number };
    tags: string[];
    createdAt: string;
}

const LANG_COLORS: Record<string, string> = {
    javascript: 'text-status-warning',
    typescript: 'text-accent-teal',
    python: 'text-accent-copper',
    java: 'text-status-danger',
    cpp: 'text-accent-teal',
    html: 'text-status-warning',
    css: 'text-accent-copper',
};

const SnippetList: React.FC = () => {
    const [snippets, setSnippets] = useState<Snippet[]>([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const fetchSnippets = async () => {
            try {
                const response = await api.get('/snippets');
                setSnippets(response.data.data);
            } catch (error) {
                console.error('Error fetching snippets', error);
            } finally {
                setLoading(false);
            }
        };
        fetchSnippets();
    }, []);

    if (loading) {
        return (
            <div className="animate-fade-in flex items-center justify-center min-h-[50vh]">
                <div className="w-8 h-8 border-2 border-accent-copper border-t-transparent rounded-full animate-spin" />
            </div>
        );
    }

    return (
        <div className="animate-fade-in">
            <div className="flex items-center justify-between mb-8">
                <div>
                    <h1 className="heading text-2xl sm:text-3xl text-text-primary mb-1">
                        Snippets
                    </h1>
                    <p className="text-sm text-text-muted">
                        Discover and share code with the community.
                    </p>
                </div>
                <Link to="/snippets/create" className="btn btn-primary">
                    <FiPlus className="w-4 h-4" />
                    New Snippet
                </Link>
            </div>

            {snippets.length === 0 ? (
                <div className="card p-12 text-center">
                    <div className="w-12 h-12 rounded-full bg-deep-elevated border border-border flex items-center justify-center mx-auto mb-4">
                        <FiCode className="w-5 h-5 text-text-muted" />
                    </div>
                    <p className="text-text-muted mb-1">No snippets yet</p>
                    <p className="text-sm text-text-muted/60 mb-6">
                        Be the first to share something useful.
                    </p>
                    <Link to="/snippets/create" className="btn btn-primary">
                        Create Snippet
                    </Link>
                </div>
            ) : (
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5">
                    {snippets.map((snippet) => (
                        <Link
                            key={snippet.id}
                            to={`/snippets/${snippet.id}`}
                            className="card p-6 flex flex-col hover:border-accent-copper/30 transition-all group"
                        >
                            <div className="flex items-center justify-between mb-4">
                                <span className={`text-xs font-mono ${LANG_COLORS[snippet.language] || 'text-text-muted'}`}>
                                    {snippet.language}
                                </span>
                                <span className="text-xs text-text-muted font-mono">
                                    {new Date(snippet.createdAt).toLocaleDateString('en-US', {
                                        month: 'short',
                                        day: 'numeric',
                                    })}
                                </span>
                            </div>
                            <h3 className="font-semibold text-text-primary mb-2 group-hover:text-accent-copper transition-colors">
                                {snippet.title}
                            </h3>
                            <p className="text-sm text-text-muted/70 mb-4 line-clamp-2 flex-1">
                                {snippet.description}
                            </p>
                            <div className="flex flex-wrap gap-1.5 mb-4">
                                {snippet.tags.slice(0, 3).map((tag) => (
                                    <span key={tag} className="tag">
                                        #{tag}
                                    </span>
                                ))}
                            </div>
                            <div className="flex items-center justify-between pt-4 border-t border-border">
                                <div className="flex items-center gap-2">
                                    <div className="w-5 h-5 rounded-full bg-deep-elevated border border-border flex items-center justify-center overflow-hidden">
                                        {snippet.author.avatar ? (
                                            <img src={snippet.author.avatar} alt="" className="w-full h-full object-cover" />
                                        ) : (
                                            <span className="text-[8px] text-text-muted font-mono">
                                                {snippet.author.username.charAt(0).toUpperCase()}
                                            </span>
                                        )}
                                    </div>
                                    <span className="text-xs text-text-muted">{snippet.author.username}</span>
                                </div>
                                <div className="flex items-center gap-3 text-xs text-text-muted">
                                    <span className="flex items-center gap-1">
                                        <FiHeart className="w-3 h-3" /> {snippet._count.likes}
                                    </span>
                                    <span className="flex items-center gap-1">
                                        <FiMessageSquare className="w-3 h-3" /> {snippet._count.comments}
                                    </span>
                                </div>
                            </div>
                        </Link>
                    ))}
                </div>
            )}
        </div>
    );
};

export default SnippetList;
