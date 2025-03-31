const mongoose = require('mongoose');
const { sustainabilityBaseSchema, SustainabilityBase } = require('./SustainabilityBase');
const { documentSchema } = require('./Document');

// Social Sustainability Module Schema
const socialSustainabilitySchema = new mongoose.Schema({
  // Number of beneficiaries
  beneficiaries: {
    direct: Number,
    indirect: Number,
    details: String
  },
  
  // Inclusive design and implementation
  inclusiveDesign: documentSchema,
  
  // Indigenous land
  indigenousLand: {
    isAffected: Boolean,
    locationDescription: String,
    details: String
  },
  
  // Public consultation meetings
  consultationMeetings: [{
    date: Date,
    location: {
      description: String,
      coordinates: {
        latitude: Number,
        longitude: Number
      }
    },
    participants: Number,
    document: documentSchema,
    notes: String
  }],
  
  // Land compensation budget
  landCompensationBudget: {
    amount: Number,
    currency: String,
    details: String
  },
  
  // Labor obligations
  laborObligations: [{
    type: String,
    description: String
  }],
  
  // Labor budget
  laborBudget: {
    amount: Number,
    currency: String,
    details: String
  },
  
  // Workers' accidents
  workersAccidents: [{
    date: Date,
    count: Number,
    description: String,
    severity: String,
    report: documentSchema
  }],
  
  // Health and safety certifications
  healthSafetyCertifications: documentSchema,
  
  // Construction materials testing
  materialsTesting: [{
    materialType: String,
    description: String,
    document: documentSchema,
    testDate: Date,
    result: String
  }],
  
  // Building inspections
  buildingInspections: documentSchema,
  
  // Jobs generated
  jobsGenerated: {
    estimated: {
      direct: Number,
      indirect: Number
    },
    actual: {
      direct: Number,
      indirect: Number
    },
    implementationPhase: Number,
    operationPhase: Number,
    details: String
  }
});

const SocialSustainability = SustainabilityBase.discriminator(
  'Social',
  socialSustainabilitySchema
);

module.exports = SocialSustainability; 