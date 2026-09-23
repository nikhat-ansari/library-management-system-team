const axios = require('axios');
const mongoose = require('mongoose');
require('dotenv').config({ path: '.env' });
async function run() {
  await mongoose.connect(process.env.MONGODB_URI);
  let user = await mongoose.connection.collection('users').findOne({ role: 'LIBRARIAN_STAFF' });
  const bcrypt = require('bcryptjs');
  const hash = await bcrypt.hash('password123', 10);
  await mongoose.connection.collection('users').updateOne({ _id: user._id }, { $set: { passwordHash: hash } });
  
  const res = await axios.post('http://localhost:3000/api/auth/login', { email: user.email, password: 'password123' });
  const token = res.data.accessToken;
  
  console.log('Token acquired');
  
  const catRes = await axios.get('http://localhost:3000/api/categories', { headers: { Authorization: 'Bearer ' + token } });
  console.log('Categories:', catRes.data.length);
  
  const authRes = await axios.get('http://localhost:3000/api/authors', { headers: { Authorization: 'Bearer ' + token } });
  console.log('Authors:', authRes.data.length);
  
  const pubRes = await axios.get('http://localhost:3000/api/publishers', { headers: { Authorization: 'Bearer ' + token } });
  console.log('Publishers:', pubRes.data.length);
  process.exit(0);
}
run();
