import { Circle, LayoutDashboard, ReceiptText, ShieldCheck, UserCircle } from 'lucide-react';
import type { LucideIcon } from 'lucide-react';

interface NavRoute {
    path: string;
    icon: LucideIcon;
}

/**
 * The backend (`GET /navigation`) only knows about a stable `code` and a
 * `displayName` per menu entry - it has no concept of client-side routes or
 * icons. This map resolves each known `code` to where it should link and
 * which icon represents it; anything not listed here falls back to
 * `DEFAULT_NAV_ROUTE` so an unexpected code still renders instead of
 * disappearing silently.
 */
const NAV_ROUTES_BY_CODE: Record<string, NavRoute> = {
    DASHBOARD: { path: '/dashboard', icon: LayoutDashboard },
    PROFILE: { path: '/profile', icon: UserCircle },
    ROLES_DESIGNATIONS: { path: '/roles-designations', icon: ShieldCheck },
    PAYROLL: { path: '/payroll', icon: ReceiptText },
};

const DEFAULT_NAV_ROUTE: NavRoute = { path: '/dashboard', icon: Circle };

export function resolveNavRoute(code: string): NavRoute {
    return NAV_ROUTES_BY_CODE[code] ?? DEFAULT_NAV_ROUTE;
}
