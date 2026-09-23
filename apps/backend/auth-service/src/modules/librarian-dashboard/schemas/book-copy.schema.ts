import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import type { HydratedDocument, Types } from 'mongoose';
import { COPY_STATUSES, type CopyStatus } from '../librarian-dashboard.types';

export type BookCopyDocument = HydratedDocument<BookCopy>;

@Schema({ collection: 'book_copies', timestamps: true, autoCreate: true })
export class BookCopy {
  @Prop({ required: true, type: 'ObjectId', ref: 'Book', index: true })
  bookId!: Types.ObjectId;

  @Prop({ required: true, trim: true, unique: true, index: true })
  accessionNumber!: string;

  @Prop({ trim: true, unique: true, sparse: true, index: true })
  barcode?: string;

  @Prop({ required: true, enum: COPY_STATUSES, default: 'AVAILABLE', index: true })
  status!: CopyStatus;
}

export const BookCopySchema = SchemaFactory.createForClass(BookCopy);
BookCopySchema.index({ bookId: 1, status: 1 });
