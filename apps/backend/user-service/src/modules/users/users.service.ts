import { ConflictException, Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { isValidObjectId, Model } from 'mongoose';
import { User, UserDocument } from '../../schemas/user.schema';
import { OPERATIONAL_PERMISSION_CODES, OperationalPermissionCode, StaffPermission, StaffPermissionDocument } from '../../schemas/staff-permission.schema';
import { CreateUserDto } from './dto/create-user.dto';
import { UserDto } from './dto/user.dto';
import * as bcrypt from 'bcryptjs';
import { randomBytes } from 'crypto';
import { AdminUserResponseDto, CreateAdminUserDto, UpdateAdminUserDto, UpdateUserStatusDto } from './dto/admin-user.dto';

export const OPERATIONAL_PERMISSIONS: ReadonlyArray<{ code: OperationalPermissionCode; name: string; description: string }> = [
  { code: 'BOOK_MANAGEMENT', name: 'Book & Copy Management', description: 'Manage library titles and physical copies' },
  { code: 'MEMBER_MANAGEMENT', name: 'Member Management', description: 'Manage member accounts and operational member records' },
  { code: 'ISSUE_RETURN_RENEWAL', name: 'Issue / Return / Renewal', description: 'Process circulation transactions' },
  { code: 'FINE_MANAGEMENT', name: 'Fine Management', description: 'Record and manage operational fines' },
  { code: 'RESERVATION_MANAGEMENT', name: 'Reservation Management', description: 'Manage reservation queues and pickup windows' },
  { code: 'SHELF_MANAGEMENT', name: 'Shelf Management', description: 'Manage library shelves' },
  { code: 'SEAT_MANAGEMENT', name: 'Seat Management', description: 'Manage seats and staff-assisted seat bookings' },
  { code: 'OPERATIONAL_REPORT_ACCESS', name: 'Operational Reports', description: 'Access operational library reports' },
];

@Injectable()
export class UsersService {
  constructor(
    @InjectModel(User.name) private userModel: Model<UserDocument>,
    @InjectModel(StaffPermission.name) private staffPermissionModel: Model<StaffPermissionDocument>,
  ) {}

  async create(createUserDto: CreateUserDto): Promise<UserDto> {
    const saltRounds = 10;
    const passwordHash = await bcrypt.hash(createUserDto.password, saltRounds);

    const user = await this.userModel.create({
      email: createUserDto.email.toLowerCase(),
      passwordHash,
      name: createUserDto.name,
      role: createUserDto.role,
      memberType: createUserDto.memberType,
      status: 'active',
      tokenVersion: 0,
      permissions: [],
    });

    return this.toDto(user);
  }

  async findByEmail(email: string): Promise<(UserDocument & { _id: { toString(): string } }) | null> {
    return this.userModel.findOne({ email: email.toLowerCase() });
  }

  async findById(id: string): Promise<UserDto | null> {
    const user = await this.userModel.findById(id);
    return user ? this.toDto(user) : null;
  }

  async updateLastLogin(id: string): Promise<void> {
    await this.userModel.findByIdAndUpdate(id, { lastLogin: new Date() });
  }

  async validatePassword(plainPassword: string, hash: string): Promise<boolean> {
    return bcrypt.compare(plainPassword, hash);
  }

  async getMemberDashboardCounts(): Promise<{ total: number; active: number }> {
    const [total, active] = await Promise.all([
      this.userModel.countDocuments({ role: 'MEMBER' }).exec(),
      this.userModel.countDocuments({ role: 'MEMBER', status: 'active' }).exec(),
    ]);
    return { total, active };
  }

  async invalidateTokens(id: string): Promise<boolean> {
    const result = await this.userModel.updateOne({ _id: id }, { $inc: { tokenVersion: 1 } });
    return result.matchedCount === 1;
  }

  async getAuthState(id: string): Promise<{ id: string; role: string; status: 'active' | 'inactive'; tokenVersion: number; permissions: string[] } | null> {
    const user = await this.userModel.findById(id).select('role status tokenVersion');
    if (!user) return null;
    const permissions = user.role === 'LIBRARIAN_STAFF'
      ? await this.allowedPermissionCodes(user._id.toString())
      : [];
    return { id: user._id.toString(), role: user.role, status: user.status, tokenVersion: user.tokenVersion ?? 0, permissions };
  }

  availablePermissions() { return OPERATIONAL_PERMISSIONS; }

  async getManagedStaffPermissions(id: string): Promise<{ userId: string; permissions: OperationalPermissionCode[] } | null> {
    if (!isValidObjectId(id)) return null;
    const user = await this.userModel.findOne({ _id: id, role: 'LIBRARIAN_STAFF' }).select('_id').exec();
    if (!user) return null;
    return { userId: user._id.toString(), permissions: await this.allowedPermissionCodes(user._id.toString()) };
  }

  async replaceManagedStaffPermissions(id: string, permissions: OperationalPermissionCode[]): Promise<{ userId: string; permissions: OperationalPermissionCode[] } | null> {
    if (!isValidObjectId(id)) return null;
    const user = await this.userModel.findOne({ _id: id, role: 'LIBRARIAN_STAFF' }).select('_id').exec();
    if (!user) return null;
    const allowed = new Set(permissions);
    await this.staffPermissionModel.bulkWrite(
      OPERATIONAL_PERMISSION_CODES.map((permissionKey) => ({
        updateOne: {
          filter: { staffUserId: user._id.toString(), permissionKey },
          update: {
            $set: { allowed: allowed.has(permissionKey) },
            $setOnInsert: { staffUserId: user._id.toString(), permissionKey },
          },
          upsert: true,
        },
      })),
      { ordered: true },
    );
    return { userId: user._id.toString(), permissions: await this.allowedPermissionCodes(user._id.toString()) };
  }

  private async allowedPermissionCodes(staffUserId: string): Promise<OperationalPermissionCode[]> {
    const mappings = await this.staffPermissionModel.find({ staffUserId, allowed: true }).select('permissionKey -_id').lean().exec();
    const allowed = new Set(mappings.map((mapping) => mapping.permissionKey));
    return OPERATIONAL_PERMISSION_CODES.filter((code) => allowed.has(code));
  }

  async findManagedStaff(): Promise<AdminUserResponseDto[]> {
    const users = await this.userModel.find({ role: 'LIBRARIAN_STAFF' }).sort({ createdAt: -1 }).exec();
    return users.map((user) => this.toAdminDto(user));
  }

  async findManagedStaffById(id: string): Promise<AdminUserResponseDto | null> {
    if (!isValidObjectId(id)) return null;
    const user = await this.userModel.findOne({ _id: id, role: 'LIBRARIAN_STAFF' }).exec();
    return user ? this.toAdminDto(user) : null;
  }

  async createManagedStaff(dto: CreateAdminUserDto): Promise<AdminUserResponseDto> {
    try {
      const user = await this.userModel.create({
        name: dto.name.trim(),
        email: dto.email.trim().toLowerCase(),
        role: 'LIBRARIAN_STAFF',
        // Credentials are generated server-side; they are deliberately never exposed in this API.
        passwordHash: await bcrypt.hash(randomBytes(24).toString('base64url'), 10),
        status: 'active',
        tokenVersion: 0,
      });
      return this.toAdminDto(user);
    } catch (error: any) {
      if (error?.code === 11000) throw new ConflictException('Email already exists');
      throw error;
    }
  }

  async updateManagedStaff(id: string, dto: UpdateAdminUserDto): Promise<AdminUserResponseDto | null> {
    if (!isValidObjectId(id)) return null;
    const update: Record<string, string> = {};
    if (dto.name !== undefined) update.name = dto.name.trim();
    if (dto.email !== undefined) update.email = dto.email.trim().toLowerCase();
    if (dto.role !== undefined) update.role = 'LIBRARIAN_STAFF';
    try {
      const user = await this.userModel.findOneAndUpdate({ _id: id, role: 'LIBRARIAN_STAFF' }, update, { new: true, runValidators: true }).exec();
      return user ? this.toAdminDto(user) : null;
    } catch (error: any) {
      if (error?.code === 11000) throw new ConflictException('Email already exists');
      throw error;
    }
  }

  async updateManagedStaffStatus(id: string, dto: UpdateUserStatusDto): Promise<AdminUserResponseDto | null> {
    if (!isValidObjectId(id)) return null;
    const user = await this.userModel.findOneAndUpdate(
      { _id: id, role: 'LIBRARIAN_STAFF' },
      // Invalidate any token issued before a status change. This prevents a
      // previously deactivated account's token from becoming valid on reactivation.
      { $set: { status: dto.status.toLowerCase() }, $inc: { tokenVersion: 1 } },
      { new: true, runValidators: true },
    ).exec();
    return user ? this.toAdminDto(user) : null;
  }

  private toDto(user: UserDocument): UserDto {
    const obj = user.toObject() as any;
    return {
      id: obj._id.toString(),
      email: obj.email,
      name: obj.name,
      role: obj.role,
      status: obj.status,
      memberType: obj.memberType,
      lastLogin: obj.lastLogin,
      createdAt: obj.createdAt,
      updatedAt: obj.updatedAt,
    };
  }

  private toAdminDto(user: UserDocument): AdminUserResponseDto {
    const obj = user.toObject() as any;
    const status = obj.status === 'inactive' ? 'INACTIVE' : 'ACTIVE';
    return { id: obj._id.toString(), name: obj.name, email: obj.email, role: obj.role, accountStatus: status, status, createdAt: obj.createdAt, updatedAt: obj.updatedAt };
  }
}
