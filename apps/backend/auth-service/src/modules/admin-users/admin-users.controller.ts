import { Body, Controller, Get, HttpCode, HttpStatus, Param, Patch, Post, UseGuards } from '@nestjs/common';
import { ApiBadRequestResponse, ApiBearerAuth, ApiConflictResponse, ApiCreatedResponse, ApiForbiddenResponse, ApiNotFoundResponse, ApiOkResponse, ApiOperation, ApiParam, ApiTags, ApiUnauthorizedResponse } from '@nestjs/swagger';
import { Roles } from '../../common/decorators/roles.decorator';
import { JwtGuard } from '../../common/guards/jwt.guard';
import { RolesGuard } from '../../common/guards/roles.guard';
import { AdminUsersService } from './admin-users.service';
import { AdminUserResponseDto, CreateAdminUserDto, UpdateAdminUserDto, UpdateUserStatusDto } from './dto/admin-user.dto';

@ApiTags('admin-users')
@ApiBearerAuth()
@Controller('admin/users')
@UseGuards(JwtGuard, RolesGuard)
@Roles('ADMIN')
export class AdminUsersController {
  constructor(private readonly service: AdminUsersService) {}

  @Get()
  @ApiOperation({ summary: 'List librarian/staff accounts', description: 'Requires an authenticated ADMIN user.' })
  @ApiOkResponse({ schema: { type: 'object', properties: { users: { type: 'array', items: { $ref: '#/components/schemas/AdminUserResponseDto' } } } } })
  @ApiUnauthorizedResponse({ description: 'Missing or invalid access token' }) @ApiForbiddenResponse({ description: 'ADMIN role is required' })
  list(): Promise<{ users: AdminUserResponseDto[] }> { return this.service.list(); }

  @Post()
  @ApiOperation({ summary: 'Create a librarian/staff account', description: 'Requires an authenticated ADMIN user. Credentials are generated securely and are never returned.' })
  @ApiCreatedResponse({ type: AdminUserResponseDto }) @ApiBadRequestResponse() @ApiConflictResponse({ description: 'Email already exists' }) @ApiUnauthorizedResponse() @ApiForbiddenResponse()
  create(@Body() dto: CreateAdminUserDto): Promise<AdminUserResponseDto> { return this.service.create(dto); }

  @Get(':id')
  @ApiOperation({ summary: 'Get a librarian/staff account', description: 'Requires an authenticated ADMIN user.' }) @ApiParam({ name: 'id' })
  @ApiOkResponse({ type: AdminUserResponseDto }) @ApiBadRequestResponse() @ApiNotFoundResponse() @ApiUnauthorizedResponse() @ApiForbiddenResponse()
  findOne(@Param('id') id: string): Promise<AdminUserResponseDto> { return this.service.findOne(id); }

  @Patch(':id')
  @ApiOperation({ summary: 'Update a librarian/staff account', description: 'Requires an authenticated ADMIN user.' }) @ApiParam({ name: 'id' })
  @ApiOkResponse({ type: AdminUserResponseDto }) @ApiBadRequestResponse() @ApiNotFoundResponse() @ApiConflictResponse() @ApiUnauthorizedResponse() @ApiForbiddenResponse()
  update(@Param('id') id: string, @Body() dto: UpdateAdminUserDto): Promise<AdminUserResponseDto> { return this.service.update(id, dto); }

  @Patch(':id/status')
  @HttpCode(HttpStatus.OK)
  @ApiOperation({ summary: 'Activate or deactivate a librarian/staff account', description: 'Requires an authenticated ADMIN user.' }) @ApiParam({ name: 'id' })
  @ApiOkResponse({ type: AdminUserResponseDto }) @ApiBadRequestResponse() @ApiNotFoundResponse() @ApiUnauthorizedResponse() @ApiForbiddenResponse()
  updateStatus(@Param('id') id: string, @Body() dto: UpdateUserStatusDto): Promise<AdminUserResponseDto> { return this.service.updateStatus(id, dto); }
}
