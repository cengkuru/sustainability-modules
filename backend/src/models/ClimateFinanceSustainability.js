const mongoose = require('mongoose');
const { sustainabilityBaseSchema, SustainabilityBase } = require('./SustainabilityBase');
const { documentSchema } = require('./Document');
const { 
  ClimateObjective, 
  ClimateOversightTypes,
  DisbursementStatus 
} = require('./CodeLists');

// Climate Finance Module Schema
const climateFinanceSustainabilitySchema = new mongoose.Schema({
  // Climate objective
  climateObjective: {
    type: String,
    enum: Object.values(ClimateObjective),
    required: true
  },
  
  // Financial instrument
  financialInstrument: {
    type: String,
    isConcessional: Boolean,
    isResultsBased: Boolean,
    details: String
  },
  
  // Climate transformation
  climateTransformation: documentSchema,
  
  // Climate finance decision-making
  decisionMaking: {
    organizationId: String,
    organizationName: String,
    contactDetails: String,
    decisionProcess: String
  },
  
  // Nationally Determined Contributions alignment
  ndcAlignment: {
    isAligned: Boolean,
    specificTarget: String,
    alignmentDetails: String
  },
  
  // Paris Agreement alignment
  parisAgreementAlignment: {
    isAligned: Boolean,
    specificArticles: [String],
    alignmentDetails: String
  },
  
  // Beneficiaries
  beneficiaries: {
    description: String,
    number: Number,
    categories: [String],
    details: String
  },
  
  // Amount of investment
  investmentAmount: {
    amount: Number,
    currency: String,
    disbursementPeriod: {
      startDate: Date,
      endDate: Date
    }
  },
  
  // Funding source
  fundingSource: String,
  
  // Green Climate Fund accredited entity
  gcfAccreditedEntity: {
    organizationId: String,
    organizationName: String,
    contactDetails: String
  },
  
  // Accredited entity type
  accreditedEntityType: String,
  
  // Project preparation costs
  preparationCosts: {
    amount: Number,
    currency: String,
    details: String
  },
  
  // Project preparation period
  preparationPeriod: {
    startDate: Date,
    endDate: Date
  },
  
  // Project approval period
  approvalPeriod: {
    submissionDate: Date,
    approvalDate: Date,
    details: String
  },
  
  // Ratio of co-finance
  coFinanceRatio: [{
    financeType: String,
    amount: Number,
    currency: String,
    ratio: Number,
    source: String
  }],
  
  // Terms of climate finance
  financeTerms: {
    interestRate: Number,
    graceYears: Number,
    maturityYears: Number,
    specialConditions: String
  },
  
  // Carbon efficiency
  carbonEfficiency: {
    amount: Number,
    currency: String,
    details: String
  },
  
  // Non-climate co-benefits
  nonClimateBenefits: [{
    benefitType: String,
    description: String
  }],
  
  // Public consultation meetings
  consultationMeetings: [{
    date: Date,
    location: String,
    participants: Number,
    document: documentSchema,
    notes: String
  }],
  
  // Disbursement records
  disbursementRecords: [{
    plannedDate: Date,
    actualDate: Date,
    amount: Number,
    currency: String,
    status: {
      type: String,
      enum: Object.values(DisbursementStatus)
    },
    notes: String
  }],
  
  // Type of project monitoring
  monitoringType: {
    type: String,
    enum: Object.values(ClimateOversightTypes)
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
  
  // Reporting period
  reportingPeriod: String,
  
  // Oversight reports
  oversightReports: documentSchema,
  
  // Independent monitoring
  independentMonitoring: {
    organizationId: String,
    organizationName: String,
    contactDetails: String,
    monitoringScope: String
  },
  
  // Independent evaluation
  independentEvaluation: documentSchema,
  
  // Impact measurement
  impactMeasurement: documentSchema,
  
  // Carbon footprint
  carbonFootprint: {
    value: Number,
    unit: {
      type: String,
      default: 'tons CO2 equivalent'
    },
    details: String
  },
  
  // Infrastructure assets to be decommissioned
  assetsToDecommission: [{
    projectId: String,
    assetName: String,
    description: String
  }],
  
  // Decommission period
  decommissionPeriod: {
    startDate: Date,
    endDate: Date
  },
  
  // Decommission plan
  decommissionPlan: documentSchema,
  
  // Carbon decommission savings
  carbonDecommissionSavings: {
    value: Number,
    unit: {
      type: String,
      default: 'tons CO2 equivalent'
    },
    details: String
  },
  
  // Decommission mitigation plan
  decommissionMitigationPlan: documentSchema
});

const ClimateFinanceSustainability = SustainabilityBase.discriminator(
  'ClimateFinance',
  climateFinanceSustainabilitySchema
);

module.exports = ClimateFinanceSustainability; 