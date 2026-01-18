import { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { api } from '../../services/api';
import { useAuth } from '../../context/AuthContext';
import { Card } from '../../components/UI/Card';
import { Button } from '../../components/UI/Button';
import { ArrowLeft, MapPin, Calendar, Activity, Trash2 } from 'lucide-react';
import { QRCodeGenerator } from '../../components/QRCodeGenerator';
import styles from './Assets.module.css';
import toast from 'react-hot-toast';

export const AssetDetails = () => {
    const { id } = useParams();
    const navigate = useNavigate();
    const { user: currentUser } = useAuth();
    const [asset, setAsset] = useState<any>(null);
    const [loading, setLoading] = useState(true);

    const [isEditing, setIsEditing] = useState(false);
    const [editForm, setEditForm] = useState<any>({});
    const [confirmDelete, setConfirmDelete] = useState(false);

    const handleDelete = async () => {
        if (!confirmDelete) {
            setConfirmDelete(true);
            toast('Click Delete again to confirm', { icon: '⚠️' });
            return;
        }
        try {
            await api.deleteAsset(Number(id));
            toast.success('Asset deleted successfully');
            navigate('/assets');
        } catch (e) {
            toast.error('Failed to delete asset');
        }
    };

    const handleUpdate = async () => {
        try {
            await api.updateAsset(Number(id), editForm);
            setAsset({ ...asset, ...editForm });
            setIsEditing(false);
            toast.success('Asset updated successfully');
        } catch (e) {
            console.error(e);
            toast.error('Update failed');
        }
    };

    useEffect(() => {
        if (id) {
            api.getAsset(Number(id))
                .then(data => {
                    setAsset(data);
                    setEditForm({ name: data.name, type: data.type, status: data.status, locationId: data.locationId });
                })
                .catch(console.error)
                .finally(() => setLoading(false));
        }
    }, [id]);

    if (loading) return <div style={{ padding: 40, textAlign: 'center' }}>Loading...</div>;
    if (!asset) return <div style={{ padding: 40, textAlign: 'center' }}>Asset not found</div>;

    return (
        <div className={styles.container}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 20 }}>
                <Button variant="ghost" onClick={() => navigate('/assets')}>
                    <ArrowLeft size={16} style={{ marginRight: 8 }} /> Back to Assets
                </Button>
                <div style={{ display: 'flex', gap: 10 }}>
                    {currentUser?.role === 'ADMIN' && (
                        <>
                            {isEditing ? (
                                <>
                                    <Button variant="ghost" onClick={() => setIsEditing(false)}>Cancel</Button>
                                    <Button onClick={handleUpdate}>Save Changes</Button>
                                </>
                            ) : (
                                <>
                                    <Button variant="secondary" onClick={() => setIsEditing(true)}>Edit Asset</Button>
                                    <Button variant="danger" onClick={handleDelete}><Trash2 size={16} /> Delete</Button>
                                </>
                            )}
                        </>
                    )}
                </div>
            </div>

            <div className={styles.header}>
                <div>
                    <h1 className="title-gradient" style={{ margin: 0 }}>{asset.name}</h1>
                    <p style={{ color: 'var(--text-secondary)', marginTop: 4 }}>{asset.type} • ID: #{asset.id}</p>
                </div>
                <div className={`${styles.badge} ${styles[asset.status.toLowerCase()]}`}>
                    {asset.status}
                </div>
            </div>

            <div className={styles.row}>
                <div style={{ flex: 1, display: 'flex', flexDirection: 'column', gap: 20 }}>
                    <Card className={styles.formCard}>
                        <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                            <h3 style={{ marginBottom: 16 }}>Details</h3>
                            {/* QR Code */}
                            <div style={{ background: 'white', padding: 8, borderRadius: 8 }}>
                                <QRCodeGenerator text={`asset:${asset.id}`} />
                            </div>
                        </div>

                        {isEditing ? (
                            <div className={styles.detailGrid}>
                                <input className={styles.input} value={editForm.name} onChange={e => setEditForm({ ...editForm, name: e.target.value })} />
                                <input className={styles.input} value={editForm.type} onChange={e => setEditForm({ ...editForm, type: e.target.value })} />
                                <select className={styles.select} value={editForm.status} onChange={e => setEditForm({ ...editForm, status: e.target.value })}>
                                    <option value="OPERATIONAL">OPERATIONAL</option>
                                    <option value="MAINTENANCE">MAINTENANCE</option>
                                    <option value="DOWNTIME">DOWNTIME</option>
                                </select>
                            </div>
                        ) : (
                            <div className={styles.detailGrid}>
                                {asset.image && (
                                    <div style={{ marginBottom: 16, borderRadius: 8, overflow: 'hidden', border: '1px solid var(--border-glass)' }}>
                                        <img src={`http://localhost:3000${asset.image}`} alt={asset.name} style={{ width: '100%', maxHeight: 200, objectFit: 'cover' }} />
                                    </div>
                                )}

                                <div className={styles.detailItem}>
                                    <span className={styles.detailLabel}>Name</span>
                                    <span className={styles.detailValue} style={{ fontSize: '1.2rem' }}>{asset.name}</span>
                                </div>
                                {/* ...existing details... */}
                                <div className={styles.detailItem}>
                                    <span className={styles.detailLabel}>Location</span>
                                    <span className={styles.detailValue}>
                                        <MapPin size={14} style={{ marginRight: 4 }} />
                                        {asset.location?.siteName} ({asset.location?.region})
                                    </span>
                                </div>
                                <div className={styles.detailItem}>
                                    <span className={styles.detailLabel}>Installed</span>
                                    <span className={styles.detailValue}>
                                        <Calendar size={14} style={{ marginRight: 4 }} />
                                        {new Date(asset.installationDate).toLocaleDateString()}
                                    </span>
                                </div>
                                <div className={styles.detailItem}>
                                    <span className={styles.detailLabel}>Status</span>
                                    <span className={styles.detailValue}>
                                        <Activity size={14} style={{ marginRight: 4 }} />
                                        {asset.status}
                                    </span>
                                </div>
                            </div>
                        )}
                    </Card>
                </div>
                <Card className={styles.formCard} style={{ flex: 1 }}>
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 16, borderBottom: '1px solid var(--border-glass)', paddingBottom: 8 }}>
                        <h3 style={{ margin: 0 }}>Maintenance History</h3>
                        <Button size="sm" variant="secondary" onClick={() => navigate('/maintenance', { state: { assetId: asset.id } })}>Log New</Button>
                    </div>

                    <div className={styles.historyList}>
                        {asset.maintenance?.map((m: any) => (
                            <div key={m.id} className={styles.historyItem}>
                                <div style={{ minWidth: 90, fontSize: '0.85rem', color: 'var(--text-secondary)' }}>
                                    {new Date(m.date).toLocaleDateString()}
                                </div>
                                <div>
                                    <div style={{ fontWeight: 500 }}>{m.workDescription}</div>
                                    <div style={{ fontSize: '0.8rem', color: 'var(--text-muted)' }}>By: {m.performedBy}</div>
                                </div>
                            </div>
                        ))}
                        {(!asset.maintenance || asset.maintenance.length === 0) && (
                            <p style={{ color: 'var(--text-muted)' }}>No maintenance records.</p>
                        )}
                    </div>
                </Card>
            </div>
        </div>
    );
};
