import React, { useState, useEffect } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { useNavigate, Link } from 'react-router-dom';
import { register, clearError } from '../../features/auth/authSlice';
import { AppDispatch, RootState } from '../../store';
import { toast } from 'react-hot-toast';
import { FiTerminal } from 'react-icons/fi';

const Register: React.FC = () => {
    const [formData, setFormData] = useState({
        username: '',
        email: '',
        password: '',
        firstName: '',
        lastName: '',
    });

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

    const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        setFormData({ ...formData, [e.target.name]: e.target.value });
    };

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        
        const passwordRegex = /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)/;
        if (formData.password.length < 8) {
            toast.error('Password must be at least 8 characters long');
            return;
        }
        if (!passwordRegex.test(formData.password)) {
            toast.error('Password must contain uppercase, lowercase, and a number');
            return;
        }

        dispatch(register(formData));
    };

    return (
        <div className="min-h-[80vh] flex items-center justify-center">
            <div className="w-full max-w-sm">
                <div className="text-center mb-10">
                    <div className="w-12 h-12 rounded-xl bg-accent-copper/10 border border-accent-copper/20 flex items-center justify-center mx-auto mb-4">
                        <FiTerminal className="w-6 h-6 text-accent-copper" />
                    </div>
                    <h1 className="heading text-2xl text-text-primary mb-2">Create account</h1>
                    <p className="text-sm text-text-muted">Join the DevInsight community</p>
                </div>

                <form onSubmit={handleSubmit} className="space-y-5">
                    <div className="grid grid-cols-2 gap-4">
                        <div className="space-y-1.5">
                            <label className="block text-sm text-text-muted font-medium">
                                First name
                            </label>
                            <input
                                name="firstName"
                                value={formData.firstName}
                                onChange={handleChange}
                                className="input"
                                placeholder="Jane"
                            />
                        </div>
                        <div className="space-y-1.5">
                            <label className="block text-sm text-text-muted font-medium">
                                Last name
                            </label>
                            <input
                                name="lastName"
                                value={formData.lastName}
                                onChange={handleChange}
                                className="input"
                                placeholder="Doe"
                            />
                        </div>
                    </div>

                    <div className="space-y-1.5">
                        <label className="block text-sm text-text-muted font-medium">
                            Username
                        </label>
                        <input
                            name="username"
                            required
                            value={formData.username}
                            onChange={handleChange}
                            className="input"
                            placeholder="janedoe"
                        />
                    </div>

                    <div className="space-y-1.5">
                        <label className="block text-sm text-text-muted font-medium">
                            Email
                        </label>
                        <input
                            type="email"
                            name="email"
                            required
                            value={formData.email}
                            onChange={handleChange}
                            className="input"
                            placeholder="jane@example.com"
                            autoComplete="email"
                        />
                    </div>

                    <div className="space-y-1.5">
                        <label className="block text-sm text-text-muted font-medium">
                            Password
                        </label>
                        <input
                            type="password"
                            name="password"
                            required
                            value={formData.password}
                            onChange={handleChange}
                            className="input"
                            placeholder="Min 8 characters"
                            autoComplete="new-password"
                        />
                        <p className="text-[11px] text-text-muted leading-relaxed">
                            Must be at least 8 characters and contain uppercase, lowercase, and a number.
                        </p>
                    </div>

                    <button
                        type="submit"
                        disabled={loading}
                        className="btn btn-primary w-full"
                    >
                        {loading ? 'Creating account…' : 'Create account'}
                    </button>
                </form>

                <p className="mt-8 text-center text-sm text-text-muted">
                    Already a member?{' '}
                    <Link to="/login" className="link font-medium">
                        Sign in
                    </Link>
                </p>
            </div>
        </div>
    );
};

export default Register;
