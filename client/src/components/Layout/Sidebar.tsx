import { NavLink } from 'react-router-dom';
import { LayoutDashboard, Box, MapPin, Wrench, LogOut, Sun, Moon, Monitor, Settings, BarChart3, Users, Store, ChevronLeft, ChevronRight, FileText, X } from 'lucide-react';
import styles from './Sidebar.module.css';
import { useAuth } from '../../context/AuthContext';
import { useTheme } from '../../context/ThemeContext';

interface SidebarProps {
    collapsed: boolean;
    toggle: () => void;
    onMobileClose?: () => void;
    isMobileOpen?: boolean;
}

export const Sidebar = ({ collapsed, toggle, onMobileClose, isMobileOpen = false }: SidebarProps) => {
    const { user, logout } = useAuth();
    const { theme, setTheme } = useTheme();

    const navItems = [
        { icon: LayoutDashboard, label: 'Dashboard', path: '/' },
        { icon: Box, label: 'Assets', path: '/assets' },
        { icon: MapPin, label: 'Locations', path: '/map' },
        { icon: Wrench, label: 'Maintenance', path: '/maintenance' },
        { icon: Store, label: 'Vendors', path: '/vendors' },
        { icon: BarChart3, label: 'Reports', path: '/reports' },
        ...(user?.role === 'ADMIN' ? [
            { icon: Users, label: 'Users', path: '/users' },
            { icon: FileText, label: 'Audit Logs', path: '/audit-logs' }
        ] : []),
        { icon: Settings, label: 'Settings', path: '/settings' },
    ];

    // On mobile, always show full sidebar (never collapsed)
    const isCollapsed = isMobileOpen ? false : collapsed;
    const showLabels = isMobileOpen || !collapsed;

    return (
        <aside className={`${styles.sidebar} ${isCollapsed ? styles.collapsed : ''} ${isMobileOpen ? styles.mobileOpen : ''}`}>
            <div className={styles.logo}>
                <Box className={styles.logoIcon} size={28} />
                {showLabels && <span className={styles.brand}>BSPHCL Monitor</span>}

                {/* Desktop Toggle */}
                <button className={`${styles.collapseBtn} ${styles.desktopOnly}`} onClick={toggle}>
                    {collapsed ? <ChevronRight size={16} /> : <ChevronLeft size={16} />}
                </button>

                {/* Mobile Close */}
                {onMobileClose && (
                    <button className={`${styles.collapseBtn} ${styles.mobileOnly}`} onClick={onMobileClose}>
                        <X size={18} />
                    </button>
                )}
            </div>

            <nav className={styles.nav}>
                {navItems.map((item) => (
                    <NavLink
                        key={item.path}
                        to={item.path}
                        className={({ isActive }) => `${styles.link} ${isActive ? styles.active : ''}`}
                        title={isCollapsed ? item.label : ''}
                        onClick={onMobileClose} // Close mobile menu on navigation
                    >
                        {({ isActive }) => (
                            <>
                                <item.icon size={20} className={styles.icon} />
                                {showLabels && <span className={styles.label}>{item.label}</span>}
                                {isActive && showLabels && <div className={styles.glow} />}
                            </>
                        )}
                    </NavLink>
                ))}
            </nav>

            <div className={styles.footer}>
                {showLabels ? (
                    <div className={styles.themeToggle}>
                        <button onClick={() => setTheme('light')} className={`${styles.themeBtn} ${theme === 'light' ? styles.activeTheme : ''}`}><Sun size={16} /></button>
                        <button onClick={() => setTheme('dark')} className={`${styles.themeBtn} ${theme === 'dark' ? styles.activeTheme : ''}`}><Moon size={16} /></button>
                        <button onClick={() => setTheme('system')} className={`${styles.themeBtn} ${theme === 'system' ? styles.activeTheme : ''}`}><Monitor size={16} /></button>
                    </div>
                ) : (
                    <button className={styles.themeBtn} onClick={() => setTheme(theme === 'dark' ? 'light' : 'dark')} style={{ marginBottom: 16 }}>
                        {theme === 'dark' ? <Moon size={16} /> : <Sun size={16} />}
                    </button>
                )}

                <button className={styles.link} onClick={logout} title="Logout">
                    <LogOut size={20} className={styles.icon} />
                    {showLabels && <span className={styles.label}>Logout</span>}
                </button>
            </div>
        </aside>
    );
};
