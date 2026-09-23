import { Injectable, ServiceUnavailableException, HttpException } from '@nestjs/common';
import axios from 'axios';

@Injectable()
export class CirculationClient {
  private circulationServiceUrl = process.env.CIRCULATION_SERVICE_URL ?? 'http://localhost:3004';

  async issueBook(authorization: string, actorId: string, data: any): Promise<any> {
    try {
      const response = await axios.post(`${this.circulationServiceUrl}/api/internal/circulation/issue`, data, {
        headers: { Authorization: authorization, 'x-user-id': actorId }
      });
      return response.data;
    } catch (error: any) {
      if (error.response) throw new HttpException(error.response.data.message || error.response.data, error.response.status || 500);
      throw new ServiceUnavailableException('Circulation service is unavailable');
    }
  }

  async returnBook(authorization: string, actorId: string, data: any): Promise<any> {
    try {
      const response = await axios.post(`${this.circulationServiceUrl}/api/internal/circulation/return`, data, {
        headers: { Authorization: authorization, 'x-user-id': actorId }
      });
      return response.data;
    } catch (error: any) {
      if (error.response) throw new HttpException(error.response.data.message || error.response.data, error.response.status || 500);
      throw new ServiceUnavailableException('Circulation service is unavailable');
    }
  }

  async renewBook(authorization: string, actorId: string, data: any): Promise<any> {
    try {
      const response = await axios.post(`${this.circulationServiceUrl}/api/internal/circulation/renew`, data, {
        headers: { Authorization: authorization, 'x-user-id': actorId }
      });
      return response.data;
    } catch (error: any) {
      if (error.response) throw new HttpException(error.response.data.message || error.response.data, error.response.status || 500);
      throw new ServiceUnavailableException('Circulation service is unavailable');
    }
  }

  async getMemberActiveLoans(memberId: string): Promise<any> {
    try {
      const response = await axios.get(`${this.circulationServiceUrl}/api/internal/circulation/member/${memberId}/active`);
      return response.data;
    } catch (error: any) {
      if (error.response) throw new HttpException(error.response.data.message || error.response.data, error.response.status || 500);
      throw new ServiceUnavailableException('Circulation service is unavailable');
    }
  }
}
