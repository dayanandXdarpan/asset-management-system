import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { api } from '../../services/api';
import { Card } from '../../components/UI/Card';
import { Button } from '../../components/UI/Button';
import { Skeleton } from '../../components/UI/Skeleton';
import { Activity, AlertTriangle, Box, CheckCircle, MapPin, Wrench, RefreshCw } from 'lucide-react';
import styles from './Dashboard.module.css';
import { PieChart, Pie, Cell, ResponsiveContainer, Tooltip, AreaChart, Area, XAxis, YAxis, CartesianGrid } from 'recharts';
import toast from 'react-hot-toast';

interface Stats {
    totalAssets: number;
    activeAssets: number;
    maintenanceCount: number;
    locations: number;
}

interface MaintenanceLog {
    id: number;
    date: string;
    workDescription: string;
    performedBy: string;
    asset?: { name: string };
}

export const Dashboard = () => {
    const navigate = useNavigate();
    const [stats, setStats] = useState<Stats>({
        totalAssets: 0,
        activeAssets: 0,
        maintenanceCount: 0,
        locations: 0
    });
    const [activity, setActivity] = useState<MaintenanceLog[]>([]);
    const [assets, setAssets] = useState<any[]>([]); // For attention list
    const [trendData, setTrendData] = useState<any[]>([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(false);

    const loadData = async () => {
        setLoading(true);
        setError(false);
        try {
            const [statsData, records, assetsData] = await Promise.all([
                api.getStats(),
                api.getMaintenance(),
                api.getAssets()
            ]);
            setStats(statsData);
            setActivity(records);
            setAssets(assetsData.data || assetsData);

            // Calculate Trends (Last 6 months)
            const months = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];
            const last6Months = Array.from({ length: 6 }, (_, i) => {
                const d = new Date();
                d.setMonth(d.getMonth() - (5 - i));
                return {
                    name: months[d.getMonth()],
                    date: d.toISOString().slice(0, 7), // YYYY-MM
                    count: 0
                };
            });

            records.forEach((rec: any) => {
                const recDate = rec.date.slice(0, 7);
                const month = last6Months.find(m => m.date === recDate);
                if (month) month.count++;
            });
            setTrendData(last6Months);

        } catch (e) {
            console.error("Failed to load dashboard data", e);
            setError(true);
            toast.error('Failed to load dashboard data');
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => { loadData(); }, []);

    // Filter assets needing attention
    const attentionAssets = assets.filter(a => a.status !== 'OPERATIONAL');

    const statCards = [
        { label: 'Total Assets', value: stats.totalAssets, icon: Box, color: 'var(--accent-primary)' },
        { label: 'Operational', value: stats.activeAssets, icon: CheckCircle, color: '#10b981' },
        { label: 'Maintenance Logs', value: stats.maintenanceCount, icon: Activity, color: '#f59e0b' },
        { label: 'Locations', value: stats.locations, icon: MapPin, color: 'var(--accent-secondary)' },
    ];

    const statusData = [
        { name: 'Operational', value: stats.activeAssets || 0, color: '#10b981' },
        { name: 'Downtime', value: Math.max(0, stats.totalAssets - stats.activeAssets), color: '#ef4444' }
    ];

    if (loading) {
        return (
            <div className={styles.dashboard}>
                <h1 className={styles.title}>Dashboard Overview</h1>
                <div className={styles.grid}>
                    {[1, 2, 3, 4].map(i => (
                        <Card key={i} className={styles.statCard}>
                            <div className={styles.statContent}>
                                <div>
                                    <Skeleton width={100} height={16} />
                                    <Skeleton width={60} height={32} />
                                </div>
                                <Skeleton variant="circular" width={48} height={48} />
                            </div>
                        </Card>
                    ))}
                </div>
            </div>
        );
    }

    if (error) {
        return (
            <div className={styles.dashboard}>
                <h1 className={styles.title}>Dashboard Overview</h1>
                <Card style={{ textAlign: 'center', padding: 40 }}>
                    <AlertTriangle size={48} color="#ef4444" />
                    <h3 style={{ marginTop: 16 }}>Failed to load dashboard</h3>
                    <p style={{ color: 'var(--text-secondary)', marginBottom: 20 }}>
                        Please check your connection and try again.
                    </p>
                    <Button onClick={loadData}>
                        <RefreshCw size={18} style={{ marginRight: 8 }} /> Retry
                    </Button>
                </Card>
            </div>
        );
    }

    return (
        <div className={styles.dashboard}>
            <h1 className={styles.title}>Dashboard Overview</h1>

            <div className={styles.grid}>
                {statCards.map((stat, i) => (
                    <Card key={i} className={styles.statCard}>
                        <div className={styles.statContent}>
                            <div>
                                <p className={styles.statLabel}>{stat.label}</p>
                                <h3 className={styles.statValue}>{stat.value}</h3>
                            </div>
                            <div className={styles.iconBox} style={{ backgroundColor: `${stat.color}20` }}>
                                <stat.icon size={24} color={stat.color} />
                            </div>
                        </div>
                    </Card>
                ))}
            </div>

            <div className={styles.chartsRow}>
                {/* Trend Chart */}
                <Card title="Maintenance Trends" className={styles.chartCard} style={{ flex: 2 }}>
                    <div style={{ width: '100%', height: 250 }}>
                        <ResponsiveContainer>
                            <AreaChart data={trendData}>
                                <defs>
                                    <linearGradient id="colorCount" x1="0" y1="0" x2="0" y2="1">
                                        <stop offset="5%" stopColor="var(--accent-primary)" stopOpacity={0.8} />
                                        <stop offset="95%" stopColor="var(--accent-primary)" stopOpacity={0} />
                                    </linearGradient>
                                </defs>
                                <CartesianGrid strokeDasharray="3 3" stroke="var(--border-glass)" />
                                <XAxis dataKey="name" stroke="var(--text-secondary)" fontSize={12} tickLine={false} />
                                <YAxis stroke="var(--text-secondary)" fontSize={12} tickLine={false} />
                                <Tooltip
                                    contentStyle={{ backgroundColor: 'var(--bg-secondary)', borderRadius: 8, border: '1px solid var(--border-glass)' }}
                                />
                                <Area type="monotone" dataKey="count" stroke="var(--accent-primary)" fillOpacity={1} fill="url(#colorCount)" />
                            </AreaChart>
                        </ResponsiveContainer>
                    </div>
                </Card>

                <Card title="Asset Status" className={styles.chartCard} style={{ flex: 1 }}>
                    <div style={{ width: '100%', height: 250 }}>
                        <ResponsiveContainer>
                            <PieChart>
                                <Pie
                                    data={statusData}
                                    innerRadius={60}
                                    outerRadius={80}
                                    paddingAngle={5}
                                    dataKey="value"
                                >
                                    {statusData.map((entry, index) => (
                                        <Cell key={`cell-${index}`} fill={entry.color} />
                                    ))}
                                </Pie>
                                <Tooltip />
                            </PieChart>
                        </ResponsiveContainer>
                        <div style={{ display: 'flex', justifyContent: 'center', gap: 10, fontSize: '0.8rem', marginTop: 10 }}>
                            {statusData.map((entry, i) => (
                                <div key={i} style={{ display: 'flex', alignItems: 'center' }}>
                                    <div style={{ width: 10, height: 10, borderRadius: '50%', background: entry.color, marginRight: 5 }}></div>
                                    {entry.name}
                                </div>
                            ))}
                        </div>
                    </div>
                </Card>
            </div>

            <div className={styles.chartsRow}>
                {/* Actionable Insights */}
                <Card title="Attention Required" className={styles.chartCard} style={{ flex: 1 }}>
                    <div className={styles.activityList}>
                        {attentionAssets.slice(0, 5).map((asset) => (
                            <div key={asset.id} className={styles.activityItem} style={{ borderLeft: `3px solid ${asset.status === 'DOWNTIME' ? '#ef4444' : '#f59e0b'}` }}>
                                <div className={styles.activityContent}>
                                    <p className={styles.activityText}>
                                        <strong>{asset.name}</strong>
                                    </p>
                                    <span style={{ fontSize: '0.8rem', color: asset.status === 'DOWNTIME' ? '#ef4444' : '#f59e0b' }}>
                                        {asset.status}
                                    </span>
                                </div>
                                <Button size="sm" variant="ghost" onClick={() => navigate(`/assets/${asset.id}`)}>
                                    View
                                </Button>
                            </div>
                        ))}
                        {attentionAssets.length === 0 && (
                            <div style={{ textAlign: 'center', padding: 20, color: 'var(--text-muted)' }}>
                                <CheckCircle size={32} color="#10b981" style={{ marginBottom: 8 }} />
                                <p>All assets are operational!</p>
                            </div>
                        )}
                    </div>
                </Card>

                <Card title="Recent Maintenance" className={styles.chartCard} style={{ flex: 1 }}>
                    <div className={styles.activityList}>
                        {activity.slice(0, 4).map((log) => (
                            <div key={log.id} className={styles.activityItem}>
                                <div className={styles.activityIcon}>
                                    <Wrench size={14} color="#f59e0b" />
                                </div>
                                <div className={styles.activityContent}>
                                    <p className={styles.activityText}>
                                        <strong>{log.asset?.name || 'Asset'}</strong>: {log.workDescription}
                                    </p>
                                    <span className={styles.activityDate}>{new Date(log.date).toLocaleDateString()}</span>
                                </div>
                            </div>
                        ))}
                        {activity.length === 0 && <p style={{ color: 'var(--text-muted)' }}>No recent activity.</p>}
                    </div>
                </Card>
            </div>
        </div>
    );
};

