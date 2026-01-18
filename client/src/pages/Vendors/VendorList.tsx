import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { api } from '../../services/api';
import { Card } from '../../components/UI/Card';
import { Button } from '../../components/UI/Button';
import { Skeleton } from '../../components/UI/Skeleton';
import { ConfirmModal } from '../../components/UI/ConfirmModal';
import { RoleGuard } from '../../components/RoleGuard';
import { Pagination } from '../../components/UI/Pagination';
import { Plus, Store, Phone, Mail, Globe, Trash2 } from 'lucide-react';
import toast from 'react-hot-toast';
import styles from './Vendors.module.css';
import { useDataManagement } from '../../hooks/useDataManagement';
import { DataToolbar } from '../../components/Common/DataToolbar';

export const VendorList = () => {
    const navigate = useNavigate();
    const [vendors, setVendors] = useState<any[]>([]);
    const [loading, setLoading] = useState(true);
    const [deleteModal, setDeleteModal] = useState<{ isOpen: boolean; vendorId: number | null; vendorName: string }>({
        isOpen: false,
        vendorId: null,
        vendorName: ''
    });
    const [deleting, setDeleting] = useState(false);
    const [page, setPage] = useState(1);
    const ITEMS_PER_PAGE = 9;

    const {
        searchTerm,
        setSearchTerm,
        sortConfig,
        setSortConfig,
        processedData,
        exportCSV,
        importCSV
    } = useDataManagement(vendors, { key: 'name', direction: 'asc' }, ['name', 'contactPerson', 'email']);

    const totalPages = Math.ceil(processedData.length / ITEMS_PER_PAGE);
    const paginatedVendors = processedData.slice((page - 1) * ITEMS_PER_PAGE, page * ITEMS_PER_PAGE);

    const loadData = async () => {
        setLoading(true);
        try {
            const data = await api.getVendors();
            setVendors(data);
        } catch (e) {
            toast.error('Failed to load vendors');
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => { loadData(); }, []);

    const handleImport = async (data: any[]) => {
        let count = 0;
        const toastId = toast.loading('Importing vendors...');
        try {
            for (const item of data) {
                // Basic validation
                if (item.name) {
                    await api.createVendor({
                        name: item.name,
                        contactPerson: item.contactPerson || '',
                        email: item.email || '',
                        phone: item.phone || '',
                        website: item.website || '',
                        address: item.address || ''
                    });
                    count++;
                }
            }
            toast.success(`Successfully imported ${count} vendors`, { id: toastId });
            loadData();
        } catch (e) {
            toast.error('Import completed with errors', { id: toastId });
        }
    };

    const openDeleteModal = (id: number, name: string, e: React.MouseEvent) => {
        e.stopPropagation();
        setDeleteModal({ isOpen: true, vendorId: id, vendorName: name });
    };

    const handleDelete = async () => {
        if (!deleteModal.vendorId) return;
        setDeleting(true);
        try {
            await api.deleteVendor(deleteModal.vendorId);
            toast.success('Vendor deleted');
            setDeleteModal({ isOpen: false, vendorId: null, vendorName: '' });
            loadData();
        } catch (e: any) {
            toast.error(e.message || 'Failed to delete vendor');
        } finally {
            setDeleting(false);
        }
    };

    if (loading) {
        return (
            <div className={styles.container}>
                <div className={styles.header}>
                    <h1 className="title-gradient">Vendors</h1>
                    <Skeleton width={120} height={40} />
                </div>
                <div className={styles.grid}>
                    {[1, 2, 3].map(i => (
                        <Card key={i} className={styles.vendorCard}>
                            <Skeleton height={20} width="60%" />
                            <Skeleton height={16} width="80%" />
                            <Skeleton height={16} width="40%" />
                        </Card>
                    ))}
                </div>
            </div>
        );
    }

    return (
        <div className={styles.container}>
            <div className={styles.header}>
                <h1 className="title-gradient">Vendors</h1>
                <RoleGuard allowedRoles={['ADMIN']}>
                    <Button onClick={() => navigate('/vendors/new')}>
                        <Plus size={18} style={{ marginRight: 8 }} /> Add Vendor
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
                    { key: 'contactPerson', label: 'Contact Person' }
                ]}
                onExport={() => exportCSV('vendors_export')}
                onImport={(file) => importCSV(file, handleImport)}
            />

            {processedData.length === 0 ? (
                <Card className={styles.emptyState}>
                    <Store size={48} color="var(--accent-primary)" style={{ opacity: 0.5 }} />
                    <h3>{searchTerm ? 'No matches found' : 'No Vendors Found'}</h3>
                    <p>{searchTerm ? 'Try a different search term' : 'Add your first supplier or service provider.'}</p>
                    {!searchTerm && (
                        <RoleGuard allowedRoles={['ADMIN']}>
                            <Button variant="secondary" onClick={() => navigate('/vendors/new')} style={{ marginTop: 16 }}>
                                Add Vendor
                            </Button>
                        </RoleGuard>
                    )}
                </Card>
            ) : (
                <>
                <div className={styles.grid}>
                    {paginatedVendors.map((vendor: any) => (
                        <Card
                            key={vendor.id}
                            className={styles.vendorCard}
                            onClick={() => navigate(`/vendors/${vendor.id}`)}
                            style={{ cursor: 'pointer' }}
                        >
                            <div className={styles.cardHeader}>
                                <div className={styles.iconBox}>
                                    <Store size={20} color="var(--accent-primary)" />
                                </div>
                                <RoleGuard allowedRoles={['ADMIN']}>
                                    <Button
                                        variant="ghost"
                                        size="sm"
                                        className={styles.deleteBtn}
                                        onClick={(e) => openDeleteModal(vendor.id, vendor.name, e)}
                                    >
                                        <Trash2 size={16} color="#ef4444" />
                                    </Button>
                                </RoleGuard>
                            </div>

                            <h3 className={styles.name}>{vendor.name}</h3>
                            <p className={styles.contactPerson}>{vendor.contactPerson}</p>

                            <div className={styles.infoList}>
                                {vendor.phone && (
                                    <div className={styles.infoItem}>
                                        <Phone size={14} /> <span>{vendor.phone}</span>
                                    </div>
                                )}
                                {vendor.email && (
                                    <div className={styles.infoItem}>
                                        <Mail size={14} /> <span>{vendor.email}</span>
                                    </div>
                                )}
                                {vendor.website && (
                                    <div className={styles.infoItem}>
                                        <Globe size={14} />
                                        <a href={vendor.website} target="_blank" rel="noopener noreferrer" onClick={e => e.stopPropagation()}>
                                            Website
                                        </a>
                                    </div>
                                )}
                            </div>

                            <div className={styles.footer}>
                                <span className={styles.assetCount}>
                                    {vendor._count?.assets || 0} Assets Linked
                                </span>
                            </div>
                        </Card>
                    ))}
                </div>
                <Pagination
                    currentPage={page}
                    totalPages={totalPages}
                    onPageChange={setPage}
                />
                </>
            )}

            <ConfirmModal
                isOpen={deleteModal.isOpen}
                onClose={() => setDeleteModal({ isOpen: false, vendorId: null, vendorName: '' })}
                onConfirm={handleDelete}
                title="Delete Vendor"
                message={`Are you sure you want to delete "${deleteModal.vendorName}"? This action cannot be undone.`}
                confirmText="Delete"
                variant="danger"
                loading={deleting}
            />
        </div>
    );
};
