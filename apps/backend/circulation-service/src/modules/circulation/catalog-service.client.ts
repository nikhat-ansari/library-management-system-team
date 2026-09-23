import { Injectable, ServiceUnavailableException, NotFoundException, BadRequestException } from '@nestjs/common';
import axios from 'axios';

interface BookCopyData {
  _id: string;
  bookId: string;
  accessionNumber: string;
  barcode?: string;
  condition?: string;
  status: string;
  chargeHistory: any[];
}

@Injectable()
export class CatalogServiceClient {
  private catalogServiceUrl = process.env.CATALOG_SERVICE_URL ?? 'http://localhost:3003';

  async findCopyByBarcode(authorization: string, barcode: string): Promise<BookCopyData> {
    try {
      const response = await axios.get<BookCopyData>(`${this.catalogServiceUrl}/api/internal/book-copies/barcode/${barcode}`, {
        headers: { Authorization: authorization }
      });
      return response.data;
    } catch (error: any) {
      if (error.response?.status === 404) throw new NotFoundException('Book copy not found');
      throw new ServiceUnavailableException('Catalog service is unavailable');
    }
  }

  async findCopyById(authorization: string, copyId: string): Promise<BookCopyData> {
    try {
      const response = await axios.get<BookCopyData>(`${this.catalogServiceUrl}/api/internal/book-copies/${copyId}`, {
        headers: { Authorization: authorization }
      });
      return response.data;
    } catch (error: any) {
      if (error.response?.status === 404) throw new NotFoundException('Book copy not found');
      throw new ServiceUnavailableException('Catalog service is unavailable');
    }
  }

  async updateCopyStatus(authorization: string, actorId: string, copyId: string, status: string): Promise<void> {
    try {
      await axios.patch(`${this.catalogServiceUrl}/api/book-copies/${copyId}/status`, { status }, {
        headers: { Authorization: authorization, 'x-user-id': actorId }
      });
    } catch (error: any) {
      if (error.response?.status === 400) throw new BadRequestException(error.response.data.message || 'Cannot update copy status');
      throw new ServiceUnavailableException('Catalog service is unavailable');
    }
  }

  async reportLostDamaged(authorization: string, actorId: string, copyId: string, type: 'LOST' | 'DAMAGED', reason: string): Promise<void> {
    try {
      await axios.post(`${this.catalogServiceUrl}/api/book-copies/${copyId}/lost-damaged`, { type, reason }, {
        headers: { Authorization: authorization, 'x-user-id': actorId }
      });
    } catch (error: any) {
      if (error.response?.status === 400) throw new BadRequestException(error.response.data.message || 'Cannot report copy as lost/damaged');
      throw new ServiceUnavailableException('Catalog service is unavailable');
    }
  }
}
