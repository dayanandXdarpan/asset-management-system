import { useNavigate } from 'react-router-dom';
import { Card } from '../components/UI/Card';
import { Button } from '../components/UI/Button';
import { Home, ArrowLeft } from 'lucide-react';

export const NotFound = () => {
    const navigate = useNavigate();

    return (
        <div style={{
            height: '100vh',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            background: 'var(--bg-primary)',
            color: 'var(--text-primary)'
        }}>
            <Card style={{ textAlign: 'center', padding: 48, maxWidth: 500 }}>
                <h1 style={{ fontSize: '6rem', margin: 0, color: 'var(--accent-primary)' }}>404</h1>
                <h2 className="title-gradient" style={{ marginBottom: 8 }}>Page Not Found</h2>
                <p style={{ color: 'var(--text-secondary)', marginBottom: 32 }}>
                    The page you're looking for doesn't exist or has been moved.
                </p>
                <div style={{ display: 'flex', gap: 12, justifyContent: 'center' }}>
                    <Button variant="ghost" onClick={() => navigate(-1)}>
                        <ArrowLeft size={18} style={{ marginRight: 8 }} /> Go Back
                    </Button>
                    <Button onClick={() => navigate('/')}>
                        <Home size={18} style={{ marginRight: 8 }} /> Dashboard
                    </Button>
                </div>
            </Card>
        </div>
    );
};
