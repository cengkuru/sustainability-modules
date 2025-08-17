const mongoose = require('mongoose');
const dotenv = require('dotenv');
const path = require('path');

// Load environment variables
dotenv.config({ path: path.join(__dirname, '.env') });

const MONGODB_URI = process.env.MONGODB_URI || 'mongodb+srv://michael:I8atyUtCA21b3Az2@prototype.ncqh9de.mongodb.net/?retryWrites=true&w=majority&appName=prototype';

// Connect to MongoDB
mongoose.connect(MONGODB_URI)
  .then(() => {
    console.log('✅ Successfully connected to MongoDB Atlas!');
    
    // List all collections
    mongoose.connection.db.listCollections().toArray()
      .then(collections => {
        console.log('\nAvailable collections:');
        if (collections.length === 0) {
          console.log('- No collections found. Database is empty.');
        } else {
          collections.forEach(collection => {
            console.log(`- ${collection.name}`);
          });
        }
        
        // Close the connection after listing collections
        mongoose.connection.close().then(() => {
          console.log('\nMongoDB connection closed.');
          process.exit(0);
        });
      })
      .catch(err => {
        console.error('Error listing collections:', err);
        mongoose.connection.close().then(() => process.exit(1));
      });
  })
  .catch(err => {
    console.error('❌ MongoDB connection error:', err);
    process.exit(1);
  }); 