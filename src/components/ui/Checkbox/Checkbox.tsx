import { forwardRef, useId, type InputHTMLAttributes } from 'react';
import { Check } from 'lucide-react';
import styles from './Checkbox.module.css';

interface CheckboxProps extends Omit<InputHTMLAttributes<HTMLInputElement>, 'type'> {
    label: string;
}

export const Checkbox = forwardRef<HTMLInputElement, CheckboxProps>(function Checkbox(
    { label, id, className, ...rest },
    ref,
) {
    const generatedId = useId();
    const inputId = id ?? generatedId;

    return (
        <label htmlFor={inputId} className={[styles.wrapper, className].filter(Boolean).join(' ')}>
            <input type="checkbox" id={inputId} ref={ref} className={styles.input} {...rest} />
            <span className={styles.box}>
        <Check size={13} strokeWidth={3} className={styles.check} aria-hidden="true" />
      </span>
            <span className={styles.label}>{label}</span>
        </label>
    );
});
