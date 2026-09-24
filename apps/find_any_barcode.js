const { MongoClient } = require('mongodb');

async function run() {
  const uriCatalog = 'mongodb+srv://nikhatansari:abuzar123@cluster0.tgnjev2.mongodb.net/lms-catalog?retryWrites=true&w=majority';
  const client = new MongoClient(uriCatalog);

  try {
    await client.connect();
    const db = client.db('lms-catalog');
    
    const anyCopy = await db.collection('book_copies').findOne({});
    if (anyCopy) {
        console.log('--- FOUND ANY BOOK COPY ---');
        console.log('Barcode:', anyCopy.barcode);
        console.log('Status:', anyCopy.status);
    } else {
        console.log('No book copies found in the database at all.');
    }
  } catch(e) {
    console.error(e);
  } finally {
    await client.close();
  }
}

run();
