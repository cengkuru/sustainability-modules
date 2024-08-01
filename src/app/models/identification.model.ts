
import {Attachment} from "./attachment.model";

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
export interface InstitutionalSustainabilityDataIdentification {
    numberOfFreedomOfInformationRequests: number;
    attachments: Attachment[];
    numberOfFreedomOfInformationAnswers: number;
    lobbyingMeetingsMinutes: string;
    numberOfLobbyingActivities: number;
    policyCoherenceDocumentation: string;
    freedomOfInformationRequestsAndAnswers: string;
}

export interface ProjectOfficial {
    name: string;
    role: string;
}




export interface Identification {
    basicData: BasicDataIdentification;
    institutionalSustainabilityData: InstitutionalSustainabilityDataIdentification;
    climateFinanceData: ClimateFinanceDataIdentification;
}
