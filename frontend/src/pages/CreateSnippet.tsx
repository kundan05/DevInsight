import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import CodeEditor from '../components/common/CodeEditor';
import api from '../services/api';
import { toast } from 'react-hot-toast';
import { FiArrowLeft } from 'react-icons/fi';

const LANGUAGES = ['javascript', 'typescript', 'python', 'java', 'cpp', 'html', 'css'];

const CreateSnippet: React.FC = () => {
    const navigate = useNavigate();
    const [title, setTitle] = useState('');
    const [description, setDescription] = useState('');
    const [language, setLanguage] = useState('javascript');
    const [code, setCode] = useState('// Write your code here');
    const [tags, setTags] = useState('');
    const [isPublic, setIsPublic] = useState(true);
    const [submitting, setSubmitting] = useState(false);

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setSubmitting(true);
        try {
            await api.post('/snippets', {
                title,
                description,
                language,
                code,
                tags: tags.split(',').map((tag) => tag.trim()).filter(Boolean),
                isPublic,
            });
            toast.success('Snippet created');
            navigate('/snippets');
        } catch (error) {
            toast.error('Failed to create snippet');
            console.error(error);
        } finally {
            setSubmitting(false);
        }
    };

    return (
        <div className="max-w-4xl mx-auto animate-fade-in">
            <button
                onClick={() => navigate('/snippets')}
                className="flex items-center gap-2 text-sm text-text-muted hover:text-text-primary mb-6 transition-colors"
            >
                <FiArrowLeft className="w-4 h-4" />
                Back to snippets
            </button>

            <h1 className="heading text-2xl sm:text-3xl text-text-primary mb-8">
                New Snippet
            </h1>

            <form onSubmit={handleSubmit} className="space-y-6">
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
                    <div className="space-y-1.5">
                        <label className="block text-sm text-text-muted font-medium">Title</label>
                        <input
                            type="text"
                            required
                            value={title}
                            onChange={(e) => setTitle(e.target.value)}
                            className="input"
                            placeholder="A descriptive title"
                        />
                    </div>
                    <div className="space-y-1.5">
                        <label className="block text-sm text-text-muted font-medium">Language</label>
                        <select
                            value={language}
                            onChange={(e) => setLanguage(e.target.value)}
                            className="input select"
                        >
                            {LANGUAGES.map((lang) => (
                                <option key={lang} value={lang}>
                                    {lang.charAt(0).toUpperCase() + lang.slice(1)}
                                </option>
                            ))}
                        </select>
                    </div>
                </div>

                <div className="space-y-1.5">
                    <label className="block text-sm text-text-muted font-medium">Description</label>
                    <textarea
                        rows={3}
                        value={description}
                        onChange={(e) => setDescription(e.target.value)}
                        className="input resize-none"
                        placeholder="What does this snippet do?"
                    />
                </div>

                <div className="space-y-1.5">
                    <label className="block text-sm text-text-muted font-medium mb-2">Code</label>
                    <CodeEditor
                        code={code}
                        language={language}
                        onChange={(value) => setCode(value || '')}
                        showHeader
                        onLanguageChange={setLanguage}
                    />
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
                    <div className="space-y-1.5">
                        <label className="block text-sm text-text-muted font-medium">
                            Tags
                        </label>
                        <input
                            type="text"
                            value={tags}
                            onChange={(e) => setTags(e.target.value)}
                            className="input"
                            placeholder="react, hooks, api"
                        />
                        <p className="text-xs text-text-muted/60 font-mono">
                            Comma-separated
                        </p>
                    </div>
                    <div className="flex items-end pb-2">
                        <label className="flex items-center gap-3 cursor-pointer">
                            <div
                                onClick={() => setIsPublic(!isPublic)}
                                className={`w-10 h-5 rounded-full transition-colors relative ${
                                    isPublic ? 'bg-accent-copper' : 'bg-deep-elevated border border-border'
                                }`}
                            >
                                <div
                                    className={`w-3.5 h-3.5 rounded-full bg-white absolute top-0.5 transition-all ${
                                        isPublic ? 'left-[22px]' : 'left-[3px]'
                                    }`}
                                />
                            </div>
                            <span className="text-sm text-text-muted">
                                {isPublic ? 'Public' : 'Private'}
                            </span>
                        </label>
                    </div>
                </div>

                <div className="flex gap-3 pt-4">
                    <button type="submit" disabled={submitting} className="btn btn-primary">
                        {submitting ? 'Creating…' : 'Create Snippet'}
                    </button>
                    <button
                        type="button"
                        onClick={() => navigate('/snippets')}
                        className="btn btn-ghost"
                    >
                        Cancel
                    </button>
                </div>
            </form>
        </div>
    );
};

export default CreateSnippet;
