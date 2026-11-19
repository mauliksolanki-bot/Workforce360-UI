import axios from 'axios';
import { httpClient } from './httpClient';
import type { NxtGenFormField } from '../types/form';

const GENERIC_ERROR_MESSAGE = 'Something went wrong. Please try again.';
const NETWORK_ERROR_MESSAGE = 'Unable to reach the server. Check your connection and try again.';

export class FormApiError extends Error {
    readonly status?: number;
    readonly isCanceled: boolean;

    constructor(message: string, status?: number, isCanceled = false) {
        super(message);
        this.name = 'FormApiError';
        this.status = status;
        this.isCanceled = isCanceled;
    }
}

/** Calls `GET /form/getformdetails?formCode=...`, matching `NxtGenFormController`. */
export async function fetchFormFields(formCode: string, signal?: AbortSignal): Promise<NxtGenFormField[]> {
    try {
        const { data } = await httpClient.get<NxtGenFormField[]>('/forms/details', {
            params: { formCode },
            signal,
        });
        return data;
    } catch (error) {
        throw toFormApiError(error);
    }
}

function toFormApiError(error: unknown): FormApiError {
    if (axios.isCancel(error) || (axios.isAxiosError(error) && error.code === 'ERR_CANCELED')) {
        return new FormApiError('Request canceled', undefined, true);
    }
    if (axios.isAxiosError(error)) {
        if (error.response) {
            const body = error.response.data as { message?: string } | undefined;
            return new FormApiError(body?.message ?? GENERIC_ERROR_MESSAGE, error.response.status);
        }
        if (error.request) {
            return new FormApiError(NETWORK_ERROR_MESSAGE);
        }
    }
    return new FormApiError(GENERIC_ERROR_MESSAGE);
}
