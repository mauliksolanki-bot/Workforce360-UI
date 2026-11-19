import { httpClient } from './httpClient';

export interface LeaveCategory { leaveType: string; defaultLeave: number; }
export interface LeaveBalance { leaveType: string; totalLeave: number; availableLeave: number; }
export interface LeaveHistory { id:number; leaveType:string; fromDate:string; toDate:string; reason:string; status:string; approvedBy:string|null; appliedOn:string; documentAttached:boolean; }
export interface Holiday { holidayName:string; onDate:string; }

export const fetchLeaveCategories = async () => (await httpClient.get<LeaveCategory[]>('/leave-management/leave-categories')).data;
export const fetchHolidays = async () => (await httpClient.get<Holiday[]>('/leave-management/holiday-calendar')).data;
export const fetchLeaveBalance = async () => (await httpClient.get<LeaveBalance[]>('/leave-management/employee-leave-balances')).data;
export const fetchLeaveHistory = async () => (await httpClient.get<LeaveHistory[]>('/leave-management/employee-leave-history')).data;
export const cancelLeave = async (id:number) => { await httpClient.put(`/leave-management/leave-applications/${id}/cancellation`); };
export const fetchLeaveApprovals = async () => (await httpClient.get<LeaveHistory[]>('/leave-management/manager-leave-approvals')).data;
export const decideLeave = async (id:number,status:'APPROVED'|'REJECTED') => { await httpClient.put(`/leave-management/leave-applications/${id}/approval-decision`,null,{params:{status}}); };
export const fetchLeaveDocument = async (id:number) => (await httpClient.get<Blob>(`/leave-management/leave-applications/${id}/supporting-document`,{responseType:'blob'})).data;
export async function applyLeave(values: { leaveType: string; fromDate: string; toDate: string; reason: string; document?: File | null }): Promise<void> { const data=new FormData(); data.append('leaveType',values.leaveType); data.append('fromDate',values.fromDate); data.append('toDate',values.toDate); data.append('reason',values.reason); if(values.document) data.append('document',values.document); await httpClient.post('/leave-management/leave-applications',data,{headers:{'Content-Type':'multipart/form-data'}}); }
