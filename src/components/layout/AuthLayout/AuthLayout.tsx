import type { ReactNode } from 'react';
import { BarChart3, ShieldCheck, Users2 } from 'lucide-react';
import styles from './AuthLayout.module.css';

interface AuthLayoutProps {
    children: ReactNode;
}

// Computed once per module load rather than during render.
const CURRENT_YEAR = new Date().getFullYear();

const HIGHLIGHTS = [
    {
        icon: Users2,
        title: 'Unified workforce records',
        description: 'Every employee profile, role and reporting line in one place.',
    },
    {
        icon: ShieldCheck,
        title: 'Enterprise-grade security',
        description: 'JWT-backed sessions with encrypted credentials end to end.',
    },
    {
        icon: BarChart3,
        title: 'Real-time insights',
        description: 'Track headcount, attendance and performance as it happens.',
    },
];

/** Shared split-screen shell for authentication screens (login, forgot password, etc.). */
export function AuthLayout({ children }: AuthLayoutProps) {
    return (
        <div className={styles.page}>
            <aside className={styles.brandPanel}>
                <div className={styles.blobOne} aria-hidden="true" />
                <div className={styles.blobTwo} aria-hidden="true" />
                <div className={styles.gridOverlay} aria-hidden="true" />

                <div className={styles.brandContent}>
                    <div className={styles.brandMark}>
                        <span className={styles.brandMarkBadge}>W</span>
                        <span className={styles.brandMarkText}>Workforce360</span>
                    </div>

                    <h1 className={styles.tagline}>Manage your entire workforce, with clarity and confidence.</h1>
                    <p className={styles.subTagline}>
                        One secure workspace for HR operations, built on the NxtGen platform.
                    </p>

                    <ul className={styles.highlightList}>
                        {HIGHLIGHTS.map(({ icon: Icon, title, description }) => (
                            <li key={title} className={styles.highlightItem}>
                <span className={styles.highlightIcon}>
                  <Icon size={19} aria-hidden="true" />
                </span>
                                <span>
                  <strong>{title}</strong>
                  <p>{description}</p>
                </span>
                            </li>
                        ))}
                    </ul>
                </div>

                <p className={styles.brandFooter}>© {CURRENT_YEAR} Workforce360 · NxtGen Platform</p>
            </aside>

            <main className={styles.contentPanel}>
                <div className={styles.contentInner}>{children}</div>
            </main>
        </div>
    );
}
