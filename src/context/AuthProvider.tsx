import { useCallback, useEffect, useMemo, useState, type ReactNode } from 'react';
import { login as loginRequest } from '../api/authApi';
import { AUTH_LOGOUT_EVENT } from '../api/httpClient';
import { clearSession, isSessionExpired, loadStoredSession, saveSession } from '../utils/tokenStorage';
import type { LoginCredentials, NxtGenUser } from '../types/auth';
import { AuthContext, type AuthContextValue } from './authContext';

// localStorage/sessionStorage reads are synchronous, so the session can be
// hydrated directly as initial state instead of via an effect + extra render.
function readStoredUser(): NxtGenUser | null {
    const stored = loadStoredSession();
    if (!stored) {
        return null;
    }
    if (isSessionExpired(stored)) {
        clearSession();
        return null;
    }
    return stored.session.user;
}

export function AuthProvider({ children }: { children: ReactNode }) {
    const [user, setUser] = useState<NxtGenUser | null>(readStoredUser);

    useEffect(() => {
        const handleForcedLogout = () => setUser(null);
        window.addEventListener(AUTH_LOGOUT_EVENT, handleForcedLogout);
        return () => window.removeEventListener(AUTH_LOGOUT_EVENT, handleForcedLogout);
    }, []);

    const login = useCallback(async (credentials: LoginCredentials, rememberMe: boolean) => {
        const session = await loginRequest(credentials);
        saveSession(session, rememberMe);
        setUser(session.user);
        return session.user;
    }, []);

    const logout = useCallback(() => {
        clearSession();
        setUser(null);
    }, []);

    const value = useMemo<AuthContextValue>(
        () => ({
            user,
            isAuthenticated: user !== null,
            login,
            logout,
        }),
        [user, login, logout],
    );

    return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}
