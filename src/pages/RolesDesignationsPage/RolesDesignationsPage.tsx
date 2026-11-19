import { useEffect, useState } from 'react';
import { ChevronDown, ChevronRight, Pencil, ShieldCheck, Trash2 } from 'lucide-react';
import { fetchDeleteConfirmationPopupConfig, fetchEditRoleDesignationPopupConfig } from '../../api/configApi';
import { deleteRoleDesignation, fetchRoleDesignationGrid, updateRoleDesignation, type RoleGrid, type RoleRow } from '../../api/roleDesignationApi';
import { Alert } from '../../components/ui/Alert/Alert';
import { Button } from '../../components/ui/Button/Button';
import { Modal } from '../../components/ui/Modal/Modal';
import { TextField } from '../../components/ui/TextField/TextField';
import { useToast } from '../../hooks/useToast';
import styles from './RolesDesignationsPage.module.css';

const columnValue = (row: RoleRow, columnName: string): string | null => {
    const fields: Record<string, keyof RoleRow> = { ROLE_NAME: 'roleName', ROLE_DESC: 'roleDesc', ROLE_LEVEL: 'roleLevel', IS_ACTIVE: 'isActive' };
    return row[fields[columnName]] as string | null;
};

/** Administrator landing page for role and designation administration. */
export function RolesDesignationsPage() {
    const [grid, setGrid] = useState<RoleGrid | null>(null);
    const [editing, setEditing] = useState<RoleRow | null>(null);
    const [error, setError] = useState<string | null>(null);
    const [saving, setSaving] = useState(false);
    const [page, setPage] = useState(1);
    const [selectedPageSize, setSelectedPageSize] = useState<number | null>(null);
    const [popupTitle, setPopupTitle] = useState('Edit Role & Designation');
    const [deleting, setDeleting] = useState<RoleRow | null>(null);
    const [deleteConfig, setDeleteConfig] = useState({ title: 'Delete Role & Designation', description: 'Are you sure you want to delete?', yes: 'Yes', no: 'No' });
    const [expandedGroups, setExpandedGroups] = useState<Set<string>>(new Set());
    const { showSuccess, showError } = useToast();

    const load = async (targetPage = page, targetPageSize = selectedPageSize ?? 100): Promise<boolean> => {
        try { setError(null); setGrid(await fetchRoleDesignationGrid(targetPage, targetPageSize)); return true; }
        catch { setError('Unable to load Roles & Designations.'); return false; }
    };
    useEffect(() => { void load(1, 100); }, []);
    const openEdit = async (role: RoleRow) => {
        try { const config = await fetchEditRoleDesignationPopupConfig(); setPopupTitle(config.staticJson.title || 'Edit Role & Designation'); }
        catch { setPopupTitle('Edit Role & Designation'); }
        setEditing({ ...role });
    };
    const openDelete = async (role: RoleRow) => {
        try { const config = await fetchDeleteConfirmationPopupConfig(); setDeleteConfig({ title: config.staticJson.title || 'Delete Role & Designation', description: config.staticJson.description || 'Are you sure you want to delete?', yes: config.staticJson.yesButtonLabel || 'Yes', no: config.staticJson.noButtonLabel || 'No' }); }
        catch { setDeleteConfig({ title: 'Delete Role & Designation', description: 'Are you sure you want to delete?', yes: 'Yes', no: 'No' }); }
        setDeleting(role);
    };
    const save = async () => {
        if (!editing || !editing.roleName.trim()) return;
        try { setSaving(true); await updateRoleDesignation(editing.id, { ...editing, roleDesc: editing.roleDesc ?? '' }); setEditing(null); await load(); showSuccess('Role updated successfully.', 'Saved'); }
        catch { showError('Unable to update the role.', 'Save failed'); } finally { setSaving(false); }
    };
    const remove = async () => {
        if (!deleting) return;
        try { await deleteRoleDesignation(deleting.id); setDeleting(null); await load(); showSuccess('Role deleted successfully.', 'Deleted'); }
        catch { showError('This role could not be deleted because it may be assigned to a user.', 'Delete failed'); }
    };

    const paginationEnabled = grid?.metadata.pagination === 'Y';
    const pageSizeConfig = (() => {
        try {
            const config = JSON.parse(grid?.metadata.pageSize ?? '{"default":100,"options":[10,25,50,100]}') as { default?: number; options?: number[] };
            return { defaultSize: Number(config.default) || 100, options: config.options?.map(Number).filter(Boolean) ?? [100] };
        } catch { return { defaultSize: 100, options: [100] }; }
    })();
    const pageSize = selectedPageSize ?? pageSizeConfig.defaultSize;
    const totalPages = Math.max(1, Math.ceil((grid?.totalRecords ?? 0) / pageSize));
    const visibleRows = grid?.rows ?? [];
    const goToPage = (targetPage: number) => { setPage(targetPage); void load(targetPage, pageSize); };
    const refresh = async () => {
        const refreshed = await load(1, pageSize);
        if (refreshed) {
            setPage(1);
            showSuccess('Roles and designations have been refreshed.', 'Refreshed');
        } else {
            showError('Unable to refresh roles and designations.', 'Refresh failed');
        }
    };
    const toggleGroup = (groupName: string) => {
        setExpandedGroups((current) => {
            const next = new Set(current);
            next.has(groupName) ? next.delete(groupName) : next.add(groupName);
            return next;
        });
    };
    const groupedRoles = Array.from(visibleRows.reduce((groups, role) => {
        const group = role.roleGroup || 'Other';
        const rolesByLevel = groups.get(group) ?? new Map<string, RoleRow[]>();
        rolesByLevel.set(role.roleLevel, [...(rolesByLevel.get(role.roleLevel) ?? []), role]);
        groups.set(group, rolesByLevel);
        return groups;
    }, new Map<string, Map<string, RoleRow[]>>()).entries()).map(([groupName, levels]) => ({
        groupName,
        levels: Array.from(levels.entries()).sort(([first], [second]) => Number(first.slice(1)) - Number(second.slice(1))),
    }));

    return (
        <div className={styles.page}>
            <main className={styles.content}>
                <section className={styles.profileCard}>
                    <span className={styles.avatar} aria-hidden="true">
                        <ShieldCheck size={26} />
                    </span>
                    <div className={styles.profileInfo}>
                        <div className={styles.nameRow}>
                            <h1>Roles &amp; Designations</h1>
                        </div>
                        <p className={styles.roleLine}>Organisation role and designation administration</p>
                    </div>
                </section>

                <section className={styles.formCard}>
                    <div className={styles.sectionHeader}><h2 className={styles.sectionTitle}>Role &amp; Designation</h2><Button onClick={() => void refresh()}>Refresh</Button></div>
                    {error ? <Alert variant="error">{error}</Alert> : null}
                    {grid ? <><div className={styles.tableWrap}><table><thead><tr>{grid.columns.map((column) => <th key={column.columnName}>{column.uiDisplayName}</th>)}<th>Actions</th></tr></thead><tbody>{grid.totalRecords ? groupedRoles.flatMap(({ groupName, levels }) => { const isExpanded = expandedGroups.has(groupName); return [<tr key={`group-${groupName}`} className={styles.groupRow}><td colSpan={grid.columns.length + 1}><button type="button" onClick={() => toggleGroup(groupName)} aria-expanded={isExpanded}><span>Group Name - {groupName}</span><span className={styles.groupChevron}>{isExpanded ? <ChevronDown size={15} /> : <ChevronRight size={15} />}</span></button></td></tr>, ...(isExpanded ? levels.flatMap(([, roles]) => roles.map((role) => <tr key={role.id}><td>{columnValue(role, 'ROLE_NAME') || '—'}</td><td>{columnValue(role, 'ROLE_DESC') || '—'}</td><td>{role.roleLevel}</td><td><span className={styles.status} data-active={role.isActive === 'Y'}>{role.isActive === 'Y' ? 'Active' : 'Inactive'}</span></td><td className={styles.actions}><button onClick={() => void openEdit(role)} aria-label={`Edit ${role.roleName}`}><Pencil size={16} /></button><button onClick={() => void openDelete(role)} aria-label={`Delete ${role.roleName}`}><Trash2 size={16} /></button></td></tr>)) : [])]; }) : <tr><td colSpan={grid.columns.length + 1} className={styles.empty}>{grid.metadata.noDataFoundMessage || 'No roles found.'}</td></tr>}</tbody></table></div>{paginationEnabled && grid.totalRecords ? <div className={styles.pagination}><label>Rows per page <select value={pageSize} onChange={(event) => { const size = Number(event.target.value); setSelectedPageSize(size); setPage(1); void load(1, size); }}>{pageSizeConfig.options.map((size) => <option key={size} value={size}>{size}</option>)}</select></label><span>Page {page} of {totalPages}</span><div><Button variant="ghost" disabled={page === 1} onClick={() => goToPage(page - 1)}>Previous</Button><Button variant="ghost" disabled={page === totalPages} onClick={() => goToPage(page + 1)}>Next</Button></div></div> : null}</> : <p className={styles.loading}>Loading roles…</p>}
                </section>
            </main>
            <Modal isOpen={Boolean(editing)} onClose={() => setEditing(null)} title={popupTitle} description="Update designation details." footer={<><Button variant="ghost" onClick={() => setEditing(null)}>Cancel</Button><Button onClick={() => void save()} isLoading={saving}>Save Changes</Button></>}>
                {editing ? <div className={styles.editGrid}><TextField label="Designation" value={editing.roleName} onChange={(event) => setEditing({ ...editing, roleName: event.target.value })} /><TextField label="Description" value={editing.roleDesc ?? ''} onChange={(event) => setEditing({ ...editing, roleDesc: event.target.value })} /><label>Designation Level<select value={editing.roleLevel} onChange={(event) => setEditing({ ...editing, roleLevel: event.target.value })}>{Array.from({ length: 11 }, (_, index) => <option key={index} value={`L${index + 1}`}>L{index + 1}</option>)}</select></label><label>Status<select value={editing.isActive} onChange={(event) => setEditing({ ...editing, isActive: event.target.value })}><option value="Y">Active</option><option value="N">Inactive</option></select></label></div> : null}
            </Modal>
            <Modal isOpen={Boolean(deleting)} onClose={() => setDeleting(null)} title={deleteConfig.title} description={deleteConfig.description} footer={<><Button variant="ghost" onClick={() => setDeleting(null)}>{deleteConfig.no}</Button><Button onClick={() => void remove()}>{deleteConfig.yes}</Button></>}><p className={styles.confirmText}>{deleting?.roleName}</p></Modal>
        </div>
    );
}
