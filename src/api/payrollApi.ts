import { httpClient } from './httpClient';
export interface BankGridColumn { columnName: string; uiDisplayName: string; }
export interface BankGridRow { id: number; empId: string; bankName: string; ifscCode: string; branchName: string; accountType: string; }
export interface BankGrid { metadata: Record<string, string>; columns: BankGridColumn[]; rows: BankGridRow[]; }
export async function fetchPayrollBankGrid(): Promise<BankGrid> { return (await httpClient.get<BankGrid>('/payroll/bank-details')).data; }
