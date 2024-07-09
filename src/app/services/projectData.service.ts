// project-data.service.ts
import { Injectable } from '@angular/core';

@Injectable({
    providedIn: 'root'
})
export class ProjectDataService {

    getBasicDataItems(basicData: any) {
        return {
            'Project Reference Number': basicData.projectReferenceNumber,
            'Project Owner': basicData.projectOwner,
            'Sector, Subsector': basicData.sectorSubsector,
            'Project Name': basicData.projectName,
            'Project Location': basicData.projectLocation,
            'Purpose': basicData.purpose,
            'Project Description': basicData.projectDescription,
            'Project Brief or Feasibility Study': basicData.projectBriefOrFeasibilityStudy,
            'Project Scope': basicData.projectScope,
            'Contact Details': basicData.contactDetails,
            'Funding Sources': basicData.fundingSources,
            'Project Budget': basicData.projectBudget,
            'Project Budget Approval Date': basicData.projectBudgetApprovalDate,
            'Number of Beneficiaries': basicData.numberOfBeneficiaries,
            'Climate and Disaster Risk Assessment': basicData.climateAndDisasterRiskAssessment,
            'Conservation Measures': basicData.conservationMeasures,
            'Risk Management Plans': basicData.riskManagementPlans,
            'Life Cycle Cost Calculation Methodology': basicData.lifeCycleCostCalculationMethodology,
            'Climate Measures': basicData.climateMeasures,
            'Asset Lifetime': basicData.assetLifetime,
            'Indigenous Land': basicData.indigenousLand,
            'Environmental Measures': basicData.environmentalMeasures,
            'Protected Area': basicData.protectedArea,
            'Public Consultation Meetings': basicData.publicConsultationMeetings,
            'Land Compensation Budget': basicData.landCompensationBudget,
            'Cost Benefit Analysis': basicData.costBenefitAnalysis,
            'Environmental Impact Category': basicData.environmentalImpactCategory,
            'Forecast of Greenhouse Gas Emissions': basicData.forecastOfGreenhouseGasEmissions,
            'Life Cycle Cost': basicData.lifeCycleCost,
            'Value for Money': basicData.valueForMoney,
            'Environmental Licenses and Exemptions': basicData.environmentalLicensesAndExemptions,
            'Inclusive Design': basicData.inclusiveDesign,
            'Maintenance Plan': basicData.maintenancePlan,
            'Procurement Strategy': basicData.procurementStrategy,
            'Budget Projections': basicData.budgetProjections,
            'Budget for Preparation': basicData.budgetForPreparation
        };
    }

    getClimateFinanceDataItems(climateFinanceData: any) {
        return {
            'Climate Objective': climateFinanceData.climateObjective,
            'Financial Instrument': climateFinanceData.financialInstrument,
            'Climate Transformation': climateFinanceData.climateTransformation,
            'Climate Finance Decision-Making': climateFinanceData.climateFinanceDecisionMaking,
            'Nationally Determined Contributions': climateFinanceData.nationallyDeterminedContributions,
            'Paris Agreement': climateFinanceData.parisAgreement,
            'Amount of Investment': climateFinanceData.amountOfInvestment,
            'Policy Coherence': climateFinanceData.policyCoherence,
            'Beneficiaries': climateFinanceData.beneficiaries,
            'Green Climate Fund Accredited Entity': climateFinanceData.greenClimateFundAccreditedEntity,
            'Accredited Entity Type': climateFinanceData.accreditedEntityType,
            'Ratio of Co-Finance': climateFinanceData.ratioOfCoFinance,
            'Project Approval Period': climateFinanceData.projectApprovalPeriod,
            'Carbon Efficiency': climateFinanceData.carbonEfficiency,
            'Project Preparation Period': climateFinanceData.projectPreparationPeriod,
            'Non-Climate Co-Benefits': climateFinanceData.nonClimateCoBenefits,
            'Terms of Climate Finance': climateFinanceData.termsOfClimateFinance,
            'Project Preparation Costs': climateFinanceData.projectPreparationCosts,
            'Funding Source': climateFinanceData.fundingSource
        };
    }

