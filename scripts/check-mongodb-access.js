/**
 * Check if the current IP has access to MongoDB Atlas
 * This script helps verify if your IP is properly whitelisted in MongoDB Atlas
 */

const mongoose = require('mongoose');
const dotenv = require('dotenv');
const path = require('path');
const http = require('http');

// Load environment variables
dotenv.config({ path: path.join(__dirname, '../server/.env') });

// MongoDB connection string
const MONGODB_URI = process.env.MONGODB_URI || 'mongodb+srv://michael:I8atyUtCA21b3Az2@prototype.ncqh9de.mongodb.net/?retryWrites=true&w=majority&appName=prototype';

// Get current public IP
async function getPublicIP() {
  return new Promise((resolve, reject) => {
    http.get('http://api.ipify.org', (res) => {
      let data = '';
      res.on('data', (chunk) => {
        data += chunk;
      });
      res.on('end', () => {
        resolve(data.trim());
      });
    }).on('error', (err) => {
      console.error('Error getting public IP:', err.message);
      resolve('unknown');
    });
  });
}

async function checkMongoDBAccess() {
  console.log('========================================');
  console.log('MongoDB Atlas Access Check');
  console.log('========================================\n');
  
  try {
    // Get public IP
    const publicIP = await getPublicIP();
    console.log(`🔍 Your current public IP address: ${publicIP}`);
    console.log('📡 Attempting to connect to MongoDB Atlas...');
    
    // Try to connect to MongoDB
    await mongoose.connect(MONGODB_URI, { 
      serverSelectionTimeoutMS: 5000 // 5 second timeout
    });
    
    console.log('✅ Successfully connected to MongoDB Atlas!');
    console.log('🎉 Your IP is properly whitelisted.');
    
    // List collections
    const collections = await mongoose.connection.db.listCollections().toArray();
    console.log('\n📚 Available collections:');
    if (collections.length === 0) {
      console.log('   None (database is empty)');
    } else {
      collections.forEach(collection => {
        console.log(`   - ${collection.name}`);
      });
    }
    
    // Close the connection
    await mongoose.connection.close();
    console.log('\n🔌 MongoDB connection closed');
    
    return true;
  } catch (error) {
    console.error('\n❌ Could not connect to MongoDB Atlas');
    
    if (error.name === 'MongoServerSelectionError') {
      console.error('\n👉 This is likely because your IP address is not whitelisted.');
      console.error('   Please follow these steps to whitelist your IP:');
      console.error('\n   1. Log in to MongoDB Atlas: https://cloud.mongodb.com');
      console.error('   2. Navigate to Network Access in the left sidebar');
      console.error('   3. Click "Add IP Address"');
      console.error(`   4. Enter your IP address: ${await getPublicIP()}`);
      console.error('   5. Click "Confirm"');
      console.error('\n   After whitelisting your IP, run this script again to verify access.');
    } else {
      console.error('Error details:', error.message);
    }
    
    // Close MongoDB connection if open
    if (mongoose.connection.readyState !== 0) {
      await mongoose.connection.close();
    }
    
    return false;
  }
}

// Run the check
checkMongoDBAccess()
  .then(success => {
    process.exit(success ? 0 : 1);
  })
  .catch(error => {
    console.error('Unexpected error:', error);
    process.exit(1);
  }); 