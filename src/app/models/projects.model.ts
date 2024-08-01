// core/models/project.model.ts
import {Metadata} from "./metadata.model";
import {Attachment} from "./attachment.model";
import {Implementation} from "./implementation.model";
import {OperationsAndMaintenance} from "./operationandmaintenance.model";
import {Decommissioning} from "./decomissioning.model";



















export interface EconomicAndFinancialSustainabilityDataPreparation {
  maintenancePlan: string;
  costBenefitAnalysis: string;
  lifeCycleCostCalculationMethodology: string;
  budgetForPreparation: string;
  fundingSourceForPreparation: string;
  attachments: Attachment[];
  valueForMoney: string;
  assetLifetime: string;
  procurementStrategy: string;
  lifeCycleCost: string;
  budgetProjections: string;
}

export interface EnvironmentalAndClimateSustainabilityDataPreparation {
  environmentalImpactCategory: string;
  climateMeasures: string;
  attachments: Attachment[];
  conservationMeasures: string;
  forecastOfGreenhouseGasEmissions: string;
  environmentalLicensesAndExemptions: string;
  protectedArea: string;
  climateAndDisasterRiskAssessment: string;
  environmentalMeasures: string;
}

export interface ClimateFinanceDataPreparation {
  projectPreparationCosts: string;
  attachments: Attachment[];
  projectPreparationPeriod: string;
  nonClimateCoBenefits: string;
  fundingSource: string;
  accreditedEntityType: string;
  carbonEfficiency: string;
  projectApprovalPeriod: string;
  ratioOfCoFinance: string;
  termsOfClimateFinance: string;
  greenClimateFundAccreditedEntity: string;
}

export interface InstitutionalSustainabilityDataPreparation {
  policyCoherenceDocumentation: string;
  riskManagementPlans: string;
  freedomOfInformationRequestsAndAnswers: string;
  numberOfFreedomOfInformationAnswers: number;
  numberOfFreedomOfInformationRequests: number;
  attachments: Attachment[];
}

export interface SocialSustainabilityDataPreparation {
  numberOfBeneficiaries: number;
  attachments: Attachment[];
  landCompensationBudget: string;
  beneficiaries: string;
  publicConsultationMeetings: string;
  inclusiveDesign: string;
  laborObligations: string;
  indigenousLand: string;
}

export interface BasicDataPreparation {
  fundingSources: string;
  projectBudget: string;
  attachments: Attachment[];
  projectBudgetApprovalDate: string;
  projectScope: string;
  contactDetails: string;
}

export interface Preparation {
  economicAndFinancialSustainabilityData: EconomicAndFinancialSustainabilityDataPreparation;
  environmentalAndClimateSustainabilityData: EnvironmentalAndClimateSustainabilityDataPreparation;
  climateFinanceData: ClimateFinanceDataPreparation;
  institutionalSustainabilityData: InstitutionalSustainabilityDataPreparation;
  socialSustainabilityData: SocialSustainabilityDataPreparation;
  basicData: BasicDataPreparation;
  projectRequirements: string; // Add detailed project requirements
  projectApproval: { // Add information about the project approval process
    date: string;
    authority: string;
  };
}

export interface BasicDataTender {
  contractOfficialsAndRoles: ContractOfficial[];
  procuringEntity: string;
  contractType: string;
  contractTitle: string;
  procuringEntityContactDetails: string;
  attachments: Attachment[];
  contractStatus: string;
  contractPrice: string;
  costEstimate: string;
  contractFirm: string;
  contractAdministrationEntity: string;
  contractDuration: string;
  procurementMethod: string;
  contractScopeOfWork: string;
  numberOfFirmsTendering: number;
  procurementProcess: string;
  contractStartDate: string;
}

export interface InstitutionalSustainabilityDataTender {
  freedomOfInformationRequestsAndAnswers: string;
  numberOfFreedomOfInformationAnswers: number;
  antiCorruptionCertifications: string;
  numberOfFreedomOfInformationRequests: number;
  attachments: Attachment[];
  beneficialOwnership: string;
  sustainabilityCriteria: string;
}

export interface SocialSustainabilityDataTender {
  healthAndSafetyCertifications: string;
  attachments: Attachment[];
  laborBudget: string;
}

