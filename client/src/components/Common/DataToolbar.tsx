import React, { useRef } from 'react';
import { Button } from '../UI/Button';
import { Search, Download, Upload, ArrowUpDown } from 'lucide-react';
import styles from './DataToolbar.module.css';

interface DataToolbarProps {
    searchTerm: string;
    onSearchChange: (val: string) => void;
    sortConfig: { key: string; direction: 'asc' | 'desc' };
    onSortChange: (config: { key: string; direction: 'asc' | 'desc' }) => void;
    sortOptions: { key: string; label: string }[];
    onExport: () => void;
    onImport?: (file: File) => void;
}

export const DataToolbar: React.FC<DataToolbarProps> = ({
    searchTerm,
    onSearchChange,
    sortConfig,
    onSortChange,
    sortOptions,
    onExport,
    onImport
}) => {
    const fileInputRef = useRef<HTMLInputElement>(null);

    const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        if (e.target.files && e.target.files[0] && onImport) {
            onImport(e.target.files[0]);
            e.target.value = ''; // Reset
        }
    };

    return (
        <div className={styles.toolbar}>
            <div className={styles.searchGroup}>
                <Search size={18} className={styles.searchIcon} />
                <input
                    type="text"
                    placeholder="Search..."
                    className={styles.searchInput}
                    value={searchTerm}
                    onChange={e => onSearchChange(e.target.value)}
                />
            </div>

            <div className={styles.actions}>
                <div className={styles.sortGroup}>
                    <ArrowUpDown size={16} className={styles.sortIcon} />
                    <select
                        className={styles.sortSelect}
                        value={sortConfig.key}
                        onChange={e => onSortChange({ ...sortConfig, key: e.target.value })}
                    >
                        {sortOptions.map(opt => (
                            <option key={opt.key} value={opt.key}>{opt.label}</option>
                        ))}
                    </select>
                    <button
                        className={styles.dirBtn}
                        onClick={() => onSortChange({ ...sortConfig, direction: sortConfig.direction === 'asc' ? 'desc' : 'asc' })}
                    >
                        {sortConfig.direction.toUpperCase()}
                    </button>
                </div>

                <div className={styles.fileActions}>
                    <Button variant="secondary" size="sm" onClick={onExport}>
                        <Download size={16} style={{ marginRight: 6 }} /> Export
                    </Button>

                    {onImport && (
                        <>
                            <input
                                type="file"
                                ref={fileInputRef}
                                style={{ display: 'none' }}
                                accept=".csv"
                                onChange={handleFileChange}
                            />
                            <Button variant="secondary" size="sm" onClick={() => fileInputRef.current?.click()}>
                                <Upload size={16} style={{ marginRight: 6 }} /> Import
                            </Button>
                        </>
                    )}
                </div>
            </div>
        </div>
    );
};
