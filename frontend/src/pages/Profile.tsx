import React from 'react';
import { useParams } from 'react-router-dom';
import { useSelector } from 'react-redux';
import { RootState } from '../store';

const Profile: React.FC = () => {
    const { username } = useParams<{ username: string }>();
    const { user } = useSelector((state: RootState) => state.auth);

    const isCurrentUser = user?.username === username;
    // Fallback for demo if not current user
    const profileUser = isCurrentUser ? user : { username, firstName: 'User', lastName: 'Profile', email: '', avatar: null };

    return (
        <div className="container mx-auto px-4 py-8">
            <div className="bg-white dark:bg-gray-800 rounded-lg shadow-md p-6 mb-6">
                <div className="flex items-center space-x-4">
                    <div className="w-20 h-20 bg-blue-500 rounded-full flex items-center justify-center text-white text-3xl font-bold uppercase">
                        {profileUser?.username?.charAt(0) || 'U'}
                    </div>
                    <div>
                        <h1 className="text-2xl font-bold dark:text-white">
                            {profileUser?.firstName} {profileUser?.lastName}
                        </h1>
                        <p className="text-gray-500">@{profileUser?.username}</p>
                    </div>
                </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="bg-white dark:bg-gray-800 rounded-lg shadow-md p-6">
                    <h2 className="text-xl font-semibold mb-4 dark:text-white">Recent Snippets</h2>
                    <p className="text-gray-500">No snippets to display.</p>
                </div>
                <div className="bg-white dark:bg-gray-800 rounded-lg shadow-md p-6">
                    <h2 className="text-xl font-semibold mb-4 dark:text-white">Achievements</h2>
                    <p className="text-gray-500">No achievements yet.</p>
                </div>
            </div>
        </div>
    );
};

export default Profile;
