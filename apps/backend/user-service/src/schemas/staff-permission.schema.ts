import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import type { HydratedDocument } from 'mongoose';

export const OPERATIONAL_PERMISSION_CODES = [
  'BOOK_MANAGEMENT',
  'MEMBER_MANAGEMENT',
  'ISSUE_RETURN_RENEWAL',
  'FINE_MANAGEMENT',
  'RESERVATION_MANAGEMENT',
  'SHELF_MANAGEMENT',
  'SEAT_MANAGEMENT',
  'OPERATIONAL_REPORT_ACCESS',
] as const;

export type OperationalPermissionCode = (typeof OPERATIONAL_PERMISSION_CODES)[number];
export type StaffPermissionDocument = HydratedDocument<StaffPermission>;

@Schema({ collection: 'staff_permissions', timestamps: true })
export class StaffPermission {
  // User IDs are exposed by this service as strings; storing that canonical ID
  // avoids cross-package Mongoose ObjectId constructor mismatches.
  @Prop({ required: true, index: true })
  staffUserId!: string;

  @Prop({ required: true, enum: OPERATIONAL_PERMISSION_CODES })
  permissionKey!: OperationalPermissionCode;

  @Prop({ required: true, type: Boolean })
  allowed!: boolean;
}

export const StaffPermissionSchema = SchemaFactory.createForClass(StaffPermission);
StaffPermissionSchema.index({ staffUserId: 1, permissionKey: 1 }, { unique: true });
