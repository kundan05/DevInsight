import React, { useState, useEffect } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { useNavigate, Link } from 'react-router-dom';
import { login, clearError } from '../../features/auth/authSlice';
import { AppDispatch, RootState } from '../../store';
import { toast } from 'react-hot-toast';
import { FiTerminal, FiCode } from 'react-icons/fi';

const Login: React.FC = () => {
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');

    const dispatch = useDispatch<AppDispatch>();
    const navigate = useNavigate();
    const { loading, error, isAuthenticated } = useSelector((state: RootState) => state.auth);

    useEffect(() => {
        if (error) {
            toast.error(error);
            dispatch(clearError());
        }
        if (isAuthenticated) {
            navigate('/dashboard');
        }
    }, [error, isAuthenticated, navigate, dispatch]);

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        dispatch(login({ email, password }));
    };

    return (
        <div className="min-h-[80vh] flex items-center justify-center">
            <div className="w-full max-w-sm">
                <div className="text-center mb-10">
                    <div className="w-12 h-12 rounded-xl bg-accent-copper/10 border border-accent-copper/20 flex items-center justify-center mx-auto mb-4">
                        <FiTerminal className="w-6 h-6 text-accent-copper" />
                    </div>
                    <h1 className="heading text-2xl text-text-primary mb-2">Sign in</h1>
                    <p className="text-sm text-text-muted">Welcome back to DevInsight</p>
                </div>

                <form onSubmit={handleSubmit} className="space-y-5">
                    <div className="space-y-1.5">
                        <label className="block text-sm text-text-muted font-medium">
                            Email
                        </label>
                        <input
                            type="email"
                            required
                            value={email}
                            onChange={(e) => setEmail(e.target.value)}
                            className="input"
                            placeholder="you@example.com"
                            autoComplete="email"
                        />
                    </div>

                    <div className="space-y-1.5">
                        <label className="block text-sm text-text-muted font-medium">
                            Password
                        </label>
                        <input
                            type="password"
                            required
                            value={password}
                            onChange={(e) => setPassword(e.target.value)}
                            className="input"
                            placeholder="Enter your password"
                            autoComplete="current-password"
                        />
                    </div>

                    <button
                        type="submit"
                        disabled={loading}
                        className="btn btn-primary w-full"
                    >
                        {loading ? 'Signing in…' : 'Sign in'}
                    </button>
                </form>

                <p className="mt-8 text-center text-sm text-text-muted">
                    Don&apos;t have an account?{' '}
                    <Link to="/register" className="link font-medium">
                        Create one
                    </Link>
                </p>
            </div>
        </div>
    );
};

export default Login;
