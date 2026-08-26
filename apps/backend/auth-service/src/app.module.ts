import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { AuthModule } from './modules/auth/auth.module';
import { HealthModule } from './health/health.module';
import jwtConfig from './config/jwt.config';

@Module({ imports: [ConfigModule.forRoot({ isGlobal: true, load: [jwtConfig] }), AuthModule, HealthModule] })
export class AppModule {}
