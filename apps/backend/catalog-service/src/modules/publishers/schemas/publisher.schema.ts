import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import type { HydratedDocument } from 'mongoose';

export type PublisherDocument = HydratedDocument<Publisher>;

@Schema({ collection: 'publishers', timestamps: true, autoCreate: true })
export class Publisher {
  @Prop({ required: true, trim: true, index: true })
  name!: string;
}

export const PublisherSchema = SchemaFactory.createForClass(Publisher);
