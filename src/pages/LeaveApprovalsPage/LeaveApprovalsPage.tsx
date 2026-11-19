import { Check, Download, Eye, FileText, X } from 'lucide-react';
import { useEffect, useState } from 'react';
import { decideLeave, fetchLeaveApprovals, fetchLeaveDocument, type LeaveHistory } from '../../api/leaveApi';
import { Modal } from '../../components/ui/Modal/Modal';
import { useToast } from '../../hooks/useToast';
import styles from '../LeaveHistoryPage/LeaveHistoryPage.module.css';

const date = (value: string) => new Date(`${value}T00:00:00`).toLocaleDateString('en-IN', { day: '2-digit', month: 'short', year: 'numeric' });
type Preview = { url: string; mimeType: string; leaveType: string };

export function LeaveApprovalsPage() {
  const [items, setItems] = useState<LeaveHistory[]>([]);
  const [preview, setPreview] = useState<Preview | null>(null);
  const { showSuccess, showError } = useToast();
  const load = () => void fetchLeaveApprovals().then(setItems);

  useEffect(load, []);
  useEffect(() => () => { if (preview) URL.revokeObjectURL(preview.url); }, [preview]);

  const closePreview = () => setPreview((current) => {
    if (current) URL.revokeObjectURL(current.url);
    return null;
  });
  const decide = async (id: number, status: 'APPROVED' | 'REJECTED') => {
    await decideLeave(id, status);
    showSuccess(`Leave ${status.toLowerCase()}.`, 'Updated');
    load();
  };
  const viewDocument = async (item: LeaveHistory) => {
    try {
      const document = await fetchLeaveDocument(item.id);
      setPreview({ url: URL.createObjectURL(document), mimeType: document.type, leaveType: item.leaveType });
    } catch {
      showError('The supporting document could not be opened.', 'Preview unavailable');
    }
  };

  const isImage = preview?.mimeType.startsWith('image/');
  const isPdf = preview?.mimeType === 'application/pdf';
  return <main className={styles.page}>
    <section className={styles.hero}><span>✓</span><div><h1>Leave Approvals</h1><p>Review leave requests submitted by your reportees.</p></div></section>
    <section className={styles.card}>
      <div className={styles.tableWrap}><table><thead><tr><th>Leave type</th><th>From</th><th>To</th><th>Reason</th><th>Status</th><th>Applied on</th><th>Actions</th></tr></thead><tbody>
        {items.length ? items.map((item) => <tr key={item.id}><td><strong>{item.leaveType}</strong></td><td>{date(item.fromDate)}</td><td>{date(item.toDate)}</td><td>{item.reason}</td><td><span className={styles.status} data-status={item.status}>{item.status.replace('_', ' ')}</span></td><td>{date(item.appliedOn)}</td><td><div className={styles.actions}>{item.documentAttached ? <button className={styles.viewDocument} title="View supporting document" onClick={() => void viewDocument(item)}><Eye size={16} /></button> : null}<button disabled={item.status !== 'PENDING'} title="Approve" onClick={() => void decide(item.id, 'APPROVED')}><Check size={16} /></button><button disabled={item.status !== 'PENDING'} title="Reject" onClick={() => void decide(item.id, 'REJECTED')}><X size={16} /></button></div></td></tr>) : <tr><td className={styles.empty} colSpan={7}>No leave requests from reportees.</td></tr>}
      </tbody></table></div>
    </section>
    <Modal isOpen={Boolean(preview)} onClose={closePreview} title="Supporting document" description={preview ? `${preview.leaveType} leave request` : undefined} size="xl">
      <div className={styles.preview}>{isImage ? <img src={preview?.url} alt="Supporting document" /> : isPdf ? <iframe title="Supporting document preview" src={preview?.url} /> : <div className={styles.noPreview}><FileText size={36} /><strong>Preview is not available for this document type.</strong><span>Download the Word document to view it.</span><a href={preview?.url} download><Download size={16} /> Download document</a></div>}</div>
    </Modal>
  </main>;
}
