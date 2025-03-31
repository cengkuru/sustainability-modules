const mongoose = require('mongoose');
const { sustainabilityBaseSchema, SustainabilityBase } = require('./SustainabilityBase');
const { documentSchema } = require('./Document');
const { FOIRequestStatus } = require('./CodeLists');

// Institutional Sustainability Module Schema
const institutionalSustainabilitySchema = new mongoose.Schema({
  // Policy coherence
  policyCoherence: [{
    policyType: String,
    description: String,
    alignmentClassification: String
  }],
  
  // Freedom of information requests
  foiRequests: [{
    document: documentSchema,
    requestDate: Date,
    requestSubject: String,
    requestStatus: {
      type: String,
      enum: Object.values(FOIRequestStatus)
    }
  }],
  
  // Answers to freedom of information requests
  foiResponses: [{
    relatedRequestId: String,
    document: documentSchema,
    responseDate: Date,
    responseDetails: String
  }],
  
  // Lobbying transparency
  lobbyingTransparency: [{
    date: Date,
    location: String,
    participants: [{
      name: String,
      organization: String,
      role: String
    }],
    publicOfficials: [{
      name: String,
      position: String,
      department: String
    }],
    subject: String,
    document: documentSchema,
    notes: String
  }],
  
  // Beneficial ownership
  beneficialOwnership: [{
    name: String,
    identifier: {
      scheme: String,
      id: String
    },
    organization: String,
    ownershipPercentage: Number,
    verificationDate: Date,
    verificationSource: String
  }],
  
  // Sustainability criteria
  sustainabilityCriteria: [{
    strategyType: String,
    description: String
  }],
  
  // Anti-corruption certifications
  antiCorruptionCertifications: documentSchema,
  
  // Independent monitoring
  independentMonitoring: {
    organizationId: String,
    organizationName: String,
    contactDetails: String,
    monitoringScope: String,
    appointmentDate: Date
  },
  
  // Performance monitoring
  performanceMonitoring: [{
    kpiName: String,
    description: String,
    targetValue: mongoose.Schema.Types.Mixed,
    actualValue: mongoose.Schema.Types.Mixed,
    unit: String,
    measurementDate: Date,
    notes: String
  }],
  
  // Risk management plans
  riskManagementPlans: documentSchema,
  
  // Sustainable subsectors
  sustainableSubsectors: [{
    sectorCode: String,
    description: String
  }]
});

const InstitutionalSustainability = SustainabilityBase.discriminator(
  'Institutional',
  institutionalSustainabilitySchema
);

module.exports = InstitutionalSustainability; 