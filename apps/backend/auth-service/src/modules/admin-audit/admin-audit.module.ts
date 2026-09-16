import { Module } from '@nestjs/common';
import { AuthModule } from '../auth/auth.module';
import { AdminAuditController } from './admin-audit.controller';
@Module({ imports: [AuthModule], controllers: [AdminAuditController] })
export class AdminAuditModule {}
