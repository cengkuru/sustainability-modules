const mongoose = require('mongoose');

const MONGODB_URI = 'mongodb+srv://michael:I8atyUtCA21b3Az2@prototype.ncqh9de.mongodb.net/?retryWrites=true&w=majority&appName=prototype';

async function testConnection() {
  console.log('Testing MongoDB connection from local machine...');
  
  try {
    await mongoose.connect(MONGODB_URI);
    console.log('✅ MongoDB connected successfully');
    
    // Test query
    const collections = await mongoose.connection.db.listCollections().toArray();
    console.log('Collections found:', collections.map(c => c.name));
    
    // Check users collection
    const users = await mongoose.connection.db.collection('users').find({}).limit(5).toArray();
    console.log('\nUsers in database:');
    users.forEach(user => {
      console.log(`  - ${user.email} (roles: ${user.roles})`);
    });
    
    await mongoose.disconnect();
    console.log('✅ Connection closed');
  } catch (error) {
    console.error('❌ Connection failed:', error.message);
  }
}

testConnection();