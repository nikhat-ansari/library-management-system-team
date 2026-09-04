import { NestFactory } from '@nestjs/core';
import { AppModule } from '../app.module';
import { UsersService } from '../modules/users/users.service';

type SeedRole = 'ADMIN' | 'STAFF' | 'MEMBER';

const requiredEnv = (name: string): string => {
  const value = process.env[name];
  if (!value) throw new Error(`${name} must be set before seeding development users`);
  return value;
};

async function bootstrap(): Promise<void> {
  if (process.env.NODE_ENV === 'production') {
    throw new Error('Development users cannot be seeded when NODE_ENV=production');
  }

  const app = await NestFactory.createApplicationContext(AppModule);
  try {
    const usersService = app.get(UsersService);
    const roles: SeedRole[] = ['ADMIN', 'STAFF', 'MEMBER'];

    for (const role of roles) {
      await usersService.seedDevelopmentUser({
        email: requiredEnv(`DEV_SEED_${role}_EMAIL`),
        password: requiredEnv(`DEV_SEED_${role}_PASSWORD`),
        name: requiredEnv(`DEV_SEED_${role}_NAME`),
        role,
      });
    }

    for (const role of roles) {
      const user = await usersService.findByEmail(requiredEnv(`DEV_SEED_${role}_EMAIL`));
      if (!user || user.role !== role) {
        throw new Error(`Unable to verify seeded ${role} user`);
      }
    }

    console.log('Development users are ready. Passwords were hashed before storage.');
    console.log('Verified roles in the configured users collection: ADMIN, STAFF, MEMBER.');
  } finally {
    await app.close();
  }
}

void bootstrap();
