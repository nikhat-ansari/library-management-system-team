import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import type { HydratedDocument, Types } from 'mongoose';
import { RESERVATION_STATUSES, type ReservationStatus } from '../librarian-dashboard.types';

export type ReservationDocument = HydratedDocument<Reservation>;

@Schema({ collection: 'reservations', timestamps: true, autoCreate: true })
export class Reservation {
  @Prop({ required: true, type: 'ObjectId', ref: 'Book', index: true })
  bookId!: Types.ObjectId;

  @Prop({ required: true, index: true })
  memberId!: string;

  @Prop({ required: true, enum: RESERVATION_STATUSES, default: 'PENDING', index: true })
  status!: ReservationStatus;

  @Prop({ required: true, default: Date.now, index: true })
  requestedAt!: Date;

  @Prop({ min: 1 })
  queuePosition?: number;

  @Prop()
  pickupExpiresAt?: Date;
}

export const ReservationSchema = SchemaFactory.createForClass(Reservation);
ReservationSchema.index({ status: 1, requestedAt: 1 });
ReservationSchema.index({ bookId: 1, status: 1, requestedAt: 1 });
