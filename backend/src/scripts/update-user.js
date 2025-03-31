/**
 * Script to update regular users with the correct roles field
 */

require('dotenv').config();
const mongoose = require('mongoose');
const User = require('../models/User');
const PublicAuthority = require('../models/PublicAuthority');

async function updateUser() {
  try {
    await mongoose.connect(process.env.MONGODB_URI);
    console.log('MongoDB connected successfully');
    
    // Create a default public authority if none exists
    let defaultAuthority = await PublicAuthority.findOne();
    
    if (!defaultAuthority) {
      defaultAuthority = new PublicAuthority({
        name: 'Default Authority',
        code: 'DEFAULT',
        description: 'Default authority for system users',
        status: 'active'
      });
      
      await defaultAuthority.save();
      console.log('Created default public authority');
    }
    
    // Update all users without roles to have the 'user' role
    const usersToUpdate = await User.find({ 
      $or: [
        { roles: { $size: 0 } },
        { roles: { $exists: false } }
      ] 
    });
    
    console.log(`Found ${usersToUpdate.length} users to update`);
    
    for (const user of usersToUpdate) {
      // Add 'user' role
      user.roles = ['user'];
      
      // Add public authority if missing and user is not admin
      if (!user.publicAuthority && !user.roles.includes('admin')) {
        user.publicAuthority = defaultAuthority._id;
        console.log(`Assigned default authority to user: ${user.email}`);
      }
      
      // Use save with validation disabled for admin users without publicAuthority
      if (user.roles.includes('admin')) {
        await User.findByIdAndUpdate(user._id, { roles: user.roles }, { 
          new: true,
          runValidators: false
        });
        console.log(`Updated admin user: ${user.email}`);
      } else {
        await user.save();
        console.log(`Updated regular user: ${user.email}`);
      }
    }
    
    // List all users
    const users = await User.find({}).select('name email roles publicAuthority status');
    console.log('\nAll users in database:');
    console.table(users.map(u => ({
      name: u.name,
      email: u.email,
      roles: u.roles,
      authority: u.publicAuthority ? 'Yes' : 'None',
      status: u.status
    })));
    
  } catch (error) {
    console.error('Error:', error);
  } finally {
    await mongoose.disconnect();
    console.log('MongoDB disconnected');
  }
}

updateUser(); 