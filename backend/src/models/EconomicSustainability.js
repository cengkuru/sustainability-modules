const mongoose = require('mongoose');
const { sustainabilityBaseSchema, SustainabilityBase } = require('./SustainabilityBase');
const { documentSchema } = require('./Document');

// Economic and Financial Sustainability Module Schema
const economicSustainabilitySchema = new mongoose.Schema({
  // Procurement strategy document
  procurementStrategy: documentSchema,
  
  // Life-cycle cost
  lifeCycleCost: {
    amount: Number,
    currency: String,
    details: String
  },
  
  // Life-cycle cost calculation methodology
  lifeCycleCostMethodology: documentSchema,
  
  // Funding sources
  fundingSources: [{
    organization: {
      id: String,
      name: String
    },
    phase: {
      type: String,
      enum: ['preparation', 'implementation', 'maintenance']
    },
    details: String
  }],
  
  // Budgets for different phases
  budgets: [{
    phase: {
      type: String,
      enum: ['preparation', 'implementation', 'maintenance']
    },
    amount: Number,
    currency: String,
    details: String
  }],
  
  // Cost-benefit analysis
  costBenefitAnalysis: documentSchema,
  
  // Value for money
  valueForMoney: documentSchema,
  
  // Asset lifetime
  assetLifetime: {
    startDate: Date,
    endDate: Date,
    durationInYears: Number,
    details: String
  },
  
  // Budget projections by year
  budgetProjections: [{
    year: Number,
    amount: Number,
    currency: String,
    details: String
  }],
  
  // Budget shortfall
  budgetShortfall: {
    amount: Number,
    currency: String,
    explanation: String
  },
  
  // Maintenance plan
  maintenancePlan: documentSchema
});

const EconomicSustainability = SustainabilityBase.discriminator(
  'Economic',
  economicSustainabilitySchema
);

module.exports = EconomicSustainability; 