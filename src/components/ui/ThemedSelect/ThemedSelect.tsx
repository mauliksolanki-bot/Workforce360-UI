import { ChevronDown } from 'lucide-react';
import { useEffect, useRef, useState } from 'react';
import styles from './ThemedSelect.module.css';

interface ThemedSelectProps { value: string; options: string[]; onChange: (value: string) => void; ariaLabel: string; placeholder?: string; disabled?: boolean; className?: string; }

/** Branded select control whose opened menu is fully themeable (unlike native select popups). */
export function ThemedSelect({ value, options, onChange, ariaLabel, placeholder = 'Select an option', disabled = false, className }: ThemedSelectProps) {
    const [open, setOpen] = useState(false);
    const root = useRef<HTMLDivElement>(null);
    useEffect(() => { const close = (event: MouseEvent) => { if (!root.current?.contains(event.target as Node)) setOpen(false); }; document.addEventListener('mousedown', close); return () => document.removeEventListener('mousedown', close); }, []);
    return <div className={styles.root} ref={root}><button type="button" disabled={disabled} className={[styles.trigger, className].filter(Boolean).join(' ')} onClick={() => setOpen((current) => !current)} aria-label={ariaLabel} aria-haspopup="listbox" aria-expanded={open}><span>{value || placeholder}</span><ChevronDown size={18} className={open ? styles.openIcon : undefined} /></button>{open ? <div className={styles.menu} role="listbox" aria-label={ariaLabel}>{options.filter(Boolean).map((option) => <button type="button" key={option} role="option" aria-selected={option === value} className={option === value ? styles.selected : undefined} onClick={() => { onChange(option); setOpen(false); }}>{option}</button>)}</div> : null}</div>;
}
