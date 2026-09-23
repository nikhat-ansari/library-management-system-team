import { Controller, Get, Headers, Req, HttpException, HttpStatus, UnauthorizedException } from '@nestjs/common';
import { ApiTags, ApiBearerAuth, ApiOperation, ApiResponse, ApiUnauthorizedResponse, ApiForbiddenResponse } from '@nestjs/swagger';
import { ReferenceDataClient } from './reference-data.client';
import { Request } from 'express';
import axios from 'axios';

@ApiTags('reference-data')
@ApiBearerAuth()
@Controller()
export class ReferenceDataController {
  constructor(private readonly referenceDataClient: ReferenceDataClient) {}

  private async call(request: () => Promise<unknown>) {
    try {
      return await request();
    } catch (error) {
      if (axios.isAxiosError(error)) throw new HttpException(error.response?.data?.message ?? 'Service unavailable', error.response?.status ?? HttpStatus.SERVICE_UNAVAILABLE);
      throw error;
    }
  }

  @Get('categories')
  @ApiOperation({ summary: 'List categories' })
  @ApiResponse({ status: 200, description: 'List of categories' })
  @ApiUnauthorizedResponse({ description: 'Unauthorized' })
  @ApiForbiddenResponse({ description: 'Forbidden' })
  async getCategories(@Headers('authorization') auth?: string) {
    if (!auth) throw new UnauthorizedException('Missing access token');
    return this.call(() => this.referenceDataClient.getCategories(auth));
  }

  @Get('authors')
  @ApiOperation({ summary: 'List authors' })
  @ApiResponse({ status: 200, description: 'List of authors' })
  @ApiUnauthorizedResponse({ description: 'Unauthorized' })
  @ApiForbiddenResponse({ description: 'Forbidden' })
  async getAuthors(@Headers('authorization') auth?: string) {
    if (!auth) throw new UnauthorizedException('Missing access token');
    return this.call(() => this.referenceDataClient.getAuthors(auth));
  }

  @Get('publishers')
  @ApiOperation({ summary: 'List publishers' })
  @ApiResponse({ status: 200, description: 'List of publishers' })
  @ApiUnauthorizedResponse({ description: 'Unauthorized' })
  @ApiForbiddenResponse({ description: 'Forbidden' })
  async getPublishers(@Headers('authorization') auth?: string) {
    if (!auth) throw new UnauthorizedException('Missing access token');
    return this.call(() => this.referenceDataClient.getPublishers(auth));
  }
}
