const admin = require('firebase-admin');

// Initialize Firebase Admin SDK
function initializeFirebase() {
  try {
    // Check if already initialized
    admin.app();
    console.log('Firebase Admin already initialized');
  } catch (error) {
    // Initialize with project ID
    admin.initializeApp({
      projectId: 'climatefinance-2dcc3'
    });
    console.log('Firebase Admin initialized');
  }
  
  return admin;
}

module.exports = initializeFirebase();