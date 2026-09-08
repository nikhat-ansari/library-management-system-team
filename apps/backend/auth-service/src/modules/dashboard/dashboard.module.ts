import { Module } from '@nestjs/common';
import { AuthModule } from '../auth/auth.module';
import { DashboardController } from './dashboard.controller';
import { DashboardDataService } from './dashboard-data.service';
import { DashboardService } from './dashboard.service';

@Module({ imports: [AuthModule], controllers: [DashboardController], providers: [DashboardService, DashboardDataService] })
export class DashboardModule {}
