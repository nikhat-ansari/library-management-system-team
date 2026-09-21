import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import type { HydratedDocument } from 'mongoose';

export type SystemHealthEventDocument = HydratedDocument<SystemHealthEvent>;
export const SYSTEM_HEALTH_EVENT_TYPES = ['API_ERROR', 'NOTIFICATION_FAILURE', 'AI_SUCCESS', 'AI_FAILURE', 'AI_TIMEOUT', 'AI_UNAVAILABLE', 'AI_FALLBACK'] as const;
export type SystemHealthEventType = typeof SYSTEM_HEALTH_EVENT_TYPES[number];

@Schema({ collection: 'system_health_events', timestamps: true })
export class SystemHealthEvent {
  @Prop({ required: true, type: String, enum: SYSTEM_HEALTH_EVENT_TYPES, index: true })
  type!: SystemHealthEventType;

  @Prop({ required: true, maxlength: 80, index: true })
  source!: string;

  @Prop({ min: 100, max: 599 })
  statusCode?: number;

  @Prop({ required: true, default: Date.now, index: true })
  occurredAt!: Date;
}

export const SystemHealthEventSchema = SchemaFactory.createForClass(SystemHealthEvent);
SystemHealthEventSchema.index({ occurredAt: 1 }, { expireAfterSeconds: 60 * 60 * 24 * 90 });
SystemHealthEventSchema.index({ type: 1, occurredAt: -1 });
