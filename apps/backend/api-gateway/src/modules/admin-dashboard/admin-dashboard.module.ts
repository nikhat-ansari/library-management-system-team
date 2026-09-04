import { Module } from '@nestjs/common';
import { AdminDashboardClient } from './admin-dashboard.client';
import { AdminDashboardController } from './admin-dashboard.controller';

@Module({ controllers: [AdminDashboardController], providers: [AdminDashboardClient] })
export class AdminDashboardModule {}
