import { ShieldCheck } from 'lucide-react';
import { useAuth } from '../../hooks/useAuth';
import styles from './DashboardPage.module.css';

/**
 * Minimal, polished landing page shown right after sign-in. It exists to prove
 * the authentication flow works end to end; feature screens will build on it.
 */
export function DashboardPage() {
    const { user } = useAuth();

    if (!user) {
        return null;
    }

    return (
        <div className={styles.page}>
            <main className={styles.content}>
                <section className={styles.welcomeCard}>
          <span className={styles.welcomeIcon}>
            <ShieldCheck size={26} aria-hidden="true" />
          </span>
                    <div>
                        <h1>Welcome back, {user.empFirstName}.</h1>
                        <p>
                            You're signed in as {user.roleName} · Employee ID {user.empId}
                        </p>
                    </div>
                </section>

                <section className={styles.grid}>
                    <div className={styles.infoCard}>
                        <h3>Work email</h3>
                        <p>{user.empEmail}</p>
                    </div>
                    <div className={styles.infoCard}>
                        <h3>Designation</h3>
                        <p>{user.designation ?? 'Not specified'}</p>
                    </div>
                    <div className={styles.infoCard}>
                        <h3>Work location</h3>
                        <p>{user.workLocation ?? 'Not specified'}</p>
                    </div>
                    <div className={styles.infoCard}>
                        <h3>Reporting manager</h3>
                        <p>{user.reportingManager ?? 'Not specified'}</p>
                    </div>
                </section>
            </main>
        </div>
    );
}
