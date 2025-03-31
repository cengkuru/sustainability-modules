const mongoose = require('mongoose');

// Base schema for all sustainability modules
const sustainabilityBaseSchema = new mongoose.Schema({
  project: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Project',
    required: true,
    index: true
  },
  isActive: {
    type: Boolean,
    default: true
  },
  createdBy: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  createdAt: {
    type: Date,
    default: Date.now
  },
  updatedBy: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User'
  },
  updatedAt: {
    type: Date
  }
}, { discriminatorKey: 'moduleType' });

// Update timestamps on save
sustainabilityBaseSchema.pre('save', function(next) {
  this.updatedAt = Date.now();
  next();
});

const SustainabilityBase = mongoose.model('SustainabilityBase', sustainabilityBaseSchema);

module.exports = { 
  sustainabilityBaseSchema, 
  SustainabilityBase 
}; 