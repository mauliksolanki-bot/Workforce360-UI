import axios from 'axios';
import { httpClient } from './httpClient';
import type { NxtGenStaticConfig } from '../types/config';

const GENERIC_ERROR_MESSAGE = 'Something went wrong. Please try again.';
const NETWORK_ERROR_MESSAGE = 'Unable to reach the server. Check your connection and try again.';

export class ConfigApiError extends Error {
    readonly status?: number;
    readonly isCanceled: boolean;

    constructor(message: string, status?: number, isCanceled = false) {
        super(message);
        this.name = 'ConfigApiError';
        this.status = status;
        this.isCanceled = isCanceled;
    }
}

/**
 * Backend-driven popup configuration (`NXTGEN_STATIC_CONFIG`) is served through one dedicated
 * endpoint per popup on `NxtGenStaticConfigController` (e.g. `/config/editedudetailspopup`)
 * rather than a single generic `/config/{confCode}` route. When a new popup needs backend-driven
 * config, add its matching controller endpoint, then export a new function here following the
 * same pattern as `fetchEditEducationDetailsPopupConfig`.
 */
async function getStaticConfig(path: string, signal?: AbortSignal): Promise<NxtGenStaticConfig> {
    try {
        const { data } = await httpClient.get<NxtGenStaticConfig>(path, { signal });
        return data;
    } catch (error) {
        throw toConfigApiError(error);
    }
}

/** Calls `GET /config/editedudetailspopup`, matching `NxtGenStaticConfigController.getEduDetailsPopup`. */
export function fetchEditEducationDetailsPopupConfig(signal?: AbortSignal): Promise<NxtGenStaticConfig> {
    return getStaticConfig('/config/editedudetailspopup', signal);
}

function toConfigApiError(error: unknown): ConfigApiError {
    if (axios.isCancel(error) || (axios.isAxiosError(error) && error.code === 'ERR_CANCELED')) {
        return new ConfigApiError('Request canceled', undefined, true);
    }
    if (axios.isAxiosError(error)) {
        if (error.response) {
            const body = error.response.data as { message?: string } | undefined;
            return new ConfigApiError(body?.message ?? GENERIC_ERROR_MESSAGE, error.response.status);
        }
        if (error.request) {
            return new ConfigApiError(NETWORK_ERROR_MESSAGE);
        }
    }
    return new ConfigApiError(GENERIC_ERROR_MESSAGE);
}
