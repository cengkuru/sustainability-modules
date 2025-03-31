const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');

const userSchema = new mongoose.Schema({
  name: {
    type: String,
    required: true,
    trim: true
  },
  email: {
    type: String,
    required: true,
    unique: true,
    trim: true,
    lowercase: true
  },
  password: {
    type: String,
    required: true
  },
  roles: [{
    type: String,
    enum: ['admin', 'hod', 'user'],
    default: ['user']
  }],
  publicAuthority: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'PublicAuthority',
    required: function() {
      return !this.roles.includes('admin'); // Only required if user is not an admin
    }
  },
  status: {
    type: String,
    enum: ['active', 'inactive', 'suspended'],
    default: 'active'
  },
  lastPasswordReset: {
    type: Date
  },
  createdAt: {
    type: Date,
    default: Date.now
  },
  updatedAt: {
    type: Date,
    default: Date.now
  }
});

// Hash password before saving
userSchema.pre('save', async function(next) {
  this.updatedAt = Date.now();
  
  if (!this.isModified('password')) return next();
  
  try {
    const salt = await bcrypt.genSalt(10);
    this.password = await bcrypt.hash(this.password, salt);
    next();
  } catch (error) {
    next(error);
  }
});

// Method to check password
userSchema.methods.comparePassword = async function(candidatePassword) {
  try {
    // Using return await to ensure we get the actual result
    return await bcrypt.compare(candidatePassword, this.password);
  } catch (error) {
    console.error('Password comparison error:', error);
    return false;
  }
};

// Method to check if user has a specific role
userSchema.methods.hasRole = function(role) {
  return this.roles.includes(role);
};

// Method to check if user is HOD
userSchema.methods.isHOD = function() {
  return this.roles.includes('hod');
};

// Method to check if user is Admin
userSchema.methods.isAdmin = function() {
  return this.roles.includes('admin');
};

const User = mongoose.model('User', userSchema);

module.exports = User; 