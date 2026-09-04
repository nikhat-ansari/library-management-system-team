import { NestFactory } from '@nestjs/core';
import { AppModule } from '../app.module';
import { UsersService } from '../modules/users/users.service';

type SeedRole = 'ADMIN' | 'STAFF' | 'MEMBER';

const requiredEnv = (name: string): string => {
  const value = process.env[name];
  if (!value) throw new Error(`${name} must be set before resetting development users`);
  return value;
};

async function bootstrap(): Promise<void> {
  if (process.env.NODE_ENV === 'production') {
    throw new Error('Development users cannot be reset when NODE_ENV=production');
  }

  const app = await NestFactory.createApplicationContext(AppModule);
  try {
    const usersService = app.get(UsersService);
    const roles: SeedRole[] = ['ADMIN', 'STAFF', 'MEMBER'];
    const users = await Promise.all(roles.map(async (role) => {
      const user = await usersService.findByEmail(requiredEnv(`DEV_SEED_${role}_EMAIL`));
      if (!user || user.role !== role) throw new Error(`Expected development ${role} user was not found`);
      return user;
    }));

    for (const user of users) {
      await user.deleteOne();
    }

    console.log('Deleted exactly the three configured development users.');
  } finally {
    await app.close();
  }
}

void bootstrap();
