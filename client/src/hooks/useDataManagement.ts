import { useState, useMemo } from 'react';
import toast from 'react-hot-toast';

interface SortConfig {
    key: string;
    direction: 'asc' | 'desc';
}

export const useDataManagement = <T>(
    data: T[],
    initialSort: SortConfig = { key: 'id', direction: 'desc' },
    // Function to normalize data for search (flatten objects to string)
    searchKeys: (keyof T | string)[] = []
) => {
    const [searchTerm, setSearchTerm] = useState('');
    const [sortConfig, setSortConfig] = useState<SortConfig>(initialSort);

    // 1. Filter & Sort Logic
    const processedData = useMemo(() => {
        let result = [...data];

        // Search
        if (searchTerm) {
            const lowerTerm = searchTerm.toLowerCase();
            result = result.filter(item => {
                return searchKeys.some(key => {
                    const val = getNestedValue(item, key as string);
                    return String(val || '').toLowerCase().includes(lowerTerm);
                });
            });
        }

        // Sort
        if (sortConfig.key) {
            result.sort((a, b) => {
                const aVal = getNestedValue(a, sortConfig.key);
                const bVal = getNestedValue(b, sortConfig.key);

                if (aVal < bVal) return sortConfig.direction === 'asc' ? -1 : 1;
                if (aVal > bVal) return sortConfig.direction === 'asc' ? 1 : -1;
                return 0;
            });
        }

        return result;
    }, [data, searchTerm, sortConfig, searchKeys]);

    // 2. CSV Export
    const exportCSV = (filename: string, headers?: string[], mapFn?: (item: T) => any[]) => {
        if (!processedData.length) {
            toast.error('No data to export');
            return;
        }

        // Auto-generate headers if not provided
        const finalHeaders = headers || Object.keys(processedData[0] as any);

        // Generate rows
        const rows = processedData.map(item => {
            if (mapFn) return mapFn(item);
            return finalHeaders.map(header => getNestedValue(item, header));
        });

        // Build CSV String
        const csvContent = [
            finalHeaders.join(','),
            ...rows.map(row => row.map(cell => `"${String(cell || '').replace(/"/g, '""')}"`).join(','))
        ].join('\n');

        // Trigger Download
        const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
        const link = document.createElement('a');
        const url = URL.createObjectURL(blob);
        link.setAttribute('href', url);
        link.setAttribute('download', `${filename}.csv`);
        link.style.visibility = 'hidden';
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
    };

    // 3. CSV Import
    const importCSV = (file: File, onDataReady: (data: any[]) => Promise<void>) => {
        const reader = new FileReader();
        reader.onload = async (e) => {
            const text = e.target?.result as string;
            const [headerLine, ...lines] = text.split('\n');
            const headers = headerLine.split(',').map(h => h.trim().replace(/"/g, ''));

            const parsedData = lines
                .filter(line => line.trim())
                .map(line => {
                    const values = line.split(/,(?=(?:(?:[^"]*"){2})*[^"]*$)/).map(val => val.trim().replace(/^"|"$/g, '').replace(/""/g, '"'));
                    const obj: any = {};
                    headers.forEach((h, i) => {
                        if (h) obj[h] = values[i];
                    });
                    return obj;
                });

            if (parsedData.length === 0) {
                toast.error('No valid data found in CSV');
                return;
            }

            try {
                await onDataReady(parsedData);
            } catch (error) {
                console.error('Import processing failed', error);
                toast.error('Import failed');
            }
        };
        reader.readAsText(file);
    };

    return {
        searchTerm,
        setSearchTerm,
        sortConfig,
        setSortConfig,
        processedData,
        exportCSV,
        importCSV
    };
};

// Helper for 'asset.name' style access
function getNestedValue(obj: any, path: string) {
    return path.split('.').reduce((acc, part) => acc && acc[part], obj);
}
