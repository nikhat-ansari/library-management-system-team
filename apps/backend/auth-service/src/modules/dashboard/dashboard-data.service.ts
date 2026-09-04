import { Injectable, OnModuleDestroy } from '@nestjs/common';
import { createConnection, type Connection } from 'mongoose';

export interface DashboardCounts {
  totalBooks: number;
  totalMembers: number;
  unavailableDependencies: string[];
}

@Injectable()
export class DashboardDataService implements OnModuleDestroy {
  private static readonly dashboardDatabase = 'library_management';
  private connection?: Connection;

  async getDashboardCounts(): Promise<DashboardCounts> {
    const connection = await this.getConnection();
    if (!connection.db) throw new Error('Dashboard database connection is unavailable');
    const [booksAvailable, usersAvailable] = await Promise.all([
      this.hasCollection('books'),
      this.hasCollection('users'),
    ]);
    const [totalBooks, totalMembers] = await Promise.all([
      booksAvailable ? connection.db.collection('books').countDocuments({}) : Promise.resolve(0),
      usersAvailable ? connection.db.collection('users').countDocuments({ role: 'MEMBER' }) : Promise.resolve(0),
    ]);
    const unavailableDependencies: string[] = [];
    if (!booksAvailable) unavailableDependencies.push('books collection');
    if (!usersAvailable) unavailableDependencies.push('users collection');
    return { totalBooks, totalMembers, unavailableDependencies };
  }

  async onModuleDestroy(): Promise<void> {
    await this.connection?.close();
  }

  private async getConnection(): Promise<Connection> {
    if (!this.connection) {
      const uri = process.env.DASHBOARD_MONGODB_URI ?? process.env.MONGODB_URI ?? 'mongodb://localhost:27017/lms-users';
      // Dashboard metrics are read from the shared library data database.  Supplying
      // dbName explicitly prevents a database embedded in MONGODB_URI (such as the
      // auth-service's lms-users database) from being used accidentally.
      const database = process.env.DASHBOARD_DATABASE ?? DashboardDataService.dashboardDatabase;
      this.connection = createConnection(uri, database ? { dbName: database } : undefined);
      await this.connection.asPromise();
    }
    return this.connection;
  }

  private async hasCollection(name: string): Promise<boolean> {
    const connection = await this.getConnection();
    if (!connection.db) return false;
    return connection.db.listCollections({ name }, { nameOnly: true }).hasNext();
  }
}
