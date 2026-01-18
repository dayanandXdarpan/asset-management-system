import { type ReactNode } from 'react';
import { Box, FileText, MapPin, Wrench } from 'lucide-react';
import styles from './EmptyState.module.css';

interface EmptyStateProps {
    icon?: 'assets' | 'locations' | 'maintenance' | 'default';
    title: string;
    description?: string;
    action?: ReactNode;
}

const icons = {
    assets: Box,
    locations: MapPin,
    maintenance: Wrench,
    default: FileText,
};

export const EmptyState = ({ icon = 'default', title, description, action }: EmptyStateProps) => {
    const Icon = icons[icon];

    return (
        <div className={styles.container}>
            <div className={styles.iconWrapper}>
                <Icon size={48} strokeWidth={1.5} />
            </div>
            <h3 className={styles.title}>{title}</h3>
            {description && <p className={styles.description}>{description}</p>}
            {action && <div className={styles.action}>{action}</div>}
        </div>
    );
};
