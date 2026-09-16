import { Module } from '@nestjs/common';
import { AdminReportsController, AiAdminReportsController } from './admin-reports.controller';
import { ReportsDataService } from './reports-data.service';
import { ReportsExportService } from './reports-export.service';
@Module({ controllers: [AdminReportsController, AiAdminReportsController], providers: [ReportsDataService, ReportsExportService] }) export class AdminReportsModule {}
