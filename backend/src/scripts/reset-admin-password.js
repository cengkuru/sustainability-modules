/**
 * Script to reset admin password in MongoDB
 * 
 * Usage: 
 * 1. Make sure MongoDB is running and connection string is configured in .env
 * 2. Run: node src/scripts/reset-admin-password.js
 */

require('dotenv').config();
const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');
const User = require('../models/User');

const ADMIN_EMAIL = 'admin@example.com';
const ADMIN_PASSWORD = 'admin123';  // Change to a secure password

async function resetAdminPassword() {
  try {
    // Connect to MongoDB
    await mongoose.connect(process.env.MONGODB_URI);
    console.log('MongoDB connected successfully');

    // Find admin user
    const adminUser = await User.findOne({ email: ADMIN_EMAIL });
    
    if (!adminUser) {
      console.log('Admin user not found. Please run create-admin.js first.');
      return;
    }
    
    // Hash password directly
    const salt = await bcrypt.genSalt(10);
    const hashedPassword = await bcrypt.hash(ADMIN_PASSWORD, salt);
    
    // Update password directly to ensure it's properly hashed
    adminUser.password = hashedPassword;
    await adminUser.save({ validateBeforeSave: false });
    
    console.log(`Reset password for admin user: ${ADMIN_EMAIL}`);
    console.log(`Password is now: ${ADMIN_PASSWORD}`);
    
    // Test password comparison
    const isMatch = await bcrypt.compare(ADMIN_PASSWORD, adminUser.password);
    console.log(`Password verify test: ${isMatch ? 'SUCCESS' : 'FAILED'}`);
    
  } catch (error) {
    console.error('Error resetting admin password:', error);
  } finally {
    // Disconnect from MongoDB
    await mongoose.disconnect();
    console.log('MongoDB disconnected');
  }
}

// Run the function
resetAdminPassword(); 