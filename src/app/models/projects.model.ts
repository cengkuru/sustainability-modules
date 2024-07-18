// core/models/project.model.ts

export interface Metadata {
  dateUpdated: string;
  language: string;
  lastModifiedBy: string;
  changeLog: ChangeLog[];
version: string;
datePublished: string;
dateCreated: string;
}

export interface ChangeLog {
date: string;
changedBy: string;
change: string;
}

export interface Coordinates {
lat: number;
lng: number;
popup: string;
}

export interface Location {
name: string;
coordinates: Coordinates;
}

export interface Attachment {
pages: number;
title: string;
format: string;
dateModified: string;
datePublished: string;
documentType: string;
url: string;
language: string;
description: string;
}

export interface SocialSustainabilityData {
workersAccidents: number;
inclusiveImplementation: string;
jobsGenerated: number;
attachments: Attachment[];
}

export interface EconomicAndFinancialSustainabilityData {
fundingSourceForImplementation: string;
attachments: Attachment[];
budgetForImplementation: string;
budgetShortfall: string;
}

export interface InstitutionalSustainabilityData {
attachments: Attachment[];
numberOfFreedomOfInformationAnswers: number;
numberOfFreedomOfInformationRequests: number;
}

export interface EnvironmentalAndClimateSustainabilityData {
attachments: Attachment[];
environmentalMeasures: string;
climateMeasures: string;
conservationMeasures: string;
}

export interface ClimateFinanceData {
attachments: Attachment[];
performanceMonitoring: string;
reportingPeriod: string;
independentMonitoring: string;
typeOfMonitoring: string;
disbursementRecords: string;
}

export interface BasicData {
escalationOfContractPrice: string;
reasonsForScope: string;
attachments: Attachment[];
reasonsForDurationChanges: string;
variationToContractDuration: string;
variationToContractScope: string;
variationToContractPrice: string;
reasonsForPriceChanges: string;
}

export interface Implementation {
socialSustainabilityData: SocialSustainabilityData;
economicAndFinancialSustainabilityData: EconomicAndFinancialSustainabilityData;
institutionalSustainabilityData: InstitutionalSustainabilityData;
environmentalAndClimateSustainabilityData: EnvironmentalAndClimateSustainabilityData;
climateFinanceData: ClimateFinanceData;
basicData: BasicData;
}

export interface OperationsAndMaintenance {
socialSustainabilityData: SocialSustainabilityData;
basicData: BasicData;
climateFinanceData: ClimateFinanceData;
institutionalSustainabilityData: InstitutionalSustainabilityData;
environmentalAndClimateSustainabilityData: EnvironmentalAndClimateSustainabilityData;
economicAndFinancialSustainabilityData: EconomicAndFinancialSustainabilityData;
}

export interface Decommissioning {
socialSustainabilityData: SocialSustainabilityData;
economicAndFinancialSustainabilityData: EconomicAndFinancialSustainabilityData;
environmentalAndClimateSustainabilityData: EnvironmentalAndClimateSustainabilityData;
institutionalSustainabilityData: InstitutionalSustainabilityData;
climateFinanceData: ClimateFinanceData;
basicData: BasicData;
}

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
}

export interface ContractOfficial {
name: string;
role: string;
}

export interface ProjectOfficial {
name: string;
role: string;
}
