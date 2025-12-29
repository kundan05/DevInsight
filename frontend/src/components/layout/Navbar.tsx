import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useSelector, useDispatch } from 'react-redux';
import { RootState, AppDispatch } from '../../store';
import { logout } from '../../features/auth/authSlice';
import { FaCode, FaSignOutAlt, FaTrophy, FaSearch } from 'react-icons/fa';
import OrganicButton from '../common/OrganicButton';
import OrganicInput from '../common/OrganicInput';

const Navbar: React.FC = () => {
    const { user, isAuthenticated } = useSelector((state: RootState) => state.auth);
    const dispatch = useDispatch<AppDispatch>();
    const navigate = useNavigate();
    const [isSearchOpen, setIsSearchOpen] = useState(false);

    const handleLogout = () => {
        dispatch(logout());
        navigate('/login');
    };

    return (
        <nav className="relative z-50 bg-organic-sand/80 backdrop-blur-md border-b border-organic-charcoal/5 sticky top-0 transition-all duration-300">
            {/* Asymmetric max-width container */}
            <div className="max-w-[95%] mx-auto px-4 sm:px-6 lg:px-8">
                <div className="flex justify-between items-center h-20">

                    {/* Brand / Logo - Left aligned but slightly indented */}
                    <div className="flex items-center group -rotate-1 hover:rotate-1 transition-transform duration-500">
                        <Link to="/" className="flex-shrink-0 flex items-center gap-3">
                            <div className="relative">
                                <FaCode className="h-10 w-10 text-organic-moss animate-blob" />
                                <div className="absolute inset-0 bg-organic-moss blur-lg opacity-20 animate-pulse"></div>
                            </div>
                            <span className="font-display text-2xl font-bold tracking-tight text-organic-charcoal">
                                Dev<span className="text-organic-moss italic">Insight</span>
                            </span>
                        </Link>
                    </div>

                    {/* Navigation Links - Scattered/Asymmetric */}
                    <div className="hidden md:flex items-center gap-8 ml-12 absolute left-1/4 transform -translate-x-12">
                        <Link to="/snippets" className="relative group px-2 py-1 font-medium text-organic-charcoal hover:text-organic-moss transition-colors">
                            <span className="relative z-10">Snippets</span>
                            <span className="absolute bottom-0 left-0 w-full h-1 bg-organic-cell opacity-0 group-hover:opacity-20 -rotate-2 scale-x-105 transition-all"></span>
                        </Link>
                        <Link to="/challenges" className="relative group px-2 py-1 font-medium text-organic-charcoal hover:text-organic-moss transition-colors transform translate-y-2">
                            <span className="relative z-10">Challenges</span>
                            <span className="absolute bottom-0 left-0 w-full h-3 bg-yellow-200/50 -z-0 scale-x-0 group-hover:scale-x-110 rotate-1 transition-all duration-500 origin-left"></span>
                        </Link>
                    </div>

                    {/* Right Side Actions */}
                    <div className="flex items-center gap-4">
                        {/* Search as Conversation */}
                        <div className={`hidden lg:flex items-center transition-all duration-500 ${isSearchOpen ? 'w-64' : 'w-10'}`}>
                            {isSearchOpen ? (
                                <div className="relative w-full">
                                    <input
                                        autoFocus
                                        onBlur={() => setIsSearchOpen(false)}
                                        placeholder="What are you building today?"
                                        className="w-full bg-organic-clay/50 rounded-full px-4 py-2 text-sm focus:outline-none focus:ring-2 ring-organic-moss border-none placeholder-gray-500"
                                    />
                                </div>
                            ) : (
                                <button
                                    onClick={() => setIsSearchOpen(true)}
                                    className="p-2 text-organic-charcoal hover:scale-110 transition-transform"
                                >
                                    <FaSearch className="h-5 w-5" />
                                </button>
                            )}
                        </div>

                        {isAuthenticated ? (
                            <div className="flex items-center gap-4">
                                <Link to="/dashboard" className="text-organic-charcoal hover:text-organic-moss transition-transform hover:rotate-12">
                                    <FaTrophy className="h-6 w-6" />
                                </Link>
                                <Link to={`/profile/${user?.username}`} className="flex items-center gap-2 group">
                                    <div className="relative overflow-hidden rounded-organic-2 w-10 h-10 border-2 border-organic-charcoal/10 group-hover:border-organic-moss transition-colors">
                                        <img
                                            className="h-full w-full object-cover"
                                            src={user?.avatar || `https://ui-avatars.com/api/?name=${user?.username}&background=random`}
                                            alt={user?.username}
                                        />
                                    </div>
                                    <span className="text-sm font-hand font-bold text-organic-charcoal group-hover:underline decoration-wavy decoration-organic-moss">{user?.username}</span>
                                </Link>
                                <button
                                    onClick={handleLogout}
                                    className="p-2 rounded-full text-organic-charcoal/70 hover:text-red-600 transition-colors"
                                >
                                    <FaSignOutAlt className="h-5 w-5" />
                                </button>
                            </div>
                        ) : (
                            <div className="flex items-center gap-3">
                                <Link to="/login" className="text-organic-charcoal font-medium hover:underline decoration-2 underline-offset-4 decoration-organic-moss">
                                    Login
                                </Link>
                                <Link to="/register">
                                    <OrganicButton variant="primary" shape="blob" className="text-sm px-6 py-2">
                                        Join Now
                                    </OrganicButton>
                                </Link>
                            </div>
                        )}
                    </div>
                </div>
            </div>
        </nav>
    );
};

export default Navbar;
