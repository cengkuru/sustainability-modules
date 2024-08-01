import {Attachment} from "./attachment.model";

export interface InstitutionalSustainabilityData {
    attachments: Attachment[];
    numberOfFreedomOfInformationAnswers: number;
    numberOfFreedomOfInformationRequests: number;
}
