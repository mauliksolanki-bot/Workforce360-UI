import axios from 'axios';
import { httpClient } from './httpClient';
import type { NxtGenEducationDetail, NxtGenUser } from '../types/auth';

const GENERIC_ERROR_MESSAGE = 'Something went wrong. Please try again.';
const NETWORK_ERROR_MESSAGE = 'Unable to reach the server. Check your connection and try again.';

export class EducationApiError extends Error {
    readonly status?: number;

    constructor(message: string, status?: number) {
        super(message);
        this.name = 'EducationApiError';
        this.status = status;
    }
}

/** Calls `PUT /saveeducationdetails`, matching `NxtGenEducationController`. */
export async function saveEducationDetails(education: NxtGenEducationDetail[]): Promise<NxtGenUser> {
    try {
        const { data } = await httpClient.put<NxtGenUser>('/saveeducationdetails', { education });
        return data;
    } catch (error) {
        throw toEducationApiError(error);
    }
}

function toEducationApiError(error: unknown): EducationApiError {
    if (axios.isAxiosError(error)) {
        if (error.response) {
            const body = error.response.data as { message?: string } | undefined;
            return new EducationApiError(body?.message ?? GENERIC_ERROR_MESSAGE, error.response.status);
        }
        if (error.request) {
            return new EducationApiError(NETWORK_ERROR_MESSAGE);
        }
    }
    return new EducationApiError(GENERIC_ERROR_MESSAGE);
}
