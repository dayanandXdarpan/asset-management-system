import { useEffect, useState } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { api } from '../../services/api';
import { Card } from '../../components/UI/Card';
import { Button } from '../../components/UI/Button';
import { ArrowLeft, Save } from 'lucide-react';
import styles from './Vendors.module.css';
import toast from 'react-hot-toast';

export const VendorForm = () => {
    const { id } = useParams();
    const navigate = useNavigate();
    const isEdit = !!id;
    const [loading, setLoading] = useState(false);

    // Initial State
    const [formData, setFormData] = useState({
        name: '',
        contactPerson: '',
        email: '',
        phone: '',
        address: '',
        website: ''
    });

    useEffect(() => {
        if (isEdit) {
            loadVendor();
        }
    }, [id]);

    const loadVendor = async () => {
        try {
            const data = await api.getVendor(Number(id));
            setFormData({
                name: data.name,
                contactPerson: data.contactPerson || '',
                email: data.email || '',
                phone: data.phone || '',
                address: data.address || '',
                website: data.website || ''
            });
        } catch (e) {
            toast.error('Failed to load vendor details');
            navigate('/vendors');
        }
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setLoading(true);
        try {
            if (isEdit) {
                await api.updateVendor(Number(id), formData);
                toast.success('Vendor updated successfully');
            } else {
                await api.createVendor(formData);
                toast.success('Vendor created successfully');
            }
            navigate('/vendors');
        } catch (e) {
            toast.error('Failed to save vendor');
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className={styles.container}>
            <div className={styles.header}>
                <div style={{ display: 'flex', alignItems: 'center', gap: 16 }}>
                    <Button variant="ghost" onClick={() => navigate('/vendors')}>
                        <ArrowLeft size={20} />
                    </Button>
                    <h1 className="title-gradient">{isEdit ? 'Edit Vendor' : 'New Vendor'}</h1>
                </div>
            </div>

            <Card className={styles.formCard}>
                <form onSubmit={handleSubmit} className={styles.form}>
                    <div className={styles.formGrid}>
                        <div className={styles.formGroup}>
                            <label className={styles.label}>Company Name *</label>
                            <input
                                required
                                className={styles.input}
                                value={formData.name}
                                onChange={e => setFormData({ ...formData, name: e.target.value })}
                                placeholder="e.g. Acme Corp"
                            />
                        </div>
                        <div className={styles.formGroup}>
                            <label className={styles.label}>Contact Person</label>
                            <input
                                className={styles.input}
                                value={formData.contactPerson}
                                onChange={e => setFormData({ ...formData, contactPerson: e.target.value })}
                                placeholder="e.g. John Doe"
                            />
                        </div>
                    </div>

                    <div className={styles.formGrid}>
                        <div className={styles.formGroup}>
                            <label className={styles.label}>Email</label>
                            <input
                                type="email"
                                className={styles.input}
                                value={formData.email}
                                onChange={e => setFormData({ ...formData, email: e.target.value })}
                                placeholder="contact@acme.com"
                            />
                        </div>
                        <div className={styles.formGroup}>
                            <label className={styles.label}>Phone</label>
                            <input
                                type="tel"
                                className={styles.input}
                                value={formData.phone}
                                onChange={e => setFormData({ ...formData, phone: e.target.value })}
                                placeholder="+91 98765 43210"
                            />
                        </div>
                    </div>

                    <div className={styles.formGroup}>
                        <label className={styles.label}>Address</label>
                        <textarea
                            className={styles.input}
                            style={{ minHeight: 80, fontFamily: 'inherit' }}
                            value={formData.address}
                            onChange={e => setFormData({ ...formData, address: e.target.value })}
                            placeholder="Full address..."
                        />
                    </div>

                    <div className={styles.formGroup}>
                        <label className={styles.label}>Website</label>
                        <input
                            type="url"
                            className={styles.input}
                            value={formData.website}
                            onChange={e => setFormData({ ...formData, website: e.target.value })}
                            placeholder="https://acme.com"
                        />
                    </div>

                    <div style={{ display: 'flex', justifyContent: 'flex-end', marginTop: 20 }}>
                        <Button type="submit" disabled={loading}>
                            <Save size={18} style={{ marginRight: 8 }} />
                            {loading ? 'Saving...' : 'Save Vendor'}
                        </Button>
                    </div>
                </form>
            </Card>
        </div>
    );
};
