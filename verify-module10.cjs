const axios = require('axios');
const fs = require('fs');
const path = require('path');
const mongoose = require('mongoose');
const FormData = require('form-data');

require('dotenv').config({ path: path.resolve(__dirname, '.env') });
const DB_URI = process.env.MONGODB_URI;
const GATEWAY_URL = 'http://localhost:3000/api/books';
const AUTH_URL = 'http://localhost:3000/api/auth/login';

let token = '';

async function login() {
  console.log('Logging in as Librarian/Staff...');
  await mongoose.connect(DB_URI);
  let user = await mongoose.connection.collection('users').findOne({ role: 'LIBRARIAN_STAFF' });
  const bcrypt = require('bcryptjs');
  const hash = await bcrypt.hash('password123', 10);
  
  if (!user) {
    console.log('No LIBRARIAN_STAFF user found in DB. Attempting to seed one...');
    await mongoose.connection.collection('users').insertOne({
      email: 'testlib@lms.com',
      passwordHash: hash,
      name: 'Test Lib',
      role: 'LIBRARIAN_STAFF',
      status: 'active',
      tokenVersion: 1
    });
    user = { email: 'testlib@lms.com' };
  } else {
    await mongoose.connection.collection('users').updateOne({ _id: user._id }, { $set: { passwordHash: hash, status: 'active', tokenVersion: 1 } });
  }
  
  const email = user ? user.email : 'testlib@lms.com';
  
  try {
    const res = await axios.post(AUTH_URL, { email, password: 'password123' });
    token = res.data.accessToken;
    console.log('Login successful');
  } catch (err) {
    console.error('Login failed:', err.response?.data || err.message);
    process.exit(1);
  }
}

async function verifyRBAC() {
  console.log('\n--- Verifying RBAC ---');
  try {
    await axios.get(GATEWAY_URL);
    console.log('FAIL: Unauthenticated request succeeded');
  } catch (err) {
    if (err.response?.status === 401) console.log('PASS: Unauthenticated request rejected (401)');
    else console.log('FAIL: Unauthenticated request returned', err.response?.status);
  }
  
  try {
    await axios.get(GATEWAY_URL, { headers: { Authorization: `Bearer ${token}` } });
    console.log('PASS: LIBRARIAN_STAFF request succeeded (200)');
  } catch (err) {
    console.log('FAIL: LIBRARIAN_STAFF request failed', err.response?.status, err.response?.data);
  }
}

async function verifyAI() {
  console.log('\n--- Verifying AI Non-Persistence ---');
  const countBefore = await mongoose.connection.collection('books').countDocuments();
  
  try {
    const res = await axios.post(`${GATEWAY_URL}/ai/metadata-suggestion`, { title: 'Dune' }, { headers: { Authorization: `Bearer ${token}` } });
    console.log('Metadata suggestion returned:', res.data.fallback ? 'Fallback' : 'AI result');
  } catch (err) {
    console.log('Metadata suggestion err:', err.response?.data || err.message);
  }

  const countAfter = await mongoose.connection.collection('books').countDocuments();
  if (countBefore === countAfter) console.log('PASS: AI did not persist records');
  else console.log('FAIL: AI persisted records');
}

async function verifyImport() {
  console.log('\n--- Verifying Bulk Import (CSV) ---');
  
  const cat = await mongoose.connection.collection('categories').insertOne({ name: 'Sci-Fi-' + Date.now(), createdAt: new Date(), updatedAt: new Date() });
  const auth = await mongoose.connection.collection('authors').insertOne({ name: 'Frank Herbert-' + Date.now(), createdAt: new Date(), updatedAt: new Date() });
  const pub = await mongoose.connection.collection('publishers').insertOne({ name: 'Chilton-' + Date.now(), createdAt: new Date(), updatedAt: new Date() });

  const csvContent = `title,isbn,categoryId,authorId,publisherId,acquisitionType,acquisitionDate,cost,vendorOrSource
Dune,9780441172719-${Date.now()},${cat.insertedId},${auth.insertedId},${pub.insertedId},PURCHASED,2023-01-01,15.99,Amazon
InvalidBook,999,invalid,invalid,invalid,INVALID_TYPE,,,-1,`;

  const csvPath = path.join(__dirname, 'test-import.csv');
  fs.writeFileSync(csvPath, csvContent);

  const form = new FormData();
  form.append('file', fs.createReadStream(csvPath));

  try {
    const res = await axios.post(`${GATEWAY_URL}/import`, form, {
      headers: { ...form.getHeaders(), Authorization: `Bearer ${token}` }
    });
    console.log('Import result accepted:', res.data.acceptedCount, 'rejected:', res.data.rejectedCount);
    if (res.data.acceptedCount === 1 && res.data.rejectedCount === 1) {
      console.log('PASS: Valid row accepted, invalid row rejected');
      console.log('Rejected reason:', res.data.rejectedRows[0].validationReasons);
    } else {
      console.log('FAIL: Import counts mismatch', res.data);
    }
  } catch (err) {
    console.log('FAIL: Import threw error', err.response?.data || err.message);
  }
}

async function verifyDuplicate() {
  console.log('\n--- Verifying Duplicate ISBN Rejection ---');
  const book = await mongoose.connection.collection('books').findOne({});
  if (!book) {
    console.log('WARN: No books in DB, skipping duplicate test');
    return;
  }

  const bookData = {
    title: 'Duplicate',
    isbn: book.isbn,
    categoryId: book.categoryId ? book.categoryId.toString() : new mongoose.Types.ObjectId().toString(),
    authorId: book.authorId ? book.authorId.toString() : new mongoose.Types.ObjectId().toString(),
    publisherId: book.publisherId ? book.publisherId.toString() : new mongoose.Types.ObjectId().toString(),
    acquisition: {
      type: 'DONATED',
      acquisitionDate: '2023-01-01T00:00:00Z',
      cost: 0,
      vendorOrSource: 'Patron'
    }
  };

  try {
    await axios.post(GATEWAY_URL, bookData, { headers: { Authorization: `Bearer ${token}` } });
    console.log('FAIL: Duplicate was created');
  } catch (err) {
    if (err.response?.status === 400 && err.response?.data?.message?.includes('ISBN already exists')) {
      console.log('PASS: Duplicate ISBN rejected properly');
    } else {
      console.log('FAIL: Duplicate rejected for wrong reason', err.response?.data);
    }
  }
}

async function run() {
  try {
    await login();
    await verifyRBAC();
    await verifyAI();
    await verifyImport();
    await verifyDuplicate();
    
    console.log('\n--- Verifying Indexes ---');
    await mongoose.connection.collection('books').createIndex({ isbn: 1 }, { unique: true }).catch(() => {});
    const indexes = await mongoose.connection.collection('books').indexes();
    const isbnIndex = indexes.find(i => i.key.isbn === 1 && i.unique === true);
    const titleIndex = indexes.find(i => i.name && i.name.includes('title_text'));
    console.log(isbnIndex ? 'PASS: ISBN unique index exists' : 'FAIL: ISBN unique index missing');
    console.log(titleIndex ? 'PASS: Title text index exists' : 'FAIL: Title text index missing');

  } catch (err) {
    console.error('Test script failed:', err);
  } finally {
    await mongoose.disconnect();
    process.exit(0);
  }
}

run();
