import { Module } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';
import { AuditModule } from '../audit/audit.module';
import { AiFeedback, AiFeedbackSchema } from '../../schemas/ai-feedback.schema';
import { AiSettings, AiSettingsSchema } from '../../schemas/ai-settings.schema';
import { SystemHealthEvent, SystemHealthEventSchema } from '../../schemas/system-health-event.schema';
import { SystemHealthController } from './system-health.controller';
import { SystemHealthService } from './system-health.service';

@Module({ imports: [MongooseModule.forFeature([{ name: AiSettings.name, schema: AiSettingsSchema }, { name: AiFeedback.name, schema: AiFeedbackSchema }, { name: SystemHealthEvent.name, schema: SystemHealthEventSchema }]), AuditModule], controllers: [SystemHealthController], providers: [SystemHealthService], exports: [SystemHealthService] })
export class SystemHealthModule {}
