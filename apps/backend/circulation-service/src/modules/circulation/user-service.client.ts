import { Injectable, ServiceUnavailableException, NotFoundException } from '@nestjs/common';
import axios from 'axios';

interface UserData {
  id?: string;
  _id?: string;
  email: string;
  name: string;
  role: string;
  status?: 'active' | 'inactive';
  memberType?: string;
}

interface SystemSettings {
  loanPeriod: number;
  borrowingLimit: number;
  fineRate: number;
  fineCap: number;
}

@Injectable()
export class UserServiceClient {
  private userServiceUrl = process.env.USER_SERVICE_URL ?? 'http://localhost:3002';

  async findMemberById(userId: string): Promise<UserData> {
    try {
      const response = await axios.get<UserData>(`${this.userServiceUrl}/api/users/${userId}`);
      return response.data;
    } catch (error: any) {
      if (error.response?.status === 404) throw new NotFoundException('Member not found');
      throw new ServiceUnavailableException('User service is unavailable');
    }
  }

  async getSystemSettings(): Promise<SystemSettings> {
    try {
      const response = await axios.get<SystemSettings>(`${this.userServiceUrl}/api/admin/settings`);
      return response.data;
    } catch (error) {
      throw new ServiceUnavailableException('System settings unavailable');
    }
  }

  async getHolidays(): Promise<string[]> {
    try {
      const response = await axios.get<{ holidays: { date: string }[] }>(`${this.userServiceUrl}/api/admin/holidays`);
      return response.data.holidays.map(h => h.date);
    } catch (error) {
      throw new ServiceUnavailableException('Holidays unavailable');
    }
  }
}
