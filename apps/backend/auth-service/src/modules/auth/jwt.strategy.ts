import { Injectable, UnauthorizedException } from '@nestjs/common';
import { PassportStrategy } from '@nestjs/passport';
import { ExtractJwt, Strategy } from 'passport-jwt';
import { ConfigService } from '@nestjs/config';
import { UserServiceClient } from './user-service.client';

export interface JwtPayload {
  sub: string;
  role: string;
  tokenVersion: number;
}

@Injectable()
export class JwtStrategy extends PassportStrategy(Strategy) {
  constructor(configService: ConfigService, private readonly userServiceClient: UserServiceClient) {
    super({
      jwtFromRequest: ExtractJwt.fromAuthHeaderAsBearerToken(),
      ignoreExpiration: false,
      secretOrKey: configService.getOrThrow<string>('jwtSecret'),
    });
  }

  async validate(payload: JwtPayload): Promise<{ userId: string; role: string }> {
    const authState = await this.userServiceClient.getAuthState(payload.sub);
    if (!authState || authState.status !== 'active' || authState.tokenVersion !== payload.tokenVersion || authState.role !== payload.role) {
      throw new UnauthorizedException('Invalid or expired access token');
    }
    return { userId: payload.sub, role: payload.role };
  }
}
