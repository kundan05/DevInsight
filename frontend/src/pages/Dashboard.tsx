import React, { useEffect, useState } from 'react';
import { useSelector } from 'react-redux';
import { RootState } from '../store';
import api from '../services/api';

const Dashboard: React.FC = () => {
    const { user } = useSelector((state: RootState) => state.auth);
    const [stats, setStats] = useState<any>(null);

    useEffect(() => {
        const fetchStats = async () => {
            try {
                const response = await api.get('/users/stats');
                setStats(response.data.stats);
            } catch (error) {
                console.error('Error fetching stats', error);
            }
        };
        fetchStats();
    }, []);

    return (
        <div>
            <h1 className="text-3xl font-bold text-gray-900 dark:text-white mb-8">Welcome back, {user?.firstName || user?.username}!</h1>

            <div className="grid grid-cols-1 gap-5 sm:grid-cols-3">
                {/* Card 1 */}
                <div className="bg-white dark:bg-gray-800 overflow-hidden shadow rounded-lg">
                    <div className="px-4 py-5 sm:p-6">
                        <dt className="text-sm font-medium text-gray-500 dark:text-gray-400 truncate">Total Snippets</dt>
                        <dd className="mt-1 text-3xl font-semibold text-gray-900 dark:text-white">{stats?.snippetCount || 0}</dd>
                    </div>
                </div>
                {/* Card 2 */}
                <div className="bg-white dark:bg-gray-800 overflow-hidden shadow rounded-lg">
                    <div className="px-4 py-5 sm:p-6">
                        <dt className="text-sm font-medium text-gray-500 dark:text-gray-400 truncate">Likes Received</dt>
                        <dd className="mt-1 text-3xl font-semibold text-gray-900 dark:text-white">{stats?.likesReceived || 0}</dd>
                    </div>
                </div>
                {/* Card 3 */}
                <div className="bg-white dark:bg-gray-800 overflow-hidden shadow rounded-lg">
                    <div className="px-4 py-5 sm:p-6">
                        <dt className="text-sm font-medium text-gray-500 dark:text-gray-400 truncate">Challenges Solved</dt>
                        <dd className="mt-1 text-3xl font-semibold text-gray-900 dark:text-white">{stats?.challengesSolved || 0}</dd>
                    </div>
                </div>
            </div>

            {/* Recent Activity Section (Placeholder) */}
            <div className="mt-8">
                <h2 className="text-xl font-bold text-gray-900 dark:text-white mb-4">Recent Activity</h2>
                <div className="bg-white dark:bg-gray-800 shadow sm:rounded-md">
                    <ul className="divide-y divide-gray-200 dark:divide-gray-700">
                        <li className="px-4 py-4 sm:px-6 text-gray-500 dark:text-gray-400">
                            No recent activity found.
                        </li>
                    </ul>
                </div>
            </div>
        </div>
    );
};

export default Dashboard;
