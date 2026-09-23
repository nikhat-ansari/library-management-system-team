import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import type { HydratedDocument } from 'mongoose';

export type AuditLogDocument = HydratedDocument<AuditLog>;
export interface AuditSummary { [key: string]: AuditValue; }
export type AuditValue = string | number | boolean | null | AuditSummary | AuditValue[];

@Schema({ _id: false })
export class AuditRecordReference {
  @Prop({ required: true }) id!: string;
  @Prop({ required: true }) type!: string;
}
export const AuditRecordReferenceSchema = SchemaFactory.createForClass(AuditRecordReference);

@Schema({ collection: 'audit_logs', timestamps: true })
export class AuditLog {
  @Prop({ required: true, index: true })
  actorId!: string;

  @Prop({ required: true, enum: ['USER_CREATED', 'USER_UPDATED', 'USER_STATUS_CHANGED', 'PERMISSIONS_CHANGED', 'SYSTEM_SETTINGS_UPDATED', 'HOLIDAY_CREATED', 'HOLIDAY_DELETED', 'AI_SETTINGS_UPDATED'], index: true })
  action!: string;

  @Prop({ required: true, enum: ['USER_MANAGEMENT', 'PERMISSIONS', 'SYSTEM_SETTINGS', 'HOLIDAY_CALENDAR', 'AI_SETTINGS'], index: true })
  module!: string;

  @Prop({ required: true, type: AuditRecordReferenceSchema })
  recordReference!: { id: string; type: string };

  @Prop({ type: Object, default: null })
  oldChangeSummary!: AuditSummary | null;

  @Prop({ type: Object, default: null })
  newChangeSummary!: AuditSummary | null;

  @Prop({ required: true, default: Date.now, index: true })
  timestamp!: Date;
}

export const AuditLogSchema = SchemaFactory.createForClass(AuditLog);
AuditLogSchema.index({ timestamp: -1, _id: -1 });
AuditLogSchema.index({ actorId: 1, timestamp: -1, _id: -1 });
AuditLogSchema.index({ action: 1, timestamp: -1, _id: -1 });
AuditLogSchema.index({ module: 1, timestamp: -1, _id: -1 });
AuditLogSchema.index({ 'recordReference.id': 1, timestamp: -1, _id: -1 });
