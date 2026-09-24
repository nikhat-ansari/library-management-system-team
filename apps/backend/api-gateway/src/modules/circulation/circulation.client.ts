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

  async getSystemSettings(): Promise<{ fineRate: number; fineCap: number }> {
    try {
      // Fetch settings from user-service since it manages system_settings
      const userServiceUrl = process.env.USER_SERVICE_URL ?? 'http://localhost:3002';
      const response = await axios.get(`${userServiceUrl}/api/admin/settings`);
      return response.data;
    } catch (error) {
      throw new ServiceUnavailableException('System settings unavailable');
    }
  }

  async payFine(actorId: string, transactionId: string, amount: number) {
    try {
      const response = await axios.post(`${this.circulationServiceUrl}/api/internal/circulation/fine/${transactionId}/pay`, { amount }, { headers: { 'x-user-id': actorId } });
      return response.data;
    } catch (error: any) {
      throw new ServiceUnavailableException('Circulation service unavailable');
    }
  }

  async waiveFine(actorId: string, transactionId: string, amount: number, reason: string) {
    try {
      const response = await axios.post(`${this.circulationServiceUrl}/api/internal/circulation/fine/${transactionId}/waive`, { amount, reason }, { headers: { 'x-user-id': actorId } });
      return response.data;
    } catch (error: any) {
      throw new ServiceUnavailableException('Circulation service unavailable');
    }
  }
}
