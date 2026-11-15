import { useCallback, useEffect, useRef, useState } from 'react';
import { AlertCircle, AlertTriangle, CheckCircle2, Info, X } from 'lucide-react';
import type { LucideIcon } from 'lucide-react';
import type { ToastItem, ToastVariant } from '../../../context/toastContext';
import styles from './Toast.module.css';

const AUTO_DISMISS_MS = 5000;
const EXIT_ANIMATION_MS = 200;

const ICONS: Record<ToastVariant, LucideIcon> = {
    success: CheckCircle2,
    error: AlertCircle,
    warning: AlertTriangle,
    info: Info,
};

interface ToastProps {
    toast: ToastItem;
    onDismiss: (id: string) => void;
}

/**
 * A single auto-dismissing toast. Auto-dismisses after 5 seconds; hovering pauses the
 * countdown (and the visual progress bar) so a user reading a message doesn't lose it mid-read.
 */
export function Toast({ toast, onDismiss }: ToastProps) {
    const { id, variant, title, message } = toast;
    const Icon = ICONS[variant];

    const [isExiting, setIsExiting] = useState(false);
    const [isPaused, setIsPaused] = useState(false);

    const timeoutRef = useRef<ReturnType<typeof setTimeout> | undefined>(undefined);
    const remainingRef = useRef(AUTO_DISMISS_MS);
    const startedAtRef = useRef(Date.now());

    const requestDismiss = useCallback(() => {
        setIsExiting(true);
        setTimeout(() => onDismiss(id), EXIT_ANIMATION_MS);
    }, [id, onDismiss]);

    const clearTimer = useCallback(() => {
        if (timeoutRef.current) {
            clearTimeout(timeoutRef.current);
            timeoutRef.current = undefined;
        }
    }, []);

    const startTimer = useCallback(() => {
        startedAtRef.current = Date.now();
        timeoutRef.current = setTimeout(requestDismiss, remainingRef.current);
    }, [requestDismiss]);

    useEffect(() => {
        startTimer();
        return clearTimer;
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, []);

    const handleMouseEnter = () => {
        setIsPaused(true);
        remainingRef.current = Math.max(remainingRef.current - (Date.now() - startedAtRef.current), 0);
        clearTimer();
    };

    const handleMouseLeave = () => {
        setIsPaused(false);
        startTimer();
    };

    return (
        <div
            className={[styles.toast, styles[variant], isExiting ? styles.exiting : null].filter(Boolean).join(' ')}
            role={variant === 'error' ? 'alert' : 'status'}
            onMouseEnter={handleMouseEnter}
            onMouseLeave={handleMouseLeave}
        >
      <span className={styles.iconChip}>
        <Icon size={18} aria-hidden="true" />
      </span>
            <div className={styles.body}>
                {title ? <p className={styles.title}>{title}</p> : null}
                <p className={styles.message}>{message}</p>
            </div>
            <button type="button" className={styles.closeButton} onClick={requestDismiss} aria-label="Dismiss notification">
                <X size={15} aria-hidden="true" />
            </button>
            <span className={styles.progress} style={{ animationPlayState: isPaused ? 'paused' : 'running' }} />
        </div>
    );
}
