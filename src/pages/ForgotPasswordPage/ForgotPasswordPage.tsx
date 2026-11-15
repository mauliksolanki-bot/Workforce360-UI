import { ArrowLeft, LifeBuoy } from 'lucide-react';
import { Link } from 'react-router-dom';
import { AuthLayout } from '../../components/layout/AuthLayout/AuthLayout';
import styles from './ForgotPasswordPage.module.css';

/**
 * Workforce360 accounts are provisioned by an administrator rather than through
 * self-service sign-up, so there is no password-reset API yet. This screen sets
 * honest expectations instead of linking to functionality that doesn't exist.
 */
export function ForgotPasswordPage() {
    return (
        <AuthLayout>
            <div className={styles.card}>
        <span className={styles.icon}>
          <LifeBuoy size={26} aria-hidden="true" />
        </span>
                <h2 className={styles.title}>Need account help?</h2>
                <p className={styles.description}>
                    Password resets for Workforce360 are handled by your IT administrator. Reach out to them directly, or
                    email our support team and we'll get you back in quickly.
                </p>
                <a className={styles.supportLink} href="mailto:support@workforce360.com">
                    support@workforce360.com
                </a>
                <Link to="/login" className={styles.backLink}>
                    <ArrowLeft size={16} aria-hidden="true" />
                    Back to sign in
                </Link>
            </div>
        </AuthLayout>
    );
}
