import { useCallback, useEffect, useMemo, useRef, useState, type ReactNode } from 'react';
import { ToastContext, type ToastContextValue, type ToastItem } from './toastContext';
import { ToastViewport } from '../components/ui/Toast/ToastViewport';
import { API_ERROR_TOAST_EVENT } from '../utils/apiErrorToast';

let fallbackIdCounter = 0;

/** `crypto.randomUUID` isn't available in every environment (e.g. non-HTTPS contexts); fall back to a counter. */
function createToastId(): string {
    if (typeof crypto !== 'undefined' && typeof crypto.randomUUID === 'function') {
        return crypto.randomUUID();
    }
    fallbackIdCounter += 1;
    return `toast-${fallbackIdCounter}`;
}

/**
 * App-wide toast notifications. Toasts auto-dismiss after 5 seconds (see `Toast.tsx`, which
 * owns the countdown so hovering a toast can pause/resume it) and render through a portal so
 * they always sit above the rest of the UI, including modals.
 */
export function ToastProvider({ children }: { children: ReactNode }) {
    const [toasts, setToasts] = useState<ToastItem[]>([]);
    const lastErrorToastAt = useRef(0);

    const dismissToast = useCallback((id: string) => {
        setToasts((current) => current.filter((toast) => toast.id !== id));
    }, []);

    const showToast = useCallback<ToastContextValue['showToast']>((variant, message, title) => {
        const now = Date.now();
        if (variant === 'error' && now - lastErrorToastAt.current < 300) return;
        if (variant === 'error') lastErrorToastAt.current = now;
        setToasts((current) => [...current, { id: createToastId(), variant, message, title }]);
    }, []);

    useEffect(() => {
        const showGenericError = () => showToast('error', 'Something went wrong. Please try again.', 'Request failed');
        window.addEventListener(API_ERROR_TOAST_EVENT, showGenericError);
        return () => window.removeEventListener(API_ERROR_TOAST_EVENT, showGenericError);
    }, [showToast]);

    const value = useMemo<ToastContextValue>(
        () => ({
            showToast,
            showSuccess: (message, title) => showToast('success', message, title),
            showError: (message, title) => showToast('error', message, title),
            showWarning: (message, title) => showToast('warning', message, title),
            showInfo: (message, title) => showToast('info', message, title),
            dismissToast,
        }),
        [showToast, dismissToast],
    );

    return (
        <ToastContext.Provider value={value}>
            {children}
            <ToastViewport toasts={toasts} onDismiss={dismissToast} />
        </ToastContext.Provider>
    );
}
