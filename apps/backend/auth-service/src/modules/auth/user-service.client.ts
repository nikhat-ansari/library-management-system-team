import { Injectable, ServiceUnavailableException } from '@nestjs/common';
import axios from 'axios';

interface UserData {
  id?: string;
  _id?: string;
  email: string;
  name: string;
  role: string;
  passwordHash: string;
  status?: 'active' | 'inactive';
  lastLogin?: Date;
}

type AdminUserPayload = { name?: string; email?: string; role?: 'LIBRARIAN_STAFF'; status?: 'ACTIVE' | 'INACTIVE' };

export interface AuthState {
  id: string;
  role: string;
  status: 'active' | 'inactive';
  tokenVersion: number;
  permissions: string[];
}

@Injectable()
export class UserServiceClient {
  private userServiceUrl = process.env.USER_SERVICE_URL ?? 'http://localhost:3002';

  async findByEmail(email: string): Promise<UserData | null> {
    try {
      const response = await axios.get<UserData>(`${this.userServiceUrl}/api/users/by-email`, {
        params: { email },
      });
      return response.data;
    } catch (error: any) {
      if (error.response?.status === 404 || error.response?.status === 400) {
        return null;
      }
      throw new ServiceUnavailableException('User service is unavailable');
    }
  }

  async updateLastLogin(userId: string): Promise<void> {
    try {
      await axios.patch(`${this.userServiceUrl}/api/users/${userId}/last-login`);
    } catch (error) {
      // Log but don't throw - this is non-critical
      console.error('Failed to update last login:', error);
    }
  }

  async validatePassword(plainPassword: string, hash: string): Promise<boolean> {
    try {
      const response = await axios.post<{ valid: boolean }>(`${this.userServiceUrl}/api/users/validate-password`, {
        plainPassword,
        hash,
      });
      return response.data.valid;
    } catch (error) {
      throw new ServiceUnavailableException('User service is unavailable');
    }
  }

  async findById(userId: string): Promise<UserData | null> {
    try {
      const response = await axios.get<UserData>(`${this.userServiceUrl}/api/users/${userId}`);
      return response.data;
    } catch (error: any) {
      if (error.response?.status === 404) return null;
      throw new ServiceUnavailableException('User service is unavailable');
    }
  }

  async getMemberDashboardCounts(): Promise<{ total: number; active: number }> {
    try {
      const response = await axios.get<{ total: number; active: number }>(`${this.userServiceUrl}/api/users/dashboard/member-counts`);
      return response.data;
    } catch {
      throw new ServiceUnavailableException('User service is unavailable');
    }
  }

  async getAuthState(userId: string): Promise<AuthState | null> {
    try {
      const response = await axios.get<AuthState>(`${this.userServiceUrl}/api/users/${userId}/auth-state`);
      return response.data;
    } catch (error: any) {
      if (error.response?.status === 404) return null;
      throw new ServiceUnavailableException('User service is unavailable');
    }
  }

  async invalidateTokens(userId: string): Promise<void> {
    try {
      await axios.patch(`${this.userServiceUrl}/api/users/${userId}/token-version`);
    } catch (error: any) {
      if (error.response?.status === 404) return;
      throw new ServiceUnavailableException('User service is unavailable');
    }
  }

  async listManagedStaff(): Promise<any> { return (await axios.get(`${this.userServiceUrl}/api/users/admin/managed-staff`)).data; }
  async findManagedStaffById(id: string): Promise<any> { return (await axios.get(`${this.userServiceUrl}/api/users/admin/managed-staff/${id}`)).data; }
  async createManagedStaff(payload: AdminUserPayload): Promise<any> { return (await axios.post(`${this.userServiceUrl}/api/users/admin/managed-staff`, payload)).data; }
  async updateManagedStaff(id: string, payload: AdminUserPayload): Promise<any> { return (await axios.patch(`${this.userServiceUrl}/api/users/admin/managed-staff/${id}`, payload)).data; }
  async updateManagedStaffStatus(id: string, payload: AdminUserPayload): Promise<any> { return (await axios.patch(`${this.userServiceUrl}/api/users/admin/managed-staff/${id}/status`, payload)).data; }
  async availableOperationalPermissions(): Promise<any> { return (await axios.get(`${this.userServiceUrl}/api/users/admin/permissions`)).data; }
  async getManagedStaffPermissions(id: string): Promise<any> { return (await axios.get(`${this.userServiceUrl}/api/users/admin/managed-staff/${id}/permissions`)).data; }
  async replaceManagedStaffPermissions(id: string, payload: { permissions: string[] }): Promise<any> { return (await axios.patch(`${this.userServiceUrl}/api/users/admin/managed-staff/${id}/permissions`, payload)).data; }
}
