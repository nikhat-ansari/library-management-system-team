import { Module } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { JwtModule } from '@nestjs/jwt';
import { PassportModule } from '@nestjs/passport';
import { JwtStrategy } from './jwt.strategy';
import { AuthController } from './auth.controller';
import { AuthService } from './auth.service';
import { UserServiceClient } from './user-service.client';
import { PermissionGuard } from '../../common/guards/permission.guard';

@Module({
  imports: [
    PassportModule.register({ defaultStrategy: 'jwt' }),
    JwtModule.registerAsync({
      inject: [ConfigService],
      useFactory: (config: ConfigService) => ({
        secret: config.getOrThrow<string>('jwtSecret'),
        signOptions: { expiresIn: config.getOrThrow<string>('jwtExpiresIn') as never },
      }),
    }),
  ],
  providers: [JwtStrategy, AuthService, UserServiceClient, PermissionGuard],
  controllers: [AuthController],
  exports: [JwtModule, PassportModule, AuthService, UserServiceClient, PermissionGuard],
})
export class AuthModule {}
