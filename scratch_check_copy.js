const { MongoClient } = require('mongodb');

async function run() {
  const uri = "mongodb+srv://nikhatansari:abuzar123@cluster0.tgnjev2.mongodb.net/lms-users?retryWrites=true&w=majority";
  const client = new MongoClient(uri);

  try {
    await client.connect();
    const db = client.db('lms-users');
    const copy = await db.collection('book_copies').findOne({ barcode: 'BC-987654321' });
    console.log("Status:", copy.status);
    console.log("Charge history:", copy.chargeHistory);
  } finally {
    await client.close();
  }
}

run().catch(console.error);
