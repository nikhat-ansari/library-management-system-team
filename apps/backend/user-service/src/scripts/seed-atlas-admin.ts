import 'reflect-metadata';
import * as bcrypt from 'bcryptjs';
import { createConnection, type Connection } from 'mongoose';

const admin = {
  email: 'admin@library.local',
  name: 'Library Admin',
  role: 'ADMIN',
  status: 'active',
} as const;

const requiredEnv = (name: string): string => {
  const value = process.env[name];
  if (!value) throw new Error(`${name} must be set before seeding the Atlas admin`);
  return value;
};

async function bootstrap(): Promise<number> {
  const uri = requiredEnv('MONGODB_URI');
  const password = requiredEnv('ADMIN_TEST_PASSWORD');
  const database = new URL(uri).pathname.replace(/^\//, '');

  if (database !== 'lms-users') {
    throw new Error(`Refusing to seed database "${database || '(none)'}"; expected "lms-users"`);
  }

  let connection: Connection | undefined;
  try {
    console.log('Connecting to Atlas...');
    connection = createConnection(uri, {
      serverSelectionTimeoutMS: 10_000,
      socketTimeoutMS: 10_000,
      waitQueueTimeoutMS: 10_000,
      // This script uses the established users collection and never needs to
      // build indexes. Disabling automatic index work prevents its background
      // operations from keeping this one-off process alive.
      autoIndex: false,
      autoCreate: false,
      bufferCommands: false,
    });
    await connection.asPromise();
    console.log('Connected to database lms-users');

    if (!connection.db) throw new Error('Atlas database connection is unavailable');
    const users = connection.db.collection('users');
    console.log('Checking existing admin...');
    const existingAdmin = await users.findOne(
      { email: admin.email },
      { maxTimeMS: 10_000, timeoutMS: 10_000 },
    );
    console.log(existingAdmin ? 'Existing admin found' : 'Admin not found');

    console.log('Creating or updating admin...');
    const passwordHash = await bcrypt.hash(password, 10);
    await users.updateOne(
      { email: admin.email },
      {
        $set: {
          ...admin,
          passwordHash,
          tokenVersion: 0,
          permissions: [],
          updatedAt: new Date(),
        },
        $setOnInsert: { createdAt: new Date() },
        $unset: { memberType: '' },
      },
      { upsert: true, maxTimeMS: 10_000, timeoutMS: 10_000 },
    );
    console.log('Admin seed complete');
    return 0;
  } catch {
    // Deliberately avoid logging driver errors because they can contain
    // connection details. The progress logs above identify the failed stage.
    console.error('Admin seed failed');
    return 1;
  } finally {
    delete process.env.ADMIN_TEST_PASSWORD;
    if (connection) await connection.close(true);
  }
}

void bootstrap()
  .then((exitCode) => process.exit(exitCode))
  .catch(() => {
    console.error('Admin seed failed');
    process.exit(1);
  });
