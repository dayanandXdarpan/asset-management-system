import styles from './Skeleton.module.css';

interface SkeletonProps {
    width?: string | number;
    height?: string | number;
    variant?: 'text' | 'circular' | 'rectangular';
    className?: string;
}

export const Skeleton = ({
    width = '100%',
    height = 20,
    variant = 'text',
    className = ''
}: SkeletonProps) => {
    const style = {
        width: typeof width === 'number' ? `${width}px` : width,
        height: typeof height === 'number' ? `${height}px` : height,
    };

    return (
        <div
            className={`${styles.skeleton} ${styles[variant]} ${className}`}
            style={style}
        />
    );
};

// Preset skeletons for common use cases
export const SkeletonCard = () => (
    <div className={styles.card}>
        <Skeleton variant="rectangular" height={120} />
        <div style={{ padding: 16 }}>
            <Skeleton height={24} width="60%" />
            <Skeleton height={16} width="80%" />
            <Skeleton height={16} width="40%" />
        </div>
    </div>
);

export const SkeletonTable = ({ rows = 5 }: { rows?: number }) => (
    <div className={styles.table}>
        <div className={styles.tableHeader}>
            {[1, 2, 3, 4].map(i => <Skeleton key={i} height={20} />)}
        </div>
        {Array.from({ length: rows }).map((_, i) => (
            <div key={i} className={styles.tableRow}>
                {[1, 2, 3, 4].map(j => <Skeleton key={j} height={16} />)}
            </div>
        ))}
    </div>
);
