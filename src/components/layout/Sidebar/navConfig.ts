import { CalendarDays, CalendarRange, Circle, ClipboardCheck, FilePenLine, KeyRound, LayoutDashboard, ReceiptText, ScrollText, ShieldCheck, UserCircle, WalletCards } from 'lucide-react';
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
    LEAVE_MANAGEMENT: { path: '/leave-management', icon: CalendarDays },
    APPLY_LEAVE: { path: '/leave-management/apply-leave', icon: FilePenLine },
    LEAVE_BALANCE: { path: '/leave-management/leave-history', icon: WalletCards },
    LEAVE_APPROVALS: { path: '/leave-management/leave-approvals', icon: ClipboardCheck },
    HOLIDAY_CALENDAR: { path: '/leave-management/holiday-calendar', icon: CalendarRange },
    AUDIT: { path: '/audit', icon: ScrollText },
    USER_ACCESS: { path: '/audit/user-access', icon: KeyRound },
};

const DEFAULT_NAV_ROUTE: NavRoute = { path: '/dashboard', icon: Circle };

export function resolveNavRoute(code: string): NavRoute {
    return NAV_ROUTES_BY_CODE[code] ?? DEFAULT_NAV_ROUTE;
}
