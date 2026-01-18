import React from 'react';
import styles from './Card.module.css';

interface CardProps {
    children: React.ReactNode;
    title?: string;
    className?: string;
    style?: React.CSSProperties;
    onClick?: () => void;
}

export const Card: React.FC<CardProps> = ({ title, children, className = '', style, onClick }) => {
    return (
        <div className={`${styles.card} ${className}`} style={style} onClick={onClick}>
            {title && <div className={styles.header}>{title}</div>}
            <div className={styles.content}>
                {children}
            </div>
        </div>
    );
};
