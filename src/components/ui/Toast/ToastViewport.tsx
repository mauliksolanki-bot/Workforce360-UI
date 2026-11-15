import { createPortal } from 'react-dom';
import { Toast } from './Toast';
import type { ToastItem } from '../../../context/toastContext';
import styles from './Toast.module.css';

interface ToastViewportProps {
    toasts: ToastItem[];
    onDismiss: (id: string) => void;
}

/** Portals the active toast stack to `document.body` so it renders above everything, including modals. */
export function ToastViewport({ toasts, onDismiss }: ToastViewportProps) {
    if (toasts.length === 0) {
        return null;
    }

    return createPortal(
        <div className={styles.viewport} role="region" aria-label="Notifications">
            {toasts.map((toast) => (
                <Toast key={toast.id} toast={toast} onDismiss={onDismiss} />
            ))}
        </div>,
        document.body,
    );
}
