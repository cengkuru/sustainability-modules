import {Attachment} from "./attachment.model";

export interface EconomicAndFinancialSustainabilityData {
    fundingSourceForImplementation: string;
    attachments: Attachment[];
    budgetForImplementation: string;
    budgetShortfall: string;
}
