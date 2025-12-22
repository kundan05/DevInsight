import React, { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import api from '../services/api';
import { FaHeart, FaComment, FaEye } from 'react-icons/fa';

interface Snippet {
    id: string;
    title: string;
    description: string;
    language: string;
    author: {
        username: string;
        avatar: string;
    };
    _count: {
        likes: number;
        comments: number;
    };
    tags: string[];
    createdAt: string;
}

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

    if (loading) return <div>Loading snippets...</div>;

    return (
        <div>
            <div className="flex justify-between items-center mb-8">
                <h1 className="text-3xl font-bold text-gray-900 dark:text-white">Discover Snippets</h1>
                <Link to="/snippets/create" className="bg-primary-600 text-white px-4 py-2 rounded-md hover:bg-primary-700">
                    Create Snippet
                </Link>
            </div>

            <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3">
                {snippets.map((snippet) => (
                    <Link key={snippet.id} to={`/snippets/${snippet.id}`} className="block group">
                        <div className="bg-white dark:bg-gray-800 rounded-lg shadow-sm hover:shadow-md transition-shadow duration-200 overflow-hidden border border-gray-200 dark:border-gray-700 h-full flex flex-col">
                            <div className="p-6 flex-1">
                                <div className="flex justify-between items-start mb-4">
                                    <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-200">
                                        {snippet.language}
                                    </span>
                                    <span className="text-xs text-gray-500 dark:text-gray-400">
                                        {new Date(snippet.createdAt).toLocaleDateString()}
                                    </span>
                                </div>
                                <h3 className="text-lg font-semibold text-gray-900 dark:text-white group-hover:text-primary-600 mb-2 line-clamp-1">
                                    {snippet.title}
                                </h3>
                                <p className="text-gray-500 dark:text-gray-400 text-sm mb-4 line-clamp-2">
                                    {snippet.description}
                                </p>
                                <div className="flex flex-wrap gap-2">
                                    {snippet.tags.slice(0, 3).map(tag => (
                                        <span key={tag} className="text-xs text-gray-500 dark:text-gray-400 bg-gray-100 dark:bg-gray-700 px-2 py-1 rounded">
                                            #{tag}
                                        </span>
                                    ))}
                                </div>
                            </div>
                            <div className="bg-gray-50 dark:bg-gray-700 px-6 py-3 flex items-center justify-between">
                                <div className="flex items-center space-x-2">
                                    <img className="h-6 w-6 rounded-full" src={snippet.author.avatar || `https://ui-avatars.com/api/?name=${snippet.author.username}`} alt="" />
                                    <span className="text-sm font-medium text-gray-700 dark:text-gray-300">{snippet.author.username}</span>
                                </div>
                                <div className="flex items-center space-x-4 text-sm text-gray-500 dark:text-gray-400">
                                    <span className="flex items-center"><FaHeart className="mr-1" /> {snippet._count.likes}</span>
                                    <span className="flex items-center"><FaComment className="mr-1" /> {snippet._count.comments}</span>
                                </div>
                            </div>
                        </div>
                    </Link>
                ))}
            </div>
        </div>
    );
};

export default SnippetList;
