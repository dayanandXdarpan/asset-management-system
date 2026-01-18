import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { api } from '../../services/api';
import { Card } from '../../components/UI/Card';
import { Button } from '../../components/UI/Button';
import { ImageUpload } from '../../components/UI/ImageUpload';
import styles from './Assets.module.css';
import toast from 'react-hot-toast';

interface Location {
    id: number;
    siteName: string;
    region: string;
}

interface Vendor {
    id: number;
    name: string;
}

export const AssetForm = () => {
    const navigate = useNavigate();
    const [locations, setLocations] = useState<Location[]>([]);
    const [vendors, setVendors] = useState<Vendor[]>([]);
    const [loading, setLoading] = useState(false);
    const [formData, setFormData] = useState({
        name: '',
        type: '',
        status: 'OPERATIONAL',
        locationId: '',
        vendorId: '',
        installationDate: new Date().toISOString().split('T')[0],
        image: ''
    });

    useEffect(() => {
        Promise.all([
            api.getLocations(),
            api.getVendors()
        ])
            .then(([locs, vends]) => {
                setLocations(locs);
                setVendors(vends);
            })
            .catch(e => {
                console.error(e);
                toast.error('Failed to load data');
            });
    }, []);

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();

        // Validation
        if (!formData.name.trim()) {
            toast.error('Please enter an asset name');
            return;
        }
        if (!formData.type.trim()) {
            toast.error('Please enter an asset type');
            return;
        }
        if (!formData.locationId) {
            toast.error('Please select a location');
            return;
        }

        setLoading(true);
        try {
            await api.createAsset({
                ...formData,
                locationId: Number(formData.locationId),
                vendorId: formData.vendorId ? Number(formData.vendorId) : null
            });
            toast.success('Asset created successfully!');
            navigate('/assets');
        } catch (err) {
            console.error(err);
            toast.error('Failed to create asset');
        } finally {
            setLoading(false);
        }
    };

    const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
        setFormData({ ...formData, [e.target.name]: e.target.value });
    };

    return (
        <div className={styles.container} style={{ maxWidth: 800, margin: '0 auto' }}>
            <h1 className="title-gradient" style={{ marginBottom: 24 }}>Add New Asset</h1>
            <Card className={styles.formCard}>
                <form onSubmit={handleSubmit} className={styles.form}>
                    <div className={styles.formGroup}>
                        <label className={styles.label}>Asset Name</label>
                        <input
                            name="name"
                            className={styles.input}
                            value={formData.name}
                            onChange={handleChange}
                            required
                            placeholder="e.g. Turbine A-102"
                        />
                    </div>

                    <div className={styles.row}>
                        <div className={styles.formGroup}>
                            <label className={styles.label}>Type</label>
                            <input
                                name="type"
                                className={styles.input}
                                value={formData.type}
                                onChange={handleChange}
                                required
                                placeholder="e.g. Generator"
                            />
                        </div>

                        <div className={styles.formGroup}>
                            <label className={styles.label}>Status</label>
                            <select name="status" className={styles.select} value={formData.status} onChange={handleChange}>
                                <option value="OPERATIONAL">Operational</option>
                                <option value="MAINTENANCE">Maintenance</option>
                                <option value="DOWNTIME">Downtime</option>
                            </select>
                        </div>
                    </div>

                    <div className={styles.formGroup}>
                        <label className={styles.label}>Installation Date</label>
                        <input
                            type="date"
                            name="installationDate"
                            className={styles.input}
                            value={formData.installationDate}
                            onChange={handleChange}
                            required
                        />
                    </div>

                    <div className={styles.formGroup}>
                        <label className={styles.label}>Asset Image</label>
                        <ImageUpload onUpload={(url) => setFormData({ ...formData, image: url })} />
                    </div>

                    <div className={styles.row}>
                        <div className={styles.formGroup}>
                            <label className={styles.label}>Location</label>
                            <select
                                name="locationId"
                                className={styles.select}
                                value={formData.locationId}
                                onChange={handleChange}
                                required
                            >
                                <option value="">Select Location</option>
                                {locations.map(l => <option key={l.id} value={l.id}>{l.siteName} ({l.region})</option>)}
                            </select>
                        </div>

                        <div className={styles.formGroup}>
                            <label className={styles.label}>Vendor / Supplier</label>
                            <select
                                name="vendorId"
                                className={styles.select}
                                value={formData.vendorId}
                                onChange={handleChange}
                            >
                                <option value="">Select Vendor (Optional)</option>
                                {vendors.map(v => <option key={v.id} value={v.id}>{v.name}</option>)}
                            </select>
                        </div>
                    </div>

                    <div className={styles.actions}>
                        <Button type="button" variant="ghost" onClick={() => navigate('/assets')}>Cancel</Button>
                        <Button type="submit" disabled={loading}>
                            {loading ? 'Creating...' : 'Create Asset'}
                        </Button>
                    </div>
                </form>
            </Card>
        </div>
    );
};
