import {SocialSustainabilityData} from "./socialsustainabilitydata.model";
import {EconomicAndFinancialSustainabilityData} from "./economocandfinancialsustainabilitydata.model";
import {InstitutionalSustainabilityData} from "./institutionalsustainabilitydata.model";
import {EnvironmentalAndClimateSustainabilityData} from "./environmentalandclimatesustainabilitydata.model";
import {ClimateFinanceData} from "./climatefinance.model";
import {BasicData} from "./basicdata.model";
import {Transaction} from "./transaction.model";
import {Milestone} from "./milestone.model";

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
