import { lazy, Suspense } from 'react';
import { Navigate, Route, Routes } from 'react-router-dom';
import { ProtectedRoute } from './routes/ProtectedRoute';
import { AdministratorRoute } from './routes/AdministratorRoute';
import { PublicOnlyRoute } from './routes/PublicOnlyRoute';
import { FullScreenLoader } from './components/ui/FullScreenLoader/FullScreenLoader';
import { AppLayout } from './components/layout/AppLayout/AppLayout';

const LoginPage = lazy(() => import('./pages/LoginPage/LoginPage').then((m) => ({ default: m.LoginPage })));
const ForgotPasswordPage = lazy(() =>
    import('./pages/ForgotPasswordPage/ForgotPasswordPage').then((m) => ({ default: m.ForgotPasswordPage })),
);
const DashboardPage = lazy(() =>
    import('./pages/DashboardPage/DashboardPage').then((m) => ({ default: m.DashboardPage })),
);
const ProfilePage = lazy(() =>
    import('./pages/ProfilePage/ProfilePage').then((m) => ({ default: m.ProfilePage })),
);
const RolesDesignationsPage = lazy(() =>
    import('./pages/RolesDesignationsPage/RolesDesignationsPage').then((m) => ({ default: m.RolesDesignationsPage })),
);
const PayrollPage = lazy(() => import('./pages/PayrollPage/PayrollPage').then((m) => ({ default: m.PayrollPage })));
const NotFoundPage = lazy(() =>
    import('./pages/NotFoundPage/NotFoundPage').then((m) => ({ default: m.NotFoundPage })),
);

function App() {
    return (
        <Suspense fallback={<FullScreenLoader />}>
            <Routes>
                <Route element={<PublicOnlyRoute />}>
                    <Route path="/login" element={<LoginPage />} />
                    <Route path="/forgot-password" element={<ForgotPasswordPage />} />
                </Route>

                <Route element={<ProtectedRoute />}>
                    <Route element={<AppLayout />}>
                        <Route path="/dashboard" element={<DashboardPage />} />
                        <Route path="/profile" element={<ProfilePage />} />
                        <Route element={<AdministratorRoute />}>
                            <Route path="/roles-designations" element={<RolesDesignationsPage />} />
                            <Route path="/payroll" element={<PayrollPage />} />
                        </Route>
                    </Route>
                </Route>

                <Route path="/" element={<Navigate to="/dashboard" replace />} />
                <Route path="*" element={<NotFoundPage />} />
            </Routes>
        </Suspense>
    );
}

export default App;
