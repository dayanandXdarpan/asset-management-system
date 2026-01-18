import { useState } from 'react';
import { useAuth } from '../../context/AuthContext';
import { Button } from '../../components/UI/Button';
import { Input } from '../../components/UI/Input';
import { api } from '../../services/api';
import { Zap, ArrowRight, Activity } from 'lucide-react';
import toast from 'react-hot-toast';
import styles from './Login.module.css';

export const Login = () => {
    const { login } = useAuth();
    const [isLogin, setIsLogin] = useState(true);
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [name, setName] = useState('');
    const [loading, setLoading] = useState(false);

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setLoading(true);
        try {
            if (isLogin) {
                const res = await api.login({ email, password });
                toast.success(`Welcome back, ${res.user.name}!`);
                login(res.token, res.user);
            } else {
                await api.post('/register', { name, email, password });
                toast.success('Account created! Logging you in...');
                const res = await api.login({ email, password });
                login(res.token, res.user);
            }
        } catch (err: any) {
            console.error(err);
            toast.error(err.message || 'Authentication failed');
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className={styles.container}>
            <div className={`${styles.orb} ${styles.orb1}`} />
            <div className={`${styles.orb} ${styles.orb2}`} />
            
            <div className={styles.card}>
                <div className={styles.header}>
                    <div className={styles.logoWrapper}>
                        <Zap size={32} color="#2563eb" fill="#2563eb" fillOpacity={0.2} />
                    </div>
                    <span className={styles.companyName}>Bihar State Power (Holding) Co. Ltd.</span>
                    <h1 className={styles.title}>BSPHCL <span>InfraMonitor</span></h1>
                    <p className={styles.subtitle}>Secure IT Asset Management Portal</p>
                </div>

                <form onSubmit={handleSubmit} className={styles.form}>
                    {!isLogin && (
                        <Input
                            label="Full Name"
                            type="text"
                            value={name}
                            onChange={e => setName(e.target.value)}
                            required={!isLogin}
                            placeholder="Enter your full name"
                        />
                    )}

                    <Input
                        label="Official Email"
                        type="email"
                        value={email}
                        onChange={e => setEmail(e.target.value)}
                        required
                        placeholder="employee@bsphcl.co.in"
                    />

                    <Input
                        label="Password"
                        type="password"
                        value={password}
                        onChange={e => setPassword(e.target.value)}
                        required
                        placeholder="••••••••"
                    />

                    <Button type="submit" fullWidth disabled={loading} style={{ height: 48, fontSize: '1rem' }}>
                        {loading ? 'Processing...' : (
                            <span style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 8 }}>
                                {isLogin ? 'Sign In' : 'Create Account'} 
                                <ArrowRight size={18} />
                            </span>
                        )}
                    </Button>
                </form>

                <div className={styles.footer}>
                    <p style={{ marginBottom: 16 }}>
                        {isLogin ? "Don't have an account?" : "Already have an account?"}
                        <button 
                            onClick={() => setIsLogin(!isLogin)}
                            style={{ 
                                background: 'none', 
                                border: 'none', 
                                color: '#2563eb', 
                                fontWeight: 600, 
                                cursor: 'pointer',
                                marginLeft: 6,
                                textDecoration: 'underline',
                                fontSize: 'inherit'
                            }}
                        >
                            {isLogin ? 'Register Access' : 'Login Here'}
                        </button>
                    </p>
                    <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 6, fontSize: '0.75rem', opacity: 0.7 }}>
                        <Activity size={12} />
                        <span>System Operational • v1.2.0</span>
                    </div>
                </div>
            </div>
        </div>
    );
};
