import axios from 'axios';
import { clearSession, loadStoredSession } from '../utils/tokenStorage';
import { showGeneralApiErrorToast } from '../utils/apiErrorToast';

/** Dispatched whenever a request is rejected with 401 after the user had an active session. */
export const AUTH_LOGOUT_EVENT = 'workforce360:auth-logout';

const DEFAULT_BASE_URL = 'http://localhost:8080/api';

// Axios request config isn't typed with a timestamp field by default; this
// augments it so request/response logging can report call duration.
declare module 'axios' {
    interface InternalAxiosRequestConfig {
        metadata?: { startedAt: number };
    }
}

export const httpClient = axios.create({
    baseURL: import.meta.env.VITE_API_BASE_URL ?? DEFAULT_BASE_URL,
    timeout: 15000,
    headers: {
        'Content-Type': 'application/json',
    },
});

httpClient.interceptors.request.use((config) => {
    const stored = loadStoredSession();
    if (stored) {
        config.headers.set('Authorization', `${stored.session.tokenType} ${stored.session.accessToken}`);
    }

    if (import.meta.env.DEV) {
        config.metadata = { startedAt: performance.now() };
        const method = config.method?.toUpperCase() ?? 'GET';
        console.log(`%c[API →] ${method} ${config.baseURL ?? ''}${config.url}`, 'color:#2563eb', {
            params: config.params,
            body: config.data,
        });
    }

    return config;
});

httpClient.interceptors.response.use(
    (response) => {
        if (import.meta.env.DEV) {
            logResponse(response);
        }
        return response;
    },
    (error: unknown) => {
        if (import.meta.env.DEV) {
            logError(error);
        }

        if (axios.isAxiosError(error)) {
            if (error.code !== 'ERR_CANCELED' && (!error.response || error.response.status >= 500)) {
                showGeneralApiErrorToast();
            }
            const isLoginRequest = error.config?.url?.includes('/auth/login');
            if (error.response?.status === 401 && !isLoginRequest) {
                clearSession();
                window.dispatchEvent(new Event(AUTH_LOGOUT_EVENT));
            }
        }
        else {
            showGeneralApiErrorToast();
        }
        return Promise.reject(error);
    },
);

function elapsedSince(startedAt?: number): string {
    return startedAt ? `${Math.round(performance.now() - startedAt)}ms` : 'n/a';
}

function logResponse(response: import('axios').AxiosResponse) {
    const method = response.config.method?.toUpperCase() ?? 'GET';
    const duration = elapsedSince(response.config.metadata?.startedAt);
    console.log(
        `%c[API ←] ${method} ${response.config.url} — ${response.status} (${duration})`,
        'color:#16a34a',
        response.data,
    );
}

function logError(error: unknown) {
    if (axios.isAxiosError(error)) {
        const method = error.config?.method?.toUpperCase() ?? 'GET';
        const duration = elapsedSince(error.config?.metadata?.startedAt);
        if (error.response) {
            console.error(
                `%c[API ×] ${method} ${error.config?.url} — ${error.response.status} (${duration})`,
                'color:#dc2626',
                error.response.data,
            );
        } else {
            console.error(`%c[API ×] ${method} ${error.config?.url} — network error (${duration})`, 'color:#dc2626', error.message);
        }
        return;
    }
    console.error('[API ×] Unexpected error', error);
}
