import React, { useEffect, useState } from 'react';
import { useParams, Link } from 'react-router-dom';
import { useSelector } from 'react-redux';
import { RootState } from '../store';
import api from '../services/api';
import { FiCode, FiAward, FiUser, FiHeart, FiMessageSquare } from 'react-icons/fi';

interface ProfileUser {
    id: string;
    username: string;
    firstName?: string;
    lastName?: string;
    bio?: string;
    avatar?: string;
    githubUrl?: string;
    linkedinUrl?: string;
    role: string;
    createdAt: string;
    _count: { snippets: number; challengeSubmissions: number; achievements: number };
}

interface Snippet {
    id: string;
    title: string;
    description: string;
    language: string;
    createdAt: string;
    _count: { likes: number; comments: number };
}

const LANG_COLORS: Record<string, string> = {
    javascript: 'text-status-warning',
    typescript: 'text-accent-teal',
    python: 'text-accent-copper',
    java: 'text-status-danger',
    cpp: 'text-accent-teal',
    html: 'text-status-warning',
    css: 'text-accent-copper',
};

const Profile: React.FC = () => {
    const { username } = useParams<{ username: string }>();
    const { user: authUser } = useSelector((state: RootState) => state.auth);
    const [profileUser, setProfileUser] = useState<ProfileUser | null>(null);
    const [snippets, setSnippets] = useState<Snippet[]>([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const fetchProfile = async () => {
            try {
                const [profileRes, snippetsRes] = await Promise.all([
                    api.get(`/users/profile/${username}`),
                    api.get('/snippets', { params: { authorId: username, limit: 5 } }),
                ]);
                setProfileUser(profileRes.data.user);
                setSnippets(snippetsRes.data.data || []);
            } catch (error) {
                console.error('Error fetching profile', error);
            } finally {
                setLoading(false);
            }
        };
        fetchProfile();
    }, [username]);

    if (loading) {
        return (
            <div className="max-w-4xl mx-auto text-center py-20 animate-fade-in">
                <div className="w-8 h-8 border-2 border-accent-copper border-t-transparent rounded-full animate-spin mx-auto" />
            </div>
        );
    }
    if (!profileUser) {
        return (
            <div className="max-w-4xl mx-auto text-center py-20 animate-fade-in">
                <p className="text-text-muted">User not found</p>
                <Link to="/" className="btn btn-ghost mt-4">Go Home</Link>
            </div>
        );
    }

    return (
        <div className="max-w-4xl mx-auto animate-fade-in">
            <div className="card p-8 mb-8">
                <div className="flex items-center gap-6">
                    <div className="w-16 h-16 rounded-full bg-deep-elevated border-2 border-border flex items-center justify-center overflow-hidden flex-shrink-0">
                        {profileUser.avatar ? (
                            <img src={profileUser.avatar} alt="" className="w-full h-full object-cover" />
                        ) : (
                            <FiUser className="w-6 h-6 text-text-muted" />
                        )}
                    </div>
                    <div className="flex-1 min-w-0">
                        <h1 className="heading text-2xl text-text-primary mb-1 truncate">
                            {[profileUser.firstName, profileUser.lastName].filter(Boolean).join(' ') || profileUser.username}
                        </h1>
                        <p className="text-text-muted font-mono text-sm">
                            @{profileUser.username}
                        </p>
                        {profileUser.bio && (
                            <p className="text-sm text-text-muted/70 mt-2">{profileUser.bio}</p>
                        )}
                        <div className="flex items-center gap-4 mt-3 text-xs text-text-muted font-mono">
                            <span>{profileUser._count.snippets} snippets</span>
                            <span>{profileUser._count.challengeSubmissions} challenges</span>
                            {profileUser._count.achievements > 0 && (
                                <span>{profileUser._count.achievements} achievements</span>
                            )}
                        </div>
                    </div>
                </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="card p-6">
                    <div className="flex items-center gap-2 mb-4">
                        <FiCode className="w-4 h-4 text-accent-copper" />
                        <h2 className="font-semibold text-text-primary">Recent Snippets</h2>
                    </div>
                    {snippets.length === 0 ? (
                        <div className="text-sm text-text-muted py-8 text-center">
                            {authUser?.username === username
                                ? 'No snippets yet. Create your first one!'
                                : 'No snippets yet.'}
                        </div>
                    ) : (
                        <div className="space-y-2">
                            {snippets.map((s) => (
                                <Link
                                    key={s.id}
                                    to={`/snippets/${s.id}`}
                                    className="flex items-center justify-between p-3 rounded-md bg-deep-surface border border-border hover:border-accent-copper/30 transition-all group"
                                >
                                    <div className="min-w-0 flex-1">
                                        <p className="text-sm text-text-primary truncate group-hover:text-accent-copper transition-colors">{s.title}</p>
                                        <div className="flex items-center gap-3 mt-1 text-xs text-text-muted">
                                            <span className={`font-mono ${LANG_COLORS[s.language] || 'text-text-muted'}`}>{s.language}</span>
                                            <span className="flex items-center gap-1"><FiHeart className="w-3 h-3" />{s._count.likes}</span>
                                            <span className="flex items-center gap-1"><FiMessageSquare className="w-3 h-3" />{s._count.comments}</span>
                                        </div>
                                    </div>
                                </Link>
                            ))}
                        </div>
                    )}
                </div>
                <div className="card p-6">
                    <div className="flex items-center gap-2 mb-4">
                        <FiAward className="w-4 h-4 text-accent-copper" />
                        <h2 className="font-semibold text-text-primary">Achievements</h2>
                    </div>
                    <div className="text-sm text-text-muted py-8 text-center">
                        <p>{profileUser._count.achievements > 0 ? `${profileUser._count.achievements} achievements unlocked` : 'No achievements yet.'}</p>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default Profile;
