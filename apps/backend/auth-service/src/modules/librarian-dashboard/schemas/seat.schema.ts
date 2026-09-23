import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import type { HydratedDocument } from 'mongoose';
import { SEAT_STATUSES, type SeatStatus } from '../librarian-dashboard.types';

export type SeatDocument = HydratedDocument<Seat>;

@Schema({ collection: 'seats', timestamps: true, autoCreate: true })
export class Seat {
  @Prop({ required: true, trim: true, unique: true, index: true })
  seatNumber!: string;

  @Prop({ required: true, enum: ['AC', 'NON_AC'], index: true })
  seatType!: 'AC' | 'NON_AC';

  @Prop({ required: true, enum: SEAT_STATUSES, default: 'AVAILABLE', index: true })
  status!: SeatStatus;
}

export const SeatSchema = SchemaFactory.createForClass(Seat);
SeatSchema.index({ seatType: 1, status: 1 });
