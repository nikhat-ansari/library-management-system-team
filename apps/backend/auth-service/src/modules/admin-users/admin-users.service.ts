import { HttpException, Injectable, ServiceUnavailableException } from '@nestjs/common';
import axios from 'axios';
import { UserServiceClient } from '../auth/user-service.client';
import { AdminUserResponseDto, CreateAdminUserDto, UpdateAdminUserDto, UpdateUserStatusDto } from './dto/admin-user.dto';

@Injectable()
export class AdminUsersService {
  constructor(private readonly users: UserServiceClient) {}

  async list(): Promise<{ users: AdminUserResponseDto[] }> { return this.call(() => this.users.listManagedStaff()); }
  async findOne(id: string): Promise<AdminUserResponseDto> { return this.call(() => this.users.findManagedStaffById(id)); }
  async create(dto: CreateAdminUserDto): Promise<AdminUserResponseDto> { return this.call(() => this.users.createManagedStaff(dto)); }
  async update(id: string, dto: UpdateAdminUserDto): Promise<AdminUserResponseDto> { return this.call(() => this.users.updateManagedStaff(id, dto)); }
  async updateStatus(id: string, dto: UpdateUserStatusDto): Promise<AdminUserResponseDto> { return this.call(() => this.users.updateManagedStaffStatus(id, dto)); }

  private async call<T>(request: () => Promise<T>): Promise<T> {
    try { return await request(); }
    catch (error: unknown) {
      if (axios.isAxiosError(error) && error.response) {
        const message = error.response.data?.message ?? 'User service request failed';
        throw new HttpException(message, error.response.status);
      }
      throw new ServiceUnavailableException('User service is unavailable');
    }
  }
}
