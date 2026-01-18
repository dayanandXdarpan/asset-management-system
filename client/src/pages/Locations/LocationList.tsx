import { useEffect, useState } from 'react';
import { api } from '../../services/api';
import { Card } from '../../components/UI/Card';
import { Button } from '../../components/UI/Button';
import { Modal } from '../../components/UI/Modal';
import { Skeleton } from '../../components/UI/Skeleton';
import { RoleGuard } from '../../components/RoleGuard';
import { Pagination } from '../../components/UI/Pagination';
import { Plus, MapPin, Trash2, Edit, RefreshCw } from 'lucide-react';
import styles from './Locations.module.css';
import toast from 'react-hot-toast';

interface Location {
    id: number;
    siteName: string;
    region: string;
    _count?: { assets: number };
}

export const LocationList = () => {
    const [locations, setLocations] = useState<Location[]>([]);
    const [loading, setLoading] = useState(true);
    const [showForm, setShowForm] = useState(false);
    const [editingLoc, setEditingLoc] = useState<Location | null>(null);
    const [formData, setFormData] = useState({ siteName: '', region: '' });
    const [page, setPage] = useState(1);
    const ITEMS_PER_PAGE = 8;

    const load = async () => {
        setLoading(true);
        try {
            const data = await api.getLocations();
            setLocations(data);
        } catch (e) {
            toast.error('Failed to load locations');
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => { load(); }, []);

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!formData.siteName || !formData.region) {
            toast.error('Please fill all fields');
            return;
        }
        try {
            if (editingLoc) {
                await api.updateLocation(editingLoc.id, formData);
                toast.success('Location updated');
            } else {
                await api.createLocation(formData);
                toast.success('Location created');
            }
            setFormData({ siteName: '', region: '' });
            setShowForm(false);
            setEditingLoc(null);
            load();
        } catch (e) {
            toast.error('Operation failed');
        }
    };

    const handleEdit = (loc: Location) => {
        setEditingLoc(loc);
        setFormData({ siteName: loc.siteName, region: loc.region });
        setShowForm(true);
    };

    const handleDelete = async (id: number, assetCount: number) => {
        if (assetCount > 0) {
            toast.error('Cannot delete location with existing assets');
            return;
        }
        try {
            await api.deleteLocation(id);
            toast.success('Location deleted');
            setLocations(locations.filter(l => l.id !== id));
        } catch (e) {
            toast.error('Failed to delete location');
        }
    };

    const totalPages = Math.ceil(locations.length / ITEMS_PER_PAGE);
    const paginatedLocations = locations.slice((page - 1) * ITEMS_PER_PAGE, page * ITEMS_PER_PAGE);

    if (loading) {
        return (
            <div className={styles.container}>
                <div className={styles.header}>
                    <h1 className="title-gradient">Locations</h1>
                </div>
                <div className={styles.grid}>
                    {[1, 2, 3, 4].map(i => (
                        <Card key={i} className={styles.locCard}>
                            <Skeleton width={120} height={24} />
                            <Skeleton width={80} height={16} />
                            <Skeleton width={60} height={14} />
                        </Card>
                    ))}
                </div>
            </div>
        );
    }

    return (
        <div className={styles.container}>
            <div className={styles.header}>
                <h1 className="title-gradient">Locations</h1>
                <div style={{ display: 'flex', gap: 12 }}>
                    <Button variant="secondary" onClick={load}>
                        <RefreshCw size={18} style={{ marginRight: 8 }} /> Refresh
                    </Button>
                    <RoleGuard allowedRoles={['ADMIN']}>
                        <Button onClick={() => { setEditingLoc(null); setFormData({ siteName: '', region: '' }); setShowForm(true); }}>
                            <Plus size={18} style={{ marginRight: 8 }} /> Add Location
                        </Button>
                    </RoleGuard>
                </div>
            </div>

            <Modal isOpen={showForm} onClose={() => { setShowForm(false); setEditingLoc(null); }} title={editingLoc ? 'Edit Location' : 'Add Location'}>
                <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
                    <div>
                        <label style={{ display: 'block', marginBottom: 6, color: 'var(--text-secondary)' }}>Site Name</label>
                        <input
                            placeholder="Enter site name"
                            value={formData.siteName}
                            onChange={e => setFormData({ ...formData, siteName: e.target.value })}
                            className={styles.input}
                            required
                        />
                    </div>
                    <div>
                        <label style={{ display: 'block', marginBottom: 6, color: 'var(--text-secondary)' }}>Region</label>
                        <input
                            placeholder="Enter region"
                            value={formData.region}
                            onChange={e => setFormData({ ...formData, region: e.target.value })}
                            className={styles.input}
                            required
                        />
                    </div>
                    <div style={{ display: 'flex', justifyContent: 'flex-end', gap: 12 }}>
                        <Button type="button" variant="ghost" onClick={() => { setShowForm(false); setEditingLoc(null); }}>Cancel</Button>
                        <Button type="submit">{editingLoc ? 'Update' : 'Create'}</Button>
                    </div>
                </form>
            </Modal>

            <div className={styles.grid}>
                {paginatedLocations.map(loc => (
                    <Card key={loc.id} className={styles.locCard}>
                        <div className={styles.locHeader}>
                            <MapPin size={20} color="var(--accent-secondary)" />
                            <h3>{loc.siteName}</h3>
                            <div style={{ marginLeft: 'auto', display: 'flex', gap: 4 }}>
                                <RoleGuard allowedRoles={['ADMIN']}>
                                    <Button variant="ghost" size="sm" onClick={() => handleEdit(loc)}>
                                        <Edit size={16} />
                                    </Button>
                                    <Button variant="ghost" size="sm" onClick={() => handleDelete(loc.id, loc._count?.assets || 0)}>
                                        <Trash2 size={16} color="#ef4444" />
                                    </Button>
                                </RoleGuard>
                            </div>
                        </div>
                        <p style={{ color: 'var(--text-secondary)' }}>{loc.region}</p>
                        <p style={{ fontSize: '0.8rem', marginTop: 8 }}>
                            {loc._count?.assets || 0} Assets
                        </p>
                    </Card>
                ))}
                {locations.length === 0 && (
                    <Card style={{ gridColumn: '1 / -1', textAlign: 'center', padding: 40 }}>
                        <MapPin size={48} color="var(--accent-primary)" />
                        <h3 style={{ marginTop: 16 }}>No Locations Yet</h3>
                        <p style={{ color: 'var(--text-secondary)' }}>
                            Create your first location to start adding assets.
                        </p>
                    </Card>
                )}
            </div>
            
            <Pagination
                currentPage={page}
                totalPages={totalPages}
                onPageChange={setPage}
            />
        </div>
    );
};

