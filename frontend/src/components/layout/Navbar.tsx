import React from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useSelector, useDispatch } from 'react-redux';
import { RootState, AppDispatch } from '../../store';
import { logout } from '../../features/auth/authSlice';
import { FaCode, FaUser, FaSignOutAlt, FaTrophy, FaLightbulb } from 'react-icons/fa';

const Navbar: React.FC = () => {
    const { user, isAuthenticated } = useSelector((state: RootState) => state.auth);
    const dispatch = useDispatch<AppDispatch>();
    const navigate = useNavigate();

    const handleLogout = () => {
        dispatch(logout());
        navigate('/login');
    };

    return (
        <nav className="bg-white border-b border-gray-200 dark:bg-gray-800 dark:border-gray-700">
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                <div className="flex justify-between h-16">
                    <div className="flex">
                        <Link to="/" className="flex-shrink-0 flex items-center">
                            <FaCode className="h-8 w-8 text-primary-600" />
                            <span className="ml-2 text-xl font-bold text-gray-900 dark:text-white">DevInsight</span>
                        </Link>
                        <div className="hidden sm:ml-6 sm:flex sm:space-x-8">
                            <Link to="/snippets" className="border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300 inline-flex items-center px-1 pt-1 border-b-2 text-sm font-medium">
                                Snippets
                            </Link>
                            <Link to="/challenges" className="border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300 inline-flex items-center px-1 pt-1 border-b-2 text-sm font-medium">
                                Challenges
                            </Link>
                        </div>
                    </div>
                    <div className="hidden sm:ml-6 sm:flex sm:items-center">
                        {isAuthenticated ? (
                            <div className="ml-3 relative flex items-center space-x-4">
                                <Link to="/dashboard" className="text-gray-500 hover:text-gray-700 dark:text-gray-300 dark:hover:text-white">
                                    <FaTrophy className="h-5 w-5" />
                                </Link>
                                <Link to={`/profile/${user?.username}`} className="flex items-center space-x-2 text-gray-700 dark:text-gray-200 hover:text-primary-600">
                                    <img
                                        className="h-8 w-8 rounded-full"
                                        src={user?.avatar || `https://ui-avatars.com/api/?name=${user?.username}&background=random`}
                                        alt={user?.username}
                                    />
                                    <span className="text-sm font-medium">{user?.username}</span>
                                </Link>
                                <button
                                    onClick={handleLogout}
                                    className="p-1 rounded-full text-gray-400 hover:text-gray-500 focus:outline-none"
                                >
                                    <span className="sr-only">Sign out</span>
                                    <FaSignOutAlt className="h-5 w-5" />
                                </button>
                            </div>
                        ) : (
                            <div className="flex space-x-4">
                                <Link to="/login" className="text-gray-500 hover:text-gray-900 font-medium">Login</Link>
                                <Link to="/register" className="bg-primary-600 text-white px-4 py-2 rounded-md hover:bg-primary-700 font-medium">Register</Link>
                            </div>
                        )}
                    </div>
                </div>
            </div>
        </nav>
    );
};

export default Navbar;
