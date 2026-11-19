/**
 * Mirrors `com.nxtgen.model.NxtGenNavigation`. `code` is a stable key
 * (e.g. `DASHBOARD`) used to resolve the route/icon on the client;
 * `displayName` is the label to render as-is.
 */
export interface NxtGenNavigation {
    id: number;
    code: string;
    displayName: string;
    isParent: string;
    parentNavigationId: number | null;
}
