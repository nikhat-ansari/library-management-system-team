import { Injectable } from '@nestjs/common'; import axios from 'axios';
@Injectable()
export class AdminPermissionsClient {
  private readonly authServiceUrl = process.env.AUTH_SERVICE_URL ?? 'http://localhost:3001';
  private options(authorization: string) { return { headers: { Authorization: authorization } }; }
  available(authorization: string) { return axios.get(`${this.authServiceUrl}/api/admin/permissions`, this.options(authorization)).then((result) => result.data); }
  getUserPermissions(id: string, authorization: string) { return axios.get(`${this.authServiceUrl}/api/admin/users/${id}/permissions`, this.options(authorization)).then((result) => result.data); }
  replaceUserPermissions(id: string, body: unknown, authorization: string) { return axios.put(`${this.authServiceUrl}/api/admin/users/${id}/permissions`, body, this.options(authorization)).then((result) => result.data); }
}
