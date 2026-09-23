import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import type { HydratedDocument } from 'mongoose';

export type AuthorDocument = HydratedDocument<Author>;

@Schema({ collection: 'authors', timestamps: true, autoCreate: true })
export class Author {
  @Prop({ required: true, trim: true, index: true })
  name!: string;
}

export const AuthorSchema = SchemaFactory.createForClass(Author);
