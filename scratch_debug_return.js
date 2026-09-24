const axios = require('axios');
const { MongoClient } = require('mongodb');

async function run() {
  const uri = "mongodb+srv://nikhatansari:abuzar123@cluster0.tgnjev2.mongodb.net/lms-users?retryWrites=true&w=majority";
  const client = new MongoClient(uri);

  try {
    await client.connect();
    const db = client.db('lms-users');
    
    // Find librarian email
    const users = db.collection('users');
    const librarian = await users.findOne({ role: 'LIBRARIAN_STAFF' });
    if (!librarian) {
      console.log("No librarian found.");
      return;
    }
    
    // Login to get token
    const loginRes = await axios.post('http://localhost:3000/api/auth/login', {
      email: librarian.email,
      password: 'password123'
    });
    const token = loginRes.data.accessToken;

    // Get a member
    const member = await users.findOne({ role: 'MEMBER' });

    // Make one copy available manually so we can test
    const bookCopies = db.collection('book_copies');
    const someCopy = await bookCopies.findOne({ barcode: { $nin: [null, ""] } });
    await bookCopies.updateOne({ _id: someCopy._id }, { $set: { status: 'Available' } });
    
    // Also remove active transactions for this copy so we can issue it cleanly
    const transactions = db.collection('transactions');
    await transactions.deleteMany({ copyId: someCopy._id, status: 'ACTIVE' });

    const barcode = someCopy.barcode;
    console.log("Testing with barcode:", barcode);

    // Issue book
    console.log("Issuing book...");
    try {
      await axios.post('http://localhost:3000/api/circulation/issue', {
        memberId: member._id.toString(),
        copyBarcode: barcode
      }, { headers: { Authorization: `Bearer ${token}` } });
      console.log("Issue successful.");
    } catch (err) {
      console.log("Issue failed:", err.response?.data || err.message);
      return;
    }

    // Return book as DAMAGED
    console.log("Returning book as DAMAGED...");
    try {
      const returnRes = await axios.post('http://localhost:3000/api/circulation/return', {
        copyBarcode: barcode,
        condition: 'DAMAGED'
      }, { headers: { Authorization: `Bearer ${token}` } });
      console.log("Return successful:", returnRes.data);
    } catch (err) {
      console.log("Return failed 400 Bad Request:", err.response?.data || err.message);
    }

  } catch(e) {
    console.error(e.response ? e.response.data : e.message);
  } finally {
    await client.close();
  }
}

run().catch(console.error);
