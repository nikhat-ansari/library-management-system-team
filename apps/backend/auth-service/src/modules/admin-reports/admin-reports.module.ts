import { Module } from '@nestjs/common';
import { AdminReportsController, AiAdminReportsController } from './admin-reports.controller';
import { ReportsDataService } from './reports-data.service';
import { ReportsExportService } from './reports-export.service';
import { SystemHealthModule } from '../system-health/system-health.module';
@Module({ imports: [SystemHealthModule], controllers: [AdminReportsController, AiAdminReportsController], providers: [ReportsDataService, ReportsExportService] }) export class AdminReportsModule {}
