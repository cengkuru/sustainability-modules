/**
 * Script to create an admin user in MongoDB
 * 
 * Usage: 
 * 1. Make sure MongoDB is running and connection string is configured in .env
 * 2. Run: node src/scripts/create-admin.js
 */

require('dotenv').config();
const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');
const User = require('../models/User');

// Use the Firebase user's email
const ADMIN_EMAIL = process.env.ADMIN_EMAIL || 'michael@cengkuru.com';
const ADMIN_PASSWORD = process.env.ADMIN_PASSWORD || '12345678'; // This password won't be used for Firebase auth
const ADMIN_NAME = process.env.ADMIN_NAME || 'Michael Cengkuru';

async function createAdminUser() {
  try {
    // Connect to MongoDB
    await mongoose.connect(process.env.MONGODB_URI);
    console.log('MongoDB connected successfully');

    // Check if admin user already exists
    const existingAdmin = await User.findOne({ email: ADMIN_EMAIL });
    
    if (existingAdmin) {
      console.log('Admin user already exists');
      
      // Update roles if needed
      if (!existingAdmin.roles.includes('admin')) {
        existingAdmin.roles = ['admin'];
        await existingAdmin.save();
        console.log('Updated admin user roles');
      }
      
    } else {
      // Create new admin user (password will be hashed by pre-save hook)
      const adminUser = new User({
        name: ADMIN_NAME,
        email: ADMIN_EMAIL,
        password: ADMIN_PASSWORD,
        roles: ['admin'],
        status: 'active'
      });
      
      await adminUser.save();
      console.log('Admin user created successfully');
    }
    
    // List all users
    const users = await User.find({}).select('name email roles status');
    console.log('\nAll users in database:');
    console.table(users.map(u => ({
      name: u.name,
      email: u.email,
      roles: u.roles,
      status: u.status
    })));
    
  } catch (error) {
    console.error('Error creating admin user:', error);
  } finally {
    // Disconnect from MongoDB
    await mongoose.disconnect();
    console.log('MongoDB disconnected');
  }
}

// Run the function
createAdminUser(); 