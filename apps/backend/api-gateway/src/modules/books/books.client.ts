import { Injectable, InternalServerErrorException, HttpException } from '@nestjs/common';
import axios from 'axios';
import * as FormData from 'form-data';

@Injectable()
export class BooksClient {
  private readonly catalogServiceUrl = process.env.CATALOG_SERVICE_URL ?? 'http://localhost:3003';

  async findAll(authorization: string, query: any): Promise<unknown> {
    try {
      const response = await axios.get(`${this.catalogServiceUrl}/api/books`, { 
        headers: { Authorization: authorization },
        params: query
      });
      return response.data;
    } catch (error: any) {
      this.handleError(error);
    }
  }

  async findOne(authorization: string, id: string): Promise<unknown> {
    try {
      const response = await axios.get(`${this.catalogServiceUrl}/api/books/${id}`, { headers: { Authorization: authorization } });
      return response.data;
    } catch (error: any) {
      this.handleError(error);
    }
  }

  async create(authorization: string, data: any): Promise<unknown> {
    try {
      const response = await axios.post(`${this.catalogServiceUrl}/api/books`, data, { headers: { Authorization: authorization } });
      return response.data;
    } catch (error: any) {
      this.handleError(error);
    }
  }

  async update(authorization: string, id: string, data: any): Promise<unknown> {
    try {
      const response = await axios.patch(`${this.catalogServiceUrl}/api/books/${id}`, data, { headers: { Authorization: authorization } });
      return response.data;
    } catch (error: any) {
      this.handleError(error);
    }
  }

  async exportCatalogue(authorization: string): Promise<unknown> {
    try {
      const response = await axios.get(`${this.catalogServiceUrl}/api/books/export`, { headers: { Authorization: authorization } });
      return response.data;
    } catch (error: any) {
      this.handleError(error);
    }
  }

  async importBulk(authorization: string, file: Express.Multer.File): Promise<unknown> {
    try {
      const formData = new FormData();
      formData.append('file', file.buffer, file.originalname);

      const response = await axios.post(`${this.catalogServiceUrl}/api/books/import`, formData, {
        headers: {
          Authorization: authorization,
          ...formData.getHeaders(),
        },
      });
      return response.data;
    } catch (error: any) {
      this.handleError(error);
    }
  }

  async suggestMetadata(authorization: string, data: { title: string; isbn?: string }): Promise<unknown> {
    try {
      const response = await axios.post(`${this.catalogServiceUrl}/api/books/ai/metadata-suggestion`, data, { headers: { Authorization: authorization } });
      return response.data;
    } catch (error: any) {
      this.handleError(error);
    }
  }

  async checkDuplicates(authorization: string, data: { title: string; isbn: string }): Promise<unknown> {
    try {
      const response = await axios.post(`${this.catalogServiceUrl}/api/books/ai/duplicate-check`, data, { headers: { Authorization: authorization } });
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
