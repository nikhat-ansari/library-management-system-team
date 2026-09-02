import { Controller, Get, Patch, Post, Query, Body, Param, BadRequestException, NotFoundException } from '@nestjs/common';
import { ApiTags } from '@nestjs/swagger';
import { UsersService } from './users.service';
import { UserDto } from './dto/user.dto';

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

  @Get(':id/auth-state')
  async getAuthState(@Param('id') userId: string): Promise<{ id: string; role: string; status: 'active' | 'inactive'; tokenVersion: number }> {
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
