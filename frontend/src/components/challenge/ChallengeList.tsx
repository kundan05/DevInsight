import React, { useEffect, useState } from 'react';
import api from '../../services/api';
import { Challenge } from '../../types';
import { Link } from 'react-router-dom';

const ChallengeList: React.FC = () => {
    const [challenges, setChallenges] = useState<Challenge[]>([]);
    const [loading, setLoading] = useState(true);
    const [difficulty, setDifficulty] = useState<string>('');

    useEffect(() => {
        fetchChallenges();
    }, [difficulty]);

    const fetchChallenges = async () => {
        try {
            setLoading(true);
            const params: any = {};
            if (difficulty) params.difficulty = difficulty;

            const response = await api.get('/challenges', { params });
            setChallenges(response.data.data);
        } catch (error) {
            console.error('Error fetching challenges:', error);
        } finally {
            setLoading(false);
        }
    };

    const getDifficultyColor = (diff: string) => {
        switch (diff) {
            case 'EASY': return 'text-green-500';
            case 'MEDIUM': return 'text-yellow-500';
            case 'HARD': return 'text-red-500';
            case 'EXPERT': return 'text-purple-500';
            default: return 'text-gray-500';
        }
    };

    return (
        <div className="p-6">
            <div className="flex justify-between items-center mb-6">
                <h1 className="text-2xl font-bold text-gray-900 dark:text-white">Coding Challenges</h1>
                <select
                    value={difficulty}
                    onChange={(e) => setDifficulty(e.target.value)}
                    className="bg-white dark:bg-gray-800 text-gray-900 dark:text-white rounded p-2 border border-gray-300 dark:border-gray-700"
                >
                    <option value="">All Difficulties</option>
                    <option value="EASY">Easy</option>
                    <option value="MEDIUM">Medium</option>
                    <option value="HARD">Hard</option>
                    <option value="EXPERT">Expert</option>
                </select>
            </div>

            {loading ? (
                <div className="text-gray-900 dark:text-white">Loading...</div>
            ) : challenges.length === 0 ? (
                <div className="text-center py-10 bg-white dark:bg-gray-800 rounded-lg border border-gray-200 dark:border-gray-700 shadow-sm">
                    <h3 className="text-xl font-medium text-gray-900 dark:text-white">No challenges found</h3>
                    <p className="mt-2 text-gray-500 dark:text-gray-400">Try adjusting your filters or come back later.</p>
                </div>
            ) : (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                    {challenges.map(challenge => (
                        <Link to={`/challenges/${challenge.id}`} key={challenge.id} className="block group">
                            <div className="bg-white dark:bg-gray-800 rounded-lg p-5 hover:shadow-md transition-shadow border border-gray-200 dark:border-gray-700">
                                <div className="flex justify-between items-start mb-2">
                                    <h3 className="text-lg font-bold text-gray-900 dark:text-white group-hover:text-indigo-600 dark:group-hover:text-indigo-400 transition-colors">
                                        {challenge.title}
                                    </h3>
                                    <span className={`text-sm font-medium ${getDifficultyColor(challenge.difficulty)}`}>
                                        {challenge.difficulty}
                                    </span>
                                </div>
                                <p className="text-gray-600 dark:text-gray-400 text-sm mb-4 line-clamp-2">
                                    {(challenge.description || '').replace(/[#*`]/g, '') /* Simple markdown strip */}
                                </p>
                                <div className="flex justify-between items-center text-sm text-gray-500 dark:text-gray-400 border-t border-gray-100 dark:border-gray-700 pt-4 mt-2">
                                    <span>{challenge.points} Points</span>
                                    <span>{challenge._count?.submissions || 0} Submissions</span>
                                </div>
                                <div className="mt-4 flex flex-wrap gap-2">
                                    {challenge.tags.map(tag => (
                                        <span key={tag} className="text-xs bg-gray-100 dark:bg-gray-700 text-gray-700 dark:text-gray-300 px-2 py-1 rounded-full border border-gray-200 dark:border-gray-600">
                                            {tag}
                                        </span>
                                    ))}
                                </div>
                            </div>
                        </Link>
                    ))}
                </div>
            )}
        </div>
    );
};

export default ChallengeList;
