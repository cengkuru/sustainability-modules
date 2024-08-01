import {SocialSustainabilityData} from "./socialsustainabilitydata.model";
import {BasicData} from "./basicdata.model";
import {ClimateFinanceData} from "./climatefinance.model";
import {InstitutionalSustainabilityData} from "./institutionalsustainabilitydata.model";
import {EnvironmentalAndClimateSustainabilityData} from "./environmentalandclimatesustainabilitydata.model";
import {EconomicAndFinancialSustainabilityData} from "./economocandfinancialsustainabilitydata.model";

export interface OperationsAndMaintenance {
    socialSustainabilityData: SocialSustainabilityData;
    basicData: BasicData;
    climateFinanceData: ClimateFinanceData;
    institutionalSustainabilityData: InstitutionalSustainabilityData;
    environmentalAndClimateSustainabilityData: EnvironmentalAndClimateSustainabilityData;
    economicAndFinancialSustainabilityData: EconomicAndFinancialSustainabilityData;
}
