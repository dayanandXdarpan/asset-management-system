import { useEffect, useState } from 'react';
import { useLocation } from 'react-router-dom';
import { api } from '../../services/api';
import { Card } from '../../components/UI/Card';
import { Button } from '../../components/UI/Button';
import { Skeleton } from '../../components/UI/Skeleton';
import { RoleGuard } from '../../components/RoleGuard';
import { Pagination } from '../../components/UI/Pagination';
import { Wrench, Calendar, User, Trash2, RefreshCw, Clock, CheckCircle } from 'lucide-react';
import styles from './Maintenance.module.css';
import toast from 'react-hot-toast';

interface MaintenanceLog {
    id: number;
    assetId: number;
    date: string;
    dueDate?: string;
    workDescription: string;
    performedBy: string;
    status: 'SCHEDULED' | 'IN_PROGRESS' | 'COMPLETED' | 'CANCELLED';
    priority: 'LOW' | 'MEDIUM' | 'HIGH';
    asset?: { name: string; type: string };
}

interface Asset {
    id: number;
    name: string;
    type: string;
}

import { useDataManagement } from '../../hooks/useDataManagement';
import { DataToolbar } from '../../components/Common/DataToolbar';

export const MaintenanceList = () => {
    const location = useLocation();
    const [activeTab, setActiveTab] = useState<'scheduled' | 'history'>('scheduled');
    const [rawLogs, setRawLogs] = useState<MaintenanceLog[]>([]); // Renamed from logs
    const [assets, setAssets] = useState<Asset[]>([]);
    const [loading, setLoading] = useState(true);
    const [showForm, setShowForm] = useState(false);
    const [submitting, setSubmitting] = useState(false);
    const [newLog, setNewLog] = useState({
        assetId: '',
        workDescription: '',
        performedBy: '',
        date: new Date().toISOString().split('T')[0],
        dueDate: '',
        priority: 'MEDIUM',
        status: 'SCHEDULED'
    });
    const [page, setPage] = useState(1);
    const ITEMS_PER_PAGE = 5;

    // We filter rawLogs based on the tab FIRST, then pass to useDataManagement for Search/Sort
    const tabData = rawLogs.filter(l => activeTab === 'scheduled' ? (l.status !== 'COMPLETED') : (l.status === 'COMPLETED'));

    const {
        searchTerm,
        setSearchTerm,
        sortConfig,
        setSortConfig,
        processedData: logs, // Map processedData back to 'logs' for the render loop
        exportCSV
    } = useDataManagement(tabData, { key: 'date', direction: 'desc' }, ['workDescription', 'performedBy', 'asset.name']);

    useEffect(() => {
        if (location.state?.assetId) {
            setNewLog(prev => ({ ...prev, assetId: String(location.state.assetId) }));
            setShowForm(true);
            window.history.replaceState({}, document.title);
        }
    }, [location.state]);

    const loadData = async () => {
        setLoading(true);
        try {
            const [logsData, assetsData] = await Promise.all([
                api.getMaintenance(),
                api.getAssets('?limit=1000')
            ]);
            setRawLogs(logsData);
            setAssets(assetsData.data || assetsData);
        } catch (e) {
            toast.error('Failed to load data');
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => { loadData(); }, []);

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setSubmitting(true);
        try {
            await api.logMaintenance({
                ...newLog,
                status: activeTab === 'history' ? 'COMPLETED' : 'SCHEDULED',
                assetId: Number(newLog.assetId)
            });
            toast.success('Maintenance logged successfully');
            setNewLog({
                assetId: '',
                workDescription: '',
                performedBy: '',
                date: new Date().toISOString().split('T')[0],
                dueDate: '',
                priority: 'MEDIUM',
                status: 'SCHEDULED'
            });
            setShowForm(false);
            loadData();
        } catch (e) {
            toast.error('Failed to log maintenance');
        } finally {
            setSubmitting(false);
        }
    };

    const handleDelete = async (id: number) => {
        try {
            await api.deleteMaintenance(id);
            toast.success('Record deleted');
            setRawLogs(rawLogs.filter(l => l.id !== id));
        } catch (e) {
            toast.error('Failed to delete record');
        }
    };

    // Pagination logic
    const filteredLogs = logs;
    const totalPages = Math.ceil(filteredLogs.length / ITEMS_PER_PAGE);
    const paginatedLogs = filteredLogs.slice((page - 1) * ITEMS_PER_PAGE, page * ITEMS_PER_PAGE);

    if (loading) {
        return (
            <div className={styles.container}>
                    <div className={styles.header}>
                        <h1 className="title-gradient" style={{ fontSize: '2rem' }}>Maintenance Hub</h1>
                        <p style={{ color: 'var(--text-secondary)', marginTop: -20, marginBottom: 24 }}>Track repairs, schedule services, and view maintenance history.</p>
                    </div>
                <div className={styles.timeline}>
                    {[1, 2, 3].map(i => (
                        <Card key={i} className={styles.logCard}>
                            <Skeleton height={20} width="40%" />
                            <Skeleton height={16} width="60%" />
                            <Skeleton height={40} />
                        </Card>
                    ))}
                </div>
            </div>
        );
    }

    return (
        <div className={styles.container}>
            <div className={styles.header}>
                <h1 className="title-gradient">Maintenance Hub</h1>
                <div style={{ display: 'flex', gap: 12 }}>
                    <Button variant="secondary" onClick={loadData}>
                        <RefreshCw size={18} style={{ marginRight: 8 }} /> Refresh
                    </Button>
                    <RoleGuard allowedRoles={['ADMIN', 'TECHNICIAN']}>
                        <Button onClick={() => setShowForm(!showForm)}>
                            <Wrench size={18} style={{ marginRight: 8 }} /> {showForm ? 'Cancel' : 'New Ticket'}
                        </Button>
                    </RoleGuard>
                </div>
            </div>

            {/* Tabs */}
            <div style={{ display: 'flex', gap: 20, marginBottom: 20, borderBottom: '1px solid var(--border-glass)' }}>
                <button
                    className={styles.tab}
                    style={{
                        padding: '10px 0',
                        borderBottom: activeTab === 'scheduled' ? '2px solid var(--accent-primary)' : 'none',
                        color: activeTab === 'scheduled' ? 'var(--accent-primary)' : 'var(--text-secondary)',
                        background: 'none', border: 'none', cursor: 'pointer', fontWeight: 500
                    }}
                    onClick={() => setActiveTab('scheduled')}
                >
                    Scheduled / In-Progress
                </button>
                <button
                    className={styles.tab}
                    style={{
                        padding: '10px 0',
                        borderBottom: activeTab === 'history' ? '2px solid var(--accent-primary)' : 'none',
                        color: activeTab === 'history' ? 'var(--accent-primary)' : 'var(--text-secondary)',
                        background: 'none', border: 'none', cursor: 'pointer', fontWeight: 500
                    }}
                    onClick={() => setActiveTab('history')}
                >
                    History
                </button>
            </div>

            <DataToolbar
                searchTerm={searchTerm}
                onSearchChange={setSearchTerm}
                sortConfig={sortConfig}
                onSortChange={setSortConfig}
                sortOptions={[
                    { key: 'date', label: 'Date' },
                    { key: 'priority', label: 'Priority' },
                    { key: 'asset.name', label: 'Asset Name' }
                ]}
                onExport={() => exportCSV(`maintenance_${activeTab}`)}
            // Import intentionally omitted for maintenance to avoid complex date/asset linking issues for now
            />

            {showForm && (
                <Card className={styles.formCard}>
                    <h3 style={{ marginBottom: 16 }}>{activeTab === 'scheduled' ? 'Schedule Maintenance' : 'Log Past Maintenance'}</h3>
                    <form onSubmit={handleSubmit} className={styles.form}>
                        <div className={styles.row}>
                            <select
                                className={styles.select}
                                value={newLog.assetId}
                                onChange={e => setNewLog({ ...newLog, assetId: e.target.value })}
                                required
                            >
                                <option value="">Select Asset</option>
                                {assets.map(a => <option key={a.id} value={a.id}>{a.name} ({a.type})</option>)}
                            </select>

                            {activeTab === 'scheduled' ? (
                                <div style={{ display: 'flex', flexDirection: 'column' }}>
                                    <label style={{ fontSize: 12 }}>Due Date</label>
                                    <input
                                        type="date"
                                        className={styles.input}
                                        value={newLog.dueDate}
                                        onChange={e => setNewLog({ ...newLog, dueDate: e.target.value })}
                                        required
                                    />
                                </div>
                            ) : (
                                <div style={{ display: 'flex', flexDirection: 'column' }}>
                                    <label style={{ fontSize: 12 }}>Date Performed</label>
                                    <input
                                        type="date"
                                        className={styles.input}
                                        value={newLog.date}
                                        onChange={e => setNewLog({ ...newLog, date: e.target.value })}
                                        required
                                    />
                                </div>
                            )}

                            <div style={{ display: 'flex', flexDirection: 'column' }}>
                                <label style={{ fontSize: 12 }}>Priority</label>
                                <select
                                    className={styles.select}
                                    value={newLog.priority}
                                    onChange={e => setNewLog({ ...newLog, priority: e.target.value as any })}
                                >
                                    <option value="LOW">Low</option>
                                    <option value="MEDIUM">Medium</option>
                                    <option value="HIGH">High</option>
                                </select>
                            </div>
                        </div>

                        <input
                            className={styles.input}
                            placeholder="Technician Name"
                            value={newLog.performedBy}
                            onChange={e => setNewLog({ ...newLog, performedBy: e.target.value })}
                            required
                        />

                        <textarea
                            className={styles.textarea}
                            placeholder="Description of work..."
                            value={newLog.workDescription}
                            onChange={e => setNewLog({ ...newLog, workDescription: e.target.value })}
                            required
                            rows={4}
                        />

                        <div style={{ display: 'flex', justifyContent: 'flex-end', gap: 10 }}>
                            <Button type="button" variant="ghost" onClick={() => setShowForm(false)}>Cancel</Button>
                            <Button type="submit" disabled={submitting}>
                                {submitting ? 'Submitting...' : 'Submit Ticket'}
                            </Button>
                        </div>
                    </form>
                </Card>
            )}

            <div className={styles.timeline}>
                {paginatedLogs.map((log) => {
                        const isOverdue = log.dueDate && new Date(log.dueDate) < new Date() && log.status !== 'COMPLETED';
                        const dueText = log.dueDate ? new Date(log.dueDate).toLocaleDateString() : 'N/A';

                        return (
                            <Card key={log.id} className={styles.logCard} style={{ borderLeft: isOverdue ? '4px solid #ef4444' : `4px solid ${log.priority === 'HIGH' ? '#f59e0b' : '#10b981'}` }}>
                                <div className={styles.logHeader}>
                                    <div className={styles.assetInfo}>
                                        <span className={styles.assetName}>{log.asset?.name || 'Unknown Asset'}</span>
                                        {activeTab === 'scheduled' ? (
                                            <span style={{ color: isOverdue ? '#ef4444' : 'var(--text-secondary)', display: 'flex', alignItems: 'center', gap: 4, fontWeight: isOverdue ? 'bold' : 'normal' }}>
                                                <Clock size={14} />
                                                {isOverdue ? `Overdue (${dueText})` : `Due: ${dueText}`}
                                            </span>
                                        ) : (
                                            <span className={styles.date}><Calendar size={14} style={{ marginRight: 4 }} /> {new Date(log.date).toLocaleDateString()}</span>
                                        )}
                                    </div>
                                    <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
                                        <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'flex-end' }}>
                                            <span style={{ fontSize: 12, fontWeight: 'bold' }}>{log.priority} PRIORITY</span>
                                            <span className={styles.tech}><User size={14} style={{ marginRight: 4 }} /> {log.performedBy}</span>
                                        </div>

                                        {activeTab === 'scheduled' && (
                                            <RoleGuard allowedRoles={['ADMIN', 'TECHNICIAN']}>
                                                <Button size="sm" onClick={async () => {
                                                    await api.updateMaintenance(log.id, { status: 'COMPLETED' });
                                                    toast.success('Marked as Completed');
                                                    loadData();
                                                }}>
                                                    <CheckCircle size={14} style={{ marginRight: 4 }} /> Complete
                                                </Button>
                                            </RoleGuard>
                                        )}

                                        <RoleGuard allowedRoles={['ADMIN']}>
                                            <Button variant="ghost" size="sm" onClick={() => handleDelete(log.id)}>
                                                <Trash2 size={16} color="#ef4444" />
                                            </Button>
                                        </RoleGuard>
                                    </div>
                                </div>
                                <p className={styles.description}>{log.workDescription}</p>
                            </Card>
                        );
                    })}

                {filteredLogs.length === 0 && (
                    <p className={styles.empty}>
                        {activeTab === 'scheduled' ? 'No scheduled maintenance tasks.' : 'No maintenance history found.'}
                    </p>
                )}

                <Pagination
                    currentPage={page}
                    totalPages={totalPages}
                    onPageChange={setPage}
                />
            </div>
        </div>
    );
};

