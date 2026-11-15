/**
 * Data contracts shared with the NxtGen backend.
 * Field names mirror `com.nxtgen.model.NxtGenUser`, `NxtGenLoginCredentials`
 * and `NxtGenLoginSession` so the UI and API never drift out of sync.
 */
/** One row of an employee's education history (see `com.nxtgen.model.NxtGenEducationDetail`). */
export interface NxtGenEducationDetail {
    degree: string | null;
    institution: string | null;
    university: string | null;
    yearOfPassing: string | null;
    percentage: string | null;
}

export interface NxtGenUser {
    id: string;
    empId: string;
    empFirstName: string;
    empLastName: string;
    empEmail: string;
    primaryRoleId: number;
    roleName: string;
    isActive: string;
    createdBy: string;
    createdDate: string;
    updatedBy: string | null;
    updatedDate: string | null;
    education: NxtGenEducationDetail[];
    profileImage: string | null;
    phoneNumber: string | null;
    dateOfJoining: string | null;
    workLocation: string | null;
    reportingManager: string | null;
    designation: string | null;
    panNumber: string | null;
    aadharNumber: string | null;
}

export interface LoginCredentials {
    email: string;
    password: string;
}

export interface LoginSession {
    accessToken: string;
    tokenType: string;
    /** Lifetime of the access token, in seconds. */
    expiresIn: number;
    user: NxtGenUser;
}
