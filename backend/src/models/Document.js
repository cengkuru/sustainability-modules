const mongoose = require('mongoose');

// Standard document schema that can be embedded in other schemas
const documentSchema = new mongoose.Schema({
  id: {
    type: String,
    required: true
  },
  documentType: {
    type: String,
    required: true
  },
  title: {
    type: String,
    required: true
  },
  description: String,
  url: String,
  datePublished: Date,
  dateModified: Date,
  format: String,
  language: {
    type: String,
    default: 'en'
  },
  pageStart: String,
  pageEnd: String,
  accessDetails: String,
  author: String
});

// This schema can be used both as an embedded document and as a standalone collection
const Document = mongoose.model('Document', documentSchema);

module.exports = {
  Document,
  documentSchema
}; 