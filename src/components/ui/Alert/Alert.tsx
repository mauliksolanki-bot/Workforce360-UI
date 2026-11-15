import type { ReactNode } from 'react';
import { AlertCircle, CheckCircle2, Info } from 'lucide-react';
import styles from './Alert.module.css';

type AlertVariant = 'error' | 'success' | 'info';

interface AlertProps {
    variant?: AlertVariant;
    children: ReactNode;
}

const ICONS: Record<AlertVariant, typeof AlertCircle> = {
    error: AlertCircle,
    success: CheckCircle2,
    info: Info,
};

export function Alert({ variant = 'info', children }: AlertProps) {
    const Icon = ICONS[variant];

    return (
        <div className={[styles.alert, styles[variant]].join(' ')} role={variant === 'error' ? 'alert' : 'status'}>
            <Icon size={18} aria-hidden="true" className={styles.icon} />
            <p>{children}</p>
        </div>
    );
}
