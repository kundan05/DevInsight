import React, { useEffect, useState } from 'react';
import { useSelector } from 'react-redux';
import { Link } from 'react-router-dom';
import { RootState } from '../store';
import api from '../services/api';
import { FiCode, FiAward, FiHeart, FiPlus, FiZap } from 'react-icons/fi';

const Dashboard: React.FC = () => {
    const { user } = useSelector((state: RootState) => state.auth);
    const [stats, setStats] = useState<any>(null);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const fetchStats = async () => {
            try {
                const response = await api.get('/users/stats');
                setStats(response.data.stats);
            } catch (error) {
                console.error('Error fetching stats', error);
            } finally {
                setLoading(false);
            }
        };
        fetchStats();
    }, []);

    const statCards = [
        { label: 'Total Snippets', value: stats?.snippetCount || 0, icon: FiCode },
        { label: 'Likes Received', value: stats?.likesReceived || 0, icon: FiHeart },
        { label: 'Challenges Solved', value: stats?.challengesSolved || 0, icon: FiAward },
    ];

    if (loading) {
        return (
            <div className="animate-fade-in flex items-center justify-center min-h-[50vh]">
                <div className="w-8 h-8 border-2 border-accent-copper border-t-transparent rounded-full animate-spin" />
            </div>
        );
    }

    return (
        <div className="animate-fade-in">
            <div className="mb-10">
                <h1 className="heading text-3xl sm:text-4xl text-text-primary mb-2">
                    Welcome back, {user?.firstName || user?.username}
                </h1>
                <p className="text-text-muted">Here&apos;s your DevInsight overview.</p>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-3 gap-5 mb-12">
                {statCards.map((stat) => {
                    const Icon = stat.icon;
                    return (
                        <div key={stat.label} className="card p-6">
                            <div className="flex items-center justify-between mb-3">
                                <Icon className="w-5 h-5 text-accent-copper" />
                                <span className="heading text-2xl text-text-primary">
                                    {stat.value}
                                </span>
                            </div>
                            <p className="text-sm text-text-muted font-mono">{stat.label}</p>
                        </div>
                    );
                })}
            </div>

            <div className="card p-6">
                <div className="flex items-center justify-between mb-6">
                    <h2 className="heading text-lg text-text-primary">Recent Activity</h2>
                    <div className="flex gap-2">
                        <Link to="/snippets/create" className="btn btn-primary btn-sm">
                            <FiPlus className="w-4 h-4" />
                            New Snippet
                        </Link>
                        <Link to="/challenges" className="btn btn-ghost btn-sm">
                            <FiZap className="w-4 h-4" />
                            Challenges
                        </Link>
                    </div>
                </div>

                {(!stats?.recentActivity || stats.recentActivity.length === 0) ? (
                    <div className="text-center py-12">
                        <div className="w-12 h-12 rounded-full bg-deep-elevated border border-border flex items-center justify-center mx-auto mb-4">
                            <FiCode className="w-5 h-5 text-text-muted" />
                        </div>
                        <p className="text-text-muted mb-1">No activity yet</p>
                        <p className="text-sm text-text-muted/60">
                            Create your first snippet or solve a challenge to get started.
                        </p>
                    </div>
                ) : (
                    <div className="space-y-1">
                        {stats.recentActivity.map((activity: any, index: number) => (
                            <div key={index} className="text-sm text-text-muted py-2">
                                {activity.type || 'Activity'} — {activity.description || ''}
                            </div>
                        ))}
                    </div>
                )}
            </div>
        </div>
    );
};

export default Dashboard;
