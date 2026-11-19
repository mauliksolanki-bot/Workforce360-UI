import axios from 'axios';
import { httpClient } from './httpClient';
import type { NxtGenUser } from '../types/auth';

const GENERIC_ERROR_MESSAGE = 'Something went wrong. Please try again.';
const NETWORK_ERROR_MESSAGE = 'Unable to reach the server. Check your connection and try again.';

export class ProfileApiError extends Error {
    readonly status?: number;
    readonly isCanceled: boolean;

    constructor(message: string, status?: number, isCanceled = false) {
        super(message);
        this.name = 'ProfileApiError';
        this.status = status;
        this.isCanceled = isCanceled;
    }
}

/** Calls `GET /profile`, matching `NxtGenProfileController`. */
export async function fetchProfile(signal?: AbortSignal): Promise<NxtGenUser> {
    try {
        const { data } = await httpClient.get<NxtGenUser>('/employees/me/profile', { signal });
        return data;
    } catch (error) {
        throw toProfileApiError(error);
    }
}

/** Calls `PUT /saveprofileinformation` to update the signed-in user's editable profile data. */
export async function saveProfileInformation(phoneNumber: string): Promise<NxtGenUser> {
    try {
        const { data } = await httpClient.put<NxtGenUser>('/employees/me/profile/contact-information', { phoneNumber });
        return data;
    } catch (error) {
        throw toProfileApiError(error);
    }
}

function toProfileApiError(error: unknown): ProfileApiError {
    if (axios.isCancel(error) || (axios.isAxiosError(error) && error.code === 'ERR_CANCELED')) {
        return new ProfileApiError('Request canceled', undefined, true);
    }
    if (axios.isAxiosError(error)) {
        if (error.response) {
            const body = error.response.data as { message?: string } | undefined;
            return new ProfileApiError(body?.message ?? GENERIC_ERROR_MESSAGE, error.response.status);
        }
        if (error.request) {
            return new ProfileApiError(NETWORK_ERROR_MESSAGE);
        }
    }
    return new ProfileApiError(GENERIC_ERROR_MESSAGE);
}
