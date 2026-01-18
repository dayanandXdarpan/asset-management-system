import { useEffect, useState } from 'react';
import { api } from '../../services/api';
import { Card } from '../../components/UI/Card';
import { Pagination } from '../../components/UI/Pagination';
import { useAuth } from '../../context/AuthContext';
import { Shield, Activity } from 'lucide-react';
import styles from './AuditLogs.module.css';
import toast from 'react-hot-toast';

interface AuditLog {
    id: number;
    action: string;
    entity: string;
    entityId: number | null;
    details: string | null;
    createdAt: string;
    user: {
        name: string;
        email: string;
    };
}

export const AuditLogs = () => {
    const { user: currentUser } = useAuth();
    const [logs, setLogs] = useState<AuditLog[]>([]);
    const [loading, setLoading] = useState(true);
    const [page, setPage] = useState(1);
    const ITEMS_PER_PAGE = 15;

    const loadLogs = async () => {
        try {
            const data = await api.getAuditLogs();
            setLogs(data);
        } catch (e) {
            toast.error('Failed to load audit logs');
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => { loadLogs(); }, []);

    if (currentUser?.role !== 'ADMIN') {
        return (
            <div className={styles.accessDenied}>
                <Shield size={64} color="var(--accent-primary)" />
                <h2>Access Denied</h2>
                <p>You need administrator privileges to view this page.</p>
            </div>
        );
    }

    const getActionColor = (action: string) => {
        switch (action.toUpperCase()) {
            case 'CREATE': return '#10b981';
            case 'UPDATE': return '#f59e0b';
            case 'DELETE': return '#ef4444';
            default: return 'var(--text-primary)';
        }
    };

    const totalPages = Math.ceil(logs.length / ITEMS_PER_PAGE);
    const paginatedLogs = logs.slice((page - 1) * ITEMS_PER_PAGE, page * ITEMS_PER_PAGE);

    return (
        <div className={styles.container}>
            <div className={styles.header}>
                <h1 className="title-gradient">System Audit Logs</h1>
                <div className={styles.badge}>
                    <Activity size={16} style={{ marginRight: 6 }} />
                    System Activity
                </div>
            </div>

            <Card className={styles.card}>
                {loading ? (
                    <div className={styles.loading}>Loading logs...</div>
                ) : (
                    <div className={styles.tableWrapper}>
                        <table className={styles.table}>
                            <thead>
                                <tr>
                                    <th>Time</th>
                                    <th>User</th>
                                    <th>Action</th>
                                    <th>Entity</th>
                                    <th>Details</th>
                                </tr>
                            </thead>
                            <tbody>
                                {paginatedLogs.map(log => (
                                    <tr key={log.id}>
                                        <td className={styles.dateCell}>{new Date(log.createdAt).toLocaleString()}</td>
                                        <td>
                                            <div className={styles.userCell}>
                                                <div className={styles.avatar}>{log.user.name.charAt(0).toUpperCase()}</div>
                                                <div style={{ display: 'flex', flexDirection: 'column' }}>
                                                    <span className={styles.userName}>{log.user.name}</span>
                                                    <span className={styles.userEmail}>{log.user.email}</span>
                                                </div>
                                            </div>
                                        </td>
                                        <td>
                                            <span className={styles.actionBadge} style={{ color: getActionColor(log.action), borderColor: getActionColor(log.action) + '40', background: getActionColor(log.action) + '10' }}>
                                                {log.action}
                                            </span>
                                        </td>
                                        <td>
                                            <span className={styles.entity}>
                                                {log.entity} <span style={{ color: 'var(--text-muted)' }}>#{log.entityId}</span>
                                            </span>
                                        </td>
                                        <td className={styles.detailsCell}>
                                            {log.details || '-'}
                                        </td>
                                    </tr>
                                ))}
                                {logs.length === 0 && (
                                    <tr>
                                        <td colSpan={5} style={{ textAlign: 'center', padding: 40, color: 'var(--text-muted)' }}>
                                            No audit logs found.
                                        </td>
                                    </tr>
                                )}
                            </tbody>
                        </table>
                    </div>
                )}
                {!loading && (
                    <Pagination
                        currentPage={page}
                        totalPages={totalPages}
                        onPageChange={setPage}
                    />
                )}
            </Card>
        </div>
    );
};
