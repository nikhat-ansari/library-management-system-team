import axios from 'axios';
import { env } from '../config/env';
import { apiClient } from '../lib/axios';
import { createAdminUsersDevelopmentMock } from './admin-user-management-development-mock';
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

function normalizeStaff(user: StaffUser): StaffUser {
  return { ...user, accountStatus: user.accountStatus ?? 'active', role: 'STAFF' };
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
    const { data } = await apiClient.get<StaffUser[] | { items: StaffUser[] }>('/admin/users');
    return (Array.isArray(data) ? data : data.items).map(normalizeStaff);
  },

  async getStaffById(id: string): Promise<StaffUser> {
    const { data } = await apiClient.get<StaffUser>(`/admin/users/${id}`);
    return normalizeStaff(data);
  },

  async createStaff(payload: CreateStaffRequest): Promise<StaffUser> {
    const { data } = await apiClient.post<StaffUser>('/admin/users', payload);
    return normalizeStaff(data);
  },

  async updateStaff(id: string, payload: UpdateStaffRequest): Promise<StaffUser> {
    const { data } = await apiClient.patch<StaffUser>(`/admin/users/${id}`, payload);
    return normalizeStaff(data);
  },

  async updateStatus(id: string, payload: UpdateStaffStatusRequest): Promise<StaffUser> {
    const { data } = await apiClient.patch<StaffUser>(`/admin/users/${id}/status`, payload);
    return normalizeStaff(data);
  },
};

// The mock is opt-in and exists only to unblock Module 3 UI development before its API ships.
export const adminUserManagementService: AdminUserManagementService = env.useAdminUsersMock
  ? createAdminUsersDevelopmentMock(env.adminUsersMockScenario)
  : realAdminUserManagementService;
