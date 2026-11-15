import axios from 'axios';
import { httpClient } from './httpClient';
import type { NxtGenNavigation } from '../types/navigation';

const GENERIC_ERROR_MESSAGE = 'Something went wrong. Please try again.';
const NETWORK_ERROR_MESSAGE = 'Unable to reach the server. Check your connection and try again.';

export class NavigationApiError extends Error {
    readonly status?: number;
    readonly isCanceled: boolean;

    constructor(message: string, status?: number, isCanceled = false) {
        super(message);
        this.name = 'NavigationApiError';
        this.status = status;
        this.isCanceled = isCanceled;
    }
}

/** Calls `GET /navigation`, matching `NxtGenNavigationController`. */
export async function fetchNavigation(signal?: AbortSignal): Promise<NxtGenNavigation[]> {
    try {
        const { data } = await httpClient.get<NxtGenNavigation[]>('/navigation', { signal });
        return data;
    } catch (error) {
        throw toNavigationApiError(error);
    }
}

function toNavigationApiError(error: unknown): NavigationApiError {
    if (axios.isCancel(error) || (axios.isAxiosError(error) && error.code === 'ERR_CANCELED')) {
        return new NavigationApiError('Request canceled', undefined, true);
    }
    if (axios.isAxiosError(error)) {
        if (error.response) {
            const body = error.response.data as { message?: string } | undefined;
            return new NavigationApiError(body?.message ?? GENERIC_ERROR_MESSAGE, error.response.status);
        }
        if (error.request) {
            return new NavigationApiError(NETWORK_ERROR_MESSAGE);
        }
    }
    return new NavigationApiError(GENERIC_ERROR_MESSAGE);
}
