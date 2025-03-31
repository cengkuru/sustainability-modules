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

const ADMIN_EMAIL = 'admin@example.com';
const ADMIN_PASSWORD = 'admin123';  // Change to a secure password
const ADMIN_NAME = 'Admin User';

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
      // Hash password
      const salt = await bcrypt.genSalt(10);
      const hashedPassword = await bcrypt.hash(ADMIN_PASSWORD, salt);
      
      // Create new admin user
      const adminUser = new User({
        name: ADMIN_NAME,
        email: ADMIN_EMAIL,
        password: hashedPassword,
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