
import {Attachment} from "./attachment.model";

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

export interface ContractOfficial {
    name: string;
    role: string;
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