export interface EnvironmentalAndClimateSustainabilityDataTender {
  environmentalCertifications: string;
  attachments: Attachment[];
  numberOfEnvironmentalCertifications: number;
}

export interface TenderManagement {
  basicData: BasicDataTender;
  institutionalSustainabilityData: InstitutionalSustainabilityDataTender;
  socialSustainabilityData: SocialSustainabilityDataTender;
  environmentalAndClimateSustainabilityData: EnvironmentalAndClimateSustainabilityDataTender;
  tender: Tender; // Add more detailed tender information
  tenderers: Tenderer[]; // Add information about organizations that submitted bids
  bids: Bid[]; // Add detailed information about bids received
  awards: Award[]; // Add information about contract award(s)
}

export interface Tender {
  id: string;
  title: string;
  description: string;
  status: string;
  period: {
    startDate: string;
    endDate: string;
  };
}

export interface Tenderer {
  id: string;
  name: string;
}

export interface Bid {
  id: string;
  tenderer: Tenderer;
  value: {
    amount: number;
    currency: string;
  };
}

export interface Award {
  id: string;
  title: string;
  description: string;
  status: string;
  date: string;
  value: {
    amount: number;
    currency: string;
  };
  suppliers: Tenderer[];
}

export interface BasicDataIdentification {
  projectBriefOrFeasibilityStudy: string;
  attachments: Attachment[];
  sectorSubsector: string;
  purpose: string;
  projectName: string;
  projectOwner: string;
  projectReferenceNumber: string;
  projectOfficialsAndRoles: ProjectOfficial[];
  projectDescription: string;
  projectLocation: string;
  projectSector: string; // Add more detailed sector classification
  projectType: string; // Add project type (construction, rehabilitation, etc.)
}

export interface InstitutionalSustainabilityDataIdentification {
  numberOfFreedomOfInformationRequests: number;
  attachments: Attachment[];
  numberOfFreedomOfInformationAnswers: number;
  lobbyingMeetingsMinutes: string;
  numberOfLobbyingActivities: number;
  policyCoherenceDocumentation: string;
  freedomOfInformationRequestsAndAnswers: string;
}

export interface ClimateFinanceDataIdentification {
  financialInstrument: string;
  climateTransformation: string;
  nationallyDeterminedContributions: string;
  climateObjective: string;
  parisAgreement: string;
  amountOfInvestment: string;
  attachments: Attachment[];
  climateFinanceDecisionMaking: string;
}

export interface Identification {
  basicData: BasicDataIdentification;
  institutionalSustainabilityData: InstitutionalSustainabilityDataIdentification;
  climateFinanceData: ClimateFinanceDataIdentification;
}

export interface BasicDataCompletion {
  completionDate: string;
  attachments: Attachment[];
  scopeAtCompletion: string;
  projectStatus: string;
  reasonsForProjectChanges: string;
  completionCost: string;
}

export interface InstitutionalSustainabilityDataCompletion {
  numberOfFreedomOfInformationRequests: number;
  attachments: Attachment[];
  numberOfFreedomOfInformationAnswers: number;
}

export interface Completion {
  institutionalSustainabilityData: InstitutionalSustainabilityDataCompletion;
  basicData: BasicDataCompletion;
  finalValue: { // Add more detailed breakdown of final project value
    amount: number;
    currency: string;
  };
  finalScope: string; // Add more detailed description of final project scope
}

export interface Project {
  metadata: Metadata;
  location: Location;
  name: string;
  stages: {
    identification: Identification;
    preparation: Preparation;
    tenderManagement: TenderManagement;
    implementation: Implementation;
    operationsAndMaintenance: OperationsAndMaintenance;
    decommissioning: Decommissioning;
    completion: Completion;
  };
  id: string;
  featured: boolean;
  status: string;
  period: { // Add project time frame
    startDate: string;
    endDate: string;
  };
  budget: { // Add overall project budget information
    amount: number;
    currency: string;
  };
  parties: Party[]; // Add information about all parties involved
  relatedProjects: RelatedProject[]; // Add links to related projects
  documents: Document[]; // Add project-level documents
}

// New interfaces for added types
export interface Party {
  id: string;
  name: string;
  roles: string[];
}

export interface RelatedProject {
  id: string;
  relationship: string;
}


export interface ContractOfficial {
  name: string;
  role: string;
}

export interface ProjectOfficial {
  name: string;
  role: string;
}
