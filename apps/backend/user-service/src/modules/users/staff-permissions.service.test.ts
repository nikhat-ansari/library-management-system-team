import * as assert from 'node:assert/strict';
import { test } from 'node:test';
import { Types } from 'mongoose';
import { OPERATIONAL_PERMISSION_CODES } from '../../schemas/staff-permission.schema';
import { UsersService } from './users.service';

const query = <T>(value: T) => ({ select: () => ({ exec: async () => value }) });

test('staff permissions default to denied and persist a complete mapping on replacement', async () => {
  const staffId = new Types.ObjectId();
  const mappings = new Map<string, boolean>();
  const userModel = {
    findOne: () => query({ _id: staffId }),
  };
  const permissionModel = {
    find: () => ({
      select: () => ({
        lean: () => ({
          exec: async () => [...mappings].filter(([, allowed]) => allowed).map(([permissionKey]) => ({ permissionKey })),
        }),
      }),
    }),
    bulkWrite: async (operations: Array<{ updateOne: { filter: { permissionKey: string }; update: { $set: { allowed: boolean } } } }>) => {
      operations.forEach(({ updateOne }) => mappings.set(updateOne.filter.permissionKey, updateOne.update.$set.allowed));
    },
  };
  const service = new UsersService(userModel as any, permissionModel as any);

  assert.deepEqual(await service.getManagedStaffPermissions(staffId.toString()), {
    userId: staffId.toString(), permissions: [],
  });

  const saved = await service.replaceManagedStaffPermissions(staffId.toString(), ['BOOK_MANAGEMENT', 'SEAT_MANAGEMENT']);
  assert.deepEqual(saved, {
    userId: staffId.toString(), permissions: ['BOOK_MANAGEMENT', 'SEAT_MANAGEMENT'],
  });
  assert.equal(mappings.size, OPERATIONAL_PERMISSION_CODES.length);
  assert.equal(mappings.get('BOOK_MANAGEMENT'), true);
  assert.equal(mappings.get('MEMBER_MANAGEMENT'), false);
});

test('an invalid staff identifier is rejected without querying persistence', async () => {
  const service = new UsersService({ findOne: () => { throw new Error('must not query'); } } as any, {} as any);
  assert.equal(await service.getManagedStaffPermissions('not-an-object-id'), null);
  assert.equal(await service.replaceManagedStaffPermissions('not-an-object-id', []), null);
});
