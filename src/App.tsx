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
const ApplyLeavePage = lazy(() => import('./pages/ApplyLeavePage/ApplyLeavePage').then((m) => ({ default: m.ApplyLeavePage })));
const LeaveHistoryPage = lazy(() => import('./pages/LeaveHistoryPage/LeaveHistoryPage').then((m) => ({ default: m.LeaveHistoryPage })));
const LeaveApprovalsPage = lazy(() => import('./pages/LeaveApprovalsPage/LeaveApprovalsPage').then((m) => ({ default: m.LeaveApprovalsPage })));
const HolidayCalendarPage = lazy(() => import('./pages/HolidayCalendarPage/HolidayCalendarPage').then((m) => ({ default: m.HolidayCalendarPage })));
const UserAccessPage = lazy(() => import('./pages/UserAccessPage/UserAccessPage').then((m) => ({ default: m.UserAccessPage })));
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
                        <Route path="/leave-management" element={<Navigate to="/leave-management/apply-leave" replace />} />
                        <Route path="/leave-management/apply-leave" element={<ApplyLeavePage />} />
                        <Route path="/leave-management/leave-history" element={<LeaveHistoryPage />} />
                        <Route path="/leave-management/leave-approvals" element={<LeaveApprovalsPage />} />
                        <Route path="/leave-management/holiday-calendar" element={<HolidayCalendarPage />} />
                        <Route path="/apply-leave" element={<Navigate to="/leave-management/apply-leave" replace />} />
                        <Route path="/leave-balance" element={<Navigate to="/leave-management/leave-history" replace />} />
                        <Route path="/leave-approvals" element={<Navigate to="/leave-management/leave-approvals" replace />} />
                        <Route path="/holiday-calendar" element={<Navigate to="/leave-management/holiday-calendar" replace />} />
                        <Route element={<AdministratorRoute />}>
                            <Route path="/roles-designations" element={<RolesDesignationsPage />} />
                            <Route path="/payroll" element={<PayrollPage />} />
                            <Route path="/audit" element={<Navigate to="/audit/user-access" replace />} />
                            <Route path="/audit/user-access" element={<UserAccessPage />} />
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
