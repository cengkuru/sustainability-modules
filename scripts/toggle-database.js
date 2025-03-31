/**
 * Simple script to toggle the database between Firebase and MongoDB
 * in the environment.ts file
 */

const fs = require('fs');
const path = require('path');

const ENV_FILE_PATH = path.join(__dirname, '../src/environments/environment.ts');

try {
  // Read the current environment file
  let envFile = fs.readFileSync(ENV_FILE_PATH, 'utf8');
  
  // Check if MongoDB is currently enabled
  const currentStatus = envFile.includes('useMongoDb: true');
  
  // Toggle the value
  if (currentStatus) {
    // Switch to Firebase
    envFile = envFile.replace('useMongoDb: true', 'useMongoDb: false');
    console.log('✅ Switched to Firebase');
  } else {
    // Switch to MongoDB
    envFile = envFile.replace('useMongoDb: false', 'useMongoDb: true');
    console.log('✅ Switched to MongoDB');
  }
  
  // Write the updated environment file
  fs.writeFileSync(ENV_FILE_PATH, envFile);
  
  console.log('Environment file updated successfully.');
  console.log('Please restart your application for changes to take effect.');
  
} catch (error) {
  console.error('Error updating environment file:', error);
  process.exit(1);
} 