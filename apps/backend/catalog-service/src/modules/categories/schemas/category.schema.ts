import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import type { HydratedDocument } from 'mongoose';

export type CategoryDocument = HydratedDocument<Category>;

@Schema({ collection: 'categories', timestamps: true, autoCreate: true })
export class Category {
  @Prop({ required: true, trim: true, unique: true, index: true })
  name!: string;
}

export const CategorySchema = SchemaFactory.createForClass(Category);
