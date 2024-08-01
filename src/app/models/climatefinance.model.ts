import {Attachment} from "./attachment.model";

export interface ClimateFinanceData {
    attachments: Attachment[];
    performanceMonitoring: string;
    reportingPeriod: string;
    independentMonitoring: string;
    typeOfMonitoring: string;
    disbursementRecords: string;
}
