import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import type { HydratedDocument } from 'mongoose';

export type AiFeedbackDocument = HydratedDocument<AiFeedback>;
export const AI_FEEDBACK_RATINGS = ['HELPFUL', 'NOT_HELPFUL'] as const;

@Schema({ collection: 'ai_feedback', timestamps: true })
export class AiFeedback {
  @Prop({ required: true, type: String, enum: AI_FEEDBACK_RATINGS, index: true })
  rating!: string;

  @Prop({ required: true, maxlength: 80, index: true })
  feature!: string;

  @Prop({ required: true, default: Date.now, index: true })
  createdAt!: Date;
}

export const AiFeedbackSchema = SchemaFactory.createForClass(AiFeedback);
AiFeedbackSchema.index({ createdAt: 1 }, { expireAfterSeconds: 60 * 60 * 24 * 365 });
AiFeedbackSchema.index({ rating: 1, createdAt: -1 });
