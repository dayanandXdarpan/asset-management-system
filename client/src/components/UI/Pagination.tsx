import React from 'react';
import { Button } from './Button';
import { ChevronLeft, ChevronRight } from 'lucide-react';
import styles from './Pagination.module.css';

interface PaginationProps {
    currentPage: number;
    totalPages: number;
    onPageChange: (page: number) => void;
}

export const Pagination: React.FC<PaginationProps> = ({ currentPage, totalPages, onPageChange }) => {
    if (totalPages <= 1) return null;

    return (
        <div className={styles.container}>
            <Button
                variant="secondary"
                size="sm"
                disabled={currentPage === 1}
                onClick={() => onPageChange(currentPage - 1)}
            >
                <ChevronLeft size={16} style={{ marginRight: 4 }} /> Previous
            </Button>
            
            <span className={styles.text}>
                Page {currentPage} of {totalPages}
            </span>

            <Button
                variant="secondary"
                size="sm"
                disabled={currentPage >= totalPages}
                onClick={() => onPageChange(currentPage + 1)}
            >
                Next <ChevronRight size={16} style={{ marginLeft: 4 }} />
            </Button>
        </div>
    );
};
