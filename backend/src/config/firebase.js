const admin = require('firebase-admin');

// Initialize Firebase Admin SDK
// For ID token verification only, we don't need full credentials
try {
  admin.app();
  console.log('Firebase Admin already initialized');
} catch (error) {
  // Initialize with just the project ID for token verification
  admin.initializeApp({
    projectId: 'climatefinance-2dcc3'
  });
  console.log('Firebase Admin initialized for token verification');
}

module.exports = admin;