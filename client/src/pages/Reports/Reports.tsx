import { useEffect, useState } from 'react';
import { api } from '../../services/api';
import { Card } from '../../components/UI/Card';
import { Button } from '../../components/UI/Button';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, PieChart, Pie, Cell, LineChart, Line } from 'recharts';
import { Download, TrendingUp, AlertTriangle, CheckCircle, Clock } from 'lucide-react';
import toast from 'react-hot-toast';
import styles from './Reports.module.css';

interface Stats {
    totalAssets: number;
    activeAssets: number;
    maintenanceCount: number;
    locations: number;
}

interface MaintenanceRecord {
    id: number;
    date: string;
    workDescription: string;
    performedBy: string;
    asset?: { name: string; type: string };
}

export const Reports = () => {
    const [stats, setStats] = useState<Stats>({ totalAssets: 0, activeAssets: 0, maintenanceCount: 0, locations: 0 });
    const [maintenance, setMaintenance] = useState<MaintenanceRecord[]>([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const loadData = async () => {
            try {
                const [statsData, maintData] = await Promise.all([
                    api.getStats(),
                    api.getMaintenance()
                ]);
                setStats(statsData);
                setMaintenance(maintData);
            } catch (e) {
                console.error('Failed to load reports data', e);
            } finally {
                setLoading(false);
            }
        };
        loadData();
    }, []);

    // Calculate status breakdown
    const statusData = [
        { name: 'Operational', value: stats.activeAssets, color: '#10b981' },
        { name: 'Downtime', value: stats.totalAssets - stats.activeAssets, color: '#ef4444' },
    ];

    // Group maintenance by month for trend chart
    const getMonthlyMaintenance = () => {
        const months: Record<string, number> = {};
        maintenance.forEach(m => {
            const month = new Date(m.date).toLocaleDateString('en-US', { month: 'short', year: '2-digit' });
            months[month] = (months[month] || 0) + 1;
        });
        return Object.entries(months).slice(-6).map(([name, count]) => ({ name, count }));
    };

    // Group by technician
    const getTechnicianStats = () => {
        const techs: Record<string, number> = {};
        maintenance.forEach(m => {
            techs[m.performedBy] = (techs[m.performedBy] || 0) + 1;
        });
        return Object.entries(techs).map(([name, count]) => ({ name, count }));
    };

    if (loading) {
        return <div className={styles.loading}>Loading reports...</div>;
    }

    const downloadCSV = (data: any[], filename: string) => {
        if (!data.length) return;
        const headers = Object.keys(data[0]).join(',');
        const rows = data.map(obj => Object.values(obj).map(val =>
            typeof val === 'string' && val.includes(',') ? `"${val}"` : val
        ).join(','));
        const csv = [headers, ...rows].join('\n');

        const blob = new Blob([csv], { type: 'text/csv' });
        const url = window.URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = filename;
        a.click();
        window.URL.revokeObjectURL(url);
    };

    const handleExportAssets = async () => {
        try {
            const assets = await api.getAssets();
            // Flatten/Format data
            const formatted = assets.map((a: any) => ({
                ID: a.id,
                Name: a.name,
                Type: a.type,
                Status: a.status,
                Location: a.location?.siteName || 'N/A',
                Vendor: a.vendor?.name || 'N/A',
                Installed: new Date(a.installationDate).toLocaleDateString()
            }));
            downloadCSV(formatted, `assets_export_${new Date().toISOString().split('T')[0]}.csv`);
            toast.success('Assets exported successfully');
        } catch (e) {
            toast.error('Failed to export assets');
        }
    };

    const handleExportMaintenance = async () => {
        try {
            const records = await api.getMaintenance();
            const formatted = records.map((m: any) => ({
                ID: m.id,
                Asset: m.asset?.name || 'Unknown',
                Date: new Date(m.date).toLocaleDateString(),
                Technician: m.performedBy,
                Description: m.workDescription
            }));
            downloadCSV(formatted, `maintenance_export_${new Date().toISOString().split('T')[0]}.csv`);
            toast.success('Maintenance records exported successfully');
        } catch (e) {
            toast.error('Failed to export maintenance records');
        }
    };

    return (
        <div className={styles.container}>
            <div className={styles.header}>
                <h1 className="title-gradient">Reports & Analytics</h1>
                <div style={{ display: 'flex', gap: 10 }}>
                    <Button variant="secondary" onClick={handleExportAssets}>
                        <Download size={18} style={{ marginRight: 8 }} /> Export Assets
                    </Button>
                    <Button variant="secondary" onClick={handleExportMaintenance}>
                        <Download size={18} style={{ marginRight: 8 }} /> Export History
                    </Button>
                </div>
            </div>

            {/* KPI Cards */}
            <div className={styles.kpiGrid}>
                <Card className={styles.kpiCard}>
                    <div className={styles.kpiIcon} style={{ background: 'rgba(16, 185, 129, 0.1)' }}>
                        <CheckCircle size={24} color="#10b981" />
                    </div>
                    <div>
                        <p className={styles.kpiLabel}>Uptime Rate</p>
                        <h2 className={styles.kpiValue}>
                            {stats.totalAssets > 0 ? Math.round((stats.activeAssets / stats.totalAssets) * 100) : 0}%
                        </h2>
                    </div>
                </Card>
                <Card className={styles.kpiCard}>
                    <div className={styles.kpiIcon} style={{ background: 'rgba(245, 158, 11, 0.1)' }}>
                        <Clock size={24} color="#f59e0b" />
                    </div>
                    <div>
                        <p className={styles.kpiLabel}>Maintenance This Month</p>
                        <h2 className={styles.kpiValue}>{maintenance.filter(m => {
                            const d = new Date(m.date);
                            const now = new Date();
                            return d.getMonth() === now.getMonth() && d.getFullYear() === now.getFullYear();
                        }).length}</h2>
                    </div>
                </Card>
                <Card className={styles.kpiCard}>
                    <div className={styles.kpiIcon} style={{ background: 'rgba(239, 68, 68, 0.1)' }}>
                        <AlertTriangle size={24} color="#ef4444" />
                    </div>
                    <div>
                        <p className={styles.kpiLabel}>Assets in Downtime</p>
                        <h2 className={styles.kpiValue}>{stats.totalAssets - stats.activeAssets}</h2>
                    </div>
                </Card>
                <Card className={styles.kpiCard}>
                    <div className={styles.kpiIcon} style={{ background: 'rgba(99, 102, 241, 0.1)' }}>
                        <TrendingUp size={24} color="#6366f1" />
                    </div>
                    <div>
                        <p className={styles.kpiLabel}>Total Locations</p>
                        <h2 className={styles.kpiValue}>{stats.locations}</h2>
                    </div>
                </Card>
            </div>

            {/* Charts Row */}
            <div className={styles.chartsRow}>
                <Card title="Asset Status Distribution" className={styles.chartCard}>
                    <div style={{ height: 280 }}>
                        <ResponsiveContainer>
                            <PieChart>
                                <Pie
                                    data={statusData}
                                    innerRadius={60}
                                    outerRadius={100}
                                    paddingAngle={5}
                                    dataKey="value"
                                    label={({ name, percent }) => `${name} ${((percent ?? 0) * 100).toFixed(0)}%`}
                                >
                                    {statusData.map((entry, index) => (
                                        <Cell key={`cell-${index}`} fill={entry.color} />
                                    ))}
                                </Pie>
                                <Tooltip />
                            </PieChart>
                        </ResponsiveContainer>
                    </div>
                </Card>

                <Card title="Maintenance Trend (6 Months)" className={styles.chartCard}>
                    <div style={{ height: 280 }}>
                        <ResponsiveContainer>
                            <LineChart data={getMonthlyMaintenance()}>
                                <CartesianGrid strokeDasharray="3 3" stroke="var(--border-glass)" />
                                <XAxis dataKey="name" stroke="var(--text-secondary)" />
                                <YAxis stroke="var(--text-secondary)" />
                                <Tooltip
                                    contentStyle={{ background: 'var(--bg-secondary)', border: '1px solid var(--border-glass)' }}
                                />
                                <Line type="monotone" dataKey="count" stroke="#6366f1" strokeWidth={2} dot={{ fill: '#6366f1' }} />
                            </LineChart>
                        </ResponsiveContainer>
                    </div>
                </Card>
            </div>

            {/* Technician Performance */}
            <Card title="Technician Activity" className={styles.fullWidthCard}>
                <div style={{ height: 300 }}>
                    <ResponsiveContainer>
                        <BarChart data={getTechnicianStats()} layout="vertical">
                            <CartesianGrid strokeDasharray="3 3" stroke="var(--border-glass)" />
                            <XAxis type="number" stroke="var(--text-secondary)" />
                            <YAxis type="category" dataKey="name" stroke="var(--text-secondary)" width={100} />
                            <Tooltip
                                contentStyle={{ background: 'var(--bg-secondary)', border: '1px solid var(--border-glass)' }}
                            />
                            <Bar dataKey="count" fill="#6366f1" radius={[0, 4, 4, 0]} />
                        </BarChart>
                    </ResponsiveContainer>
                </div>
            </Card>
        </div>
    );
};
