import { useEffect, useRef, type ReactNode } from 'react';
import { createPortal } from 'react-dom';
import { X } from 'lucide-react';
import styles from './Modal.module.css';

interface ModalProps {
    isOpen: boolean;
    title: string;
    description?: string;
    onClose: () => void;
    children: ReactNode;
    footer?: ReactNode;
    size?: 'md' | 'lg' | 'xl';
}

/** Generic, accessible dialog shell: backdrop, Escape-to-close, header/body/footer slots. */
export function Modal({ isOpen, title, description, onClose, children, footer, size = 'md' }: ModalProps) {
    const dialogRef = useRef<HTMLDivElement>(null);

    useEffect(() => {
        if (!isOpen) {
            return;
        }

        const handleKeyDown = (event: KeyboardEvent) => {
            if (event.key === 'Escape') {
                onClose();
            }
        };

        document.addEventListener('keydown', handleKeyDown);
        document.body.style.overflow = 'hidden';

        return () => {
            document.removeEventListener('keydown', handleKeyDown);
            document.body.style.overflow = '';
        };
    }, [isOpen, onClose]);

    if (!isOpen) {
        return null;
    }

    return createPortal(
        <div
            className={styles.overlay}
            onMouseDown={(event) => {
                if (event.target === event.currentTarget) {
                    onClose();
                }
            }}
        >
            <div
                ref={dialogRef}
                className={[styles.dialog, size === 'lg' ? styles.dialogLarge : null, size === 'xl' ? styles.dialogExtraLarge : null].filter(Boolean).join(' ')}
                role="dialog"
                aria-modal="true"
                aria-labelledby="modal-title"
            >
                <header className={styles.header}>
                    <div className={styles.headerText}>
                        <h2 id="modal-title" className={styles.title}>
                            {title}
                        </h2>
                        {description ? <p className={styles.description}>{description}</p> : null}
                    </div>
                    <button type="button" className={styles.closeButton} onClick={onClose} aria-label="Close dialog">
                        <X size={18} aria-hidden="true" />
                    </button>
                </header>

                <div className={styles.body}>{children}</div>

                {footer ? <footer className={styles.footer}>{footer}</footer> : null}
            </div>
        </div>,
        document.body,
    );
}
