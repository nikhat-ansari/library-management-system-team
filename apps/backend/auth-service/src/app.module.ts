import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { resolve } from 'node:path';
import { AuthModule } from './modules/auth/auth.module';
import { HealthModule } from './health/health.module';
import jwtConfig from './config/jwt.config';
import { DashboardModule } from './modules/dashboard/dashboard.module';
import { AdminUsersModule } from './modules/admin-users/admin-users.module';
import { AdminPermissionsModule } from './modules/admin-permissions/admin-permissions.module';
import { AdminSettingsModule } from './modules/admin-settings/admin-settings.module';
import { AdminReportsModule } from './modules/admin-reports/admin-reports.module';
import { AdminAuditModule } from './modules/admin-audit/admin-audit.module';
import { SystemHealthModule } from './modules/system-health/system-health.module';

@Module({ imports: [ConfigModule.forRoot({ isGlobal: true, envFilePath: resolve(__dirname, '../../../..', '.env'), load: [jwtConfig] }), AuthModule, HealthModule, DashboardModule, AdminUsersModule, AdminPermissionsModule, AdminSettingsModule, AdminReportsModule, AdminAuditModule, SystemHealthModule ] })
export class AppModule {}
