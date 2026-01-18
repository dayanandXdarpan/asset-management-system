import { useState, useRef } from 'react';
import { Upload, X } from 'lucide-react';
import { api } from '../../services/api';

interface ImageUploadProps {
    onUpload: (url: string) => void;
    currentImage?: string;
}

export const ImageUpload = ({ onUpload, currentImage }: ImageUploadProps) => {
    const [preview, setPreview] = useState<string | undefined>(currentImage);
    const [uploading, setUploading] = useState(false);
    const fileInputRef = useRef<HTMLInputElement>(null);

    const handleFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0];
        if (!file) return;

        setUploading(true);
        const formData = new FormData();
        formData.append('file', file);

        try {
            const res = await api.upload(formData);
            setPreview(res.url); // Use relative URL from server
            onUpload(res.url);
        } catch (err) {
            console.error(err);
            alert('Upload failed');
        } finally {
            setUploading(false);
        }
    };

    return (
        <div style={{ marginBottom: 16 }}>
            <label style={{ display: 'block', marginBottom: 8, fontSize: '0.9rem', color: 'var(--text-secondary)' }}>
                Asset Image
            </label>

            {preview ? (
                <div style={{ position: 'relative', width: '100%', height: 200, borderRadius: 12, overflow: 'hidden', border: '1px solid var(--border-glass)' }}>
                    <img src={`http://localhost:3000${preview}`} alt="Asset" style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
                    <button
                        type="button"
                        onClick={() => { setPreview(undefined); onUpload(''); }}
                        style={{
                            position: 'absolute', top: 8, right: 8,
                            background: 'rgba(0,0,0,0.6)', border: 'none', borderRadius: '50%',
                            width: 28, height: 28, display: 'flex', alignItems: 'center', justifyContent: 'center',
                            cursor: 'pointer', color: 'white'
                        }}
                    >
                        <X size={16} />
                    </button>
                </div>
            ) : (
                <div
                    onClick={() => fileInputRef.current?.click()}
                    style={{
                        border: '2px dashed var(--border-glass)',
                        borderRadius: 12,
                        padding: 32,
                        textAlign: 'center',
                        cursor: 'pointer',
                        background: 'var(--bg-glass-strong)',
                        transition: 'all 0.2s'
                    }}
                >
                    <Upload size={32} color="var(--accent-primary)" style={{ marginBottom: 8 }} />
                    <p style={{ margin: 0, color: 'var(--text-secondary)' }}>
                        {uploading ? 'Uploading...' : 'Click to Upload Image'}
                    </p>
                </div>
            )}
            <input
                type="file"
                ref={fileInputRef}
                onChange={handleFileChange}
                style={{ display: 'none' }}
                accept="image/*"
            />
        </div>
    );
};
