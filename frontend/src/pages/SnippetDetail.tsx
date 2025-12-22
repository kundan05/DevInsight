import React, { useEffect, useState } from 'react';
import { useParams, Link } from 'react-router-dom';
import api from '../services/api';
import CodeEditor from '../components/common/CodeEditor';
import { FaHeart, FaComment, FaShare } from 'react-icons/fa';
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
                _count: {
                    ...prev._count,
                    comments: (prev._count.comments || 0) + 1
                }
            }));
            setComment('');
            toast.success('Comment added');
        } catch (error) {
            console.error('Comment error:', error);
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
        try {
            await api.post(`/snippets/${id}/like`);
            // Optimistically update UI or refetch
            setSnippet((prev: any) => ({
                ...prev,
                _count: {
                    ...prev._count,
                    likes: prev._count.likes + 1 // Basic toggle logic needed actual response
                }
            }));
            toast.success('Liked!');
        } catch (error) {
            toast.error('Failed to like');
        }
    }

    if (loading) return <div>Loading...</div>;
    if (!snippet) return <div>Snippet not found</div>;

    return (
        <div className="max-w-4xl mx-auto">
            <div className="mb-6">
                <div className="flex items-center justify-between mb-4">
                    <div className="flex items-center space-x-4">
                        <Link to={`/profile/${snippet.author.username}`}>
                            <img className="h-10 w-10 rounded-full" src={snippet.author.avatar || `https://ui-avatars.com/api/?name=${snippet.author.username}`} alt="" />
                        </Link>
                        <div>
                            <h1 className="text-2xl font-bold text-gray-900 dark:text-white">{snippet.title}</h1>
                            <p className="text-sm text-gray-500">By <span className="font-medium text-gray-900 dark:text-white">{snippet.author.username}</span> on {new Date(snippet.createdAt).toDateString()}</p>
                        </div>
                    </div>
                    <div className="flex space-x-2">
                        <button onClick={handleLike} className="flex items-center space-x-1 px-3 py-2 bg-gray-100 dark:bg-gray-700 rounded hover:bg-gray-200 dark:hover:bg-gray-600">
                            <FaHeart className="text-red-500" />
                            <span>{snippet._count.likes}</span>
                        </button>
                    </div>
                </div>
                <p className="text-gray-700 dark:text-gray-300 mb-6">{snippet.description}</p>

                <CodeEditor code={snippet.code} language={snippet.language} readOnly={true} />

                <div className="mt-6 flex flex-wrap gap-2">
                    {snippet.tags.map((tag: string) => (
                        <span key={tag} className="text-sm text-gray-600 dark:text-gray-400 bg-gray-100 dark:bg-gray-700 px-3 py-1 rounded-full">
                            #{tag}
                        </span>
                    ))}
                </div>
            </div>

            {/* Comments Section */}
            <div className="mt-12 border-t pt-8 border-gray-200 dark:border-gray-700">
                <h2 className="text-xl font-bold mb-6 text-gray-900 dark:text-white flex items-center gap-2">
                    <FaComment className="text-gray-400" />
                    Comments ({snippet._count.comments})
                </h2>

                <form onSubmit={handleCommentSubmit} className="mb-8">
                    <div className="flex gap-4">
                        <div className="flex-1">
                            <textarea
                                value={comment}
                                onChange={(e) => setComment(e.target.value)}
                                placeholder="Add a comment..."
                                className="w-full bg-gray-100 dark:bg-gray-800 border border-gray-300 dark:border-gray-700 rounded-lg p-3 text-gray-900 dark:text-white focus:ring-2 focus:ring-indigo-500 focus:outline-none transition-colors resize-none"
                                rows={3}
                            />
                        </div>
                        <button
                            type="submit"
                            disabled={submittingComment || !comment.trim()}
                            className="h-fit px-4 py-2 bg-indigo-600 hover:bg-indigo-700 text-white rounded-lg font-medium transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                        >
                            {submittingComment ? 'Posting...' : 'Post'}
                        </button>
                    </div>
                </form>

                <div className="space-y-6">
                    {snippet.comments && snippet.comments.length > 0 ? (
                        snippet.comments.map((comment: any) => (
                            <div key={comment.id} className="flex gap-4">
                                <Link to={`/profile/${comment.author.username}`}>
                                    <img
                                        src={comment.author.avatar || `https://ui-avatars.com/api/?name=${comment.author.username}`}
                                        alt={comment.author.username}
                                        className="w-10 h-10 rounded-full object-cover"
                                    />
                                </Link>
                                <div className="flex-1">
                                    <div className="bg-gray-50 dark:bg-gray-800 rounded-lg p-4">
                                        <div className="flex justify-between items-start mb-2">
                                            <Link
                                                to={`/profile/${comment.author.username}`}
                                                className="font-semibold text-gray-900 dark:text-white hover:text-indigo-600 dark:hover:text-indigo-400"
                                            >
                                                {comment.author.username}
                                            </Link>
                                            <span className="text-xs text-gray-500">
                                                {new Date(comment.createdAt).toLocaleDateString()}
                                            </span>
                                        </div>
                                        <p className="text-gray-700 dark:text-gray-300 whitespace-pre-wrap text-sm">
                                            {comment.content}
                                        </p>
                                    </div>
                                </div>
                            </div>
                        ))
                    ) : (
                        <p className="text-gray-500 text-center py-8">No comments yet. Be the first to share your thoughts!</p>
                    )}
                </div>
            </div>
        </div>
    );
};

export default SnippetDetail;
