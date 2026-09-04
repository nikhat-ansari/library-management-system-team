import * as assert from 'node:assert/strict';
import { after, before, describe, it } from 'node:test';
import { createConnection, type Connection } from 'mongoose';
import { DashboardDataService } from './dashboard-data.service';

const uri = process.env.DASHBOARD_TEST_URI;
const database = process.env.DASHBOARD_TEST_DATABASE ?? 'lms-dashboard-test';

describe('DashboardDataService', { skip: !uri }, () => {
  let connection: Connection;
  let dataService: DashboardDataService;

  before(async () => {
    connection = await createConnection(uri!, { dbName: database }).asPromise();
    dataService = new DashboardDataService();
    (dataService as unknown as { connection: Connection }).connection = connection;
    await connection.db!.dropDatabase();
  });

  after(async () => {
    await connection.dropDatabase();
    await connection.close();
  });

  it('reflects a newly inserted book on the next read', async () => {
    const books = connection.db!.collection('books');
    const users = connection.db!.collection('users');
    await books.insertMany(Array.from({ length: 5 }, (_, index) => ({ title: `Book ${index}` })));
    await users.insertOne({ role: 'MEMBER' });

    assert.equal((await dataService.getDashboardCounts()).totalBooks, 5);

    await books.insertOne({ title: 'Book 5' });

    assert.equal((await dataService.getDashboardCounts()).totalBooks, 6);
  });

  it('returns zero for an existing empty collection and reports missing sources', async () => {
    await connection.db!.dropDatabase();
    await connection.db!.createCollection('books');
    const result = await dataService.getDashboardCounts();

    assert.equal(result.totalBooks, 0);
    assert.equal(result.totalMembers, 0);
    assert.deepEqual(result.unavailableDependencies, ['users collection']);
  });
});
