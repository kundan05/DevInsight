import React, { Component, ErrorInfo, ReactNode } from 'react';
import { FiAlertTriangle } from 'react-icons/fi';

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
        console.error('ErrorBoundary caught:', error, errorInfo);
    }

    public render() {
        if (this.state.hasError) {
            return (
                <div className="flex flex-col items-center justify-center min-h-screen bg-deep-base p-8">
                    <div className="card p-8 max-w-md w-full text-center space-y-4">
                        <div className="w-14 h-14 rounded-full bg-status-danger/10 flex items-center justify-center mx-auto">
                            <FiAlertTriangle className="w-6 h-6 text-status-danger" />
                        </div>
                        <h1 className="heading text-xl text-text-primary">Something went wrong</h1>
                        <p className="text-sm text-text-muted">
                            An unexpected error occurred. Try refreshing the page.
                        </p>
                        <button
                            className="btn btn-primary mt-4"
                            onClick={() => window.location.reload()}
                        >
                            Refresh Page
                        </button>
                        {process.env.NODE_ENV === 'development' && this.state.error && (
                            <pre className="text-xs text-status-danger font-mono mt-6 p-4 bg-deep-base rounded-md text-left overflow-auto max-h-40">
                                {this.state.error.toString()}
                            </pre>
                        )}
                    </div>
                </div>
            );
        }

        return this.props.children;
    }
}

export default ErrorBoundary;
