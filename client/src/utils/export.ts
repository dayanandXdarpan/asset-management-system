// Utility functions for exporting data

export const exportToCSV = <T extends Record<string, unknown>>(
    data: T[],
    filename: string,
    columns?: { key: keyof T; label: string }[]
) => {
    if (data.length === 0) return;

    // Determine columns
    const cols = columns || Object.keys(data[0]).map(key => ({ key: key as keyof T, label: String(key) }));

    // Create CSV header
    const header = cols.map(c => c.label).join(',');

    // Create CSV rows
    const rows = data.map(row =>
        cols.map(c => {
            const value = row[c.key];
            // Handle values with commas or quotes
            const strValue = String(value ?? '');
            if (strValue.includes(',') || strValue.includes('"') || strValue.includes('\n')) {
                return `"${strValue.replace(/"/g, '""')}"`;
            }
            return strValue;
        }).join(',')
    );

    // Combine header and rows
    const csv = [header, ...rows].join('\n');

    // Create and trigger download
    const blob = new Blob([csv], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.setAttribute('href', url);
    link.setAttribute('download', `${filename}.csv`);
    link.style.visibility = 'hidden';
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);
};

export const formatDate = (date: string | Date): string => {
    return new Date(date).toLocaleDateString('en-US', {
        year: 'numeric',
        month: 'short',
        day: 'numeric'
    });
};

export const formatDateTime = (date: string | Date): string => {
    return new Date(date).toLocaleString('en-US', {
        year: 'numeric',
        month: 'short',
        day: 'numeric',
        hour: '2-digit',
        minute: '2-digit'
    });
};
