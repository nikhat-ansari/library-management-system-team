import { Controller, Get, Headers, HttpException, HttpStatus, UnauthorizedException } from '@nestjs/common';
import { ApiBearerAuth, ApiForbiddenResponse, ApiOkResponse, ApiOperation, ApiTags, ApiUnauthorizedResponse } from '@nestjs/swagger';
import axios from 'axios';
import { AdminDashboardClient } from './admin-dashboard.client';

@ApiTags('admin-dashboard')
@ApiBearerAuth()
@Controller('admin/dashboard')
export class AdminDashboardController {
  constructor(private readonly dashboardClient: AdminDashboardClient) {}

  @Get()
  @ApiOperation({ summary: 'Get the read-only Admin Dashboard snapshot', description: 'Requires an authenticated ADMIN user.' })
  @ApiOkResponse({
    description: 'Read-only Admin Dashboard metric snapshot',
    schema: {
      type: 'object',
      required: ['totalBooks', 'totalMembers', 'issuedBooks', 'overdueBooks', 'fineSummary', 'reservationSummary', 'seatUtilization', 'managementSummary', 'trendAlerts', 'unavailableDependencies'],
      properties: {
        totalBooks: { type: 'number' }, totalMembers: { type: 'number' }, issuedBooks: { type: 'number', nullable: true }, overdueBooks: { type: 'number', nullable: true },
        fineSummary: { type: 'object', nullable: true, properties: { outstandingAmount: { type: 'number' }, pendingPayments: { type: 'number' } }, required: ['outstandingAmount', 'pendingPayments'] },
        reservationSummary: { type: 'object', nullable: true, properties: { pending: { type: 'number' }, readyForPickup: { type: 'number' } }, required: ['pending', 'readyForPickup'] },
        seatUtilization: { type: 'object', nullable: true, properties: { occupied: { type: 'number' }, total: { type: 'number' }, percentage: { type: 'number' } }, required: ['occupied', 'total', 'percentage'] },
        managementSummary: { type: 'object', nullable: true, properties: { content: { type: 'string' }, generatedAt: { type: 'string', format: 'date-time' } }, required: ['content', 'generatedAt'] },
        trendAlerts: { type: 'array', items: { type: 'object', properties: { id: { type: 'string' }, title: { type: 'string' }, description: { type: 'string' }, severity: { type: 'string', enum: ['info', 'warning', 'critical'] } }, required: ['id', 'title', 'description', 'severity'] } },
        unavailableDependencies: { type: 'array', items: { type: 'string' } },
      },
    },
  })
  @ApiUnauthorizedResponse({ description: 'Missing or invalid access token' })
  @ApiForbiddenResponse({ description: 'Admin role is required' })
  async getDashboard(@Headers('authorization') authorization?: string): Promise<unknown> {
    if (!authorization) throw new UnauthorizedException('Missing access token');
    try {
      return await this.dashboardClient.getDashboard(authorization);
    } catch (error: unknown) {
      if (axios.isAxiosError(error)) {
        throw new HttpException(error.response?.data?.message ?? 'Authentication service is unavailable', error.response?.status ?? HttpStatus.SERVICE_UNAVAILABLE);
      }
      throw error;
    }
  }
}
