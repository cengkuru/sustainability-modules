import {BasicData} from "./basicdata.model";
import {Attachment} from "./attachment.model";


export interface ClimateFinanceData {
    attachments: Attachment[];
    performanceMonitoring: string;
    reportingPeriod: string;
    independentMonitoring: string;
    typeOfMonitoring: string;
    disbursementRecords: string;
}

export interface EconomicAndFinancialSustainabilityData {
    fundingSourceForImplementation: string;
    attachments: Attachment[];
    budgetForImplementation: string;
    budgetShortfall: string;
}


export interface OperationsAndMaintenance {
    socialSustainabilityData: SocialSustainabilityData;
    basicData: BasicData;
    climateFinanceData: ClimateFinanceData;
    institutionalSustainabilityData: InstitutionalSustainabilityData;
    environmentalAndClimateSustainabilityData: EnvironmentalAndClimateSustainabilityData;
    economicAndFinancialSustainabilityData: EconomicAndFinancialSustainabilityData;
}

export interface EnvironmentalAndClimateSustainabilityData {
    attachments: Attachment[];
    environmentalMeasures: string;
    climateMeasures: string;
    conservationMeasures: string;
}

export interface InstitutionalSustainabilityData {
    attachments: Attachment[];
    numberOfFreedomOfInformationAnswers: number;
    numberOfFreedomOfInformationRequests: number;
}

export interface SocialSustainabilityData {
    workersAccidents: number;
    inclusiveImplementation: string;
    jobsGenerated: number;
    attachments: Attachment[];
}

