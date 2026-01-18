import { Card } from '../../components/UI/Card';
import { Button } from '../../components/UI/Button';
import { useTheme } from '../../context/ThemeContext';
import { useAuth } from '../../context/AuthContext';
import { Sun, Moon, Monitor, User, Shield, LogOut } from 'lucide-react';
import styles from './Settings.module.css';

export const Settings = () => {
    const { theme, setTheme } = useTheme();
    const { user, logout } = useAuth();

    const themeOptions = [
        { value: 'light', label: 'Light', icon: Sun },
        { value: 'dark', label: 'Dark', icon: Moon },
        { value: 'system', label: 'System', icon: Monitor },
    ];

    return (
        <div className={styles.container}>
            <h1 className="title-gradient">Settings</h1>

            {/* User Profile Section */}
            <Card className={styles.section}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
                    <div className={styles.sectionHeader} style={{ marginBottom: 0 }}>
                        <User size={20} color="var(--accent-primary)" />
                        <h2>Profile</h2>
                    </div>
                    <Button variant="secondary" size="sm" onClick={() => window.location.href = '/profile'}>
                        Manage
                    </Button>
                </div>
                <div className={styles.profileInfo} style={{ marginTop: 16 }}>
                    <div className={styles.avatar}>
                        {user?.name?.charAt(0).toUpperCase() || 'U'}
                    </div>
                    <div className={styles.userDetails}>
                        <h3>{user?.name || 'Unknown User'}</h3>
                        <p>{user?.email || 'No email'}</p>
                        <span className={styles.role}>
                            <Shield size={14} /> {user?.role || 'VIEWER'}
                        </span>
                    </div>
                </div>
            </Card>

            {/* Theme Settings */}
            <Card className={styles.section}>
                <div className={styles.sectionHeader}>
                    <Sun size={20} color="var(--accent-primary)" />
                    <h2>Appearance</h2>
                </div>
                <p className={styles.description}>
                    Choose how InfraMonitor looks to you. Select a single theme, or sync with your system.
                </p>
                <div className={styles.themeGrid}>
                    {themeOptions.map(opt => (
                        <button
                            key={opt.value}
                            className={`${styles.themeOption} ${theme === opt.value ? styles.active : ''}`}
                            onClick={() => setTheme(opt.value as 'light' | 'dark' | 'system')}
                        >
                            <opt.icon size={24} />
                            <span>{opt.label}</span>
                        </button>
                    ))}
                </div>
            </Card>

            {/* Danger Zone */}
            <Card className={styles.section} style={{ borderColor: 'rgba(239, 68, 68, 0.3)' }}>
                <div className={styles.sectionHeader}>
                    <LogOut size={20} color="#ef4444" />
                    <h2 style={{ color: '#ef4444' }}>Danger Zone</h2>
                </div>
                <p className={styles.description}>
                    These actions are irreversible. Proceed with caution.
                </p>
                <div className={styles.dangerActions}>
                    <Button variant="danger" onClick={logout}>
                        <LogOut size={16} style={{ marginRight: 8 }} /> Sign Out
                    </Button>
                </div>
            </Card>
        </div>
    );
};
