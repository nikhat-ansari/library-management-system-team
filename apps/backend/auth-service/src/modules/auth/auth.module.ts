import { Module } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { JwtModule } from '@nestjs/jwt';
import { PassportModule } from '@nestjs/passport';
import { JwtStrategy } from './jwt.strategy';
@Module({ imports: [PassportModule.register({ defaultStrategy: 'jwt' }), JwtModule.registerAsync({ inject: [ConfigService], useFactory: (config: ConfigService) => ({ secret: config.getOrThrow<string>('jwtSecret'), signOptions: { expiresIn: config.getOrThrow<string>('jwtExpiresIn') as never } }) })], providers: [JwtStrategy], exports: [JwtModule, PassportModule] })
export class AuthModule {}
