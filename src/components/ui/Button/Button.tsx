import type { ButtonHTMLAttributes, ReactNode } from 'react';
import { Loader2 } from 'lucide-react';
import styles from './Button.module.css';

type ButtonVariant = 'primary' | 'ghost';

interface ButtonProps extends ButtonHTMLAttributes<HTMLButtonElement> {
    variant?: ButtonVariant;
    isLoading?: boolean;
    fullWidth?: boolean;
    children: ReactNode;
}

export function Button({
                           variant = 'primary',
                           isLoading = false,
                           fullWidth = false,
                           disabled,
                           className,
                           children,
                           ...rest
                       }: ButtonProps) {
    const classes = [styles.button, styles[variant], fullWidth ? styles.fullWidth : null, className]
        .filter(Boolean)
        .join(' ');

    return (
        <button className={classes} disabled={disabled || isLoading} aria-busy={isLoading} {...rest}>
            {isLoading ? <Loader2 className={styles.spinnerIcon} size={18} aria-hidden="true" /> : null}
            <span>{children}</span>
        </button>
    );
}
