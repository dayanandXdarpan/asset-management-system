import { useState, useEffect } from 'react';
import { Outlet, useLocation } from 'react-router-dom';
import { Sidebar } from './Sidebar';
import styles from './Layout.module.css';

export const Layout = () => {
    const [collapsed, setCollapsed] = useState(window.innerWidth <= 768);
    const [mobileOpen, setMobileOpen] = useState(false);

    const location = useLocation();

    // Close mobile menu on route change
    useEffect(() => {
        setMobileOpen(false);
    }, [location]);

    // Close mobile menu on window resize to desktop
    useEffect(() => {
        const handleResize = () => {
            if (window.innerWidth > 768) {
                setMobileOpen(false);
            }
        };
        window.addEventListener('resize', handleResize);
        return () => window.removeEventListener('resize', handleResize);
    }, []);

    return (
        <div className={styles.container}>
            {/* Mobile Hamburger */}
            <button
                className={styles.mobileToggle}
                onClick={() => setMobileOpen(!mobileOpen)}
                aria-label="Toggle menu"
            >
                <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                    <path d="M3 12h18M3 6h18M3 18h18" strokeLinecap="round" strokeLinejoin="round" />
                </svg>
            </button>

            {/* Mobile Overlay */}
            {mobileOpen && (
                <div
                    className={styles.overlay}
                    onClick={() => setMobileOpen(false)}
                />
            )}

            {/* Sidebar with mobile state */}
            <Sidebar
                collapsed={collapsed}
                toggle={() => setCollapsed(!collapsed)}
                onMobileClose={() => setMobileOpen(false)}
                isMobileOpen={mobileOpen}
            />

            <main className={`${styles.main} ${collapsed ? styles.collapsed : ''}`}>
                <div className={styles.content}>
                    <Outlet />
                </div>
            </main>
        </div>
    );
};

