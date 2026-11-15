/**
 * Data contracts for `NXTGEN_STATIC_CONFIG` — backend-driven UI configuration rows (popup
 * layouts, field metadata hints, etc.) served by dedicated `/config/...` endpoints.
 *
 * The authoritative field list/labels/mandatory flags for a popup's form come from the generic
 * `NXTGEN_FORM_MASTER`/`NXTGEN_FORM_FIELDS_MASTER` tables (`GET /retriveform/{formCode}`, see
 * `formCode` below). `fieldMeta` only supplies presentation hints that table doesn't model
 * (placeholder text, max length, validation pattern), keyed by `FIELD_CODE`.
 */
export interface NxtGenStaticFieldMeta {
    placeholder?: string;
    maxLength?: number;
    pattern?: string;
    helpText?: string;
}

/** A form field merged at runtime from `NXTGEN_FORM_FIELDS_MASTER` + `fieldMeta`. */
export interface NxtGenStaticConfigField {
    code: string;
    label: string;
    mandatory: boolean;
    placeholder?: string;
    maxLength?: number;
    pattern?: string;
    helpText?: string;
}

export interface NxtGenStaticPopupConfig {
    title: string;
    description?: string;
    addButtonLabel: string;
    editButtonLabel: string;
    deleteButtonLabel: string;
    saveButtonLabel: string;
    cancelButtonLabel: string;
    emptyStateText: string;
    columnsPerRow?: number;
    /** FORM_CODE to fetch the field list from via `GET /retriveform/{formCode}`. */
    formCode: string;
    fieldMeta: Record<string, NxtGenStaticFieldMeta>;
}

export interface NxtGenStaticConfig {
    id: number;
    confCode: string;
    confCategory: string;
    staticJson: NxtGenStaticPopupConfig;
    isActive: string;
}
