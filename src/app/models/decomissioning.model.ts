import {SocialSustainabilityData} from "./socialsustainabilitydata.model";
import {EconomicAndFinancialSustainabilityData} from "./economocandfinancialsustainabilitydata.model";
import {EnvironmentalAndClimateSustainabilityData} from "./environmentalandclimatesustainabilitydata.model";
import {InstitutionalSustainabilityData} from "./institutionalsustainabilitydata.model";
import {ClimateFinanceData} from "./climatefinance.model";
import {BasicData} from "./basicdata.model";

export interface Decommissioning {
    socialSustainabilityData: SocialSustainabilityData;
    economicAndFinancialSustainabilityData: EconomicAndFinancialSustainabilityData;
    environmentalAndClimateSustainabilityData: EnvironmentalAndClimateSustainabilityData;
    institutionalSustainabilityData: InstitutionalSustainabilityData;
    climateFinanceData: ClimateFinanceData;
    basicData: BasicData;
}
