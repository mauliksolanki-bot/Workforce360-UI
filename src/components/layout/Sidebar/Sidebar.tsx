import { useEffect, useState } from 'react';
import { ChevronDown, ChevronRight, LogOut, X } from 'lucide-react';
import { NavLink, useLocation } from 'react-router-dom';
import { useAuth } from '../../../hooks/useAuth';
import { useToast } from '../../../hooks/useToast';
import { fetchNavigation, NavigationApiError } from '../../../api/navigationApi';
import { resolveNavRoute } from './navConfig';
import type { NxtGenNavigation } from '../../../types/navigation';
import styles from './Sidebar.module.css';

interface SidebarProps {
    isOpen: boolean;
    onClose: () => void;
}

/**
 * Persistent left-hand navigation. Fixed and always visible on desktop;
 * becomes a slide-in overlay (toggled from `AppLayout`'s top bar) on
 * narrower viewports.
 */
export function Sidebar({ isOpen, onClose }: SidebarProps) {
    const { user, logout } = useAuth();
    const { showInfo } = useToast();
    const location = useLocation();
    const [navItems, setNavItems] = useState<NxtGenNavigation[]>([]);
    const [expandedParents, setExpandedParents] = useState<Set<number>>(new Set());

    useEffect(() => {
        const controller = new AbortController();

        (async () => {
            try {
                const items = await fetchNavigation(controller.signal);
                setNavItems(items);
            } catch (fetchError) {
                if (fetchError instanceof NavigationApiError && fetchError.isCanceled) {
                    // StrictMode's dev-only mount/unmount/remount cycle aborts the
                    // first request; the remount's request is the one that resolves.
                    return;
                }
                // Menu access is non-critical to render the shell; leave the nav
                // empty rather than breaking the whole layout (already logged by
                // the shared httpClient request/response interceptors).
            }
        })();

        return () => {
            controller.abort();
        };
    }, []);

    useEffect(() => {
        const activeChild = navItems.find((item) => item.parentNavigationId !== null && resolveNavRoute(item.code).path === location.pathname);
        if (activeChild?.parentNavigationId === null || activeChild?.parentNavigationId === undefined) return;
        setExpandedParents((current) => current.has(activeChild.parentNavigationId!) ? current : new Set(current).add(activeChild.parentNavigationId!));
    }, [location.pathname, navItems]);

    if (!user) {
        return null;
    }

    const fullName = `${user.empFirstName} ${user.empLastName}`.trim();
    const initials = `${user.empFirstName.charAt(0)}${user.empLastName.charAt(0)}`.toUpperCase();

    const handleLogout = () => {
        logout();
        showInfo('You have been signed out.', 'Signed out');
    };
    const topLevelItems = navItems.filter((item) => item.parentNavigationId === null);
    const childrenFor = (parentId: number) => navItems.filter((item) => item.parentNavigationId === parentId);
    const toggleParent = (parentId: number) => setExpandedParents((current) => {
        const next = new Set(current);
        next.has(parentId) ? next.delete(parentId) : next.add(parentId);
        return next;
    });

    return (
        <>
            {isOpen ? <div className={styles.backdrop} onClick={onClose} aria-hidden="true" /> : null}

            <aside className={`${styles.sidebar} ${isOpen ? styles.open : ''}`}>
                <div className={styles.brandRow}>
                    <div className={styles.brand}>
                        <span className={styles.brandBadge}>W</span>
                        <span className={styles.brandWordmark}>Workforce<span>360</span></span>
                    </div>
                    <button type="button" className={styles.closeButton} onClick={onClose} aria-label="Close navigation">
                        <X size={18} aria-hidden="true" />
                    </button>
                </div>

                <nav className={styles.nav} aria-label="Primary">
                    <ul>
                        {topLevelItems.map((item) => {
                            const { id, code, displayName, isParent } = item;
                            const { path, icon: Icon } = resolveNavRoute(code);
                            const children = childrenFor(id);
                            const isExpanded = expandedParents.has(id);
                            if (isParent === 'Y') {
                                return <li key={id}><button type="button" className={styles.parentLink} data-nav-code={code} onClick={() => toggleParent(id)} aria-expanded={isExpanded}><span className={styles.parentLabel}><Icon size={18} aria-hidden="true" /><span>{displayName}</span></span>{isExpanded ? <ChevronDown size={17} aria-hidden="true" /> : <ChevronRight size={17} aria-hidden="true" />}</button>{isExpanded && children.length ? <ul className={styles.childMenu}>{children.map((child) => { const { path: childPath, icon: ChildIcon } = resolveNavRoute(child.code); return <li key={child.id}><NavLink to={childPath} end onClick={onClose} data-nav-code={child.code} className={({ isActive }) => [styles.childLink, isActive ? styles.navLinkActive : null].filter(Boolean).join(' ')}><ChildIcon size={16} aria-hidden="true" /><span>{child.displayName}</span></NavLink></li>; })}</ul> : null}</li>;
                            }
                            return (
                                <li key={id}>
                                    <NavLink
                                        to={path}
                                        end
                                        onClick={onClose}
                                        data-nav-code={code}
                                        className={({ isActive }) =>
                                            [styles.navLink, isActive ? styles.navLinkActive : null].filter(Boolean).join(' ')
                                        }
                                    >
                                        <Icon size={18} aria-hidden="true" />
                                        <span>{displayName}</span>
                                    </NavLink>
                                </li>
                            );
                        })}
                    </ul>
                </nav>

                <div className={styles.footer}>
                    <div className={styles.userCard}>
                        <span className={styles.avatar}>{initials}</span>
                        <div className={styles.userMeta}>
                            <strong>{fullName}</strong>
                            <span className={styles.roleBadge}>{user.roleName}</span>
                        </div>
                    </div>
                    <button type="button" className={styles.logoutButton} onClick={handleLogout}>
                        <LogOut size={16} aria-hidden="true" />
                        Sign out
                    </button>
                </div>
            </aside>
        </>
    );
}
