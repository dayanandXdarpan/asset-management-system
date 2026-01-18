import { useState } from 'react';
import { useAuth } from '../../context/AuthContext';
import { api } from '../../services/api';
import { Card } from '../../components/UI/Card';
import { Button } from '../../components/UI/Button';
import { ArrowLeft, User, Key, Save } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import toast from 'react-hot-toast';
import styles from './Profile.module.css';

export const Profile = () => {
    const { user } = useAuth(); // We might need to update user context after profile update
    const navigate = useNavigate();

    // Update Profile State
    const [profileForm, setProfileForm] = useState({
        name: user?.name || '',
        email: user?.email || '',
    });
    const [loadingProfile, setLoadingProfile] = useState(false);

    // Change Password State
    const [passwordForm, setPasswordForm] = useState({
        currentPassword: '',
        newPassword: '',
        confirmPassword: ''
    });
    const [loadingPassword, setLoadingPassword] = useState(false);

    const handleUpdateProfile = async (e: React.FormEvent) => {
        e.preventDefault();
        setLoadingProfile(true);
        try {
            await api.updateProfile(profileForm);
            toast.success('Profile updated');
            // Ideally update local user context here, but simplified:
            window.location.reload();
        } catch (e: any) {
            toast.error(e.message || 'Failed to update profile');
        } finally {
            setLoadingProfile(false);
        }
    };

    const handleChangePassword = async (e: React.FormEvent) => {
        e.preventDefault();
        if (passwordForm.newPassword !== passwordForm.confirmPassword) {
            toast.error('New passwords do not match');
            return;
        }
        setLoadingPassword(true);
        try {
            await api.changePassword({
                currentPassword: passwordForm.currentPassword,
                newPassword: passwordForm.newPassword
            });
            toast.success('Password changed successfully');
            setPasswordForm({ currentPassword: '', newPassword: '', confirmPassword: '' });
        } catch (e: any) {
            toast.error(e.message || 'Failed to change password');
        } finally {
            setLoadingPassword(false);
        }
    };

    return (
        <div className={styles.container}>
            <div className={styles.header}>
                <Button variant="ghost" onClick={() => navigate('/settings')}>
                    <ArrowLeft size={20} style={{ marginRight: 8 }} /> Settings
                </Button>
                <h1 className="title-gradient">My Profile</h1>
            </div>

            <div className={styles.grid}>
                <Card className={styles.card}>
                    <div className={styles.cardHeader}>
                        <div className={styles.iconBox}>
                            <User size={20} color="var(--accent-primary)" />
                        </div>
                        <h3>Personal Details</h3>
                    </div>

                    <form onSubmit={handleUpdateProfile} className={styles.form}>
                        <div className={styles.formGroup}>
                            <label className={styles.label}>Full Name</label>
                            <input
                                className={styles.input}
                                value={profileForm.name}
                                onChange={e => setProfileForm({ ...profileForm, name: e.target.value })}
                                placeholder="Your full name"
                            />
                        </div>
                        <div className={styles.formGroup}>
                            <label className={styles.label}>Email Address</label>
                            <input
                                className={styles.input}
                                value={profileForm.email}
                                disabled
                                placeholder="your.email@company.com"
                            />
                        </div>
                        
                        <div style={{ marginTop: 'auto', paddingTop: 20 }}>
                            <Button type="submit" fullWidth disabled={loadingProfile}>
                                <Save size={18} style={{ marginRight: 8 }} />
                                {loadingProfile ? 'Saving...' : 'Update Details'}
                            </Button>
                        </div>
                    </form>
                </Card>

                <Card className={styles.card}>
                    <div className={styles.cardHeader}>
                        <div className={styles.iconBox} style={{ background: 'rgba(239, 68, 68, 0.1)' }}>
                            <Key size={20} color="#ef4444" />
                        </div>
                        <h3>Security</h3>
                    </div>

                    <form onSubmit={handleChangePassword} className={styles.form}>
                        <div className={styles.formGroup}>
                            <label className={styles.label}>Current Password</label>
                            <input
                                type="password"
                                required
                                className={styles.input}
                                value={passwordForm.currentPassword}
                                onChange={e => setPasswordForm({ ...passwordForm, currentPassword: e.target.value })}
                                placeholder="••••••••"
                            />
                        </div>
                        <div className={styles.formGroup}>
                            <label className={styles.label}>New Password</label>
                            <input
                                type="password"
                                required
                                minLength={6}
                                className={styles.input}
                                value={passwordForm.newPassword}
                                onChange={e => setPasswordForm({ ...passwordForm, newPassword: e.target.value })}
                                placeholder="••••••••"
                            />
                        </div>
                        <div className={styles.formGroup}>
                            <label className={styles.label}>Confirm Password</label>
                            <input
                                type="password"
                                required
                                minLength={6}
                                className={styles.input}
                                value={passwordForm.confirmPassword}
                                onChange={e => setPasswordForm({ ...passwordForm, confirmPassword: e.target.value })}
                                placeholder="••••••••"
                            />
                        </div>

                        <div style={{ marginTop: 20 }}>
                            <Button type="submit" variant="secondary" fullWidth disabled={loadingPassword}>
                                <Save size={18} style={{ marginRight: 8 }} />
                                {loadingPassword ? 'Updating...' : 'Update Password'}
                            </Button>
                        </div>
                    </form>
                </Card>
            </div>
        </div>
    );
};
