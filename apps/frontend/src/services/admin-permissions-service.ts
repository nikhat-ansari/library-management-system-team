import { apiClient } from '../lib/axios';
import type { OperationalPermission, OperationalPermissionCode, StaffPermissions } from '../types/admin-permissions';

type PermissionDefinitionsResponse = { permissions: OperationalPermission[] };
type StaffPermissionsResponse = { userId: string; permissions: OperationalPermissionCode[] };

export const adminPermissionsService = {
  async getAvailablePermissions(): Promise<OperationalPermission[]> {
    const { data } = await apiClient.get<PermissionDefinitionsResponse>('/admin/permissions');
    return data.permissions;
  },

  async getStaffPermissions(staffUserId: string): Promise<StaffPermissions> {
    const { data } = await apiClient.get<StaffPermissionsResponse>(`/admin/users/${staffUserId}/permissions`);
    return { userId: data.userId, permissions: data.permissions };
  },

  async updateStaffPermissions(staffUserId: string, permissions: OperationalPermissionCode[]): Promise<StaffPermissions> {
    const { data } = await apiClient.put<StaffPermissionsResponse>(`/admin/users/${staffUserId}/permissions`, { permissions });
    return { userId: data.userId, permissions: data.permissions };
  },
};
