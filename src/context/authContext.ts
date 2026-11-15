import { createContext } from 'react';
import type { LoginCredentials, NxtGenUser } from '../types/auth';

export interface AuthContextValue {
    user: NxtGenUser | null;
    isAuthenticated: boolean;
    login: (credentials: LoginCredentials, rememberMe: boolean) => Promise<NxtGenUser>;
    logout: () => void;
}

export const AuthContext = createContext<AuthContextValue | undefined>(undefined);
