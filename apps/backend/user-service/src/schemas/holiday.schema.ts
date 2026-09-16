import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import type { HydratedDocument } from 'mongoose';
export type HolidayDocument = HydratedDocument<Holiday>;
@Schema({ collection: 'holidays', timestamps: true })
export class Holiday { @Prop({ required: true, unique: true }) date!: string; }
export const HolidaySchema = SchemaFactory.createForClass(Holiday);
