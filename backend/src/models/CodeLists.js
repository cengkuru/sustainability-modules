/**
 * Code lists / dropdown options for the OC4IDS infrastructure data standard
 * These are standardized enumeration values used across the application
 */

// Climate Oversight Types
const ClimateOversightTypes = {
  INTERNAL: 'internal',
  EXTERNAL: 'external'
};

// Contracting Process Status
const ContractingProcessStatus = {
  PRE_AWARD: 'pre-award',
  ACTIVE: 'active',
  CLOSED: 'closed'
};

// Contract Nature
const ContractNature = {
  DESIGN: 'design',
  CONSTRUCTION: 'construction',
  SUPERVISION: 'supervision'
};

// Environmental Goal
const EnvironmentalGoal = {
  CLIMATE_CHANGE_ADAPTATION: 'climateChangeAdaptation',
  CLIMATE_CHANGE_MITIGATION: 'climateChangeMitigation'
};

// Milestone Type
const MilestoneType = {
  PRE_PROCUREMENT: 'preProcurement',
  APPROVAL: 'approval',
  ENGAGEMENT: 'engagement',
  ASSESSMENT: 'assessment',
  DELIVERY: 'delivery',
  REPORTING: 'reporting',
  FINANCING: 'financing',
  PAYMENT: 'payment',
  PROCUREMENT: 'procurement'
};

// Project Status
const ProjectStatus = {
  IDENTIFICATION: 'identification',
  PREPARATION: 'preparation',
  IMPLEMENTATION: 'implementation',
  COMPLETION: 'completion',
  MAINTENANCE: 'maintenance',
  DECOMMISSIONING: 'decommissioning',
  DECOMMISSIONED: 'decommissioned',
  CANCELLED: 'cancelled'
};

// Project Type
const ProjectType = {
  CONSTRUCTION: 'construction',
  REHABILITATION: 'rehabilitation',
  REPLACEMENT: 'replacement',
  EXPANSION: 'expansion',
  DECOMMISSIONING: 'decommissioning'
};

// Asset Class (from OCDS)
const AssetClass = {
  DEBT: 'debt',
  GRANT: 'grant',
  EQUITY: 'equity',
  GUARANTEE: 'guarantee',
  INSURANCE: 'insurance',
  LOAN: 'loan',
  BOND: 'bond',
  OTHER: 'other'
};

// Commonly used currencies (from OCDS)
const CommonCurrencies = {
  USD: 'USD', // US Dollar
  EUR: 'EUR', // Euro
  GBP: 'GBP', // British Pound
  JPY: 'JPY', // Japanese Yen
  CNY: 'CNY', // Chinese Yuan
  INR: 'INR', // Indian Rupee
  NGN: 'NGN', // Nigerian Naira
  KES: 'KES', // Kenyan Shilling
  ZAR: 'ZAR'  // South African Rand
  // Add more as needed
};

// Debt Repayment Priority (from OCDS)
const DebtRepaymentPriority = {
  SENIOR: 'senior',
  SUBORDINATED: 'subordinated',
  JUNIOR: 'junior',
  MEZZANINE: 'mezzanine',
  OTHER: 'other'
};

// Financing Arrangement Type (from OCDS)
const FinancingArrangementType = {
  LOAN: 'loan',
  GRANT: 'grant',
  EQUITY: 'equity',
  GUARANTEE: 'guarantee',
  INSURANCE: 'insurance',
  BOND: 'bond',
  OTHER: 'other'
};

// Financing Party Type (from OCDS)
const FinancingPartyType = {
  GOVERNMENT: 'government',
  COMMERCIAL_BANK: 'commercialBank',
  DEVELOPMENT_BANK: 'developmentBank',
  INVESTMENT_BANK: 'investmentBank',
  PRIVATE_EQUITY: 'privateEquity',
  INSTITUTIONAL_INVESTOR: 'institutionalInvestor',
  MULTILATERAL: 'multilateral',
  INDIVIDUAL: 'individual',
  OTHER: 'other'
};

// Milestone Status (from OCDS)
const MilestoneStatus = {
  SCHEDULED: 'scheduled',
  MET: 'met',
  NOT_MET: 'notMet',
  PARTIALLY_MET: 'partiallyMet',
  ESTIMATED: 'estimated'
};

// Environmental Impact Category (A, B, C)
const EnvironmentalImpactCategory = {
  A: 'A', // High impact
  B: 'B', // Medium impact
  C: 'C'  // Low impact
};

// Climate Objective
const ClimateObjective = {
  MITIGATION: 'mitigation',
  ADAPTATION: 'adaptation',
  CROSS_CUTTING: 'cross-cutting'
};

// Disbursement Status
const DisbursementStatus = {
  PLANNED: 'planned',
  COMPLETED: 'completed',
  DELAYED: 'delayed',
  CANCELLED: 'cancelled'
};

// FOI Request Status
const FOIRequestStatus = {
  SUBMITTED: 'submitted',
  PROCESSING: 'processing',
  ANSWERED: 'answered',
  REJECTED: 'rejected'
};

// Project Publish Status
const PublishStatus = {
  DRAFT: 'draft',
  PUBLISHED: 'published',
  UNPUBLISHED: 'unpublished'
};

// Export all code lists
module.exports = {
  ClimateOversightTypes,
  ContractingProcessStatus,
  ContractNature,
  EnvironmentalGoal,
  MilestoneType,
  ProjectStatus,
  ProjectType,
  AssetClass,
  CommonCurrencies,
  DebtRepaymentPriority,
  FinancingArrangementType,
  FinancingPartyType,
  MilestoneStatus,
  EnvironmentalImpactCategory,
  ClimateObjective,
  DisbursementStatus,
  FOIRequestStatus,
  PublishStatus
}; 