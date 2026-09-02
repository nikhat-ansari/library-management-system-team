import { Injectable, BadRequestException, UnauthorizedException } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { LoginDto } from './dto/login.dto';
import { AuthResponseDto, AuthUserDto } from './dto/auth-response.dto';
import { UserServiceClient } from './user-service.client';

@Injectable()
export class AuthService {
  constructor(
    private readonly jwtService: JwtService,
    private readonly userServiceClient: UserServiceClient,
  ) {}

  async login(loginDto: LoginDto): Promise<AuthResponseDto> {
    const user = await this.userServiceClient.findByEmail(loginDto.email);

    if (!user) {
      throw new BadRequestException('Invalid email or password');
    }

    const isPasswordValid = await this.userServiceClient.validatePassword(
      loginDto.password,
      user.passwordHash,
    );

    if (!isPasswordValid) {
      throw new BadRequestException('Invalid email or password');
    }

    if (user.status !== 'active') {
      throw new BadRequestException('Invalid email or password');
    }

    const userId = user.id ?? user._id;
    if (!userId) throw new BadRequestException('Invalid email or password');

    // Update last login
    await this.userServiceClient.updateLastLogin(userId);

    // Generate JWT token
    const authState = await this.userServiceClient.getAuthState(userId);
    if (!authState || authState.status !== 'active') {
      throw new BadRequestException('Invalid email or password');
    }
    const payload = { sub: userId, role: user.role, tokenVersion: authState.tokenVersion };
    const accessToken = this.jwtService.sign(payload);

    const authUser: AuthUserDto = {
      id: userId,
      name: user.name,
      role: user.role,
    };

    return {
      accessToken,
      user: authUser,
    };
  }

  async verifyToken(token: string): Promise<{ sub: string; role: string } | null> {
    try {
      return this.jwtService.verify<{ sub: string; role: string }>(token);
    } catch {
      return null;
    }
  }

  async logout(userId: string): Promise<void> {
    await this.userServiceClient.invalidateTokens(userId);
  }

  async getCurrentUser(userId: string): Promise<unknown> {
    const user = await this.userServiceClient.findById(userId);
    if (!user) throw new UnauthorizedException('User no longer exists');
    return user;
  }
}

