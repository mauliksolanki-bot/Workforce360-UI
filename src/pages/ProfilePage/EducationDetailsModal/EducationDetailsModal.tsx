import { useEffect, useState } from 'react';
import { GraduationCap, Pencil, Plus, Trash2 } from 'lucide-react';
import { fetchEditEducationDetailsPopupConfig, ConfigApiError } from '../../../api/configApi';
import { saveEducationDetails, EducationApiError } from '../../../api/educationApi';
import { fetchFormFields, FormApiError } from '../../../api/formApi';
import { Alert } from '../../../components/ui/Alert/Alert';
import { Button } from '../../../components/ui/Button/Button';
import { Modal } from '../../../components/ui/Modal/Modal';
import { TextField } from '../../../components/ui/TextField/TextField';
import { useToast } from '../../../hooks/useToast';
import type { NxtGenEducationDetail, NxtGenUser } from '../../../types/auth';
import type { NxtGenStaticConfigField, NxtGenStaticPopupConfig } from '../../../types/config';
import styles from './EducationDetails.module.css';

interface EducationDetailsModalProps {
    isOpen: boolean;
    education: NxtGenEducationDetail[];
    onClose: () => void;
    onSaved: (user: NxtGenUser) => void;
}

const EMPTY_ENTRY: NxtGenEducationDetail = {
    degree: '',
    institution: '',
    university: '',
    yearOfPassing: '',
    percentage: '',
};

type FormValues = Record<string, string>;

function entryToFormValues(entry: NxtGenEducationDetail): FormValues {
    return {
        degree: entry.degree ?? '',
        institution: entry.institution ?? '',
        university: entry.university ?? '',
        yearOfPassing: entry.yearOfPassing ?? '',
        percentage: entry.percentage ?? '',
    };
}

function formValuesToEntry(values: FormValues): NxtGenEducationDetail {
    return {
        degree: values.degree?.trim() ?? '',
        institution: values.institution?.trim() ?? '',
        university: values.university?.trim() ?? '',
        yearOfPassing: values.yearOfPassing?.trim() ?? '',
        percentage: values.percentage?.trim() ?? '',
    };
}

/** Converts a NXTGEN_FORM_FIELDS_MASTER.FIELD_CODE (e.g. `YEAR_OF_PASSING`) into the matching
 * camelCase property on `NxtGenEducationDetail` (e.g. `yearOfPassing`). */
function fieldCodeToCamelCase(fieldCode: string): string {
    return fieldCode
        .toLowerCase()
        .split('_')
        .map((part, index) => (index === 0 ? part : part.charAt(0).toUpperCase() + part.slice(1)))
        .join('');
}

function validateField(field: NxtGenStaticConfigField, rawValue: string): string | undefined {
    const value = rawValue.trim();
    if (field.mandatory && !value) {
        return `${field.label} is required.`;
    }
    if (value && field.pattern && !new RegExp(field.pattern).test(value)) {
        return `Enter a valid ${field.label.toLowerCase()}.`;
    }
    if (value && field.maxLength && value.length > field.maxLength) {
        return `${field.label} must be at most ${field.maxLength} characters.`;
    }
    return undefined;
}

/**
 * Edit-education popup. Presentation (title/button labels/empty state) comes from the
 * `EDIT_EDU_DETAILS` row in `NXTGEN_STATIC_CONFIG` (`GET /config/editedudetailspopup`); the actual field
 * list, labels and mandatory flags are the source of truth in
 * `NXTGEN_FORM_MASTER`/`NXTGEN_FORM_FIELDS_MASTER` (`GET /retriveform/{formCode}`), merged with
 * the config's per-field UI hints (placeholder/maxLength/pattern) at render time.
 */
