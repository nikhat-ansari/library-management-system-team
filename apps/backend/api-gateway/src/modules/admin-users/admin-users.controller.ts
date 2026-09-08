import { Body, Controller, Get, Headers, HttpException, HttpStatus, Param, Patch, Post, UnauthorizedException } from '@nestjs/common';
import { ApiBadRequestResponse, ApiBearerAuth, ApiConflictResponse, ApiCreatedResponse, ApiForbiddenResponse, ApiNotFoundResponse, ApiOkResponse, ApiOperation, ApiParam, ApiTags, ApiUnauthorizedResponse } from '@nestjs/swagger';
import axios from 'axios';
import { AdminUsersClient } from './admin-users.client';
import { CreateAdminUserDto, UpdateAdminUserDto, UpdateUserStatusDto } from './dto/admin-user.dto';

@ApiTags('admin-users') @ApiBearerAuth() @Controller('admin/users')
export class AdminUsersController {
  constructor(private readonly client: AdminUsersClient) {}
  private authorization(value?: string): string { if (!value) throw new UnauthorizedException('Missing access token'); return value; }
  private async request(call: () => Promise<unknown>): Promise<unknown> { try { return await call(); } catch (error: unknown) { if (axios.isAxiosError(error)) throw new HttpException(error.response?.data?.message ?? 'Authentication service is unavailable', error.response?.status ?? HttpStatus.SERVICE_UNAVAILABLE); throw error; } }

  @Get() @ApiOperation({ summary: 'List librarian/staff accounts (ADMIN only)' }) @ApiOkResponse() @ApiUnauthorizedResponse() @ApiForbiddenResponse()
  list(@Headers('authorization') authorization?: string): Promise<unknown> { return this.request(() => this.client.list(this.authorization(authorization))); }
  @Post() @ApiOperation({ summary: 'Create a librarian/staff account (ADMIN only)' }) @ApiCreatedResponse() @ApiBadRequestResponse() @ApiConflictResponse() @ApiUnauthorizedResponse() @ApiForbiddenResponse()
  create(@Body() body: CreateAdminUserDto, @Headers('authorization') authorization?: string): Promise<unknown> { return this.request(() => this.client.create(body, this.authorization(authorization))); }
  @Get(':id') @ApiOperation({ summary: 'Get a librarian/staff account (ADMIN only)' }) @ApiParam({ name: 'id' }) @ApiOkResponse() @ApiBadRequestResponse() @ApiNotFoundResponse() @ApiUnauthorizedResponse() @ApiForbiddenResponse()
  findOne(@Param('id') id: string, @Headers('authorization') authorization?: string): Promise<unknown> { return this.request(() => this.client.findOne(id, this.authorization(authorization))); }
  @Patch(':id') @ApiOperation({ summary: 'Update a librarian/staff account (ADMIN only)' }) @ApiParam({ name: 'id' }) @ApiOkResponse() @ApiBadRequestResponse() @ApiNotFoundResponse() @ApiConflictResponse() @ApiUnauthorizedResponse() @ApiForbiddenResponse()
  update(@Param('id') id: string, @Body() body: UpdateAdminUserDto, @Headers('authorization') authorization?: string): Promise<unknown> { return this.request(() => this.client.update(id, body, this.authorization(authorization))); }
  @Patch(':id/status') @ApiOperation({ summary: 'Activate or deactivate a librarian/staff account (ADMIN only)' }) @ApiParam({ name: 'id' }) @ApiOkResponse() @ApiBadRequestResponse() @ApiNotFoundResponse() @ApiUnauthorizedResponse() @ApiForbiddenResponse()
  updateStatus(@Param('id') id: string, @Body() body: UpdateUserStatusDto, @Headers('authorization') authorization?: string): Promise<unknown> { return this.request(() => this.client.updateStatus(id, body, this.authorization(authorization))); }
}
