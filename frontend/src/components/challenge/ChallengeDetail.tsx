import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import api from '../../services/api';
import { Challenge, ChallengeSubmissionResult } from '../../types';
import CodeEditor from '../editor/CodeEditor';
import toast from 'react-hot-toast';

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
                console.error('Error fetching challenge:', error);
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

            const response = await api.post(`/challenges/${id}/run`, {
                code,
                language
            });

            setRunResult(response.data.results);
            toast.success('Run completed');
        } catch (error: any) {
            console.error('Run error:', error);
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

            const response = await api.post(`/challenges/${id}/submit`, {
                code,
                language
            });

            setResult(response.data);
            if (response.data.submission.status === 'ACCEPTED') {
                toast.success('Solution Accepted!');
            } else {
                toast.error('Wrong Answer');
            }
        } catch (error: any) {
            console.error('Submission error:', error);
            toast.error(error.response?.data?.message || 'Failed to submit solution');
        } finally {
            setSubmitting(false);
        }
    };

    if (loading) return <div className="text-gray-900 dark:text-white p-6">Loading...</div>;
    if (!challenge) return <div className="text-gray-900 dark:text-white p-6">Challenge not found</div>;

    return (
        <div className="flex h-[calc(100vh-64px)] overflow-hidden">
            {/* Left Panel: Problem Description */}
            <div className="w-1/3 bg-gray-800 border-r border-gray-700 flex flex-col overflow-y-auto">
                <div className="p-6">
                    <div className="flex justify-between items-start mb-4">
                        <h1 className="text-2xl font-bold text-white">{challenge.title}</h1>
                        <span className="bg-indigo-600 text-white text-xs px-2 py-1 rounded">
                            {challenge.difficulty}
                        </span>
                    </div>

                    <div className="prose prose-invert max-w-none mb-6">
                        <div className="whitespace-pre-wrap text-gray-300 font-sans">
                            {challenge.description}
                        </div>
                    </div>

                    <div className="mb-6">
                        <h3 className="text-lg font-semibold text-white mb-2">Example</h3>
                        {challenge.testCases && challenge.testCases.length > 0 && (
                            <div className="bg-gray-900 p-4 rounded-md">
                                <p className="text-gray-400 text-sm mb-1">Input:</p>
                                <pre className="text-green-400 mb-2 font-mono text-sm">{JSON.stringify(challenge.testCases[0].input, null, 2)}</pre>
                                <p className="text-gray-400 text-sm mb-1">Output:</p>
                                <pre className="text-green-400 font-mono text-sm">{JSON.stringify(challenge.testCases[0].expectedOutput, null, 2)}</pre>
                            </div>
                        )}
                    </div>
                </div>
            </div>

            {/* Right Panel: Code Editor */}
            <div className="w-2/3 flex flex-col bg-gray-900">
                <div className="flex-1 overflow-hidden">
                    <CodeEditor
                        value={code}
                        onChange={(val) => setCode(val || '')}
                        language={language}
                        // @ts-ignore
                        onLanguageChange={setLanguage}
                        theme="vs-dark"
                    />
                </div>

                {/* Bottom Panel: Actions & Results */}
                <div className="bg-gray-800 border-t border-gray-700 p-4">
                    <div className="flex justify-between items-center">
                        <div className="flex items-center gap-4">
                            {result ? (
                                <div className={`text-sm font-bold ${result.submission.status === 'ACCEPTED' ? 'text-green-500' : 'text-red-500'}`}>
                                    Status: {result.submission.status}
                                    {result.submission.totalTests && (
                                        <span className="ml-2 text-gray-400 font-normal">
                                            ({result.submission.testsPassed}/{result.submission.totalTests} tests passed)
                                        </span>
                                    )}
                                </div>
                            ) : runResult ? (
                                <div className={`text-sm font-bold ${runResult.testsPassed === runResult.totalTests ? 'text-green-500' : 'text-yellow-500'}`}>
                                    Run Results: {runResult.testsPassed}/{runResult.totalTests} passed
                                </div>
                            ) : null}
                        </div>
                        <div className="flex gap-3">
                            <button
                                onClick={handleRun}
                                disabled={running || submitting}
                                className={`px-4 py-2 rounded font-medium transition-colors border border-gray-600 ${running
                                    ? 'bg-gray-700 text-gray-400 cursor-not-allowed'
                                    : 'bg-gray-700 hover:bg-gray-600 text-white'
                                    }`}
                            >
                                {running ? 'Running...' : 'Run Code'}
                            </button>
                            <button
                                onClick={handleSubmit}
                                disabled={submitting || running}
                                className={`px-6 py-2 rounded font-medium transition-colors ${submitting
                                    ? 'bg-gray-600 text-gray-400 cursor-not-allowed'
                                    : 'bg-green-600 hover:bg-green-700 text-white'
                                    }`}
                            >
                                {submitting ? 'Running...' : 'Submit Solution'}
                            </button>
                        </div>
                    </div>

                    {((result && result.submission.feedback) || runResult) && (
                        <div className="mt-4 bg-black bg-opacity-30 p-2 rounded text-sm text-gray-300 max-h-32 overflow-y-auto font-mono">
                            {(() => {
                                const feedback = result ? result.submission.feedback : runResult.results;
                                const safeFeedback = Array.isArray(feedback) ? feedback : [];

                                return safeFeedback.map((res: any, idx: number) => (
                                    <div key={idx} className={res.passed ? 'text-green-400' : 'text-red-400'}>
                                        Test Case {idx + 1}: {res.passed ? 'PASSED' : (
                                            <span>
                                                FAILED
                                                {res.error ? ` (${res.error})` : (
                                                    res.output !== undefined && challenge?.testCases?.[idx] ?
                                                        ` (Expected: ${JSON.stringify(challenge.testCases[idx].expectedOutput)}, Actual: ${JSON.stringify(res.output)})`
                                                        : ' (Output mismatch)'
                                                )}
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
