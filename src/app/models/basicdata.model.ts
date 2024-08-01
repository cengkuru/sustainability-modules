import {Attachment} from "./attachment.model";

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
