import { CalendarDays } from 'lucide-react';
import styles from '../ApplyLeavePage/ApplyLeavePage.module.css';

export function LeaveBalancePage() {
    return <main className={styles.page}><section className={styles.card}><span className={styles.icon}><CalendarDays size={26} /></span><div><h1>Leave Balance</h1><p>View your available leave balance and leave entitlement.</p></div></section></main>;
}
