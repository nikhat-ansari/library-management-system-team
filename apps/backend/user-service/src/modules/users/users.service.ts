import { Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { User, UserDocument } from '../../schemas/user.schema';
import { CreateUserDto } from './dto/create-user.dto';
import { UserDto } from './dto/user.dto';
import * as bcrypt from 'bcryptjs';

@Injectable()
export class UsersService {
  constructor(@InjectModel(User.name) private userModel: Model<UserDocument>) {}

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

  async invalidateTokens(id: string): Promise<boolean> {
    const result = await this.userModel.updateOne({ _id: id }, { $inc: { tokenVersion: 1 } });
    return result.matchedCount === 1;
  }

  async getAuthState(id: string): Promise<{ id: string; role: string; status: 'active' | 'inactive'; tokenVersion: number } | null> {
    const user = await this.userModel.findById(id).select('role status tokenVersion');
    if (!user) return null;
    return { id: user._id.toString(), role: user.role, status: user.status, tokenVersion: user.tokenVersion ?? 0 };
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
}
