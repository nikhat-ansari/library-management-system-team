import { Body, Controller, Get, Headers, HttpException, HttpStatus, Param, Put, UnauthorizedException } from '@nestjs/common';
import { ApiBadRequestResponse, ApiBearerAuth, ApiForbiddenResponse, ApiNotFoundResponse, ApiOkResponse, ApiOperation, ApiParam, ApiTags, ApiUnauthorizedResponse } from '@nestjs/swagger';
import axios from 'axios'; import { AdminPermissionsClient } from './admin-permissions.client'; import { ReplacePermissionsDto } from './dto/permissions.dto';
@ApiTags('admin-permissions') @ApiBearerAuth() @Controller('admin')
export class AdminPermissionsController {
  constructor(private readonly client: AdminPermissionsClient) {}
  private authorization(value?: string) { if (!value) throw new UnauthorizedException('Missing access token'); return value; }
  private async request(call: () => Promise<unknown>) { try { return await call(); } catch (error: unknown) { if (axios.isAxiosError(error)) throw new HttpException(error.response?.data?.message ?? 'Authentication service is unavailable', error.response?.status ?? HttpStatus.SERVICE_UNAVAILABLE); throw error; } }
  @Get('permissions') @ApiOperation({ summary: 'List assignable operational permissions (ADMIN only)' }) @ApiOkResponse() @ApiUnauthorizedResponse() @ApiForbiddenResponse() available(@Headers('authorization') authorization?: string) { return this.request(() => this.client.available(this.authorization(authorization))); }
  @Get('users/:id/permissions') @ApiOperation({ summary: 'Get a librarian/staff permission set (ADMIN only)' }) @ApiParam({ name: 'id' }) @ApiOkResponse() @ApiBadRequestResponse() @ApiNotFoundResponse() @ApiUnauthorizedResponse() @ApiForbiddenResponse() getUserPermissions(@Param('id') id: string, @Headers('authorization') authorization?: string) { return this.request(() => this.client.getUserPermissions(id, this.authorization(authorization))); }
  @Put('users/:id/permissions') @ApiOperation({ summary: 'Replace a librarian/staff permission set (ADMIN only)' }) @ApiParam({ name: 'id' }) @ApiOkResponse() @ApiBadRequestResponse() @ApiNotFoundResponse() @ApiUnauthorizedResponse() @ApiForbiddenResponse() replaceUserPermissions(@Param('id') id: string, @Body() body: ReplacePermissionsDto, @Headers('authorization') authorization?: string) { return this.request(() => this.client.replaceUserPermissions(id, body, this.authorization(authorization))); }
}
