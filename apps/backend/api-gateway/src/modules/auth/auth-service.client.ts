import { Injectable } from '@nestjs/common';
import axios from 'axios';

@Injectable()
export class AuthServiceClient {
  private authServiceUrl = process.env.AUTH_SERVICE_URL ?? 'http://localhost:3001';

  async login(email: string, password: string): Promise<any> {
    const response = await axios.post(`${this.authServiceUrl}/api/auth/login`, {
      email,
      password,
    });
    return response.data;
  }

  async logout(authorization: string): Promise<any> {
    const response = await axios.post(`${this.authServiceUrl}/api/auth/logout`, undefined, {
      headers: { Authorization: authorization },
    });
    return response.data;
  }

  async getCurrentUser(token: string): Promise<any> {
    const response = await axios.get(`${this.authServiceUrl}/api/auth/me`, {
      headers: { Authorization: token },
    });
    return response.data;
  }
}
