import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import api from '../../services/api';
import { Challenge, ChallengeSubmissionResult } from '../../types';
import CodeEditor from '../common/CodeEditor';
import { toast } from 'react-hot-toast';
import { FiArrowLeft, FiPlay, FiCheck } from 'react-icons/fi';

const ChallengeDetail: React.FC = () => {
    const { id } = useParams<{ id: string }>();
    const navigate = useNavigate();
    const [challenge, setChallenge] = useState<Challenge | null>(null);
    const [language, setLanguage] = useState('javascript');
    const [code, setCode] = useState<string>('');
    const [loading, setLoading] = useState(true);
    const [submitting, setSubmitting] = useState(false);
    const [running, setRunning] = useState(false);
    const [runResult, setRunResult] = useState<any>(null);
    const [result, setResult] = useState<ChallengeSubmissionResult | null>(null);

    useEffect(() => {
        const fetchChallenge = async () => {
            try {
                const response = await api.get(`/challenges/${id}`);
                setChallenge(response.data.challenge);
                setCode(response.data.challenge.starterCode || '// Write your solution here');
            } catch (error) {
                toast.error('Failed to load challenge');
                navigate('/challenges');
            } finally {
                setLoading(false);
            }
        };
        if (id) fetchChallenge();
    }, [id, navigate]);

    const handleRun = async () => {
        if (!code) return;
        try {
            setRunning(true);
            setResult(null);
            setRunResult(null);
            const response = await api.post(`/challenges/${id}/run`, { code, language });
            setRunResult(response.data.results);
            toast.success('Run completed');
        } catch (error: any) {
            toast.error(error.response?.data?.message || 'Failed to run code');
        } finally {
            setRunning(false);
        }
    };

    const handleSubmit = async () => {
        if (!code) return;
        try {
            setSubmitting(true);
            setResult(null);
            setRunResult(null);
            const response = await api.post(`/challenges/${id}/submit`, { code, language });
            setResult(response.data);
            if (response.data.submission.status === 'ACCEPTED') {
                toast.success('Solution Accepted!');
            } else {
                toast.error('Wrong Answer');
            }
        } catch (error: any) {
            toast.error(error.response?.data?.message || 'Failed to submit solution');
        } finally {
            setSubmitting(false);
        }
    };

    if (loading) {
        return (
            <div className="flex items-center justify-center min-h-[50vh]">
                <div className="w-8 h-8 border-2 border-accent-copper border-t-transparent rounded-full animate-spin" />
            </div>
        );
    }
    if (!challenge) {
        return (
            <div className="text-center py-20">
                <p className="text-text-muted">Challenge not found</p>
            </div>
        );
    }

    const isAccepted = result?.submission.status === 'ACCEPTED';

    return (
        <div className="flex flex-col lg:flex-row h-[calc(100vh-8rem)] gap-0 lg:gap-0 -mx-4 sm:-mx-6 lg:-mx-8 animate-fade-in">
            <div className="w-full lg:w-[35%] overflow-y-auto border-r border-border bg-deep-base p-6">
                <button
                    onClick={() => navigate('/challenges')}
                    className="flex items-center gap-2 text-sm text-text-muted hover:text-text-primary mb-6 transition-colors"
                >
                    <FiArrowLeft className="w-4 h-4" />
                    All Challenges
                </button>

                <div className="flex items-start justify-between mb-4">
                    <h1 className="heading text-xl text-text-primary">{challenge.title}</h1>
                    <span className={`text-xs font-mono px-2.5 py-1 rounded-md border ${
                        challenge.difficulty === 'EASY' ? 'text-status-success border-status-success/20 bg-status-success/10' :
                        challenge.difficulty === 'MEDIUM' ? 'text-status-warning border-status-warning/20 bg-status-warning/10' :
                        challenge.difficulty === 'HARD' ? 'text-status-danger border-status-danger/20 bg-status-danger/10' :
                        'text-accent-copper border-accent-copper/20 bg-accent-copper/10'
                    }`}>
                        {challenge.difficulty}
                    </span>
                </div>

                <div className="text-sm text-text-muted/80 leading-relaxed mb-6 whitespace-pre-wrap font-sans">
                    {challenge.description}
                </div>

                {challenge.testCases && challenge.testCases.length > 0 && (
                    <div className="mb-6">
                        <h3 className="text-sm font-semibold text-text-primary mb-3 font-mono">
                            Example
                        </h3>
                        <div className="bg-deep-surface border border-border rounded-lg p-4 space-y-3">
                            <div>
                                <p className="text-xs text-text-muted font-mono mb-1">Input:</p>
                                <pre className="text-sm text-status-success font-mono">
                                    {JSON.stringify(challenge.testCases[0].input, null, 2)}
                                </pre>
                            </div>
                            <div>
                                <p className="text-xs text-text-muted font-mono mb-1">Output:</p>
                                <pre className="text-sm text-status-success font-mono">
                                    {JSON.stringify(challenge.testCases[0].expectedOutput, null, 2)}
                                </pre>
                            </div>
                        </div>
                    </div>
                )}

                <div className="flex flex-wrap gap-2">
                    {challenge.tags.map((tag) => (
                        <span key={tag} className="tag">{tag}</span>
                    ))}
                </div>
            </div>

            <div className="flex-1 flex flex-col bg-deep-surface">
                <div className="flex-1 overflow-hidden">
                    <CodeEditor
                        code={code}
                        language={language}
                        onChange={(val) => setCode(val || '')}
                        showHeader
                        onLanguageChange={setLanguage}
                        height="100%"
                    />
                </div>

                <div className="border-t border-border p-4">
                    <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3">
                        <div className="flex items-center gap-3 text-sm">
                            {result ? (
                                <div className={`flex items-center gap-2 font-medium ${isAccepted ? 'text-status-success' : 'text-status-danger'}`}>
                                    {isAccepted ? <FiCheck className="w-4 h-4" /> : null}
                                    {result.submission.status === 'ACCEPTED' ? 'Accepted' : result.submission.status}
                                    {result.submission.totalTests ? (
                                        <span className="text-text-muted font-normal font-mono">
                                            ({result.submission.testsPassed}/{result.submission.totalTests})
                                        </span>
                                    ) : null}
                                </div>
                            ) : runResult ? (
                                <div className={`flex items-center gap-2 font-medium ${
                                    runResult.testsPassed === runResult.totalTests ? 'text-status-success' : 'text-status-warning'
                                }`}>
                                    {runResult.testsPassed}/{runResult.totalTests} passed
                                </div>
                            ) : null}
                        </div>
                        <div className="flex gap-2">
                            <button
                                onClick={handleRun}
                                disabled={running || submitting}
                                className="btn btn-ghost"
                            >
                                <FiPlay className="w-4 h-4" />
                                {running ? 'Running…' : 'Run'}
                            </button>
                            <button
                                onClick={handleSubmit}
                                disabled={submitting || running}
                                className="btn btn-primary"
                            >
                                {submitting ? 'Running…' : 'Submit'}
                            </button>
                        </div>
                    </div>

                    {(result?.submission?.feedback || runResult) && (
                        <div className="mt-4 bg-deep-base border border-border rounded-lg p-4 text-sm font-mono max-h-40 overflow-y-auto">
                            {(() => {
                                const feedback = result ? result.submission.feedback : runResult?.results;
                                const items = Array.isArray(feedback) ? feedback : [];
                                return items.map((res: any, idx: number) => (
                                    <div key={idx} className={res.passed ? 'text-status-success' : 'text-status-danger'}>
                                        <span className="text-text-muted">#{idx + 1}</span>{' '}
                                        {res.passed ? 'PASSED' : (
                                            <span>
                                                FAILED
                                                {res.error ? ` — ${res.error}` : ''}
                                            </span>
                                        )}
                                    </div>
                                ));
                            })()}
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
};

export default ChallengeDetail;
