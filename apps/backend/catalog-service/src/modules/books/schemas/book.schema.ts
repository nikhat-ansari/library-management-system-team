import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import mongoose, { Types, type HydratedDocument } from 'mongoose';
import { Category } from '../../categories/schemas/category.schema';
import { Author } from '../../authors/schemas/author.schema';
import { Publisher } from '../../publishers/schemas/publisher.schema';

export type BookDocument = HydratedDocument<Book>;

export enum AcquisitionType {
  PURCHASED = 'PURCHASED',
  DONATED = 'DONATED',
}

@Schema({ _id: false })
class Acquisition {
  @Prop({ type: String, enum: AcquisitionType, required: true })
  type!: AcquisitionType;

  @Prop({ type: Date, required: true })
  acquisitionDate!: Date;

  @Prop({ type: Number, required: true, min: 0 })
  cost!: number;

  @Prop({ type: String, required: true, trim: true })
  vendorOrSource!: string;
}

@Schema({ collection: 'books', timestamps: true, autoCreate: true })
export class Book {
  @Prop({ required: true, trim: true, index: true })
  title!: string;

  @Prop({ required: true, trim: true, unique: true, index: true })
  isbn!: string;

  @Prop({ type: mongoose.Schema.Types.ObjectId, ref: Category.name, required: true, index: true })
  categoryId!: Types.ObjectId;

  @Prop({ type: mongoose.Schema.Types.ObjectId, ref: Author.name, required: true, index: true })
  authorId!: Types.ObjectId;

  @Prop({ type: mongoose.Schema.Types.ObjectId, ref: Publisher.name, required: true, index: true })
  publisherId!: Types.ObjectId;

  @Prop({ type: Object, default: {} })
  catalogueMetadata!: Record<string, any>;

  @Prop({ type: Acquisition, required: true })
  acquisition!: Acquisition;
}

export const BookSchema = SchemaFactory.createForClass(Book);
BookSchema.index({ title: 'text' });
