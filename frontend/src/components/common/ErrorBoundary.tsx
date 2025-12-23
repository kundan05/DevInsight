import React, { Component, ErrorInfo, ReactNode } from 'react';
import { FaExclamationTriangle } from 'react-icons/fa';

interface Props {
    children: ReactNode;
}

interface State {
    hasError: boolean;
    error: Error | null;
}

class ErrorBoundary extends Component<Props, State> {
    public state: State = {
        hasError: false,
        error: null,
    };

    public static getDerivedStateFromError(error: Error): State {
        return { hasError: true, error };
    }

    public componentDidCatch(error: Error, errorInfo: ErrorInfo) {
        console.error('Uncaught error:', error, errorInfo);
    }

    public render() {
        if (this.state.hasError) {
            return (
                <div className="flex flex-col items-center justify-center min-h-screen bg-gray-100 text-gray-800 p-4">
                    <FaExclamationTriangle className="text-6xl text-red-500 mb-4" />
                    <h1 className="text-3xl font-bold mb-2">Oops! Something went wrong.</h1>
                    <p className="text-lg mb-6">We're sorry, but an unexpected error has occurred.</p>
                    <button
                        className="px-6 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 transition-colors"
                        onClick={() => window.location.reload()}
                    >
                        Refresh Page
                    </button>
                    {process.env.NODE_ENV === 'development' && this.state.error && (
                        <div className="mt-8 p-4 bg-white rounded shadow-md max-w-2xl w-full overflow-auto">
                            <h3 className="text-lg font-semibold mb-2">Error Details:</h3>
                            <pre className="text-sm text-red-600 whitespace-pre-wrap">{this.state.error.toString()}</pre>
                        </div>
                    )}
                </div>
            );
        }

        return this.props.children;
    }
}

export default ErrorBoundary;
