import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import type { HydratedDocument, Types } from 'mongoose';
import { LOAN_STATUSES, type LoanStatus } from '../librarian-dashboard.types';

export type LoanDocument = HydratedDocument<Loan>;

@Schema({ collection: 'loans', timestamps: true, autoCreate: true })
export class Loan {
  @Prop({ required: true, type: 'ObjectId', ref: 'Book', index: true })
  bookId!: Types.ObjectId;

  @Prop({ required: true, type: 'ObjectId', ref: 'BookCopy', index: true })
  copyId!: Types.ObjectId;

  @Prop({ required: true, index: true })
  memberId!: string;

  @Prop({ required: true, index: true })
  issuedAt!: Date;

  /** Stored as the start of its Asia/Kolkata calendar date in UTC. */
  @Prop({ required: true, index: true })
  dueDate!: Date;

  @Prop()
  returnedAt?: Date;

  @Prop({ required: true, enum: LOAN_STATUSES, default: 'ACTIVE', index: true })
  status!: LoanStatus;
}

export const LoanSchema = SchemaFactory.createForClass(Loan);
LoanSchema.index({ status: 1, dueDate: 1 });
LoanSchema.index({ memberId: 1, status: 1 });
