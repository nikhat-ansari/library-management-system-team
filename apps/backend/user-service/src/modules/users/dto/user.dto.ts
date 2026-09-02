export class UserDto {
  id!: string;

  email!: string;

  name!: string;

  role!: string;

  status!: 'active' | 'inactive';

  memberType?: string;

  lastLogin?: Date;

  createdAt!: Date;

  updatedAt!: Date;
}
