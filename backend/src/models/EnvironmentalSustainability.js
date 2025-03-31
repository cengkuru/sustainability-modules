const mongoose = require('mongoose');
const { sustainabilityBaseSchema, SustainabilityBase } = require('./SustainabilityBase');
const { documentSchema } = require('./Document');
const { EnvironmentalImpactCategory, EnvironmentalGoal } = require('./CodeLists');

// Environmental and Climate Resilience Module Schema
const environmentalSustainabilitySchema = new mongoose.Schema({
  // Environmental impact category
  environmentalImpactCategory: {
    type: String,
    enum: Object.values(EnvironmentalImpactCategory),
    description: String
  },
  
  // Environmental measures
  environmentalMeasures: documentSchema,
  
  // Environmental licenses and exemptions
  environmentalLicenses: documentSchema,
  
  // Protected area
  protectedArea: {
    isInProtectedArea: Boolean,
    locationReference: String,
    details: String
  },
  
  // Conservation measures
  conservationMeasures: [{
    type: String,
    description: String
  }],
  
  // Climate and disaster risk assessment
  climateRiskAssessment: documentSchema,
  
  // Climate measures
  climateMeasures: [{
    type: String,
    description: String
  }],
  
  // Forecast of greenhouse gas emissions
  ghgEmissionsForecast: {
    value: Number,
    unit: {
      type: String,
      default: 'tons CO2 equivalent'
    },
    details: String
  },
  
  // Environmental certifications
  environmentalCertifications: documentSchema,
  
  // Decommissioning plans
  decommissioningPlans: documentSchema,
  
  // Decommissioning cost forecast
  decommissioningCostForecast: {
    amount: Number,
    currency: String,
    details: String
  },
  
  // Environmental goals
  environmentalGoals: [{
    type: String,
    enum: Object.values(EnvironmentalGoal),
    description: String
  }]
});

const EnvironmentalSustainability = SustainabilityBase.discriminator(
  'Environmental',
  environmentalSustainabilitySchema
);

module.exports = EnvironmentalSustainability; 