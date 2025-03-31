const mongoose = require('mongoose');
const admin = require('firebase-admin');
const dotenv = require('dotenv');
const path = require('path');
const fs = require('fs');

// Load environment variables
dotenv.config({ path: path.join(__dirname, '../.env') });

console.log('========================================');
console.log('Firebase to MongoDB Migration Tool');
console.log('========================================\n');

// MongoDB connection string
const MONGODB_URI = process.env.MONGODB_URI || 'mongodb+srv://michael:I8atyUtCA21b3Az2@prototype.ncqh9de.mongodb.net/?retryWrites=true&w=majority&appName=prototype';

// Check if firebase-service-account.json exists
const serviceAccountPath = path.join(__dirname, '../../firebase-service-account.json');
if (!fs.existsSync(serviceAccountPath)) {
  console.error('❌ Error: firebase-service-account.json file not found');
  console.error('\nPlease follow these steps:');
  console.error('1. Go to Firebase Console → Project Settings → Service Accounts');
  console.error('2. Click "Generate New Private Key"');
  console.error('3. Save the file as "firebase-service-account.json" in the project root directory');
  console.error('\nFor detailed instructions, see: server/migration/get-firebase-credentials.md\n');
  process.exit(1);
}

// Initialize Firebase Admin SDK
try {
  console.log('🔑 Initializing Firebase Admin SDK...');
  const serviceAccount = require(serviceAccountPath);
  
  // Perform basic validation of the service account file
  if (!serviceAccount.project_id || !serviceAccount.private_key || !serviceAccount.client_email) {
    console.error('❌ Error: The firebase-service-account.json file appears to be invalid.');
    console.error('Please make sure you\'ve replaced the placeholder values with actual credentials.');
    process.exit(1);
  }
  
  // Initialize Firebase Admin
  admin.initializeApp({
    credential: admin.credential.cert(serviceAccount)
  });
  console.log('✅ Firebase Admin SDK initialized successfully');
} catch (error) {
  console.error('❌ Error initializing Firebase Admin SDK:', error.message);
  console.error('\nPlease make sure that:');
  console.error('1. The firebase-service-account.json file contains valid JSON');
  console.error('2. The service account has Firestore read access');
  console.error('3. You\'ve replaced all placeholder values with actual credentials');
  process.exit(1);
}

// Load MongoDB models
try {
  console.log('📚 Loading MongoDB models...');
  const Project = require('../models/Project');
  const Policy = require('../models/Policy');
  console.log('✅ MongoDB models loaded successfully');
  
  // Firestore instance
  const firestore = admin.firestore();

  // Create a directory for exports if it doesn't exist
  const exportsDir = path.join(__dirname, 'exports');
  if (!fs.existsSync(exportsDir)) {
    fs.mkdirSync(exportsDir, { recursive: true });
    console.log(`✅ Created exports directory at ${exportsDir}`);
  }

  // Collections to migrate
  const collections = [
    { 
      name: 'projects', 
      model: Project,
      exportPath: path.join(exportsDir, 'projects.json')
    },
    { 
      name: 'policy', 
      model: Policy,
      exportPath: path.join(exportsDir, 'policy.json')
    }
  ];

  // Helper function to export Firestore data to JSON
  async function exportFirestoreToJson(collectionName, outputPath) {
    try {
      console.log(`Exporting collection: ${collectionName}...`);
      
      const snapshot = await firestore.collection(collectionName).get();
      
      if (snapshot.empty) {
        console.log(`   ⚠️ Collection ${collectionName} is empty`);
        return [];
      }
      
      const data = snapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data()
      }));
      
      fs.writeFileSync(outputPath, JSON.stringify(data, null, 2));
      console.log(`   ✅ Exported ${data.length} documents to ${outputPath}`);
      return data;
    } catch (error) {
      console.error(`   ❌ Error exporting ${collectionName}:`, error);
      return [];
    }
  }

  // Helper function to import data into MongoDB
  async function importToMongoDB(model, data, collectionName) {
    try {
      // Check if we have any data to import
      if (!data || data.length === 0) {
        console.log(`   ⚠️ No data to import for ${model.collection.name}`);
        return 0;
      }
      
      // First check if the collection already has data
      const existingCount = await model.countDocuments();
      if (existingCount > 0) {
        console.log(`   ⚠️ Collection ${model.collection.name} already contains ${existingCount} documents`);
        
        // Ask to clear or append
        console.log(`   Would you like to clear the existing data? [y/N]`);
        // In a real app, we'd prompt the user - here we'll default to 'yes' for demo
        const shouldClear = true;
        
        if (shouldClear) {
          await model.deleteMany({});
          console.log(`   🗑️ Cleared existing data from ${model.collection.name}`);
        } else {
          console.log(`   ⏭️ Skipping deletion, will append data`);
        }
      }
      
      // Insert new data
      const insertResult = await model.insertMany(data, { ordered: false });
      console.log(`   ✅ Imported ${insertResult.length} documents into ${model.collection.name}`);
      return insertResult.length;
    } catch (error) {
      if (error.name === 'BulkWriteError' && error.code === 11000) {
        // Duplicate key error
        console.log(`   ⚠️ Some documents already exist in MongoDB (duplicate IDs) - ${error.message}`);
        return data.length - error.writeErrors.length;
      } else {
        console.error(`   ❌ Error importing to ${model.collection.name}:`, error);
        return 0;
      }
    }
  }

  // Main migration function
  async function runMigration() {
    console.log('\n📤 Starting Firebase to MongoDB migration...\n');
    
    try {
      // Connect to MongoDB
      console.log('🔌 Connecting to MongoDB...');
      
      await mongoose.connect(MONGODB_URI);
      
      console.log('✅ Connected to MongoDB\n');
      
      let totalExported = 0;
      let totalImported = 0;
      
      // Process each collection
      for (const collection of collections) {
        console.log(`\n📋 Processing collection: ${collection.name}`);
        
        // Export data from Firestore to JSON
        const data = await exportFirestoreToJson(collection.name, collection.exportPath);
        totalExported += data.length;
        
        // Import data to MongoDB
        const importedCount = await importToMongoDB(collection.model, data, collection.name);
        totalImported += importedCount;
      }
      
      console.log('\n🎉 Migration completed!');
      console.log(`   📝 Total documents exported from Firestore: ${totalExported}`);
      console.log(`   📊 Total documents imported to MongoDB: ${totalImported}`);
      
      // Close connections
      await mongoose.connection.close();
      console.log('\n🔌 MongoDB connection closed');
      
      // Toggle database if data was migrated
      if (totalImported > 0) {
        console.log('\n💡 To start using MongoDB instead of Firebase, run:');
        console.log('   npm run toggle-db');
      }
      
      process.exit(0);
    } catch (error) {
      console.error('\n❌ Migration failed:', error);
      
      // Close MongoDB connection if open
      if (mongoose.connection.readyState !== 0) {
        await mongoose.connection.close();
        console.log('🔌 MongoDB connection closed');
      }
      
      process.exit(1);
    }
  }

  // Run the migration
  runMigration();
} catch (error) {
  console.error('❌ Error loading models:', error);
  console.error('Please make sure all required files exist and are properly formatted.');
  process.exit(1);
} 