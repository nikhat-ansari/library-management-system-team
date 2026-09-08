import { Module } from '@nestjs/common';
import { HealthModule } from './health/health.module';
import { AuthModule } from './modules/auth/auth.module';
import { UsersModule } from './modules/users/users.module';
import { AdminDashboardModule } from './modules/admin-dashboard/admin-dashboard.module';
import { AdminUsersModule } from './modules/admin-users/admin-users.module';
import { AdminPermissionsModule } from './modules/admin-permissions/admin-permissions.module';

@Module({
  imports: [HealthModule, AuthModule, UsersModule, AdminDashboardModule, AdminUsersModule, AdminPermissionsModule],
})
export class AppModule {}
