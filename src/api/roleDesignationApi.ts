import { httpClient } from './httpClient';

export interface RoleRow { id: number; roleName: string; roleDesc: string | null; roleLevel: string; roleGroup: string; isActive: string; }
export interface GridColumn { columnName: string; columnOrder: number; uiDisplayName: string; width: string; sortable: string; isHyperlink: string; type: string; showFilter: string; }
export interface RoleGrid { metadata: Record<string, string>; columns: GridColumn[]; rows: RoleRow[]; totalRecords: number; page: number; pageSize: number; }
export interface RoleUpdate { roleName: string; roleDesc: string; roleLevel: string; isActive: string; }

export async function fetchRoleDesignationGrid(roleGroup: string, page = 1, pageSize = 10, signal?: AbortSignal): Promise<RoleGrid> { return (await httpClient.get<RoleGrid>('/role-designations/grid', { params: { roleGroup, page, pageSize }, signal })).data; }
export async function fetchRoleDesignationGroups(): Promise<string[]> { return (await httpClient.get<string[]>('/role-designations/groups')).data; }
export async function updateRoleDesignation(id: number, update: RoleUpdate): Promise<void> { await httpClient.put(`/role-designations/${id}`, update); }
export async function deleteRoleDesignation(id: number): Promise<void> { await httpClient.delete(`/role-designations/${id}`); }
