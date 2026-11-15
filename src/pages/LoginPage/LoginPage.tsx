import { useState } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { Link, useLocation, useNavigate, type Location } from 'react-router-dom';
import { Mail } from 'lucide-react';
import { AuthLayout } from '../../components/layout/AuthLayout/AuthLayout';
import { TextField } from '../../components/ui/TextField/TextField';
import { PasswordField } from '../../components/ui/PasswordField/PasswordField';
import { Checkbox } from '../../components/ui/Checkbox/Checkbox';
import { Button } from '../../components/ui/Button/Button';
import { Alert } from '../../components/ui/Alert/Alert';
import { useAuth } from '../../hooks/useAuth';
import { useToast } from '../../hooks/useToast';
import { AuthApiError } from '../../api/authApi';
import styles from './LoginPage.module.css';

// Mirrors the backend's `NxtGenLoginCredentials` constraints so invalid
// requests never leave the browser.
const loginSchema = z.object({
    email: z
        .string()
        .min(1, 'Enter your work email address.')
        .max(254, 'Email address is too long.')
        .email('Enter a valid email address.'),
    password: z
        .string()
        .min(8, 'Password must be at least 8 characters.')
        .max(72, 'Password must be 72 characters or fewer.'),
    rememberMe: z.boolean(),
});

type LoginFormValues = z.infer<typeof loginSchema>;

interface LocationState {
    from?: Location;
}

const DEFAULT_REDIRECT = '/dashboard';

export function LoginPage() {
    const { login } = useAuth();
    const { showSuccess, showError } = useToast();
    const navigate = useNavigate();
    const location = useLocation();
    const [serverError, setServerError] = useState<string | null>(null);

    const {
        register,
        handleSubmit,
        formState: { errors, isSubmitting },
    } = useForm<LoginFormValues>({
        resolver: zodResolver(loginSchema),
        defaultValues: { email: '', password: '', rememberMe: false },
    });

    const onSubmit = handleSubmit(async ({ email, password, rememberMe }) => {
        setServerError(null);
        try {
            const user = await login({ email, password }, rememberMe);
            showSuccess(`Welcome back, ${user.empFirstName}!`, 'Signed in successfully');
            const redirectTo = (location.state as LocationState | null)?.from?.pathname ?? DEFAULT_REDIRECT;
            navigate(redirectTo, { replace: true });
        } catch (error) {
            const message = error instanceof AuthApiError ? error.message : 'Something went wrong. Please try again.';
            setServerError(message);
            showError(message, 'Sign in failed');
        }
    });

    return (
        <AuthLayout>
            <div className={styles.card}>
                <header className={styles.header}>
                    <div className={styles.mobileBrand}>
                        <span className={styles.mobileBrandBadge}>W</span>
                        <span>Workforce360</span>
                    </div>
                    <h2 className={styles.title}>Welcome back</h2>
                    <p className={styles.subtitle}>Sign in to your workspace to continue.</p>
                </header>

                {serverError ? (
                    <div className={styles.alertSlot}>
                        <Alert variant="error">{serverError}</Alert>
                    </div>
                ) : null}

                <form className={styles.form} onSubmit={onSubmit} noValidate>
                    <TextField
                        label="Work email"
                        type="email"
                        autoComplete="email"
                        placeholder="you@company.com"
                        leadingIcon={<Mail size={18} />}
                        error={errors.email?.message}
                        {...register('email')}
                    />

                    <PasswordField
                        label="Password"
                        autoComplete="current-password"
                        placeholder="Enter your password"
                        error={errors.password?.message}
                        {...register('password')}
                    />

                    <div className={styles.row}>
                        <Checkbox label="Remember me" {...register('rememberMe')} />
                        <Link to="/forgot-password" className={styles.forgotLink}>
                            Forgot password?
                        </Link>
                    </div>

                    <Button type="submit" fullWidth isLoading={isSubmitting}>
                        Sign in
                    </Button>
                </form>

                <p className={styles.footerText}>
                    Having trouble signing in?{' '}
                    <a href="mailto:support@workforce360.com">Contact your administrator</a>.
                </p>
            </div>
        </AuthLayout>
    );
}
