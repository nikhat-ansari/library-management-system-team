import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { HydratedDocument, Types } from 'mongoose';

export type TransactionDocument = HydratedDocument<Transaction>;

export enum TransactionStatus {
  ACTIVE = 'ACTIVE',
  RETURNED = 'RETURNED',
  LOST = 'LOST',
  DAMAGED = 'DAMAGED',
}

@Schema({ collection: 'transactions', timestamps: true, autoCreate: true })
export class Transaction {
  @Prop({ required: true, type: Types.ObjectId, index: true })
  memberId!: Types.ObjectId;

  @Prop({ required: true, type: Types.ObjectId, index: true })
  bookId!: Types.ObjectId;

  @Prop({ required: true, type: Types.ObjectId, index: true })
  copyId!: Types.ObjectId;

  @Prop({ required: true, type: Date })
  issueDate!: Date;

  @Prop({ required: true, type: Date })
  dueDate!: Date;

  @Prop({ type: Date })
  returnDate?: Date;

  @Prop({ required: true, enum: TransactionStatus, default: TransactionStatus.ACTIVE, index: true })
  status!: TransactionStatus;

  @Prop({ type: [Date], default: [] })
  renewalHistory!: Date[];

  @Prop({ type: Number, default: 0 })
  renewalCount!: number;

  @Prop({ type: Number })
  fineAmount?: number;

  // Virtual property for overdue status
  isOverdue?: boolean;
}

export const TransactionSchema = SchemaFactory.createForClass(Transaction);

TransactionSchema.index({ memberId: 1, status: 1 });
TransactionSchema.index({ copyId: 1, status: 1 });

TransactionSchema.virtual('isOverdue').get(function (this: TransactionDocument) {
  if (this.status !== TransactionStatus.ACTIVE) return false;
  return new Date() > this.dueDate;
});

TransactionSchema.set('toJSON', { virtuals: true });
TransactionSchema.set('toObject', { virtuals: true });
