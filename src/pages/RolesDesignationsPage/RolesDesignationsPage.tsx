import { useEffect, useState } from 'react';
import { Pencil, ShieldCheck, Trash2 } from 'lucide-react';
import { fetchDeleteConfirmationPopupConfig, fetchEditRoleDesignationPopupConfig } from '../../api/configApi';
import { deleteRoleDesignation, fetchRoleDesignationGrid, fetchRoleDesignationGroups, updateRoleDesignation, type RoleGrid, type RoleRow } from '../../api/roleDesignationApi';
import { Alert } from '../../components/ui/Alert/Alert';
import { Button } from '../../components/ui/Button/Button';
import { Modal } from '../../components/ui/Modal/Modal';
import { TextField } from '../../components/ui/TextField/TextField';
import { useToast } from '../../hooks/useToast';
import styles from './RolesDesignationsPage.module.css';

/** Administrator landing page for role and designation administration. */
export function RolesDesignationsPage() {
    const [grid, setGrid] = useState<RoleGrid | null>(null);
    const [editing, setEditing] = useState<RoleRow | null>(null);
    const [error, setError] = useState<string | null>(null);
    const [saving, setSaving] = useState(false);
    const [popupTitle, setPopupTitle] = useState('Edit Role & Designation');
    const [deleting, setDeleting] = useState<RoleRow | null>(null);
    const [deleteConfig, setDeleteConfig] = useState({ title: 'Delete Role & Designation', description: 'Are you sure you want to delete?', yes: 'Yes', no: 'No' });
    const [groups, setGroups] = useState<string[]>([]);
    const [selectedGroup, setSelectedGroup] = useState('');
    const { showSuccess, showError } = useToast();

    const load = async (roleGroup = selectedGroup, targetPage = 1, targetPageSize = 100): Promise<boolean> => {
        if (!roleGroup) return false;
        try { setError(null); setGrid(await fetchRoleDesignationGrid(roleGroup, targetPage, targetPageSize)); return true; }
        catch { setError('Unable to load Roles & Designations.'); return false; }
    };
    useEffect(() => { fetchRoleDesignationGroups().then((loadedGroups) => { setGroups(loadedGroups); if (loadedGroups[0]) setSelectedGroup(loadedGroups[0]); }).catch(() => setError('Unable to load role groups.')); }, []);
    useEffect(() => { if (selectedGroup) void load(selectedGroup); }, [selectedGroup]);
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

    const visibleRows = grid?.rows ?? [];
    const isPlatformAdministration = selectedGroup === 'Platform Administration';
    const configuredLevels = isPlatformAdministration ? [] : Array.from(visibleRows.reduce((levels, role) => {
        const levelRoles = levels.get(role.roleLevel) ?? [];
        levelRoles.push(role);
        levels.set(role.roleLevel, levelRoles);
        return levels;
    }, new Map<string, RoleRow[]>()).entries()).sort(([first], [second]) => Number(first.slice(1)) - Number(second.slice(1)));
    const isExecutiveLeadership = selectedGroup === 'Executive & Leadership' || selectedGroup === 'Executive Leadership';
    const topLevel = isExecutiveLeadership ? 'L1' : 'L2';
    const hierarchyRoles = new Map(configuredLevels.filter(([level]) => isExecutiveLeadership || level !== 'L1'));
    const highestLevel = Math.max(...Array.from(hierarchyRoles.keys(), (level) => Number(level.slice(1))), Number(topLevel.slice(1)));
    const levelHierarchy = Array.from({ length: highestLevel - Number(topLevel.slice(1)) + 1 }, (_, index) => {
        const level = `L${Number(topLevel.slice(1)) + index}`;
        return [level, hierarchyRoles.get(level) ?? []] as [string, RoleRow[]];
    });
    const hierarchyLevels = isPlatformAdministration ? [['Platform', visibleRows] as [string, RoleRow[]]] : levelHierarchy;
    const showGridTitle = grid?.metadata.showTitle === 'Y';
    const gridTitle = (() => { try { return (JSON.parse(grid?.metadata.titleConfig ?? '{}') as { title?: string }).title ?? 'Role & Designation'; } catch { return 'Role & Designation'; } })();
    const showRefresh = (() => { try { return (JSON.parse(grid?.metadata.topBar ?? '{"actions":[]}') as { actions?: string[] }).actions?.includes('refresh') ?? false; } catch { return false; } })();
    const refresh = async () => {
        const refreshed = await load(selectedGroup);
        if (refreshed) {
            showSuccess('Roles and designations have been refreshed.', 'Refreshed');
        } else {
            showError('Unable to refresh roles and designations.', 'Refresh failed');
        }
    };

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
                    {showGridTitle || showRefresh ? <div className={styles.sectionHeader}>{showGridTitle ? <h2 className={styles.sectionTitle}>{gridTitle}</h2> : <span />}{showRefresh ? <Button onClick={() => void refresh()}>Refresh</Button> : null}</div> : null}
                    <div className={styles.tabs} role="tablist" aria-label="Role groups">{groups.map((group) => <button key={group} type="button" role="tab" aria-selected={selectedGroup === group} className={selectedGroup === group ? styles.activeTab : undefined} onClick={() => { setGrid(null); setSelectedGroup(group); }}>{group}</button>)}</div>
                    {error ? <Alert variant="error">{error}</Alert> : null}
                    {grid ? grid.totalRecords ? <div className={styles.hierarchy} aria-label={`${selectedGroup} designation hierarchy`}>{hierarchyLevels.map(([level, roles], index) => <div key={level} className={styles.hierarchyLevel}><div className={styles.levelHeading}><span>{level === 'Platform' ? 'Admin' : level}</span><small>{level === 'Platform' ? 'Access role' : 'Designation level'}</small></div><div className={styles.nodeRow}>{roles.length ? roles.map((role) => <article key={role.id} className={styles.roleNode}><div className={styles.nodeTop}><div><h3>{role.roleName}</h3>{role.roleDesc ? <p>{role.roleDesc}</p> : null}</div><span className={styles.status} data-active={role.isActive === 'Y'}>{role.isActive === 'Y' ? 'Active' : 'Inactive'}</span></div><div className={styles.nodeActions}><button className={styles.editAction} onClick={() => void openEdit(role)} aria-label={`Edit ${role.roleName}`} title="Edit designation"><Pencil size={15} /><span>Edit</span></button><button className={styles.deleteAction} onClick={() => void openDelete(role)} aria-label={`Delete ${role.roleName}`} title="Delete designation"><Trash2 size={15} /><span>Delete</span></button></div></article>) : <div className={styles.unassignedNode}>No {level} designation configured for this group.</div>}</div>{index < hierarchyLevels.length - 1 ? <div className={styles.connector} aria-hidden="true"><span /></div> : null}</div>)}</div> : <p className={styles.empty}>{grid.metadata.noDataFoundMessage || 'No roles found.'}</p> : <p className={styles.loading}>Loading roles…</p>}
                </section>
            </main>
            <Modal isOpen={Boolean(editing)} onClose={() => setEditing(null)} title={popupTitle} description="Update designation details." footer={<><Button variant="ghost" onClick={() => setEditing(null)}>Cancel</Button><Button onClick={() => void save()} isLoading={saving}>Save Changes</Button></>}>
                {editing ? <div className={styles.editGrid}><TextField label="Designation" value={editing.roleName} onChange={(event) => setEditing({ ...editing, roleName: event.target.value })} /><TextField label="Description" value={editing.roleDesc ?? ''} onChange={(event) => setEditing({ ...editing, roleDesc: event.target.value })} /><label>Designation Level<select value={editing.roleLevel} onChange={(event) => setEditing({ ...editing, roleLevel: event.target.value })}>{Array.from({ length: 11 }, (_, index) => <option key={index} value={`L${index + 1}`}>L{index + 1}</option>)}</select></label><label>Status<select value={editing.isActive} onChange={(event) => setEditing({ ...editing, isActive: event.target.value })}><option value="Y">Active</option><option value="N">Inactive</option></select></label></div> : null}
            </Modal>
            <Modal isOpen={Boolean(deleting)} onClose={() => setDeleting(null)} title={deleteConfig.title} description={deleteConfig.description} footer={<><Button variant="ghost" onClick={() => setDeleting(null)}>{deleteConfig.no}</Button><Button onClick={() => void remove()}>{deleteConfig.yes}</Button></>}><p className={styles.confirmText}>{deleting?.roleName}</p></Modal>
        </div>
    );
}
