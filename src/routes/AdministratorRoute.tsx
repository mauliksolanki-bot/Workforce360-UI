import { Navigate, Outlet } from 'react-router-dom';
import { useAuth } from '../hooks/useAuth';

/** Restricts administrator-only screens even when their URL is entered directly. */
export function AdministratorRoute() {
    const { user } = useAuth();

    return user?.roleName === 'Administrator' ? <Outlet /> : <Navigate to="/dashboard" replace />;
}
