import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import type { HydratedDocument } from 'mongoose';

export type UserDocument = HydratedDocument<User>;

@Schema({ timestamps: true })
export class User {
  @Prop({ required: true, unique: true, lowercase: true, index: true })
  email!: string;

  @Prop({ required: true })
  passwordHash!: string;

  @Prop({ required: true })
  name!: string;

  @Prop({ required: true, enum: ['ADMIN', 'LIBRARIAN_STAFF', 'MEMBER'], default: 'MEMBER' })
  role!: string;

  @Prop({ enum: ['active', 'inactive'], default: 'active' })
  status!: 'active' | 'inactive';

  @Prop({ enum: ['STUDENT', 'TEACHER', 'FACULTY', 'EMPLOYEE', 'GENERAL'] })
  memberType?: string;

  @Prop()
  lastLogin?: Date;

  @Prop({ default: 0 })
  tokenVersion!: number;

  @Prop({ type: [String], default: [] })
  permissions!: string[];
}

export const UserSchema = SchemaFactory.createForClass(User);
