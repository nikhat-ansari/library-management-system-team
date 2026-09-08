import { Body, Controller, Get, HttpCode, HttpStatus, Param, Put, UseGuards } from '@nestjs/common';
import { ApiBadRequestResponse, ApiBearerAuth, ApiForbiddenResponse, ApiNotFoundResponse, ApiOkResponse, ApiOperation, ApiParam, ApiTags, ApiUnauthorizedResponse } from '@nestjs/swagger';
import { JwtGuard } from '../../common/guards/jwt.guard'; import { RolesGuard } from '../../common/guards/roles.guard'; import { Roles } from '../../common/decorators/roles.decorator';
import { AdminPermissionsService } from './admin-permissions.service'; import { ReplacePermissionsDto } from './dto/permissions.dto';
@ApiTags('admin-permissions') @ApiBearerAuth() @Controller('admin') @UseGuards(JwtGuard, RolesGuard) @Roles('ADMIN')
export class AdminPermissionsController {
  constructor(private readonly service: AdminPermissionsService) {}
  @Get('permissions') @ApiOperation({ summary: 'List assignable operational permissions', description: 'Requires an authenticated ADMIN user.' }) @ApiOkResponse() @ApiUnauthorizedResponse() @ApiForbiddenResponse() available() { return this.service.available(); }
  @Get('users/:id/permissions') @ApiOperation({ summary: 'Get a librarian/staff permission set', description: 'Requires an authenticated ADMIN user.' }) @ApiParam({ name: 'id' }) @ApiOkResponse() @ApiBadRequestResponse() @ApiNotFoundResponse() @ApiUnauthorizedResponse() @ApiForbiddenResponse() getUserPermissions(@Param('id') id: string) { return this.service.getUserPermissions(id); }
  @Put('users/:id/permissions') @HttpCode(HttpStatus.OK) @ApiOperation({ summary: 'Replace a librarian/staff permission set', description: 'Requires an authenticated ADMIN user.' }) @ApiParam({ name: 'id' }) @ApiOkResponse() @ApiBadRequestResponse() @ApiNotFoundResponse() @ApiUnauthorizedResponse() @ApiForbiddenResponse() replaceUserPermissions(@Param('id') id: string, @Body() dto: ReplacePermissionsDto) { return this.service.replaceUserPermissions(id, [...new Set(dto.permissions)]); }
}
