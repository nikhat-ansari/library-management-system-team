import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import type { HydratedDocument } from 'mongoose';

export type AiSettingsDocument = HydratedDocument<AiSettings>;

@Schema({ collection: 'ai_settings', timestamps: true })
export class AiSettings {
  @Prop({ required: true, unique: true, immutable: true, default: 'default' })
  key!: string;

  @Prop({ required: true, default: true })
  enabled!: boolean;
}

export const AiSettingsSchema = SchemaFactory.createForClass(AiSettings);
