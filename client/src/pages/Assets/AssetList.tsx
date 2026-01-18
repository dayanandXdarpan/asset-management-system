import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Card } from '../../components/UI/Card';
import { Button } from '../../components/UI/Button';
import { Pagination } from '../../components/UI/Pagination';
import { RoleGuard } from '../../components/RoleGuard';
import { Plus, Trash2 } from 'lucide-react';
import styles from './Assets.module.css';
import { useDataManagement } from '../../hooks/useDataManagement';
import { DataToolbar } from '../../components/Common/DataToolbar';
import { api } from '../../services/api';
import toast from 'react-hot-toast';

export const AssetList = () => {
    const [page, setPage] = useState(1);
    const navigate = useNavigate();

    // 1. Fetch ALL data for client-side sorting/filtering (since API is paginated, we might need to adjust strategy.
    // For now, let's stick to the existing hook but maybe we should fetch all for this "Rich Table" experience?
    // Actually, useAssets handles server-side search. But useDataManagement is client-side.
    // OPTION: We fetch a larger page size or handle it differently.
    // DECISION: Let's fetch a larger set or just use client side for the data we have on the current page for sort, 
    // BUT truly the user expects global search. 
    // Given the constraints and the goal of "Universal Toolbar", 
    // I will modify this to fetch ALL assets (or a large limit) to enable true client-side power as requested.

    const [allAssets, setAllAssets] = useState<any[]>([]);
    const [loading, setLoading] = useState(true);

    const loadAllAssets = async () => {
        setLoading(true);
        try {
            const res = await api.getAssets('?limit=1000'); // Fetch all assets for client-side processing
            // The current api.getAssets calls '/assets'. Let's check if it returns paginated or all. 
            // If I switch to `api.getAssets()`, I get the full list (based on `MaintenanceList` usage).
            setAllAssets(res.data || res);
        } catch (e) {
            toast.error("Failed to load assets");
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => { loadAllAssets(); }, []);

    const {
        searchTerm,
        setSearchTerm,
        sortConfig,
        setSortConfig,
        processedData,
        exportCSV,
        importCSV
    } = useDataManagement(allAssets, { key: 'name', direction: 'asc' }, ['name', 'type', 'status', 'location.siteName']);

    // Pagination for the processed data
    const ITEMS_PER_PAGE = 10;
    const totalPages = Math.ceil(processedData.length / ITEMS_PER_PAGE);
    const paginatedAssets = processedData.slice((page - 1) * ITEMS_PER_PAGE, page * ITEMS_PER_PAGE);

    const handleImport = async (data: any[]) => {
        let count = 0;
        const toastId = toast.loading('Importing assets...');
        try {
            for (const item of data) {
                if (item.name && item.type) {
                    await api.createAsset({
                        name: item.name,
                        type: item.type,
                        status: item.status || 'ACTIVE',
                        locationId: Number(item.locationId) || 1, // Fallback or need real logic
                        serialNumber: item.serialNumber || `IMP-${Date.now()}-${count}`,
                        vendorId: Number(item.vendorId) || undefined
                    });
                    count++;
                }
            }
            toast.success(`Successfully imported ${count} assets`, { id: toastId });
            loadAllAssets();
        } catch (e) {
            toast.error('Import completed with errors', { id: toastId });
        }
    };

    const handleDelete = async (id: number) => {
        if (!window.confirm('Are you sure you want to delete this asset?')) return;
        try {
            await api.deleteAsset(id);
            toast.success('Asset deleted');
            setAllAssets(prev => prev.filter(a => a.id !== id));
        } catch (e) {
            toast.error('Failed to delete asset');
        }
    };

    return (
        <div className={styles.container}>
            <div className={styles.header}>
                <h1 className="title-gradient" style={{ fontSize: '1.8rem', margin: 0 }}>Assets</h1>
                <RoleGuard allowedRoles={['ADMIN']}>
                    <Button onClick={() => navigate('/assets/new')}>
                        <Plus size={18} style={{ marginRight: 8 }} /> Add Asset
                    </Button>
                </RoleGuard>
            </div>

            <DataToolbar
                searchTerm={searchTerm}
                onSearchChange={setSearchTerm}
                sortConfig={sortConfig}
                onSortChange={setSortConfig}
                sortOptions={[
                    { key: 'name', label: 'Name' },
                    { key: 'type', label: 'Type' },
                    { key: 'status', label: 'Status' }
                ]}
                onExport={() => exportCSV('assets_export')}
                onImport={(file) => importCSV(file, handleImport)}
            />

            <Card className={styles.tableCard}>
                {loading ? (
                    <div style={{ padding: 40, textAlign: 'center' }}>Loading assets...</div>
                ) : (
                    <>
                    <div className={styles.tableWrapper}>
                        <table className={styles.table}>
                            <thead>
                                <tr>
                                    <th>Name</th>
                                    <th>Type</th>
                                    <th>Location</th>
                                    <th>Status</th>
                                    <th>Install Date</th>
                                    <th>Actions</th>
                                </tr>
                            </thead>
                            <tbody>
                                {paginatedAssets.map((asset: any) => (
                                    <tr key={asset.id}>
                                        <td>{asset.name}</td>
                                        <td>{asset.type}</td>
                                        <td>{asset.location?.siteName || '-'}</td>
                                        <td>
                                            <span className={`${styles.badge} ${styles[asset.status.toLowerCase()]}`}>
                                                {asset.status}
                                            </span>
                                        </td>
                                        <td>{new Date(asset.installationDate).toLocaleDateString()}</td>
                                        <td>
                                            <div style={{ display: 'flex', gap: 4 }}>
                                                <Button variant="ghost" size="sm" onClick={() => navigate(`/assets/${asset.id}`)}>
                                                    View
                                                </Button>
                                                <RoleGuard allowedRoles={['ADMIN']}>
                                                    <Button variant="ghost" size="sm" onClick={() => handleDelete(asset.id)} style={{ color: '#ef4444' }}>
                                                        <Trash2 size={16} />
                                                    </Button>
                                                </RoleGuard>
                                            </div>
                                        </td>
                                    </tr>
                                ))}
                                {paginatedAssets.length === 0 && (
                                    <tr>
                                        <td colSpan={6} style={{ textAlign: 'center', padding: 40, color: 'var(--text-muted)' }}>
                                            No assets found.
                                        </td>
                                    </tr>
                                )}
                            </tbody>
                        </table>
                    </div>
                    
                    <Pagination
                        currentPage={page}
                        totalPages={totalPages}
                        onPageChange={setPage}
                    />
                    </>
                )}
            </Card>
        </div>
    );
};
