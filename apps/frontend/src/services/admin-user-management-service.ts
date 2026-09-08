import axios from 'axios';
import { apiClient } from '../lib/axios';
import type {
  CreateStaffRequest,
  StaffApiError,
  StaffUser,
  UpdateStaffRequest,
  UpdateStaffStatusRequest,
} from '../types/admin-user-management';

type ApiErrorBody = {
  message?: string | string[];
  errors?: Record<string, string | string[]>;
  fieldErrors?: Record<string, string | string[]>;
};

const toMessage = (value: string | string[] | undefined, fallback: string) =>
  Array.isArray(value) ? value[0] ?? fallback : value ?? fallback;

export function toStaffApiError(error: unknown, fallback: string): StaffApiError {
  if (
    typeof error === 'object' &&
    error !== null &&
    'message' in error &&
    'fields' in error
  ) {
    const mockError = error as { message: unknown; status?: unknown; fields: unknown };
    return {
      message: typeof mockError.message === 'string' ? mockError.message : fallback,
      status: typeof mockError.status === 'number' ? mockError.status : undefined,
      fields: typeof mockError.fields === 'object' && mockError.fields !== null
        ? mockError.fields as StaffApiError['fields']
        : {},
    };
  }
  if (!axios.isAxiosError<ApiErrorBody>(error)) {
    return { message: 'Network connection is unavailable. Please try again.', fields: {} };
  }
  const body = error.response?.data;
  const fields = body?.fieldErrors ?? body?.errors ?? {};
  const mappedFields = Object.fromEntries(
    Object.entries(fields).map(([key, value]) => [key, toMessage(value, fallback)]),
  );
  const message = toMessage(body?.message, fallback);
  const duplicateEmail = error.response?.status === 409 || /email.*(exist|use|duplicate)/i.test(message);
  return {
    message,
    status: error.response?.status,
    fields: duplicateEmail && !mappedFields.email
      ? { ...mappedFields, email: 'This email is already in use.' }
      : mappedFields,
  };
}

type BackendStatus = 'ACTIVE' | 'INACTIVE';
type BackendStaffUser = Omit<StaffUser, 'role' | 'accountStatus'> & {
  role: 'LIBRARIAN_STAFF';
  accountStatus?: BackendStatus;
  status?: BackendStatus;
};

function normalizeStaff(user: BackendStaffUser): StaffUser {
  const backendStatus = user.accountStatus ?? user.status;
  if (!backendStatus) throw new Error('The server returned a staff account without a status.');
  return {
    ...user,
    role: 'LIBRARIAN_STAFF',
    accountStatus: backendStatus === 'ACTIVE' ? 'active' : 'inactive',
  };
}

export interface AdminUserManagementService {
  getStaff(): Promise<StaffUser[]>;
  getStaffById(id: string): Promise<StaffUser>;
  createStaff(payload: CreateStaffRequest): Promise<StaffUser>;
  updateStaff(id: string, payload: UpdateStaffRequest): Promise<StaffUser>;
  updateStatus(id: string, payload: UpdateStaffStatusRequest): Promise<StaffUser>;
}

const realAdminUserManagementService: AdminUserManagementService = {
  async getStaff(): Promise<StaffUser[]> {
    const { data } = await apiClient.get<{ users: BackendStaffUser[] }>('/admin/users');
    return data.users.map(normalizeStaff);
  },

  async getStaffById(id: string): Promise<StaffUser> {
    const { data } = await apiClient.get<BackendStaffUser>(`/admin/users/${id}`);
    return normalizeStaff(data);
  },

  async createStaff(payload: CreateStaffRequest): Promise<StaffUser> {
    const { data } = await apiClient.post<BackendStaffUser>('/admin/users', payload);
    return normalizeStaff(data);
  },

  async updateStaff(id: string, payload: UpdateStaffRequest): Promise<StaffUser> {
    const { data } = await apiClient.patch<BackendStaffUser>(`/admin/users/${id}`, payload);
    return normalizeStaff(data);
  },

  async updateStatus(id: string, payload: UpdateStaffStatusRequest): Promise<StaffUser> {
    const { data } = await apiClient.patch<BackendStaffUser>(`/admin/users/${id}/status`, {
      status: payload.accountStatus === 'active' ? 'ACTIVE' : 'INACTIVE',
    });
    return normalizeStaff(data);
  },
};

export const adminUserManagementService: AdminUserManagementService = realAdminUserManagementService;
