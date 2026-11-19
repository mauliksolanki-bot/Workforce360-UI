import axios from 'axios';
import { httpClient } from './httpClient';
import type { NxtGenBankDetail, NxtGenBankDetailUpdate, NxtGenBankMaster } from '../types/auth';

const GENERIC_ERROR_MESSAGE = 'Something went wrong. Please try again.';
const NETWORK_ERROR_MESSAGE = 'Unable to reach the server. Check your connection and try again.';

export class BankApiError extends Error {
    readonly status?: number;
    readonly isCanceled: boolean;

    constructor(message: string, status?: number, isCanceled = false) {
        super(message);
        this.name = 'BankApiError';
        this.status = status;
        this.isCanceled = isCanceled;
    }
}

/** Calls `GET /bankdetails` for the signed-in user's single bank record. */
export async function fetchBankDetails(signal?: AbortSignal): Promise<NxtGenBankDetail | null> {
    try {
        const response = await httpClient.get<NxtGenBankDetail>('/bankdetails', { signal });
        return response.status === 204 ? null : response.data;
    } catch (error) {
        throw toBankApiError(error);
    }
}

/** Calls `GET /banks` for active bank options and their account-number validation rules. */
export async function fetchBanks(signal?: AbortSignal): Promise<NxtGenBankMaster[]> {
    try {
        const { data } = await httpClient.get<NxtGenBankMaster[]>('/banks', { signal });
        return data;
    } catch (error) {
        throw toBankApiError(error);
    }
}

/** Calls `PUT /savebankdetails` to create or update the signed-in user's bank record. */
export async function saveBankDetails(detail: NxtGenBankDetailUpdate): Promise<NxtGenBankDetail> {
    try {
        const { data } = await httpClient.put<NxtGenBankDetail>('/savebankdetails', detail);
        return data;
    } catch (error) {
        throw toBankApiError(error);
    }
}

function toBankApiError(error: unknown): BankApiError {
    if (axios.isCancel(error) || (axios.isAxiosError(error) && error.code === 'ERR_CANCELED')) {
        return new BankApiError('Request canceled', undefined, true);
    }
    if (axios.isAxiosError(error)) {
        if (error.response) {
            const body = error.response.data as { message?: string } | undefined;
            return new BankApiError(body?.message ?? GENERIC_ERROR_MESSAGE, error.response.status);
        }
        if (error.request) {
            return new BankApiError(NETWORK_ERROR_MESSAGE);
        }
    }
    return new BankApiError(GENERIC_ERROR_MESSAGE);
}
