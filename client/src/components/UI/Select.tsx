import { SelectHTMLAttributes, forwardRef } from 'react';
import styles from './Select.module.css';

interface SelectOption {
    value: string | number;
    label: string;
}

interface SelectProps extends Omit<SelectHTMLAttributes<HTMLSelectElement>, 'children'> {
    label?: string;
    error?: string;
    options: SelectOption[];
    placeholder?: string;
    fullWidth?: boolean;
}

export const Select = forwardRef<HTMLSelectElement, SelectProps>(
    ({ label, error, options, placeholder, fullWidth = true, className, ...props }, ref) => {
        return (
            <div className={`${styles.wrapper} ${fullWidth ? styles.fullWidth : ''}`}>
                {label && <label className={styles.label}>{label}</label>}
                <select
                    ref={ref}
                    className={`${styles.select} ${error ? styles.error : ''} ${className || ''}`}
                    {...props}
                >
                    {placeholder && <option value="">{placeholder}</option>}
                    {options.map(opt => (
                        <option key={opt.value} value={opt.value}>{opt.label}</option>
                    ))}
                </select>
                {error && <span className={styles.errorText}>{error}</span>}
            </div>
        );
    }
);

Select.displayName = 'Select';
