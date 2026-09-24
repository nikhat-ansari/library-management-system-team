const { MongoClient } = require('mongodb');

async function run() {
  const uriCatalog = 'mongodb+srv://nikhatansari:abuzar123@cluster0.tgnjev2.mongodb.net/lms-catalog?retryWrites=true&w=majority';
  const client = new MongoClient(uriCatalog);

  try {
    await client.connect();
    const db = client.db('lms-catalog');
    
    const availableCopy = await db.collection('book_copies').findOne({ status: 'AVAILABLE' });
    if (availableCopy) {
        console.log('--- FOUND AVAILABLE BOOK COPY ---');
        console.log('Barcode:', availableCopy.barcode);
        console.log('Book ID:', availableCopy.bookId);
    } else {
        console.log('No available book copies found.');
    }
  } catch(e) {
    console.error(e);
  } finally {
    await client.close();
  }
}

run();
