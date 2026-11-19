import { ScrollText } from 'lucide-react';
import styles from '../ApplyLeavePage/ApplyLeavePage.module.css';

export function AuditPage() {
    return <main className={styles.page}><section className={styles.card}><span className={styles.icon}><ScrollText size={26} /></span><div><h1>Audit</h1><p>Review application activity and audit records.</p></div></section></main>;
}
