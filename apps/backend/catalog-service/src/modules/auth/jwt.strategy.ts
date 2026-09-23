import { Injectable, UnauthorizedException } from '@nestjs/common';
import { PassportStrategy } from '@nestjs/passport';
import { ExtractJwt, Strategy } from 'passport-jwt';

export interface JwtPayload {
  sub: string;
  role: string;
  tokenVersion: number;
}

@Injectable()
export class JwtStrategy extends PassportStrategy(Strategy) {
  constructor() {
    super({
      jwtFromRequest: ExtractJwt.fromAuthHeaderAsBearerToken(),
      ignoreExpiration: false,
      secretOrKey: process.env.JWT_SECRET || 'replace-with-a-long-random-secret',
    });
  }

  async validate(payload: JwtPayload): Promise<{ userId: string; role: string }> {
    if (!payload.role) {
      throw new UnauthorizedException('Invalid or expired access token');
    }
    return { userId: payload.sub, role: payload.role };
  }
}
