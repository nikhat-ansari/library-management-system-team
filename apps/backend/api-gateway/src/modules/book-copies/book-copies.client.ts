import { Injectable, InternalServerErrorException, HttpException } from '@nestjs/common';
import axios from 'axios';

@Injectable()
export class BookCopiesClient {
  private readonly catalogServiceUrl = process.env.CATALOG_SERVICE_URL ?? 'http://localhost:3003';

  async findByBookId(authorization: string, bookId: string): Promise<unknown> {
    try {
      const response = await axios.get(`${this.catalogServiceUrl}/api/books/${bookId}/copies`, { headers: { Authorization: authorization } });
      return response.data;
    } catch (error: any) {
      this.handleError(error);
    }
  }

  async create(authorization: string, userId: string, bookId: string, data: any): Promise<unknown> {
    try {
      const response = await axios.post(`${this.catalogServiceUrl}/api/books/${bookId}/copies`, data, { headers: { Authorization: authorization, 'x-user-id': userId } });
      return response.data;
    } catch (error: any) {
      this.handleError(error);
    }
  }

  async update(authorization: string, userId: string, id: string, data: any): Promise<unknown> {
    try {
      const response = await axios.patch(`${this.catalogServiceUrl}/api/book-copies/${id}`, data, { headers: { Authorization: authorization, 'x-user-id': userId } });
      return response.data;
    } catch (error: any) {
      this.handleError(error);
    }
  }

  async updateStatus(authorization: string, userId: string, id: string, data: any): Promise<unknown> {
    try {
      const response = await axios.patch(`${this.catalogServiceUrl}/api/book-copies/${id}/status`, data, { headers: { Authorization: authorization, 'x-user-id': userId } });
      return response.data;
    } catch (error: any) {
      this.handleError(error);
    }
  }

  async reportLostDamaged(authorization: string, userId: string, id: string, data: any): Promise<unknown> {
    try {
      const response = await axios.post(`${this.catalogServiceUrl}/api/book-copies/${id}/lost-damaged`, data, { headers: { Authorization: authorization, 'x-user-id': userId } });
      return response.data;
    } catch (error: any) {
      this.handleError(error);
    }
  }

  async reportFound(authorization: string, userId: string, id: string, data: any): Promise<unknown> {
    try {
      const response = await axios.post(`${this.catalogServiceUrl}/api/book-copies/${id}/found`, data, { headers: { Authorization: authorization, 'x-user-id': userId } });
      return response.data;
    } catch (error: any) {
      this.handleError(error);
    }
  }

  async archive(authorization: string, userId: string, id: string): Promise<unknown> {
    try {
      const response = await axios.delete(`${this.catalogServiceUrl}/api/book-copies/${id}`, { headers: { Authorization: authorization, 'x-user-id': userId } });
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
