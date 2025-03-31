const mongoose = require('mongoose');

const publicAuthoritySchema = new mongoose.Schema({
  name: {
    type: String,
    required: true,
    trim: true,
    unique: true
  },
  code: {
    type: String,
    required: true,
    unique: true,
    trim: true
  },
  description: {
    type: String,
    trim: true
  },
  status: {
    type: String,
    enum: ['active', 'inactive'],
    default: 'active'
  },
  address: {
    streetAddress: String,
    locality: String,
    region: String,
    postalCode: String,
    countryName: String
  },
  contactInfo: {
    email: String,
    phone: String,
    website: String
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

// Update the updatedAt timestamp before saving
publicAuthoritySchema.pre('save', function(next) {
  this.updatedAt = Date.now();
  next();
});

const PublicAuthority = mongoose.model('PublicAuthority', publicAuthoritySchema);

module.exports = PublicAuthority; 