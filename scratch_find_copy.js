const { MongoClient } = require('mongodb');

async function run() {
  const uri = "mongodb+srv://nikhatansari:abuzar123@cluster0.tgnjev2.mongodb.net/lms-users?retryWrites=true&w=majority";
  const client = new MongoClient(uri);

  try {
    await client.connect();
    const db = client.db('lms-users');
    const bookCopies = db.collection('book_copies');
    
    const availableCopy = await bookCopies.findOne({
      status: 'Available',
      barcode: { $nin: [null, "", 'BC-987654321'] }
    });
    console.log("AVAILABLE COPY WITH BARCODE:");
    console.log(JSON.stringify(availableCopy, null, 2));

  } finally {
    await client.close();
  }
}

run().catch(console.dir);
