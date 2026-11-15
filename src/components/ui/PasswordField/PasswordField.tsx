import { forwardRef, useState, type InputHTMLAttributes } from 'react';
import { Eye, EyeOff, Lock } from 'lucide-react';
import { TextField } from '../TextField/TextField';
import styles from './PasswordField.module.css';

interface PasswordFieldProps extends Omit<InputHTMLAttributes<HTMLInputElement>, 'type'> {
    label: string;
    error?: string;
}

/** A `TextField` preconfigured for passwords, with a show/hide visibility toggle. */
export const PasswordField = forwardRef<HTMLInputElement, PasswordFieldProps>(function PasswordField(
    { label, error, ...rest },
    ref,
) {
    const [isVisible, setIsVisible] = useState(false);

    return (
        <TextField
            {...rest}
            ref={ref}
            label={label}
            error={error}
            type={isVisible ? 'text' : 'password'}
            leadingIcon={<Lock size={18} />}
            trailingAdornment={
                <button
                    type="button"
                    className={styles.toggle}
                    onClick={() => setIsVisible((prev) => !prev)}
                    aria-label={isVisible ? 'Hide password' : 'Show password'}
                >
                    {isVisible ? <EyeOff size={18} aria-hidden="true" /> : <Eye size={18} aria-hidden="true" />}
                </button>
            }
        />
    );
});
