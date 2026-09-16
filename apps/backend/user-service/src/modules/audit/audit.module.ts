import { Module } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';
import { AuditLog, AuditLogSchema } from '../../schemas/audit-log.schema';
import { User, UserSchema } from '../../schemas/user.schema';
import { AuditController } from './audit.controller';
import { AuditService } from './audit.service';

@Module({ imports: [MongooseModule.forFeature([{ name: AuditLog.name, schema: AuditLogSchema }, { name: User.name, schema: UserSchema }])], controllers: [AuditController], providers: [AuditService], exports: [AuditService] })
export class AuditModule {}
