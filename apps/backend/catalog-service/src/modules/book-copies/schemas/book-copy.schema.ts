import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { HydratedDocument, Types } from 'mongoose';

export type BookCopyDocument = HydratedDocument<BookCopy>;

export enum CopyStatus {
  AVAILABLE = 'Available',
  ISSUED = 'Issued',
  RESERVED = 'Reserved',
  LOST = 'Lost',
  DAMAGED = 'Damaged',
  MAINTENANCE = 'Maintenance',
  ARCHIVED = 'Archived',
}

export enum ChargeWorkflow {
  LOST = 'LOST',
  DAMAGED = 'DAMAGED',
  FOUND = 'FOUND',
}

export enum ChargeType {
  CHARGE = 'CHARGE',
  REVERSAL = 'REVERSAL',
  ADJUSTMENT = 'ADJUSTMENT',
  PAYMENT = 'PAYMENT',
  WAIVER = 'WAIVER',
}

@Schema({ _id: false })
export class ChargeHistoryRecord {
  @Prop({ type: String, required: true, default: () => new Types.ObjectId().toString() })
  id!: string;

  @Prop({ type: String, enum: ChargeType, required: true })
  type!: ChargeType;

  @Prop({ type: Number, required: true })
  amount!: number;

  @Prop({ type: String, required: true })
  reason!: string;

  @Prop({ type: String, enum: ChargeWorkflow, required: true })
  workflow!: ChargeWorkflow;

  @Prop({ type: Date, required: true, default: Date.now })
  createdAt!: Date;

  @Prop({ type: String, required: true })
  actorId!: string;
}

@Schema({ collection: 'book_copies', timestamps: true, autoCreate: true })
export class BookCopy {
  @Prop({ required: true, type: Types.ObjectId, ref: 'Book', index: true })
  bookId!: Types.ObjectId;

  @Prop({ required: true, trim: true, unique: true, index: true })
  accessionNumber!: string;

  @Prop({ trim: true, unique: true, sparse: true, index: true })
  barcode?: string;

  @Prop({ type: String, trim: true })
  condition?: string;

  @Prop({ required: true, enum: CopyStatus, default: CopyStatus.AVAILABLE, index: true })
  status!: CopyStatus;

  @Prop({ type: [ChargeHistoryRecord], default: [] })
  chargeHistory!: ChargeHistoryRecord[];
}

export const BookCopySchema = SchemaFactory.createForClass(BookCopy);
BookCopySchema.index({ bookId: 1, status: 1 });
