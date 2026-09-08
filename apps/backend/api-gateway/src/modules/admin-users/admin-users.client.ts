import { Injectable } from '@nestjs/common';
import axios from 'axios';

@Injectable()
export class AdminUsersClient {
  private readonly authServiceUrl = process.env.AUTH_SERVICE_URL ?? 'http://localhost:3001';
  private options(authorization: string) { return { headers: { Authorization: authorization } }; }
  async list(authorization: string): Promise<unknown> { return (await axios.get(`${this.authServiceUrl}/api/admin/users`, this.options(authorization))).data; }
  async findOne(id: string, authorization: string): Promise<unknown> { return (await axios.get(`${this.authServiceUrl}/api/admin/users/${id}`, this.options(authorization))).data; }
  async create(body: unknown, authorization: string): Promise<unknown> { return (await axios.post(`${this.authServiceUrl}/api/admin/users`, body, this.options(authorization))).data; }
  async update(id: string, body: unknown, authorization: string): Promise<unknown> { return (await axios.patch(`${this.authServiceUrl}/api/admin/users/${id}`, body, this.options(authorization))).data; }
  async updateStatus(id: string, body: unknown, authorization: string): Promise<unknown> { return (await axios.patch(`${this.authServiceUrl}/api/admin/users/${id}/status`, body, this.options(authorization))).data; }
}
