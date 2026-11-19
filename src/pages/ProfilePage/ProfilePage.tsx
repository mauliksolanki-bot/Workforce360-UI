import { useEffect, useState } from 'react';
import {
    Briefcase,
    CreditCard,
    Eye,
    EyeOff,
    Calendar,
    Fingerprint,
    GraduationCap,
    Hash,
    Landmark,
    Layers,
    Mail,
    MapPin,
    Pencil,
    Percent,
    Phone,
    School,
    UserCog,
} from 'lucide-react';
import type { LucideIcon } from 'lucide-react';
import { fetchFormFields, FormApiError } from '../../api/formApi';
import { BankApiError, fetchBankDetails, fetchBanks, saveBankDetails } from '../../api/bankApi';
import { fetchProfile, ProfileApiError, saveProfileInformation } from '../../api/profileApi';
import { Alert } from '../../components/ui/Alert/Alert';
import { Button } from '../../components/ui/Button/Button';
import { TextField } from '../../components/ui/TextField/TextField';
import { ThemedSelect } from '../../components/ui/ThemedSelect/ThemedSelect';
import { useToast } from '../../hooks/useToast';
import type { NxtGenBankDetail, NxtGenBankDetailUpdate, NxtGenBankMaster, NxtGenUser } from '../../types/auth';
import type { NxtGenFormField } from '../../types/form';
import { EducationDetailsModal } from './EducationDetailsModal/EducationDetailsModal';
import styles from './ProfilePage.module.css';

const PROFILE_FORM_CODE = 'profile';
const BANK_DETAILS_FORM_CODE = 'bank_details';
const INDIAN_PHONE_NUMBER_LENGTH = 10;

const fieldIcons: Record<string, LucideIcon> = {
    EMP_ID: Hash,
    EMP_EMAIL: Mail,
    EMP_FNAME: UserCog,
    EMP_LNAME: UserCog,
    PRIMARY_ROLE: Briefcase,
    DESIGNATION_LEVEL: Layers,
    PHONE_NUMBER: Phone,
    DATE_OF_JOINING: Calendar,
    WORK_LOCATION: MapPin,
    REPORTING_MANAGER: UserCog,
    DESIGNATION: Briefcase,
    PAN_NUMBER: CreditCard,
    AADHAR_NUMBER: Fingerprint,
};

function toIndianPhoneNumber(value: string | null): string {
    const digits = (value ?? '').replace(/\D/g, '');
    return digits.length === 12 && digits.startsWith('91') ? digits.slice(2) : digits.slice(0, INDIAN_PHONE_NUMBER_LENGTH);
}

function formatAadhaarNumber(value: string | null): string | null {
    if (!value) {
        return null;
    }

    return value.replace(/\D/g, '').replace(/(.{4})(?=.)/g, '$1 ');
}

function isBankDetailsUpdateAllowed(date = new Date()): boolean {
    const day = date.getDate();
    return day >= 5 && day < 25;
}

const EMPTY_BANK_DETAILS: NxtGenBankDetailUpdate = {
    accountNumber: '',
    repeatAccountNumber: '',
    ifscCode: '',
    bankName: '',
    branchName: '',
    accountType: '',
};

function bankDetailsToFormValues(bankDetails: NxtGenBankDetail | null): NxtGenBankDetailUpdate {
    return bankDetails
        ? {
              accountNumber: bankDetails.accountNumber,
              repeatAccountNumber: bankDetails.accountNumber,
              ifscCode: bankDetails.ifscCode,
              bankName: bankDetails.bankName,
              branchName: bankDetails.branchName,
              accountType: bankDetails.accountType,
          }
        : EMPTY_BANK_DETAILS;
}

function maskBankAccountNumber(accountNumber: string): string {
    return accountNumber ? `•••• ${accountNumber.slice(-4)}` : '';
}

function getFormFieldLabel(fields: NxtGenFormField[], fieldCode: string, fallback: string): string {
    return fields.find((field) => field.fieldCode === fieldCode)?.fieldName ?? fallback;
}

