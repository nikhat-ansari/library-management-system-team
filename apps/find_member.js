const { MongoClient } = require('mongodb');

async function run() {
  const uri = 'mongodb+srv://nikhatansari:abuzar123@cluster0.tgnjev2.mongodb.net/lms-users?retryWrites=true&w=majority';
  const client = new MongoClient(uri);

  try {
    await client.connect();
    const db = client.db('lms-users');
    
    // Find users who might be members
    const user = await db.collection('users').findOne({ role: 'MEMBER' });
    if (user) {
        console.log('Member ID:', user._id.toString());
        console.log('Name:', user.name);
    } else {
        const anyUser = await db.collection('users').findOne({});
        console.log('Any User ID:', anyUser ? anyUser._id.toString() : 'None found');
        console.log('Role:', anyUser ? anyUser.role : 'N/A');
    }
  } catch(e) {
    console.error(e);
  } finally {
    await client.close();
  }
}

run();
