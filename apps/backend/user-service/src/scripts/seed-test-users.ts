import * as bcrypt from 'bcryptjs';
import { createConnection, type Connection } from 'mongoose';

const users = [
  { email: 'admin@library.local', name: 'Library Admin', role: 'ADMIN', passwordEnv: 'ADMIN_TEST_PASSWORD' },
  { email: 'staff@library.local', name: 'Library Staff', role: 'LIBRARIAN_STAFF', passwordEnv: 'STAFF_TEST_PASSWORD' },
  { email: 'member@library.local', name: 'Library Member', role: 'MEMBER', passwordEnv: 'MEMBER_TEST_PASSWORD' },
] as const;

const requiredEnv = (name: string): string => {
  const value = process.env[name];
  if (!value) throw new Error(`${name} must be set before seeding test users`);
  return value;
};

async function bootstrap(): Promise<number> {
  let connection: Connection | undefined;
  try {
    const uri = requiredEnv('MONGODB_URI');
    if (new URL(uri).pathname.replace(/^\//, '') !== 'lms-users') throw new Error('Refusing to seed a database other than lms-users');

    console.log('Connecting to Atlas...');
    connection = createConnection(uri, { serverSelectionTimeoutMS: 10_000, socketTimeoutMS: 10_000, waitQueueTimeoutMS: 10_000, autoIndex: false, autoCreate: false, bufferCommands: false });
    await connection.asPromise();
    if (!connection.db) throw new Error('Atlas database connection is unavailable');
    console.log('Connected to database lms-users');

    const collection = connection.db.collection('users');
    for (const user of users) {
      console.log(`Creating or updating ${user.role} test account...`);
      const passwordHash = await bcrypt.hash(requiredEnv(user.passwordEnv), 10);
      await collection.updateOne(
        { email: user.email },
        {
          $set: { email: user.email, name: user.name, role: user.role, status: 'active', passwordHash, tokenVersion: 0, permissions: [], updatedAt: new Date() },
          $setOnInsert: { createdAt: new Date() },
          $unset: { memberType: '' },
        },
        { upsert: true, maxTimeMS: 10_000, timeoutMS: 10_000 },
      );
    }
    console.log('Test user seed complete');
    return 0;
  } catch {
    console.error('Test user seed failed');
    return 1;
  } finally {
    delete process.env.ADMIN_TEST_PASSWORD;
    delete process.env.STAFF_TEST_PASSWORD;
    delete process.env.MEMBER_TEST_PASSWORD;
    if (connection) await connection.close(true);
  }
}

void bootstrap().then((exitCode) => process.exit(exitCode)).catch(() => process.exit(1));