/** Read-only profile overview, fetched live from `GET /profile`. */
export function ProfilePage() {
    const [user, setUser] = useState<NxtGenUser | null>(null);
    const [error, setError] = useState<string | null>(null);
    const [isLoading, setIsLoading] = useState(true);
    const [isEducationModalOpen, setIsEducationModalOpen] = useState(false);
    const [bankFormValues, setBankFormValues] = useState<NxtGenBankDetailUpdate>(EMPTY_BANK_DETAILS);
    const [banks, setBanks] = useState<NxtGenBankMaster[]>([]);
    const [bankFormErrors, setBankFormErrors] = useState<Record<string, string>>({});
    const [bankSaveError, setBankSaveError] = useState<string | null>(null);
    const [isSavingBankDetails, setIsSavingBankDetails] = useState(false);
    const [isAccountNumberVisible, setIsAccountNumberVisible] = useState(false);
    const [isRepeatAccountNumberVisible, setIsRepeatAccountNumberVisible] = useState(false);
    const [profileFields, setProfileFields] = useState<NxtGenFormField[]>([]);
    const [bankFields, setBankFields] = useState<NxtGenFormField[]>([]);
    const [phoneNumber, setPhoneNumber] = useState('');
    const [phoneNumberError, setPhoneNumberError] = useState<string | null>(null);
    const [isSavingProfileInformation, setIsSavingProfileInformation] = useState(false);
    const { showError, showSuccess } = useToast();

    useEffect(() => {
        const controller = new AbortController();

        (async () => {
            try {
                const [profile, fields, bankDetail, bankOptions, bankFormFields] = await Promise.all([
                    fetchProfile(controller.signal),
                    fetchFormFields(PROFILE_FORM_CODE, controller.signal),
                    fetchBankDetails(controller.signal),
                    fetchBanks(controller.signal),
                    fetchFormFields(BANK_DETAILS_FORM_CODE, controller.signal),
                ]);
                setUser(profile);
                setPhoneNumber(toIndianPhoneNumber(profile.phoneNumber));
                setProfileFields(fields);
                setBankFields(bankFormFields);
                setBankFormValues(bankDetailsToFormValues(bankDetail));
                setBanks(bankOptions);
                setIsLoading(false);
            } catch (fetchError) {
                if (
                    (fetchError instanceof ProfileApiError || fetchError instanceof FormApiError || fetchError instanceof BankApiError)
                    && fetchError.isCanceled
                ) {
                    // StrictMode's dev-only mount/unmount/remount cycle aborts the
                    // first request; the remount's request is the one that resolves,
                    // so leave loading/error state untouched here.
                    return;
                }
                const message =
                    fetchError instanceof ProfileApiError || fetchError instanceof FormApiError || fetchError instanceof BankApiError
                        ? fetchError.message
                        : 'Something went wrong. Please try again.';
                setError(message);
                setIsLoading(false);
                showError(message, 'Unable to load profile');
            }
        })();

        return () => {
            controller.abort();
        };
    }, [showError]);

    if (isLoading) {
        return (
            <div className={styles.page}>
                <main className={styles.content}>
                    <p className={styles.loadingText}>Loading profile…</p>
                </main>
            </div>
        );
    }

    if (error || !user) {
        return (
            <div className={styles.page}>
                <main className={styles.content}>
                    <Alert variant="error">{error ?? 'Unable to load profile.'}</Alert>
                </main>
            </div>
        );
    }

    const fullName = `${user.empFirstName} ${user.empLastName}`.trim();
    const initials = `${user.empFirstName.charAt(0)}${user.empLastName.charAt(0)}`.toUpperCase();

    const profileValues: Record<string, string | null> = {
        EMP_ID: user.empId,
        EMP_EMAIL: user.empEmail,
        EMP_FNAME: user.empFirstName,
        EMP_LNAME: user.empLastName,
        PRIMARY_ROLE: user.roleName,
        DESIGNATION_LEVEL: user.roleLevel,
        PHONE_NUMBER: user.phoneNumber,
        DATE_OF_JOINING: user.dateOfJoining,
        WORK_LOCATION: user.workLocation,
        REPORTING_MANAGER: user.reportingManager?.trim() || null,
        DESIGNATION: user.designation,
        PAN_NUMBER: user.panNumber,
        AADHAR_NUMBER: user.aadharNumber,
    };
    const generalInformationFields = profileFields.filter((field) => field.fieldType !== 'GRID');
    const canUpdateBankDetails = isBankDetailsUpdateAllowed();
    const selectedBank = banks.find((bank) => bank.bankName === bankFormValues.bankName);
    const bankLabels = {
        accountNumber: getFormFieldLabel(bankFields, 'ACCOUNT_NUMBER', 'Account Number'),
        repeatAccountNumber: getFormFieldLabel(bankFields, 'REPEAT_ACCOUNT_NUMBER', 'Repeat Account Number'),
        ifscCode: getFormFieldLabel(bankFields, 'IFSC_CODE', 'IFSC Code'),
        bankName: getFormFieldLabel(bankFields, 'BANK_NAME', 'Bank Name'),
        branchName: getFormFieldLabel(bankFields, 'BRANCH_NAME', 'Branch Name'),
        accountType: getFormFieldLabel(bankFields, 'ACCOUNT_TYPE', 'Account Type'),
    };

    const handleSaveProfileInformation = async () => {
        if (!/^\d{10}$/.test(phoneNumber)) {
            setPhoneNumberError('Enter a valid 10-digit phone number.');
            return;
        }

        setIsSavingProfileInformation(true);
        setPhoneNumberError(null);
        try {
            const updatedUser = await saveProfileInformation(phoneNumber);
            setUser(updatedUser);
            setPhoneNumber(toIndianPhoneNumber(updatedUser.phoneNumber));
            showSuccess('Phone number updated successfully.', 'Saved');
        } catch (saveError) {
            const message = saveError instanceof ProfileApiError ? saveError.message : 'Unable to save profile information.';
            setPhoneNumberError(message);
            showError(message, 'Unable to save');
        } finally {
            setIsSavingProfileInformation(false);
        }
    };

    const updateBankFormValue = (key: keyof NxtGenBankDetailUpdate, value: string) => {
        setBankFormValues((current) => ({ ...current, [key]: value }));
        setBankFormErrors((current) => {
            if (!current[key]) {
                return current;
            }
            const next = { ...current };
            delete next[key];
            return next;
        });
    };

    const handleSaveBankDetails = async () => {
        const nextErrors: Record<string, string> = {};
        if (!selectedBank) {
            nextErrors.bankName = 'Select a bank.';
        } else if (bankFormValues.accountNumber.length !== selectedBank.accountNumberLength) {
            nextErrors.accountNumber = `Enter the ${selectedBank.accountNumberLength}-digit account number for ${selectedBank.bankName}.`;
        }
        if (bankFormValues.repeatAccountNumber !== bankFormValues.accountNumber) {
            nextErrors.repeatAccountNumber = 'Account numbers do not match.';
        }
        if (!/^[A-Z]{4}0[A-Z0-9]{6}$/.test(bankFormValues.ifscCode)) {
            nextErrors.ifscCode = 'Enter a valid 11-character IFSC code.';
        }
        if (!bankFormValues.bankName.trim()) {
            nextErrors.bankName = 'Bank name is required.';
        }
        if (!bankFormValues.branchName.trim()) {
            nextErrors.branchName = 'Branch name is required.';
        }
        if (!bankFormValues.accountType) {
            nextErrors.accountType = 'Select an account type.';
        }
        if (Object.keys(nextErrors).length > 0) {
            setBankFormErrors(nextErrors);
            return;
        }

        setIsSavingBankDetails(true);
        setBankSaveError(null);
        try {
            const saved = await saveBankDetails({
                ...bankFormValues,
                ifscCode: bankFormValues.ifscCode.toUpperCase(),
                bankName: bankFormValues.bankName.trim(),
                branchName: bankFormValues.branchName.trim(),
            });
            setBankFormValues(bankDetailsToFormValues(saved));
            showSuccess('Bank details saved successfully.', 'Saved');
        } catch (saveError) {
            const message = saveError instanceof BankApiError ? saveError.message : 'Unable to save bank details.';
            setBankSaveError(message);
            showError(message, 'Unable to save');
        } finally {
            setIsSavingBankDetails(false);
        }
    };

    return (
        <div className={styles.page}>
            <main className={styles.content}>
                <section className={styles.profileCard}>
                    <span className={styles.avatar}>{initials}</span>

                    <div className={styles.profileInfo}>
                        <div className={styles.nameRow}>
                            <h1>{fullName}</h1>
                            <span className={styles.statusBadge} data-active={user.isActive === 'Y'}>
                {user.isActive === 'Y' ? 'Active' : 'Inactive'}
              </span>
                        </div>
                        <p className={styles.roleLine}>{user.roleName}</p>
                    </div>
                </section>

                <section className={styles.formCard}>
                    <div className={styles.sectionHeader}>
                        <h2 className={styles.sectionTitle}>General Information</h2>
                        <Button
                            type="button"
                            onClick={handleSaveProfileInformation}
                            isLoading={isSavingProfileInformation}
                            disabled={phoneNumber === toIndianPhoneNumber(user.phoneNumber)}
                        >
                            Save
                        </Button>
                    </div>
                    <div className={styles.formGrid}>
                        {generalInformationFields.map((field) => {
                            const Icon = fieldIcons[field.fieldCode] ?? Hash;

                            if (field.fieldCode === 'PHONE_NUMBER') {
                                return (
                                    <TextField
                                        key={field.id}
                                        label={field.fieldName}
                                        labelIcon={<Phone size={14} />}
                                        labelClassName={styles.formLabel}
                                        type="tel"
                                        inputMode="numeric"
                                        autoComplete="tel"
                                        pattern="[0-9]*"
                                        maxLength={INDIAN_PHONE_NUMBER_LENGTH}
                                        leadingIcon={phoneNumber ? <span>+91</span> : undefined}
                                        value={phoneNumber}
                                        error={phoneNumberError ?? undefined}
                                        onChange={(event) => {
                                            setPhoneNumber(event.target.value.replace(/\D/g, '').slice(0, INDIAN_PHONE_NUMBER_LENGTH));
                                            setPhoneNumberError(null);
                                        }}
                                    />
                                );
                            }

                            return (
                            <div key={field.id} className={styles.formField}>
                <span className={styles.formLabel}>
                  <Icon size={14} aria-hidden="true" />
                    {field.fieldName}
                </span>
                                <span className={styles.formValue}>
                                    {field.fieldCode === 'AADHAR_NUMBER'
                                        ? formatAadhaarNumber(profileValues[field.fieldCode]) ?? 'Not specified'
                                        : profileValues[field.fieldCode] ?? 'Not specified'}
                                </span>
                            </div>
                            );
                        })}
                    </div>
                </section>

                <section className={styles.formCard}>
                    <div className={styles.sectionHeader}>
                        <h2 className={styles.sectionTitle}>Bank Details</h2>
                        <Button
                            type="button"
                            onClick={handleSaveBankDetails}
                            isLoading={isSavingBankDetails}
                            disabled={!canUpdateBankDetails}
                        >
                            Save
                        </Button>
                    </div>
                    {!canUpdateBankDetails ? (
                        <Alert variant="info">
                            Bank details can be updated from the 5th through the 24th of each month.
                        </Alert>
                    ) : null}
                    {bankSaveError ? <Alert variant="error">{bankSaveError}</Alert> : null}
                    <div className={styles.formGrid}>
                        <TextField label={bankLabels.accountNumber} labelIcon={<CreditCard size={14} />} labelClassName={styles.formLabel}
                            inputMode="numeric" pattern="[0-9]*" maxLength={selectedBank?.accountNumberLength ?? 18} disabled={!canUpdateBankDetails}
                            readOnly={!isAccountNumberVisible && Boolean(bankFormValues.accountNumber)}
                            value={isAccountNumberVisible ? bankFormValues.accountNumber : maskBankAccountNumber(bankFormValues.accountNumber)}
                            error={bankFormErrors.accountNumber}
                            trailingAdornment={
                                <button type="button" className={styles.bankAccountToggle}
                                    onClick={() => setIsAccountNumberVisible((visible) => !visible)}
                                    aria-label={isAccountNumberVisible ? 'Hide account number' : 'Show account number'}>
                                    {isAccountNumberVisible ? <EyeOff size={17} aria-hidden="true" /> : <Eye size={17} aria-hidden="true" />}
                                </button>
                            }
                            onChange={(event) => {
                                setIsAccountNumberVisible(true);
                                updateBankFormValue('accountNumber', event.target.value.replace(/\D/g, '').slice(0, selectedBank?.accountNumberLength ?? 18));
                            }} />
                        <TextField label={bankLabels.repeatAccountNumber} labelIcon={<CreditCard size={14} />} labelClassName={styles.formLabel}
                            inputMode="numeric" pattern="[0-9]*" maxLength={selectedBank?.accountNumberLength ?? 18} disabled={!canUpdateBankDetails}
                            readOnly={!isRepeatAccountNumberVisible && Boolean(bankFormValues.repeatAccountNumber)}
                            value={isRepeatAccountNumberVisible ? bankFormValues.repeatAccountNumber : maskBankAccountNumber(bankFormValues.repeatAccountNumber)}
                            error={bankFormErrors.repeatAccountNumber}
                            trailingAdornment={
                                <button type="button" className={styles.bankAccountToggle}
                                    onClick={() => setIsRepeatAccountNumberVisible((visible) => !visible)}
                                    aria-label={isRepeatAccountNumberVisible ? 'Hide repeated account number' : 'Show repeated account number'}>
                                    {isRepeatAccountNumberVisible ? <EyeOff size={17} aria-hidden="true" /> : <Eye size={17} aria-hidden="true" />}
                                </button>
                            }
                            onChange={(event) => {
                                setIsRepeatAccountNumberVisible(true);
                                updateBankFormValue('repeatAccountNumber', event.target.value.replace(/\D/g, '').slice(0, selectedBank?.accountNumberLength ?? 18));
                            }} />
                        <TextField label={bankLabels.ifscCode} labelIcon={<Hash size={14} />} labelClassName={styles.formLabel}
                            maxLength={11} disabled={!canUpdateBankDetails} value={bankFormValues.ifscCode} error={bankFormErrors.ifscCode}
                            onChange={(event) => updateBankFormValue('ifscCode', event.target.value.replace(/[^a-zA-Z0-9]/g, '').toUpperCase().slice(0, 11))} />
                        <div className={styles.bankSelectField}>
                            <label htmlFor="bank-name" className={styles.formLabel}><Landmark size={14} aria-hidden="true" />{bankLabels.bankName}</label>
                            <ThemedSelect ariaLabel={bankLabels.bankName} placeholder="Select bank" disabled={!canUpdateBankDetails} value={bankFormValues.bankName}
                                className={[styles.bankSelect, bankFormErrors.bankName ? styles.bankSelectError : null].filter(Boolean).join(' ')}
                                options={['', ...banks.map((bank) => bank.bankName)]}
                                onChange={(value) => {
                                    updateBankFormValue('bankName', value);
                                    updateBankFormValue('accountNumber', '');
                                    updateBankFormValue('repeatAccountNumber', '');
                                    setIsAccountNumberVisible(false);
                                    setIsRepeatAccountNumberVisible(false);
                                }} />
                            {bankFormErrors.bankName ? <p className={styles.bankErrorText}>{bankFormErrors.bankName}</p> : null}
                        </div>
                        <TextField label={bankLabels.branchName} labelIcon={<MapPin size={14} />} labelClassName={styles.formLabel}
                            maxLength={160} disabled={!canUpdateBankDetails} value={bankFormValues.branchName} error={bankFormErrors.branchName}
                            onChange={(event) => updateBankFormValue('branchName', event.target.value)} />
                        <div className={styles.bankSelectField}>
                            <label htmlFor="account-type" className={styles.formLabel}><Landmark size={14} aria-hidden="true" />{bankLabels.accountType}</label>
                            <ThemedSelect ariaLabel={bankLabels.accountType} placeholder="Select account type" disabled={!canUpdateBankDetails} value={bankFormValues.accountType}
                                className={[styles.bankSelect, bankFormErrors.accountType ? styles.bankSelectError : null].filter(Boolean).join(' ')}
                                options={['', 'Salary Account', 'Savings Account', 'Current Account']}
                                onChange={(value) => updateBankFormValue('accountType', value)} />
                            {bankFormErrors.accountType ? <p className={styles.bankErrorText}>{bankFormErrors.accountType}</p> : null}
                        </div>
                    </div>
                </section>

                <section className={styles.formCard}>
                    <div className={styles.sectionHeader}>
                        <h2 className={styles.sectionTitle}>Education</h2>
                        <button
                            type="button"
                            className={styles.editSectionButton}
                            onClick={() => setIsEducationModalOpen(true)}
                        >
                            <Pencil size={14} aria-hidden="true" />
                            Edit
                        </button>
                    </div>
                    {user.education.length > 0 ? (
                        <div className={styles.educationGrid}>
                            {user.education.map((entry, index) => (
                                <article key={`${entry.degree ?? 'degree'}-${index}`} className={styles.educationCard}>
                                    <div className={styles.educationIcon}>
                                        <GraduationCap size={20} aria-hidden="true" />
                                    </div>
                                    <div className={styles.educationBody}>
                                        <h3 className={styles.educationDegree}>{entry.degree ?? 'Not specified'}</h3>
                                        <p className={styles.educationInstitution}>
                                            <School size={13} aria-hidden="true" />
                                            {entry.institution ?? 'Not specified'}
                                        </p>
                                        <div className={styles.educationMetaRow}>
                                            <span className={styles.educationMetaItem}>
                                                <Landmark size={13} aria-hidden="true" />
                                                {entry.university ?? 'Not specified'}
                                            </span>
                                            <span className={styles.educationMetaItem}>
                                                <Calendar size={13} aria-hidden="true" />
                                                {entry.yearOfPassing ?? 'Not specified'}
                                            </span>
                                            <span className={styles.educationMetaItem}>
                                                <Percent size={13} aria-hidden="true" />
                                                {entry.percentage ?? 'Not specified'}
                                            </span>
                                        </div>
                                    </div>
                                </article>
                            ))}
                        </div>
                    ) : (
                        <p className={styles.emptyState}>No education records added yet.</p>
                    )}
                </section>
            </main>

            <EducationDetailsModal
                isOpen={isEducationModalOpen}
                education={user.education}
                onClose={() => setIsEducationModalOpen(false)}
                onSaved={(updatedUser) => setUser(updatedUser)}
            />
        </div>
    );
}
