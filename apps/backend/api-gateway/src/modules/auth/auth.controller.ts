import { Controller, Post, Body, HttpCode, HttpStatus, BadRequestException, Headers, HttpException, UnauthorizedException } from '@nestjs/common';
import { ApiTags, ApiResponse } from '@nestjs/swagger';
import { AuthServiceClient } from './auth-service.client';
import { IsEmail, IsString, MinLength } from 'class-validator';

class LoginDto {
  @IsEmail()
  email!: string;

  @IsString()
  @MinLength(1)
  password!: string;
}

@ApiTags('auth')
@Controller('auth')
export class AuthController {
  constructor(private readonly authServiceClient: AuthServiceClient) {}

  @Post('login')
  @HttpCode(HttpStatus.OK)
  @ApiResponse({ status: 200, description: 'Login successful' })
  @ApiResponse({ status: 400, description: 'Invalid credentials' })
  async login(@Body() loginDto: LoginDto): Promise<any> {
    try {
      return await this.authServiceClient.login(loginDto.email, loginDto.password);
    } catch (error: any) {
      if (error.response?.status === 400) {
        throw new BadRequestException(error.response?.data?.message ?? 'Invalid credentials');
      }
      throw error;
    }
  }

  @Post('logout')
  @HttpCode(HttpStatus.OK)
  @ApiResponse({ status: 200, description: 'Logout successful' })
  async logout(@Headers('authorization') authorization?: string): Promise<any> {
    if (!authorization) throw new UnauthorizedException('Missing access token');
    try {
      return await this.authServiceClient.logout(authorization);
    } catch (error: any) {
      throw new HttpException(error.response?.data?.message ?? 'Authentication service is unavailable', error.response?.status ?? HttpStatus.SERVICE_UNAVAILABLE);
    }
  }
}
