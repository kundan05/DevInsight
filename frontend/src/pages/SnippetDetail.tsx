import React, { useEffect, useState } from 'react';
import { useParams, Link } from 'react-router-dom';
import api from '../services/api';
import CodeEditor from '../components/common/CodeEditor';
import { FiHeart, FiMessageSquare, FiArrowLeft } from 'react-icons/fi';
import { toast } from 'react-hot-toast';

const SnippetDetail: React.FC = () => {
    const { id } = useParams<{ id: string }>();
    const [snippet, setSnippet] = useState<any>(null);
    const [loading, setLoading] = useState(true);
    const [comment, setComment] = useState('');
    const [submittingComment, setSubmittingComment] = useState(false);

    const handleCommentSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!comment.trim()) return;

        try {
            setSubmittingComment(true);
            const response = await api.post(`/snippets/${id}/comments`, { content: comment });
            setSnippet((prev: any) => ({
                ...prev,
                comments: [response.data.comment, ...(prev.comments || [])],
                _count: { ...prev._count, comments: (prev._count.comments || 0) + 1 },
            }));
            setComment('');
            toast.success('Comment added');
        } catch (error) {
            toast.error('Failed to add comment');
        } finally {
            setSubmittingComment(false);
        }
    };

    useEffect(() => {
        const fetchSnippet = async () => {
            try {
                const response = await api.get(`/snippets/${id}`);
                setSnippet(response.data.snippet);
            } catch (error) {
                console.error('Error fetching snippet', error);
            } finally {
                setLoading(false);
            }
        };
        fetchSnippet();
    }, [id]);

    const handleLike = async () => {
        const prev = snippet;
        setSnippet((p: any) => ({
            ...p,
            _count: { ...p._count, likes: p._count.likes + 1 },
        }));
        try {
            const response = await api.post(`/snippets/${id}/like`);
            if (!response.data.liked) {
                setSnippet((p: any) => ({
                    ...p,
                    _count: { ...p._count, likes: p._count.likes - 1 },
                }));
            }
            toast.success(response.data.liked ? 'Liked!' : 'Unliked');
        } catch {
            setSnippet(prev);
            toast.error('Failed to like');
        }
    };

    if (loading) {
        return (
            <div className="flex items-center justify-center min-h-[50vh]">
                <div className="w-8 h-8 border-2 border-accent-copper border-t-transparent rounded-full animate-spin" />
            </div>
        );
    }
    if (!snippet) {
        return (
            <div className="text-center py-20">
                <p className="text-text-muted">Snippet not found</p>
                <Link to="/snippets" className="btn btn-ghost mt-4">
                    Back to snippets
                </Link>
            </div>
        );
    }

    return (
        <div className="max-w-4xl mx-auto animate-fade-in">
            <Link
                to="/snippets"
                className="inline-flex items-center gap-2 text-sm text-text-muted hover:text-text-primary mb-6 transition-colors"
            >
                <FiArrowLeft className="w-4 h-4" />
                Back to snippets
            </Link>

            <div className="card p-6 mb-6">
                <div className="flex items-start justify-between mb-4">
                    <div className="flex items-center gap-4">
                        <Link to={`/profile/${snippet.author.username}`}>
                            <div className="w-10 h-10 rounded-full bg-deep-elevated border border-border flex items-center justify-center overflow-hidden">
                                {snippet.author.avatar ? (
                                    <img src={snippet.author.avatar} alt="" className="w-full h-full object-cover" />
                                ) : (
                                    <span className="text-sm text-text-muted font-mono">
                                        {snippet.author.username.charAt(0).toUpperCase()}
                                    </span>
                                )}
                            </div>
                        </Link>
                        <div>
                            <h1 className="heading text-xl sm:text-2xl text-text-primary">
                                {snippet.title}
                            </h1>
                            <p className="text-sm text-text-muted">
                                by{' '}
                                <Link to={`/profile/${snippet.author.username}`} className="link">
                                    {snippet.author.username}
                                </Link>{' '}
                                &middot; {new Date(snippet.createdAt).toLocaleDateString('en-US', {
                                    month: 'long',
                                    day: 'numeric',
                                    year: 'numeric',
                                })}
                            </p>
                        </div>
                    </div>
                    <button
                        onClick={handleLike}
                        className="flex items-center gap-2 px-4 py-2 rounded-md bg-deep-surface border border-border text-text-muted hover:text-status-danger hover:border-status-danger/30 transition-all text-sm"
                    >
                        <FiHeart className="w-4 h-4" />
                        {snippet._count.likes}
                    </button>
                </div>

                {snippet.description && (
                    <p className="text-text-muted/80 text-sm mb-6">{snippet.description}</p>
                )}

                <CodeEditor code={snippet.code} language={snippet.language} readOnly />

                <div className="flex flex-wrap gap-2 mt-6">
                    {snippet.tags.map((tag: string) => (
                        <span key={tag} className="tag">
                            #{tag}
                        </span>
                    ))}
                </div>
            </div>

            {/* Comments */}
            <div className="card p-6">
                <h2 className="flex items-center gap-2 text-lg font-semibold text-text-primary mb-6">
                    <FiMessageSquare className="w-4 h-4 text-text-muted" />
                    Comments ({snippet._count.comments})
                </h2>

                <form onSubmit={handleCommentSubmit} className="mb-8">
                    <div className="flex gap-3">
                        <textarea
                            value={comment}
                            onChange={(e) => setComment(e.target.value)}
                            placeholder="Add a comment…"
                            className="input resize-none flex-1 min-h-[80px]"
                            rows={3}
                        />
                        <button
                            type="submit"
                            disabled={submittingComment || !comment.trim()}
                            className="btn btn-primary self-start"
                        >
                            {submittingComment ? 'Posting…' : 'Post'}
                        </button>
                    </div>
                </form>

                <div className="space-y-4">
                    {snippet.comments && snippet.comments.length > 0 ? (
                        snippet.comments.map((c: any) => (
                            <div key={c.id} className="flex gap-3">
                                <Link to={`/profile/${c.author.username}`}>
                                    <div className="w-8 h-8 rounded-full bg-deep-elevated border border-border flex items-center justify-center overflow-hidden flex-shrink-0">
                                        {c.author.avatar ? (
                                            <img src={c.author.avatar} alt="" className="w-full h-full object-cover" />
                                        ) : (
                                            <span className="text-[9px] text-text-muted font-mono">
                                                {c.author.username.charAt(0).toUpperCase()}
                                            </span>
                                        )}
                                    </div>
                                </Link>
                                <div className="flex-1 min-w-0">
                                    <div className="card p-4">
                                        <div className="flex items-center justify-between mb-2">
                                            <Link
                                                to={`/profile/${c.author.username}`}
                                                className="text-sm font-medium text-text-primary hover:text-accent-teal transition-colors"
                                            >
                                                {c.author.username}
                                            </Link>
                                            <span className="text-xs text-text-muted font-mono">
                                                {new Date(c.createdAt).toLocaleDateString('en-US', {
                                                    month: 'short',
                                                    day: 'numeric',
                                                })}
                                            </span>
                                        </div>
                                        <p className="text-sm text-text-muted/80 whitespace-pre-wrap">
                                            {c.content}
                                        </p>
                                    </div>
                                </div>
                            </div>
                        ))
                    ) : (
                        <p className="text-center text-sm text-text-muted py-8">
                            No comments yet. Be the first to share your thoughts.
                        </p>
                    )}
                </div>
            </div>
        </div>
    );
};

export default SnippetDetail;
