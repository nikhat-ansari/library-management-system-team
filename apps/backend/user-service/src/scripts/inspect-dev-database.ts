import { getConnectionToken } from '@nestjs/mongoose';
import { NestFactory } from '@nestjs/core';
import type { Connection } from 'mongoose';
import { AppModule } from '../app.module';

async function bootstrap(): Promise<void> {
  const app = await NestFactory.createApplicationContext(AppModule);
  try {
    const connection = app.get<Connection>(getConnectionToken());
    const users = await connection.collection('users').find({}, { projection: { email: 1, role: 1 } }).sort({ email: 1 }).toArray();
    const roleCounts = await connection.collection('users').aggregate<{ _id: string; count: number }>([
      { $group: { _id: '$role', count: { $sum: 1 } } },
    ]).toArray();
    const counts = new Map(roleCounts.map(({ _id, count }) => [_id, count]));

    console.log(`cluster_host=${connection.host}`);
    console.log(`database_name=${connection.name}`);
    console.log(`collection=${connection.name}.users`);
    console.log(`role_counts=ADMIN:${counts.get('ADMIN') ?? 0},STAFF:${counts.get('STAFF') ?? 0},MEMBER:${counts.get('MEMBER') ?? 0}`);
    console.log(`users=${users.map((user) => `${user.email}:${user.role}`).join(',') || '(none)'}`);
  } finally {
    await app.close();
  }
}

void bootstrap();
