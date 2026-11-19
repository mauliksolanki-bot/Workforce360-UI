export const API_ERROR_TOAST_EVENT = 'workforce360:api-error';

/** Requests a single, app-wide generic API failure toast without coupling the HTTP client to React. */
export function showGeneralApiErrorToast(): void {
    window.dispatchEvent(new Event(API_ERROR_TOAST_EVENT));
}
