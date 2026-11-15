import { createContext } from 'react';

export type ToastVariant = 'success' | 'error' | 'warning' | 'info';

export interface ToastItem {
    id: string;
    variant: ToastVariant;
    title?: string;
    message: string;
}

export interface ToastContextValue {
    /** Low-level primitive; prefer the variant-specific helpers below. */
    showToast: (variant: ToastVariant, message: string, title?: string) => void;
    showSuccess: (message: string, title?: string) => void;
    showError: (message: string, title?: string) => void;
    showWarning: (message: string, title?: string) => void;
    showInfo: (message: string, title?: string) => void;
    dismissToast: (id: string) => void;
}

export const ToastContext = createContext<ToastContextValue | undefined>(undefined);
