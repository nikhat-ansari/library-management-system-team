import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import type { HydratedDocument } from 'mongoose';

export type BookDocument = HydratedDocument<Book>;

@Schema({ collection: 'books', timestamps: true, autoCreate: true })
export class Book {
  @Prop({ required: true, trim: true, index: true })
  title!: string;

  @Prop({ trim: true, index: true })
  isbn?: string;
}

export const BookSchema = SchemaFactory.createForClass(Book);
BookSchema.index({ title: 1, isbn: 1 });
