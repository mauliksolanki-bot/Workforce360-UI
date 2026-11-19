import { useEffect, useState } from 'react';
import { ReceiptText } from 'lucide-react';
import { fetchPayrollBankGrid, type BankGridRow } from '../../api/payrollApi';
import styles from './PayrollPage.module.css';

export function PayrollPage() {
    const [rows, setRows] = useState<BankGridRow[]>([]);
    const [loading, setLoading] = useState(true);
    useEffect(() => { fetchPayrollBankGrid().then((grid) => setRows(grid.rows)).finally(() => setLoading(false)); }, []);
    return (
        <div className={styles.page}>
            <main className={styles.content}>
                <section className={styles.headerCard}>
                    <span className={styles.icon} aria-hidden="true"><ReceiptText size={26} /></span>
                    <div><h1>Payroll</h1><p>Manage employee payroll records and processing.</p></div>
                </section>
                <section className={styles.card}>
                    <div className={styles.tabs}><button className={styles.activeTab}>Bank Details</button></div>
                    {loading ? <p className={styles.loading}>Loading bank details…</p> : <div className={styles.tableWrap}><table><thead><tr><th>Employee ID</th><th>Bank Name</th><th>IFSC Code</th><th>Branch Name</th><th>Account Type</th></tr></thead><tbody>{rows.length ? rows.map((row) => <tr key={row.id}><td>{row.empId}</td><td>{row.bankName}</td><td>{row.ifscCode}</td><td>{row.branchName}</td><td>{row.accountType}</td></tr>) : <tr><td colSpan={5}>No bank details found.</td></tr>}</tbody></table></div>}
                </section>
            </main>
        </div>
    );
}
