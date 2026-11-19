import { forwardRef, useId, type InputHTMLAttributes, type ReactNode } from 'react';
import styles from './TextField.module.css';

export interface TextFieldProps extends InputHTMLAttributes<HTMLInputElement> {
    label: string;
    error?: string;
    labelIcon?: ReactNode;
    labelClassName?: string;
    leadingIcon?: ReactNode;
    trailingAdornment?: ReactNode;
}

export const TextField = forwardRef<HTMLInputElement, TextFieldProps>(function TextField(
    { label, error, labelIcon, labelClassName, leadingIcon, trailingAdornment, id, className, ...rest },
    ref,
) {
    const generatedId = useId();
    const inputId = id ?? generatedId;
    const errorId = `${inputId}-error`;

    return (
        <div className={styles.field}>
            <label htmlFor={inputId} className={[styles.label, labelClassName].filter(Boolean).join(' ')}>
                {labelIcon ? <span aria-hidden="true">{labelIcon}</span> : null}
                {label}
            </label>
            <div className={[styles.inputWrapper, error ? styles.inputWrapperError : null].filter(Boolean).join(' ')}>
                {leadingIcon ? (
                    <span className={styles.icon} aria-hidden="true">
            {leadingIcon}
          </span>
                ) : null}
                <input
                    id={inputId}
                    ref={ref}
                    className={[styles.input, className].filter(Boolean).join(' ')}
                    aria-invalid={Boolean(error)}
                    aria-describedby={error ? errorId : undefined}
                    {...rest}
                />
                {trailingAdornment ? <span className={styles.adornment}>{trailingAdornment}</span> : null}
            </div>
            {error ? (
                <p id={errorId} className={styles.errorText} role="alert">
                    {error}
                </p>
            ) : null}
        </div>
    );
});
