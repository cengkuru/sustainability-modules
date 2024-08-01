import {BasicData} from "./basicdata.model";
import {Transaction} from "./transaction.model";
import {Milestone} from "./milestone.model";
import {
    ClimateFinanceData,
    EconomicAndFinancialSustainabilityData, EnvironmentalAndClimateSustainabilityData,
    InstitutionalSustainabilityData,
    SocialSustainabilityData
} from "./operationandmaintenance.model";

export interface Implementation {
    socialSustainabilityData: SocialSustainabilityData;
    economicAndFinancialSustainabilityData: EconomicAndFinancialSustainabilityData;
    institutionalSustainabilityData: InstitutionalSustainabilityData;
    environmentalAndClimateSustainabilityData: EnvironmentalAndClimateSustainabilityData;
    climateFinanceData: ClimateFinanceData;
    basicData: BasicData;
    transactions: Transaction[]; // Add payments made as part of the contract
    milestones: Milestone[]; // Add key events in the contract's implementation
}
