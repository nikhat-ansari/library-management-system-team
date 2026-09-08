import { HttpException, Injectable, ServiceUnavailableException } from '@nestjs/common';
import axios from 'axios';
import { UserServiceClient } from '../auth/user-service.client';
@Injectable()
export class AdminPermissionsService {
  constructor(private readonly users: UserServiceClient) {}
  available() { return this.call(() => this.users.availableOperationalPermissions()); }
  getUserPermissions(id: string) { return this.call(() => this.users.getManagedStaffPermissions(id)); }
  replaceUserPermissions(id: string, permissions: string[]) { return this.call(() => this.users.replaceManagedStaffPermissions(id, { permissions })); }
  private async call<T>(request: () => Promise<T>): Promise<T> { try { return await request(); } catch (error: unknown) { if (axios.isAxiosError(error) && error.response) throw new HttpException(error.response.data?.message ?? 'User service request failed', error.response.status); throw new ServiceUnavailableException('User service is unavailable'); } }
}
