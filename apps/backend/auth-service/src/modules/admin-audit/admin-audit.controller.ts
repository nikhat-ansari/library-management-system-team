import { Controller, Get, Headers, HttpException, HttpStatus, Query, ServiceUnavailableException, UseGuards } from '@nestjs/common';
import { ApiBearerAuth, ApiForbiddenResponse, ApiOkResponse, ApiTags, ApiUnauthorizedResponse } from '@nestjs/swagger';
import axios from 'axios';
import { CurrentUser } from '../../common/decorators/auth-user.decorator';
import { Roles } from '../../common/decorators/roles.decorator';
import { JwtGuard } from '../../common/guards/jwt.guard';
import { RolesGuard } from '../../common/guards/roles.guard';

@ApiTags('admin-audit-logs') @ApiBearerAuth() @Controller('admin/audit-logs') @UseGuards(JwtGuard, RolesGuard) @Roles('ADMIN')
export class AdminAuditController {
  private readonly url = process.env.USER_SERVICE_URL ?? 'http://localhost:3002';

  @Get()
  @ApiOkResponse() @ApiUnauthorizedResponse() @ApiForbiddenResponse()
  async list(@Query() query: Record<string, string | undefined>, @CurrentUser() user: { userId: string }, @Headers('authorization') authorization?: string) {
    try {
      return (await axios.get(`${this.url}/api/admin/audit-logs`, { params: query, headers: { 'x-audit-actor-id': user.userId, Authorization: authorization ?? '' } })).data;
    } catch (error) {
      if (axios.isAxiosError(error)) throw new HttpException(error.response?.data?.message ?? 'User service unavailable', error.response?.status ?? HttpStatus.SERVICE_UNAVAILABLE);
      throw new ServiceUnavailableException('User service is unavailable');
    }
  }
}