    getInstitutionalSustainabilityDataItems(institutionalSustainabilityData: any) {
        return {
            'Policy Coherence Documentation': institutionalSustainabilityData.policyCoherenceDocumentation,
            'Number of Freedom of Information Requests': institutionalSustainabilityData.numberOfFreedomOfInformationRequests,
            'Number of Freedom of Information Answers': institutionalSustainabilityData.numberOfFreedomOfInformationAnswers,
            'Number of Lobbying Activities': institutionalSustainabilityData.numberOfLobbyingActivities,
            'Lobbying Meetings Minutes': institutionalSustainabilityData.lobbyingMeetingsMinutes,
            'Freedom of Information Requests and Answers': institutionalSustainabilityData.freedomOfInformationRequestsAndAnswers,
            'Risk Management Plans': institutionalSustainabilityData.riskManagementPlans
        };
    }

    getSocialSustainabilityDataItems(socialSustainabilityData: any) {
        return {
            'Public Consultation Meetings': socialSustainabilityData.publicConsultationMeetings,
            'Inclusive Design': socialSustainabilityData.inclusiveDesign,
            'Labor Obligations': socialSustainabilityData.laborObligations,
            'Land Compensation Budget': socialSustainabilityData.landCompensationBudget,
            'Indigenous Land': socialSustainabilityData.indigenousLand,
            'Beneficiaries': socialSustainabilityData.beneficiaries,
            'Number of Beneficiaries': socialSustainabilityData.numberOfBeneficiaries
        };
    }

    getEconomicFinancialSustainabilityDataItems(economicFinancialSustainabilityData: any) {
        return {
            'Value for Money': economicFinancialSustainabilityData.valueForMoney,
            'Budget for Preparation': economicFinancialSustainabilityData.budgetForPreparation,
            'Maintenance Plan': economicFinancialSustainabilityData.maintenancePlan,
            'Asset Lifetime': economicFinancialSustainabilityData.assetLifetime,
            'Cost Benefit Analysis': economicFinancialSustainabilityData.costBenefitAnalysis,
            'Funding Source for Preparation': economicFinancialSustainabilityData.fundingSourceForPreparation,
            'Budget Projections': economicFinancialSustainabilityData.budgetProjections,
            'Procurement Strategy': economicFinancialSustainabilityData.procurementStrategy,
            'Life Cycle Cost Calculation Methodology': economicFinancialSustainabilityData.lifeCycleCostCalculationMethodology,
            'Life Cycle Cost': economicFinancialSustainabilityData.lifeCycleCost
        };
    }

    getEnvironmentalClimateSustainabilityDataItems(environmentalClimateSustainabilityData: any) {
        return {
            'Environmental Licenses and Exemptions': environmentalClimateSustainabilityData.environmentalLicensesAndExemptions,
            'Forecast of Greenhouse Gas Emissions': environmentalClimateSustainabilityData.forecastOfGreenhouseGasEmissions,
            'Protected Area': environmentalClimateSustainabilityData.protectedArea,
            'Climate Measures': environmentalClimateSustainabilityData.climateMeasures,
            'Environmental Measures': environmentalClimateSustainabilityData.environmentalMeasures,
            'Environmental Impact Category': environmentalClimateSustainabilityData.environmentalImpactCategory,
            'Climate and Disaster Risk Assessment': environmentalClimateSustainabilityData.climateAndDisasterRiskAssessment,
            'Conservation Measures': environmentalClimateSustainabilityData.conservationMeasures
        };
    }

    getAllAttachments(stage: any) {
        return [
            ...(stage.basicData?.attachments || []),
            ...(stage.climateFinanceData?.attachments || []),
            ...(stage.socialSustainabilityData?.attachments || []),
            ...(stage.institutionalSustainabilityData?.attachments || []),
            ...(stage.economicAndFinancialSustainabilityData?.attachments || []),
            ...(stage.environmentalAndClimateSustainabilityData?.attachments || [])
        ];
    }
}