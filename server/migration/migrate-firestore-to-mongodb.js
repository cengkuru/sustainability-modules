const admin = require('firebase-admin');
const mongoose = require('mongoose');
const dotenv = require('dotenv');
const path = require('path');
const fs = require('fs');

// Load environment variables
dotenv.config({ path: path.join(__dirname, '../.env') });

// Initialize Firebase Admin
const serviceAccount = require('../../firebase-service-account.json');
admin.initializeApp({
  credential: admin.credential.cert(serviceAccount)
});

// Connect to MongoDB
mongoose.connect(process.env.MONGODB_URI)
  .then(() => {
    console.log('Connected to MongoDB Atlas');
    runMigration();
  })
  .catch(err => {
    console.error('MongoDB connection error:', err);
    process.exit(1);
  });

// Import MongoDB models
const Project = require('../models/Project');
const Policy = require('../models/Policy');

// Firestore instance
const firestore = admin.firestore();

// Collections to migrate
const collections = [
  { name: 'projects', model: Project },
  { name: 'policy', model: Policy }
];

// Helper function to export Firestore data to JSON
async function exportFirestoreToJson(collectionName, outputPath) {
  try {
    const snapshot = await firestore.collection(collectionName).get();
    const data = snapshot.docs.map(doc => ({
      id: doc.id,
      ...doc.data()
    }));
    
    fs.writeFileSync(outputPath, JSON.stringify(data, null, 2));
    console.log(`Exported ${data.length} documents from ${collectionName} to ${outputPath}`);
    return data;
  } catch (error) {
    console.error(`Error exporting ${collectionName}:`, error);
    return [];
  }
}

// Helper function to import data into MongoDB
async function importToMongoDB(model, data) {
  try {
    // Clear existing data - CAUTION: This removes all data!
    await model.deleteMany({});
    console.log(`Cleared existing data from ${model.collection.name}`);
    
    // Insert new data
    if (data.length > 0) {
      await model.insertMany(data);
      console.log(`Imported ${data.length} documents into ${model.collection.name}`);
    } else {
      console.log(`No data to import into ${model.collection.name}`);
    }
  } catch (error) {
    console.error(`Error importing to ${model.collection.name}:`, error);
  }
}

// Main migration function
async function runMigration() {
  try {
    // Create exports directory if it doesn't exist
    const exportsDir = path.join(__dirname, 'exports');
    if (!fs.existsSync(exportsDir)) {
      fs.mkdirSync(exportsDir);
    }
    
    // Process each collection
    for (const collection of collections) {
      console.log(`\nProcessing collection: ${collection.name}`);
      
      // Export data to JSON
      const outputPath = path.join(exportsDir, `${collection.name}.json`);
      const data = await exportFirestoreToJson(collection.name, outputPath);
      
      // Import data to MongoDB
      await importToMongoDB(collection.model, data);
    }
    
    console.log('\nMigration completed successfully!');
    process.exit(0);
  } catch (error) {
    console.error('Migration failed:', error);
    process.exit(1);
  }
}

// Handle process termination
process.on('SIGINT', () => {
  mongoose.connection.close(() => {
    console.log('MongoDB connection closed through app termination');
    process.exit(0);
  });
}); 