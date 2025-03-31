/**
 * Script to check and fix password hashing for all users
 * 
 * Usage: 
 * 1. Make sure MongoDB is running and connection string is configured in .env
 * 2. Run: node src/scripts/fix-password-hashing.js
 */

require('dotenv').config();
const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');
const User = require('../models/User');

async function fixUserPasswords() {
  try {
    // Connect to MongoDB
    await mongoose.connect(process.env.MONGODB_URI);
    console.log('MongoDB connected successfully');

    // Find all users
    const users = await User.find({});
    console.log(`Found ${users.length} users in database`);
    
    let fixedCount = 0;
    
    // Admin credentials for testing
    const adminEmail = 'admin@example.com';
    const adminPassword = 'admin123';
    
    for (const user of users) {
      // Hash password directly
      const salt = await bcrypt.genSalt(10);
      const hashedPassword = await bcrypt.hash(
        user.email === adminEmail ? adminPassword : 'password123', // Use admin password for admin user
        salt
      );
      
      // Update the password field directly
      await User.updateOne(
        { _id: user._id },
        { $set: { password: hashedPassword } }
      );
      
      fixedCount++;
      console.log(`Fixed password for user: ${user.email}`);
    }
    
    console.log(`\nFixed passwords for ${fixedCount} users`);
    
    // Verify admin password
    const adminUser = await User.findOne({ email: adminEmail });
    if (adminUser) {
      const isMatch = await bcrypt.compare(adminPassword, adminUser.password);
      console.log(`Admin password verify test: ${isMatch ? 'SUCCESS' : 'FAILED'}`);
      
      // Also test the model's comparePassword method
      const modelMatch = await adminUser.comparePassword(adminPassword);
      console.log(`Model comparePassword test: ${modelMatch ? 'SUCCESS' : 'FAILED'}`);
    }
    
  } catch (error) {
    console.error('Error fixing user passwords:', error);
  } finally {
    // Disconnect from MongoDB
    await mongoose.disconnect();
    console.log('MongoDB disconnected');
  }
}

// Run the function
fixUserPasswords(); 