import { useEffect, useState } from 'react';
import {
    Briefcase,
    Calendar,
    CreditCard,
    Fingerprint,
    GraduationCap,
    Hash,
    Landmark,
    Mail,
    MapPin,
    Pencil,
    Percent,
    Phone,
    School,
    UserCog,
} from 'lucide-react';
import type { LucideIcon } from 'lucide-react';
import { fetchProfile, ProfileApiError } from '../../api/profileApi';
import { Alert } from '../../components/ui/Alert/Alert';
import { useToast } from '../../hooks/useToast';
import type { NxtGenUser } from '../../types/auth';
import { EducationDetailsModal } from './EducationDetailsModal/EducationDetailsModal';
import styles from './ProfilePage.module.css';

interface DetailItem {
    label: string;
    value: string | null;
    icon: LucideIcon;
}

/** Read-only profile overview, fetched live from `GET /profile`. */
export function ProfilePage() {
    const [user, setUser] = useState<NxtGenUser | null>(null);
    const [error, setError] = useState<string | null>(null);
    const [isLoading, setIsLoading] = useState(true);
    const [isEducationModalOpen, setIsEducationModalOpen] = useState(false);
    const { showError } = useToast();

    useEffect(() => {
        const controller = new AbortController();

        (async () => {
            try {
                const profile = await fetchProfile(controller.signal);
                setUser(profile);
                setIsLoading(false);
            } catch (fetchError) {
                if (fetchError instanceof ProfileApiError && fetchError.isCanceled) {
                    // StrictMode's dev-only mount/unmount/remount cycle aborts the
                    // first request; the remount's request is the one that resolves,
                    // so leave loading/error state untouched here.
                    return;
                }
                const message =
                    fetchError instanceof ProfileApiError ? fetchError.message : 'Something went wrong. Please try again.';
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

    const details: DetailItem[] = [
        { label: 'Employee ID', value: user.empId, icon: Hash },
        { label: 'Work email', value: user.empEmail, icon: Mail },
        { label: 'Phone number', value: user.phoneNumber, icon: Phone },
        { label: 'Work location', value: user.workLocation, icon: MapPin },
        { label: 'Designation', value: user.designation, icon: Briefcase },
        { label: 'Reporting manager', value: user.reportingManager, icon: UserCog },
        { label: 'Date of joining', value: user.dateOfJoining, icon: Calendar },
        { label: 'PAN number', value: user.panNumber, icon: CreditCard },
        { label: 'Aadhar number', value: user.aadharNumber, icon: Fingerprint },
    ];

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
                    <h2 className={styles.sectionTitle}>General Information</h2>
                    <div className={styles.formGrid}>
                        {details.map(({ label, value, icon: Icon }) => (
                            <div key={label} className={styles.formField}>
                <span className={styles.formLabel}>
                  <Icon size={14} aria-hidden="true" />
                    {label}
                </span>
                                <span className={styles.formValue}>{value ?? 'Not specified'}</span>
                            </div>
                        ))}
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