export function EducationDetailsModal({ isOpen, education, onClose, onSaved }: EducationDetailsModalProps) {
    const { showSuccess, showError } = useToast();
    const [popupConfig, setPopupConfig] = useState<NxtGenStaticPopupConfig | null>(null);
    const [fields, setFields] = useState<NxtGenStaticConfigField[]>([]);
    const [configError, setConfigError] = useState<string | null>(null);
    const [isLoadingConfig, setIsLoadingConfig] = useState(false);

    const [entries, setEntries] = useState<NxtGenEducationDetail[]>([]);
    const [view, setView] = useState<'list' | 'form'>('list');
    const [editingIndex, setEditingIndex] = useState<number | null>(null);
    const [formValues, setFormValues] = useState<FormValues>(entryToFormValues(EMPTY_ENTRY));
    const [formErrors, setFormErrors] = useState<Record<string, string>>({});

    const [isSaving, setIsSaving] = useState(false);
    const [saveError, setSaveError] = useState<string | null>(null);

    useEffect(() => {
        if (!isOpen) {
            return;
        }

        setEntries(education.map((entry) => ({ ...entry })));
        setView('list');
        setEditingIndex(null);
        setSaveError(null);

        // Always re-fetch the popup config + form fields on every open so the modal reflects the
        // latest NXTGEN_STATIC_CONFIG / NXTGEN_FORM_FIELDS_MASTER data, rather than reusing a
        // previously loaded copy from an earlier time this modal was opened.
        const controller = new AbortController();
        setIsLoadingConfig(true);
        setConfigError(null);

        (async () => {
            try {
                const config = await fetchEditEducationDetailsPopupConfig(controller.signal);
                const formFields = await fetchFormFields(config.staticJson.formCode, controller.signal);
                const mergedFields: NxtGenStaticConfigField[] = formFields.map((field) => {
                    const meta = config.staticJson.fieldMeta[field.fieldCode] ?? {};
                    return {
                        code: fieldCodeToCamelCase(field.fieldCode),
                        label: field.fieldName,
                        mandatory: field.isMandatory === 'Y',
                        ...meta,
                    };
                });
                setPopupConfig(config.staticJson);
                setFields(mergedFields);
                setIsLoadingConfig(false);
            } catch (error) {
                if ((error instanceof ConfigApiError || error instanceof FormApiError) && error.isCanceled) {
                    return;
                }
                setConfigError(
                    error instanceof ConfigApiError || error instanceof FormApiError
                        ? error.message
                        : 'Unable to load the education form.',
                );
                setIsLoadingConfig(false);
            }
        })();

        return () => {
            controller.abort();
        };
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [isOpen]);

    const handleClose = () => {
        if (isSaving) {
            return;
        }
        onClose();
    };

    const openAddForm = () => {
        setEditingIndex(null);
        setFormValues(entryToFormValues(EMPTY_ENTRY));
        setFormErrors({});
        setView('form');
    };

    const openEditForm = (index: number) => {
        setEditingIndex(index);
        setFormValues(entryToFormValues(entries[index]));
        setFormErrors({});
        setView('form');
    };

    const removeEntry = (index: number) => {
        setEntries((current) => current.filter((_, i) => i !== index));
    };

    const handleFieldChange = (code: string, value: string) => {
        setFormValues((current) => ({ ...current, [code]: value }));
        setFormErrors((current) => {
            if (!current[code]) {
                return current;
            }
            const next = { ...current };
            delete next[code];
            return next;
        });
    };

    const handleFormSubmit = () => {
        if (fields.length === 0) {
            return;
        }

        const nextErrors: Record<string, string> = {};
        fields.forEach((field) => {
            const error = validateField(field, formValues[field.code] ?? '');
            if (error) {
                nextErrors[field.code] = error;
            }
        });

        if (Object.keys(nextErrors).length > 0) {
            setFormErrors(nextErrors);
            return;
        }

        const entry = formValuesToEntry(formValues);
        setEntries((current) => {
            if (editingIndex === null) {
                return [...current, entry];
            }
            return current.map((existing, i) => (i === editingIndex ? entry : existing));
        });
        setView('list');
    };

    const handleSaveAll = async () => {
        setIsSaving(true);
        setSaveError(null);
        try {
            const updatedUser = await saveEducationDetails(entries);
            onSaved(updatedUser);
            onClose();
            showSuccess('Education details updated successfully.', 'Saved');
        } catch (error) {
            const message = error instanceof EducationApiError ? error.message : 'Unable to save education details.';
            setSaveError(message);
            showError(message, 'Unable to save');
        } finally {
            setIsSaving(false);
        }
    };

    const columns = popupConfig?.columnsPerRow ?? 2;
    const isReady = !isLoadingConfig && !configError && popupConfig && fields.length > 0;

    const footer =
        view === 'list' ? (
            <>
                <Button variant="ghost" type="button" onClick={handleClose} disabled={isSaving}>
                    {popupConfig?.cancelButtonLabel ?? 'Cancel'}
                </Button>
                <Button type="button" onClick={handleSaveAll} isLoading={isSaving} disabled={!isReady}>
                    {popupConfig?.saveButtonLabel ?? 'Save changes'}
                </Button>
            </>
        ) : (
            <>
                <Button variant="ghost" type="button" onClick={() => setView('list')}>
                    Back
                </Button>
                <Button type="button" onClick={handleFormSubmit}>
                    {editingIndex === null ? (popupConfig?.addButtonLabel ?? 'Add') : 'Update entry'}
                </Button>
            </>
        );

    return (
        <Modal
            isOpen={isOpen}
            onClose={handleClose}
            title={popupConfig?.title ?? 'Education Details'}
            description={popupConfig?.description}
            footer={footer}
            size="lg"
        >
            {isLoadingConfig ? <p className={styles.helperText}>Loading form…</p> : null}
            {configError ? <Alert variant="error">{configError}</Alert> : null}
            {saveError ? <Alert variant="error">{saveError}</Alert> : null}

            {isReady ? (
                view === 'list' ? (
                    <div className={styles.listView}>
                        <button type="button" className={styles.addEntryButton} onClick={openAddForm}>
                            <Plus size={16} aria-hidden="true" />
                            {popupConfig.addButtonLabel}
                        </button>

                        {entries.length > 0 ? (
                            <div className={styles.entriesGrid}>
                                {entries.map((entry, index) => (
                                    <article key={`${entry.degree}-${index}`} className={styles.entryCard}>
                                        <div className={styles.entryIcon}>
                                            <GraduationCap size={18} aria-hidden="true" />
                                        </div>
                                        <div className={styles.entryBody}>
                                            <h3 className={styles.entryDegree}>{entry.degree || 'Not specified'}</h3>
                                            <p className={styles.entryMeta}>{entry.institution || 'Not specified'}</p>
                                            <p className={styles.entryMetaSecondary}>
                                                {[entry.university, entry.yearOfPassing, entry.percentage].filter(Boolean).join(' • ')}
                                            </p>
                                        </div>
                                        <div className={styles.entryActions}>
                                            <button
                                                type="button"
                                                className={styles.iconButton}
                                                onClick={() => openEditForm(index)}
                                                aria-label={`${popupConfig.editButtonLabel} ${entry.degree ?? ''}`}
                                            >
                                                <Pencil size={15} aria-hidden="true" />
                                            </button>
                                            <button
                                                type="button"
                                                className={[styles.iconButton, styles.iconButtonDanger].join(' ')}
                                                onClick={() => removeEntry(index)}
                                                aria-label={`${popupConfig.deleteButtonLabel} ${entry.degree ?? ''}`}
                                            >
                                                <Trash2 size={15} aria-hidden="true" />
                                            </button>
                                        </div>
                                    </article>
                                ))}
                            </div>
                        ) : (
                            <p className={styles.emptyState}>{popupConfig.emptyStateText}</p>
                        )}
                    </div>
                ) : (
                    <div className={styles.formGrid} style={{ gridTemplateColumns: `repeat(${columns}, 1fr)` }}>
                        {fields.map((field) => (
                            <TextField
                                key={field.code}
                                label={field.mandatory ? `${field.label} *` : field.label}
                                placeholder={field.placeholder}
                                maxLength={field.maxLength}
                                value={formValues[field.code] ?? ''}
                                error={formErrors[field.code]}
                                onChange={(event) => handleFieldChange(field.code, event.target.value)}
                            />
                        ))}
                    </div>
                )
            ) : null}
        </Modal>
    );
}
