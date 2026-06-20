import React from 'react';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import { useSelector, useDispatch } from 'react-redux';
import { RootState, AppDispatch } from '../../store';
import { logout } from '../../features/auth/authSlice';
import { FiTerminal, FiGrid, FiCode, FiZap, FiLogOut, FiUser } from 'react-icons/fi';

const navLinks = [
    { to: '/snippets', label: 'Snippets', icon: FiCode },
    { to: '/challenges', label: 'Challenges', icon: FiZap },
    { to: '/dashboard', label: 'Dashboard', icon: FiGrid },
];

const Navbar: React.FC = () => {
    const { user, isAuthenticated } = useSelector((state: RootState) => state.auth);
    const dispatch = useDispatch<AppDispatch>();
    const navigate = useNavigate();
    const location = useLocation();

    const handleLogout = () => {
        dispatch(logout());
        navigate('/');
    };

    const isActive = (path: string) => {
        if (path === '/') return location.pathname === '/';
        return location.pathname.startsWith(path);
    };

    return (
        <nav className="sticky top-0 z-50 bg-deep-base/80 backdrop-blur-lg border-b border-border">
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                <div className="flex items-center justify-between h-16">
                    <Link to="/" className="flex items-center gap-3 group">
                        <div className="flex items-center gap-2">
                            <FiTerminal className="w-5 h-5 text-accent-copper" />
                            <span className="font-display text-xl font-bold tracking-tight text-text-primary group-hover:text-accent-copper transition-colors">
                                Dev<span className="text-accent-copper">Insight</span>
                            </span>
                        </div>
                    </Link>

                    {isAuthenticated && (
                        <div className="hidden md:flex items-center gap-1">
                            {navLinks.map((link) => {
                                const Icon = link.icon;
                                return (
                                    <Link
                                        key={link.to}
                                        to={link.to}
                                        className={`flex items-center gap-2 px-4 py-2 text-sm rounded-md transition-all ${
                                            isActive(link.to)
                                                ? 'bg-deep-elevated text-text-primary'
                                                : 'text-text-muted hover:text-text-primary hover:bg-deep-surface'
                                        }`}
                                    >
                                        <Icon className="w-4 h-4" />
                                        {link.label}
                                    </Link>
                                );
                            })}
                        </div>
                    )}

                    <div className="flex items-center gap-3">
                        {isAuthenticated ? (
                            <>
                                <Link
                                    to={`/profile/${user?.username}`}
                                    className="flex items-center gap-2 px-3 py-1.5 text-sm text-text-muted hover:text-text-primary rounded-md hover:bg-deep-surface transition-all"
                                >
                                    <div className="w-6 h-6 rounded-full bg-deep-elevated border border-border flex items-center justify-center overflow-hidden">
                                        {user?.avatar ? (
                                            <img src={user.avatar} alt="" className="w-full h-full object-cover" />
                                        ) : (
                                            <FiUser className="w-3 h-3 text-text-muted" />
                                        )}
                                    </div>
                                    <span className="hidden sm:inline">{user?.username}</span>
                                </Link>
                                <button
                                    onClick={handleLogout}
                                    className="p-2 text-text-muted hover:text-status-danger rounded-md hover:bg-deep-surface transition-all"
                                    title="Logout"
                                >
                                    <FiLogOut className="w-4 h-4" />
                                </button>
                            </>
                        ) : (
                            <>
                                <Link
                                    to="/login"
                                    className="text-sm text-text-muted hover:text-text-primary px-3 py-2 rounded-md transition-colors"
                                >
                                    Login
                                </Link>
                                <Link
                                    to="/register"
                                    className="text-sm font-medium bg-accent-copper text-deep-base px-4 py-2 rounded-md hover:bg-accent-copper-dim transition-colors"
                                >
                                    Join Now
                                </Link>
                            </>
                        )}
                    </div>
                </div>
            </div>
        </nav>
    );
};

export default Navbar;
