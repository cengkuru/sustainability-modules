const mongoose = require('mongoose');

// Define a schema for sections and sub-sections
const sectionSchema = new mongoose.Schema({
  title: String,
  content: String,
  subsections: [{ title: String, content: String }]
}, { _id: false });

// Define the policy schema
const policySchema = new mongoose.Schema({
  id: {
    type: String,
    required: true,
    unique: true
  },
  title: String,
  version: String,
  lastUpdated: Date,
  sections: [sectionSchema],
  metadata: {
    dateCreated: Date,
    dateUpdated: Date,
    version: String,
    author: String
  }
}, { 
  timestamps: true,
  strict: false 
});

// Text index for searching
policySchema.index({
  title: 'text',
  'sections.title': 'text',
  'sections.content': 'text',
  'sections.subsections.title': 'text',
  'sections.subsections.content': 'text'
});

module.exports = mongoose.model('Policy', policySchema); 