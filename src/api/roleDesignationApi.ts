import { httpClient } from './httpClient';

export interface RoleRow { id: number; roleName: string; roleDesc: string | null; roleLevel: string; roleGroup: string; isActive: string; }
export interface GridColumn { columnName: string; columnOrder: number; uiDisplayName: string; width: string; sortable: string; isHyperlink: string; type: string; showFilter: string; }
export interface RoleGrid { metadata: Record<string, string>; columns: GridColumn[]; rows: RoleRow[]; totalRecords: number; page: number; pageSize: number; }
export interface RoleUpdate { roleName: string; roleDesc: string; roleLevel: string; isActive: string; }

export async function fetchRoleDesignationGrid(page = 1, pageSize = 10, signal?: AbortSignal): Promise<RoleGrid> { return (await httpClient.get<RoleGrid>('/rolenddesignationgrid', { params: { page, pageSize }, signal })).data; }
export async function updateRoleDesignation(id: number, update: RoleUpdate): Promise<void> { await httpClient.put(`/rolenddesignation/${id}`, update); }
export async function deleteRoleDesignation(id: number): Promise<void> { await httpClient.delete(`/rolenddesignation/${id}`); }
