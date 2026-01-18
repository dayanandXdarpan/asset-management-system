import { Component, type ErrorInfo, type ReactNode } from 'react';
import { Card } from './UI/Card';
import { AlertTriangle, RefreshCcw } from 'lucide-react';
import { Button } from './UI/Button';

interface Props {
    children?: ReactNode;
}

interface State {
    hasError: boolean;
    error?: Error;
}

export class ErrorBoundary extends Component<Props, State> {
    public state: State = {
        hasError: false
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
                <div style={{ height: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center', background: '#0f172a', padding: 20 }}>
                    <Card style={{ maxWidth: 500, textAlign: 'center', padding: 40 }}>
                        <div style={{ display: 'inline-flex', padding: 16, borderRadius: '50%', background: 'rgba(239, 68, 68, 0.1)', marginBottom: 20 }}>
                            <AlertTriangle size={48} color="#ef4444" />
                        </div>
                        <h1 className="title-gradient" style={{ marginBottom: 10 }}>Something went wrong</h1>
                        <p style={{ color: 'var(--text-secondary)', marginBottom: 24 }}>
                            The application encountered an unexpected error. We've logged this issue.
                        </p>
                        {this.state.error && process.env.NODE_ENV === 'development' && (
                            <pre style={{ textAlign: 'left', background: 'rgba(0,0,0,0.3)', padding: 10, borderRadius: 8, overflow: 'auto', marginBottom: 20, fontSize: '0.8rem', color: '#f87171' }}>
                                {this.state.error.toString()}
                            </pre>
                        )}
                        <Button onClick={() => window.location.reload()} fullWidth>
                            <RefreshCcw size={18} style={{ marginRight: 8 }} /> Reload Application
                        </Button>
                    </Card>
                </div>
            );
        }

        return this.props.children;
    }
}
