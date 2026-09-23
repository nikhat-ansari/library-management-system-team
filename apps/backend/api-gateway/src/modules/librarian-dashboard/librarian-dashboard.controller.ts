import { Controller, Get, Headers, HttpException, HttpStatus, UnauthorizedException } from '@nestjs/common';
import { ApiBearerAuth, ApiForbiddenResponse, ApiOkResponse, ApiOperation, ApiServiceUnavailableResponse, ApiTags, ApiUnauthorizedResponse } from '@nestjs/swagger';
import axios from 'axios';
import { LibrarianDashboardClient } from './librarian-dashboard.client';

@ApiTags('librarian-dashboard')
@ApiBearerAuth()
@Controller('librarian/dashboard')
export class LibrarianDashboardController {
  constructor(private readonly dashboard: LibrarianDashboardClient) {}
  @Get()
  @ApiOperation({ summary: 'Proxy the librarian daily operational dashboard' })
  @ApiOkResponse({ description: 'Daily operational dashboard for a Librarian/Staff user.' })
  @ApiUnauthorizedResponse({ description: 'Missing or invalid access token.' })
  @ApiForbiddenResponse({ description: 'LIBRARIAN_STAFF role is required.' })
  @ApiServiceUnavailableResponse({ description: 'The operational database is unavailable.' })
  async getDashboard(@Headers('authorization') authorization?: string): Promise<unknown> {
    if (!authorization) throw new UnauthorizedException('Missing access token');
    try { return await this.dashboard.getDashboard(authorization); }
    catch (error: unknown) {
      if (axios.isAxiosError(error)) throw new HttpException(error.response?.data?.message ?? 'Authentication service is unavailable', error.response?.status ?? HttpStatus.SERVICE_UNAVAILABLE);
      throw error;
    }
  }
}
