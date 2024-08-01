import {Attachment} from "./attachment.model";


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
