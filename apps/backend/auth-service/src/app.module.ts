import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { AuthModule } from './modules/auth/auth.module';
import { HealthModule } from './health/health.module';
import jwtConfig from './config/jwt.config';
import { DashboardModule } from './modules/dashboard/dashboard.module';
import { AdminUsersModule } from './modules/admin-users/admin-users.module';
import { AdminPermissionsModule } from './modules/admin-permissions/admin-permissions.module';

@Module({ imports: [ConfigModule.forRoot({ isGlobal: true, load: [jwtConfig] }), AuthModule, HealthModule, DashboardModule, AdminUsersModule, AdminPermissionsModule] })
export class AppModule {}
