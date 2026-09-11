import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import type { HydratedDocument } from 'mongoose';
export type SystemSettingsDocument = HydratedDocument<SystemSettings>;
@Schema({ collection: 'system_settings', timestamps: true })
export class SystemSettings {
  @Prop({ required: true, unique: true, immutable: true }) key!: string;
  @Prop({ required: true, min: 1 }) loanPeriod!: number;
  @Prop({ required: true, min: 0 }) borrowingLimit!: number;
  @Prop({ required: true, min: 0 }) fineRate!: number;
  @Prop({ required: true, min: 0 }) fineCap!: number;
}
export const SystemSettingsSchema = SchemaFactory.createForClass(SystemSettings);
