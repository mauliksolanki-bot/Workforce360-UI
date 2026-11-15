import axios from 'axios';
import { httpClient } from './httpClient';
import type { LoginCredentials, LoginSession } from '../types/auth';

const GENERIC_ERROR_MESSAGE = 'Something went wrong. Please try again.';
const NETWORK_ERROR_MESSAGE = 'Unable to reach the server. Check your connection and try again.';

export class AuthApiError extends Error {
    readonly status?: number;

    constructor(message: string, status?: number) {
        super(message);
        this.name = 'AuthApiError';
        this.status = status;
    }
}

/** Calls `POST /v1/auth/login`, matching `NxtGenAuthController`. */
export async function login(credentials: LoginCredentials): Promise<LoginSession> {
    try {
        const { data } = await httpClient.post<LoginSession>('/v1/auth/login', credentials);
        return data;
    } catch (error) {
        throw toAuthApiError(error);
    }
}

function toAuthApiError(error: unknown): AuthApiError {
    if (axios.isAxiosError(error)) {
        if (error.response) {
            const body = error.response.data as { message?: string } | undefined;
            return new AuthApiError(body?.message ?? GENERIC_ERROR_MESSAGE, error.response.status);
        }
        if (error.request) {
            return new AuthApiError(NETWORK_ERROR_MESSAGE);
        }
    }
    return new AuthApiError(GENERIC_ERROR_MESSAGE);
}
