
const mongoose = require('mongoose');
mongoose.connect('mongodb+srv://nikhatansari:abuzar123@cluster0.tgnjev2.mongodb.net/lms-users?retryWrites=true&w=majority')
  .then(async () => {
    const db = mongoose.connection.db;
    await db.collection('book_copies').updateOne({ barcode: 'BC-987654321' }, { $set: { status: 'Available' } });
    console.log('COPY STATUS RESET TO AVAILABLE');
    process.exit(0);
  });

