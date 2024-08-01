
import {Attachment} from "./attachment.model";


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
