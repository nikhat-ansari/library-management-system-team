import { Controller, Get, Headers, HttpException, HttpStatus, UnauthorizedException } from '@nestjs/common';
import { ApiBearerAuth, ApiResponse, ApiTags } from '@nestjs/swagger';
import { AuthServiceClient } from '../auth/auth-service.client';

@ApiTags('users')
@Controller('users')
export class UsersController {
  constructor(private readonly authServiceClient: AuthServiceClient) {}

  @Get('me')
  @ApiBearerAuth()
  @ApiResponse({ status: 200, description: 'Current authenticated user' })
  async getCurrentUser(@Headers('authorization') authorization?: string): Promise<unknown> {
    if (!authorization) throw new UnauthorizedException('Missing access token');
    try {
      return await this.authServiceClient.getCurrentUser(authorization);
    } catch (error: any) {
      throw new HttpException(error.response?.data?.message ?? 'Authentication service is unavailable', error.response?.status ?? HttpStatus.SERVICE_UNAVAILABLE);
    }
  }
}
