import { httpClient } from './httpClient';
export interface UserAudit { id:string; empId:string|null; employeeName:string|null; activityCategory:string; activityAction:string; activityDetails:string; activityStatus:string; activityAt:string; }
export interface UserAuditPage { rows: UserAudit[]; totalRecords: number; page: number; pageSize: number; }
export const fetchUserAudits=async(page=1,pageSize=10,search='')=>(await httpClient.get<UserAuditPage>('/audit/user-access-activities',{params:{page,pageSize,search:search||undefined}})).data;
