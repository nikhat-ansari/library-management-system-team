import { Controller, Get, Patch, Post, Query, Body, Param, BadRequestException, NotFoundException } from '@nestjs/common';
import { ApiTags } from '@nestjs/swagger';
import { UsersService } from './users.service';
import { UserDto } from './dto/user.dto';
import { AdminUserResponseDto, CreateAdminUserDto, UpdateAdminUserDto, UpdateUserStatusDto } from './dto/admin-user.dto';
import { ReplacePermissionsDto } from './dto/permissions.dto';

@ApiTags('users')
@Controller('users')
export class UsersController {
  constructor(private readonly usersService: UsersService) {}

  @Get('by-email')
  async findByEmail(@Query('email') email: string): Promise<any> {
    if (!email) {
      throw new BadRequestException('Email is required');
    }
    const user = await this.usersService.findByEmail(email);
    if (!user) {
      throw new BadRequestException('User not found');
    }
    // Return the full user document (including passwordHash) for auth-service
    return {
      id: user._id.toString(),
      email: user.email,
      name: user.name,
      role: user.role,
      status: user.status,
      passwordHash: user.passwordHash,
      lastLogin: user.lastLogin,
    };
  }

  @Get('dashboard/member-counts')
  async getMemberDashboardCounts(): Promise<{ total: number; active: number }> {
    return this.usersService.getMemberDashboardCounts();
  }

  @Get('admin/managed-staff')
  async findManagedStaff(): Promise<{ users: AdminUserResponseDto[] }> {
    return { users: await this.usersService.findManagedStaff() };
  }

  @Post('admin/managed-staff')
  async createManagedStaff(@Body() dto: CreateAdminUserDto): Promise<AdminUserResponseDto> {
    return this.usersService.createManagedStaff(dto);
  }

  @Get('admin/managed-staff/:id')
  async findManagedStaffById(@Param('id') id: string): Promise<AdminUserResponseDto> {
    if (!/^[a-fA-F0-9]{24}$/.test(id)) throw new BadRequestException('Invalid user ID');
    const user = await this.usersService.findManagedStaffById(id);
    if (!user) throw new NotFoundException('User not found');
    return user;
  }

  @Patch('admin/managed-staff/:id')
  async updateManagedStaff(@Param('id') id: string, @Body() dto: UpdateAdminUserDto): Promise<AdminUserResponseDto> {
    if (!/^[a-fA-F0-9]{24}$/.test(id)) throw new BadRequestException('Invalid user ID');
    const user = await this.usersService.updateManagedStaff(id, dto);
    if (!user) throw new NotFoundException('User not found');
    return user;
  }

  @Patch('admin/managed-staff/:id/status')
  async updateManagedStaffStatus(@Param('id') id: string, @Body() dto: UpdateUserStatusDto): Promise<AdminUserResponseDto> {
    if (!/^[a-fA-F0-9]{24}$/.test(id)) throw new BadRequestException('Invalid user ID');
    const user = await this.usersService.updateManagedStaffStatus(id, dto);
    if (!user) throw new NotFoundException('User not found');
    return user;
  }

  @Get('admin/permissions')
  availablePermissions() { return { permissions: this.usersService.availablePermissions() }; }

  @Get('admin/managed-staff/:id/permissions')
  async getManagedStaffPermissions(@Param('id') id: string) {
    if (!/^[a-fA-F0-9]{24}$/.test(id)) throw new BadRequestException('Invalid user ID');
    const permissions = await this.usersService.getManagedStaffPermissions(id);
    if (!permissions) throw new NotFoundException('Librarian/staff user not found');
    return { userId: id, permissions };
  }

  @Patch('admin/managed-staff/:id/permissions')
  async replaceManagedStaffPermissions(@Param('id') id: string, @Body() dto: ReplacePermissionsDto) {
    if (!/^[a-fA-F0-9]{24}$/.test(id)) throw new BadRequestException('Invalid user ID');
    const user = await this.usersService.replaceManagedStaffPermissions(id, dto.permissions);
    if (!user) throw new NotFoundException('Librarian/staff user not found');
    return { userId: id, ...user };
  }

  @Get(':id/auth-state')
  async getAuthState(@Param('id') userId: string): Promise<{ id: string; role: string; status: 'active' | 'inactive'; tokenVersion: number; permissions: string[] }> {
    const user = await this.usersService.getAuthState(userId);
    if (!user) throw new NotFoundException('User not found');
    return user;
  }

  @Get(':id')
  async findById(@Param('id') userId: string): Promise<UserDto> {
    const user = await this.usersService.findById(userId);
    if (!user) throw new NotFoundException('User not found');
    return user;
  }

  @Post('validate-password')
  async validatePassword(@Body() body: { plainPassword: string; hash: string }): Promise<{ valid: boolean }> {
    const isValid = await this.usersService.validatePassword(body.plainPassword, body.hash);
    return { valid: isValid };
  }

  @Patch(':id/last-login')
  async updateLastLogin(@Param('id') userId: string): Promise<{ message: string }> {
    await this.usersService.updateLastLogin(userId);
    return { message: 'Last login updated' };
  }

  @Patch(':id/token-version')
  async invalidateTokens(@Param('id') userId: string): Promise<{ message: string }> {
    if (!(await this.usersService.invalidateTokens(userId))) throw new NotFoundException('User not found');
    return { message: 'Tokens invalidated' };
  }
}
