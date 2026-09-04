import { Injectable } from '@nestjs/common';
import axios from 'axios';

@Injectable()
export class AdminDashboardClient {
  private readonly authServiceUrl = process.env.AUTH_SERVICE_URL ?? 'http://localhost:3001';

  async getDashboard(authorization: string): Promise<unknown> {
    const response = await axios.get(`${this.authServiceUrl}/api/admin/dashboard`, { headers: { Authorization: authorization } });
    return response.data;
  }
}
