import { Injectable, InternalServerErrorException, HttpException } from '@nestjs/common';
import axios from 'axios';

@Injectable()
export class ReferenceDataClient {
  private readonly catalogServiceUrl = process.env.CATALOG_SERVICE_URL ?? 'http://localhost:3003';

  async getCategories(authorization: string): Promise<unknown> {
    try {
      const response = await axios.get(`${this.catalogServiceUrl}/api/categories`, { headers: { Authorization: authorization } });
      return response.data;
    } catch (error: any) {
      this.handleError(error);
    }
  }

  async getAuthors(authorization: string): Promise<unknown> {
    try {
      const response = await axios.get(`${this.catalogServiceUrl}/api/authors`, { headers: { Authorization: authorization } });
      return response.data;
    } catch (error: any) {
      this.handleError(error);
    }
  }

  async getPublishers(authorization: string): Promise<unknown> {
    try {
      const response = await axios.get(`${this.catalogServiceUrl}/api/publishers`, { headers: { Authorization: authorization } });
      return response.data;
    } catch (error: any) {
      this.handleError(error);
    }
  }

  private handleError(error: any): never {
    if (error.response) {
      throw new HttpException(
        error.response.data?.message || 'Catalog service error',
        error.response.status,
      );
    }
    throw new InternalServerErrorException('Failed to communicate with catalog service');
  }
}
