import type { LoginSession } from '../types/auth';

const STORAGE_KEY = 'workforce360.session';

interface StoredSession {
    session: LoginSession;
    /** Epoch milliseconds after which the access token should be considered stale. */
    expiresAt: number;
}

function parse(raw: string | null): StoredSession | null {
    if (!raw) {
        return null;
    }

    try {
        return JSON.parse(raw) as StoredSession;
    } catch {
        return null;
    }
}

/**
 * Persists the session in `localStorage` (when "remember me" is checked) or
 * `sessionStorage` (cleared once the browser tab closes), ensuring only one
 * copy ever exists at a time.
 */
export function saveSession(session: LoginSession, rememberMe: boolean): void {
    const value = JSON.stringify({
        session,
        expiresAt: Date.now() + session.expiresIn * 1000,
    } satisfies StoredSession);

    if (rememberMe) {
        window.sessionStorage.removeItem(STORAGE_KEY);
        window.localStorage.setItem(STORAGE_KEY, value);
    } else {
        window.localStorage.removeItem(STORAGE_KEY);
        window.sessionStorage.setItem(STORAGE_KEY, value);
    }
}

export function loadStoredSession(): StoredSession | null {
    return parse(window.localStorage.getItem(STORAGE_KEY)) ?? parse(window.sessionStorage.getItem(STORAGE_KEY));
}

export function isSessionExpired(stored: StoredSession): boolean {
    return Date.now() >= stored.expiresAt;
}

export function clearSession(): void {
    window.localStorage.removeItem(STORAGE_KEY);
    window.sessionStorage.removeItem(STORAGE_KEY);
}
