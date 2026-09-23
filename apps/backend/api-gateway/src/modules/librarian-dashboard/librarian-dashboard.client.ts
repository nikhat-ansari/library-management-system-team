import { Injectable } from '@nestjs/common';
import axios from 'axios';

@Injectable()
export class LibrarianDashboardClient {
  private readonly authServiceUrl = process.env.AUTH_SERVICE_URL ?? 'http://localhost:3001';
  async getDashboard(authorization: string): Promise<unknown> {
    return (await axios.get(`${this.authServiceUrl}/api/librarian/dashboard`, { headers: { Authorization: authorization } })).data;
  }
}
