import React, { useEffect, useState } from 'react';
import api from '../../services/api';
import { Challenge } from '../../types';
import { Link } from 'react-router-dom';
import { FiZap } from 'react-icons/fi';

const DIFFICULTY_COLORS: Record<string, string> = {
    EASY: 'text-status-success',
    MEDIUM: 'text-status-warning',
    HARD: 'text-status-danger',
    EXPERT: 'text-accent-copper',
};

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

    return (
        <div className="animate-fade-in">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-8">
                <div>
                    <h1 className="heading text-2xl sm:text-3xl text-text-primary mb-1">
                        Challenges
                    </h1>
                    <p className="text-sm text-text-muted">
                        Solve problems, earn points, level up.
                    </p>
                </div>
                <select
                    value={difficulty}
                    onChange={(e) => setDifficulty(e.target.value)}
                    className="input select w-full sm:w-auto"
                >
                    <option value="">All Difficulties</option>
                    <option value="EASY">Easy</option>
                    <option value="MEDIUM">Medium</option>
                    <option value="HARD">Hard</option>
                    <option value="EXPERT">Expert</option>
                </select>
            </div>

            {loading ? (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
                    {[1, 2, 3].map((i) => (
                        <div key={i} className="card p-6">
                            <div className="h-4 bg-deep-elevated rounded w-2/3 mb-4 animate-pulse" />
                            <div className="h-3 bg-deep-elevated rounded w-full mb-2 animate-pulse" />
                            <div className="h-3 bg-deep-elevated rounded w-1/2 animate-pulse" />
                        </div>
                    ))}
                </div>
            ) : challenges.length === 0 ? (
                <div className="card p-12 text-center">
                    <div className="w-12 h-12 rounded-full bg-deep-elevated border border-border flex items-center justify-center mx-auto mb-4">
                        <FiZap className="w-5 h-5 text-text-muted" />
                    </div>
                    <p className="text-text-muted mb-1">No challenges found</p>
                    <p className="text-sm text-text-muted/60">Try adjusting your filters.</p>
                </div>
            ) : (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
                    {challenges.map((challenge) => (
                        <Link
                            key={challenge.id}
                            to={`/challenges/${challenge.id}`}
                            className="card p-6 flex flex-col hover:border-accent-copper/30 transition-all group"
                        >
                            <div className="flex items-start justify-between mb-3">
                                <h3 className="font-semibold text-text-primary group-hover:text-accent-copper transition-colors">
                                    {challenge.title}
                                </h3>
                                <span className={`text-xs font-mono ${DIFFICULTY_COLORS[challenge.difficulty] || 'text-text-muted'}`}>
                                    {challenge.difficulty}
                                </span>
                            </div>
                            <p className="text-sm text-text-muted/70 mb-4 line-clamp-2 flex-1">
                                {(challenge.description || '').replace(/[#*`]/g, '')}
                            </p>
                            <div className="flex items-center justify-between pt-4 border-t border-border text-xs text-text-muted font-mono">
                                <span>{challenge.points} pts</span>
                                <span>{challenge._count?.submissions || 0} submissions</span>
                            </div>
                            {challenge.tags.length > 0 && (
                                <div className="flex flex-wrap gap-1.5 mt-4">
                                    {challenge.tags.slice(0, 3).map((tag) => (
                                        <span key={tag} className="tag">
                                            {tag}
                                        </span>
                                    ))}
                                </div>
                            )}
                        </Link>
                    ))}
                </div>
            )}
        </div>
    );
};

export default ChallengeList;
