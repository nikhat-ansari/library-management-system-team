/** UI-facing role. This is kept local to admin user management. */
export type StaffRole = 'LIBRARIAN_STAFF';
export type StaffAccountStatus = 'active' | 'inactive';

export interface StaffUser {
  id: string;
  name: string;
  email: string;
  role: StaffRole;
  accountStatus: StaffAccountStatus;
  createdAt: string;
  updatedAt: string;
}

export interface CreateStaffRequest {
  name: string;
  email: string;
  role: StaffRole;
}

export interface UpdateStaffRequest {
  name: string;
  email: string;
}

export interface UpdateStaffStatusRequest {
  accountStatus: StaffAccountStatus;
}

export interface StaffValidationErrors {
  name?: string;
  email?: string;
  role?: string;
  form?: string;
}

export interface StaffApiError {
  message: string;
  status?: number;
  fields: StaffValidationErrors;
}
