const { MongoClient } = require('mongodb');

async function run() {
  const uri = "mongodb+srv://nikhatansari:abuzar123@cluster0.tgnjev2.mongodb.net/lms-users?retryWrites=true&w=majority";
  const client = new MongoClient(uri);

  try {
    await client.connect();
    const db = client.db('lms-users');
    const copies = await db.collection('book_copies').find({}).toArray();
    console.log("All Copies:");
    for (const c of copies) {
      console.log(`Barcode: ${c.barcode}, Status: ${c.status}, _id: ${c._id}`);
    }
  } finally {
    await client.close();
  }
}

run().catch(console.error);
