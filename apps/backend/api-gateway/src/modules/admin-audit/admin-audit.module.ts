import { Module } from '@nestjs/common';
import { AdminAuditController } from './admin-audit.controller';
@Module({ controllers: [AdminAuditController] }) export class AdminAuditModule {}
