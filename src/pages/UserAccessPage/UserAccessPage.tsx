import { ChevronLeft, ChevronRight, KeyRound, Search } from 'lucide-react';
import { useEffect, useState } from 'react';
import { fetchUserAudits, type UserAudit } from '../../api/auditApi';
import styles from './UserAccessPage.module.css';

export function UserAccessPage() {
  const [items, setItems] = useState<UserAudit[]>([]);
  const [query, setQuery] = useState('');
  const [page, setPage] = useState(1);
  const [pageSize, setPageSize] = useState(10);
  const [totalRecords, setTotalRecords] = useState(0);

  useEffect(() => {
    const timer = window.setTimeout(() => {
      void fetchUserAudits(page, pageSize, query).then((result) => {
        setItems(result.rows);
        setTotalRecords(result.totalRecords);
        if (result.page !== page) setPage(result.page);
      });
    }, query ? 250 : 0);
    return () => window.clearTimeout(timer);
  }, [page, pageSize, query]);

  const totalPages = Math.max(1, Math.ceil(totalRecords / pageSize));
  const start = totalRecords ? (page - 1) * pageSize + 1 : 0;
  const end = Math.min(page * pageSize, totalRecords);

  return <main className={styles.page}>
    <section className={styles.hero}><span><KeyRound size={26} /></span><div><h1>User Access Audit</h1><p>Monitor user activity, authentication, profile, access, and administration events.</p></div></section>
    <section className={styles.card}>
      <div className={styles.toolbar}><div><h2>Activity log</h2><p>{totalRecords} recorded activities</p></div><label><Search size={16} /><input value={query} onChange={(event) => { setQuery(event.target.value); setPage(1); }} placeholder="Search activity" /></label></div>
      <div className={styles.tableWrap}><table><thead><tr><th>Employee</th><th>Category</th><th>Activity</th><th>Details</th><th>Status</th><th>Date & time</th></tr></thead><tbody>{items.length ? items.map((item) => <tr key={item.id}><td><strong>{item.employeeName || 'Unknown user'}</strong><small>{item.empId || '—'}</small></td><td><span className={styles.category}>{item.activityCategory}</span></td><td>{item.activityAction}</td><td>{item.activityDetails}</td><td><span className={styles.status} data-status={item.activityStatus}>{item.activityStatus}</span></td><td>{new Date(item.activityAt).toLocaleString('en-IN', { dateStyle: 'medium', timeStyle: 'short' })}</td></tr>) : <tr><td colSpan={6} className={styles.empty}>No audit activity recorded yet.</td></tr>}</tbody></table></div>
      <footer className={styles.pagination}>
        <span>{totalRecords ? `Showing ${start}–${end} of ${totalRecords}` : 'No records to show'}</span>
        <label>Rows per page<select value={pageSize} onChange={(event) => { setPageSize(Number(event.target.value)); setPage(1); }}><option value={10}>10</option><option value={25}>25</option><option value={50}>50</option></select></label>
        <div><button onClick={() => setPage((value) => Math.max(1, value - 1))} disabled={page === 1} aria-label="Previous page"><ChevronLeft size={16} /></button><span>Page {page} of {totalPages}</span><button onClick={() => setPage((value) => Math.min(totalPages, value + 1))} disabled={page === totalPages || totalRecords === 0} aria-label="Next page"><ChevronRight size={16} /></button></div>
      </footer>
    </section>
  </main>;
}
