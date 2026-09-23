
const axios = require('axios');
const token = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJzdWIiOiI2YWExMTFjMDQ5ZGVlN2EyZDM3YmNiMTMiLCJyb2xlIjoiTElCUkFSSUFOX1NUQUZGIiwidG9rZW5WZXJzaW9uIjoxNCwiaWF0IjoxNzkwMTQ1MDE0LCJleHAiOjE3OTAyMzE0MTR9.zldLmtjtcRSTAqcSM2PxvtdR-jlSgYASuIY3ICmBjEs'; 

const mongoose = require('mongoose');
mongoose.connect('mongodb+srv://nikhatansari:abuzar123@cluster0.tgnjev2.mongodb.net/lms-users?retryWrites=true&w=majority')
  .then(async () => {
    const db = mongoose.connection.db;
    const member = await db.collection('users').findOne({ email: 'member@library.local' });
    
    console.log('Sending issue request for member:', member._id.toString());
    
    axios.post('http://localhost:3000/api/circulation/issue', {
      memberId: member._id.toString(),
      copyBarcode: 'BC-987654321'
    }, {
      headers: { Authorization: 'Bearer ' + token }
    }).then(res => {
      console.log('SUCCESS:', res.data);
      process.exit(0);
    }).catch(err => {
      console.error('ERROR STATUS:', err.response?.status);
      console.error('ERROR DATA:', err.response?.data);
      process.exit(1);
    });
  });

