import { useState } from 'react';
import { Menu } from 'lucide-react';
import { Outlet } from 'react-router-dom';
import { Sidebar } from '../Sidebar/Sidebar';
import styles from './AppLayout.module.css';

/**
 * Shared shell for every authenticated screen: a persistent sidebar on
 * desktop (collapsible to a slide-in overlay on mobile, toggled from the
 * top bar) with the active route rendered via `Outlet`.
 */
export function AppLayout() {
    const [isSidebarOpen, setSidebarOpen] = useState(false);

    return (
        <div className={styles.shell}>
            <Sidebar isOpen={isSidebarOpen} onClose={() => setSidebarOpen(false)} />

            <div className={styles.main}>
                <header className={styles.topbar}>
                    <button
                        type="button"
                        className={styles.menuButton}
                        onClick={() => setSidebarOpen(true)}
                        aria-label="Open navigation"
                    >
                        <Menu size={20} aria-hidden="true" />
                    </button>
                    <div className={styles.topbarBrand}>
                        <span className={styles.brandBadge}>W</span>
                        <span>Workforce360</span>
                    </div>
                </header>

                <div className={styles.pageArea}>
                    <Outlet />
                </div>
            </div>
        </div>
    );
}
