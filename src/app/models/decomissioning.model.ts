import {BasicData} from "./basicdata.model";
import {
    ClimateFinanceData, EconomicAndFinancialSustainabilityData,
    EnvironmentalAndClimateSustainabilityData,
    InstitutionalSustainabilityData, SocialSustainabilityData
} from "./operationandmaintenance.model";

export interface Decommissioning {
    socialSustainabilityData: SocialSustainabilityData;
    economicAndFinancialSustainabilityData: EconomicAndFinancialSustainabilityData;
    environmentalAndClimateSustainabilityData: EnvironmentalAndClimateSustainabilityData;
    institutionalSustainabilityData: InstitutionalSustainabilityData;
    climateFinanceData: ClimateFinanceData;
    basicData: BasicData;
}
