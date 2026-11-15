import { useContext } from 'react';
import { AuthContext, type AuthContextValue } from '../context/authContext';

/** Convenience accessor for the authentication context; throws outside of `AuthProvider`. */
export function useAuth(): AuthContextValue {
    const context = useContext(AuthContext);
    if (!context) {
        throw new Error('useAuth must be used within an AuthProvider');
    }
    return context;
}
