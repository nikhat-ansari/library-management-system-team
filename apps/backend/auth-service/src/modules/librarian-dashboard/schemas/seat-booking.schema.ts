import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import type { HydratedDocument, Types } from 'mongoose';
import { SEAT_BOOKING_STATUSES, type SeatBookingStatus } from '../librarian-dashboard.types';

export type SeatBookingDocument = HydratedDocument<SeatBooking>;

@Schema({ collection: 'seat_bookings', timestamps: true, autoCreate: true })
export class SeatBooking {
  @Prop({ required: true, type: 'ObjectId', ref: 'Seat', index: true })
  seatId!: Types.ObjectId;

  @Prop({ required: true, index: true })
  memberId!: string;

  /** Instant in UTC; dashboard scope is the start instant's Asia/Kolkata date. */
  @Prop({ required: true, index: true })
  startAt!: Date;

  @Prop({ required: true })
  endAt!: Date;

  @Prop({ required: true, enum: SEAT_BOOKING_STATUSES, default: 'CONFIRMED', index: true })
  status!: SeatBookingStatus;

  @Prop()
  cancelledAt?: Date;
}

export const SeatBookingSchema = SchemaFactory.createForClass(SeatBooking);
SeatBookingSchema.index({ status: 1, startAt: 1 });
SeatBookingSchema.index({ seatId: 1, startAt: 1, endAt: 1 });
