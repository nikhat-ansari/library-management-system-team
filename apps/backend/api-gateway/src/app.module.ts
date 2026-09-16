import { Module } from '@nestjs/common';
import { HealthModule } from './health/health.module';
import { AuthModule } from './modules/auth/auth.module';
import { UsersModule } from './modules/users/users.module';
import { AdminDashboardModule } from './modules/admin-dashboard/admin-dashboard.module';
import { AdminUsersModule } from './modules/admin-users/admin-users.module';
import { AdminPermissionsModule } from './modules/admin-permissions/admin-permissions.module';
import { AdminSettingsModule } from './modules/admin-settings/admin-settings.module';
import { AdminReportsModule } from './modules/admin-reports/admin-reports.module';
import { AdminAuditModule } from './modules/admin-audit/admin-audit.module';

@Module({
  imports: [HealthModule, AuthModule, UsersModule, AdminDashboardModule, AdminUsersModule, AdminPermissionsModule, AdminSettingsModule, AdminReportsModule, AdminAuditModule],
})
export class AppModule {}
