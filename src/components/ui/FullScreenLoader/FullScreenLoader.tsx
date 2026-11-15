import { Loader2 } from 'lucide-react';
import styles from './FullScreenLoader.module.css';

/** Full-viewport loading state shown while the stored session is being resolved. */
export function FullScreenLoader() {
    return (
        <div className={styles.wrapper} role="status" aria-live="polite">
            <Loader2 className={styles.icon} size={32} aria-hidden="true" />
            <span className={styles.label}>Loading Workforce360…</span>
        </div>
    );
}
