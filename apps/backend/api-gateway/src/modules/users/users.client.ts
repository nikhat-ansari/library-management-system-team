import { Injectable, ServiceUnavailableException } from '@nestjs/common';
import axios from 'axios';

@Injectable()
export class UsersClient {
  private readonly userServiceUrl = process.env.USER_SERVICE_URL ?? 'http://localhost:3002';

  async searchMembers(authorization: string, query: string): Promise<unknown> {
    try {
      const response = await axios.get(`${this.userServiceUrl}/api/users/search/members`, {
        params: { q: query },
        headers: { Authorization: authorization }
      });
      return response.data;
    } catch (error: any) {
      if (error.response) throw error.response.data;
      throw new ServiceUnavailableException('User service is unavailable');
    }
  }
}
