import { Module } from '@nestjs/common';
import { AdminReportsController, AiAdminReportsController } from './admin-reports.controller';
@Module({ controllers: [AdminReportsController, AiAdminReportsController] }) export class AdminReportsModule {}
