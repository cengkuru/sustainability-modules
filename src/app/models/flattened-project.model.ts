export interface FlattenedProject {
    id: string;
    name: string;
    featured: boolean;
    location: string;
    coordinates: {
        lat: number;
        lng: number;
    };
    sector: string;
    projectOwner: string;
    projectReferenceNumber: string;
    purpose: string;
    description: string;
    status: string;
    completionDate: string;
    completionCost: string;

    identificationClimateObjective: string;
    identificationAmountOfInvestment: string;

    preparationProjectBudget: string;
    preparationProjectBudgetApprovalDate: string;
    preparationNumberOfBeneficiaries: number;
    preparationFundingSources: string;

    tenderContractType: string;
    tenderProcurementMethod: string;
    tenderContractStatus: string;
    tenderContractDuration: string;
    tenderContractStartDate: string;
    tenderNumberOfFirmsTendering: number;
    tenderCostEstimate: string;
    tenderContractPrice: string;

    implementationVariationToContractPrice: string;
    implementationVariationToContractDuration: string;
    implementationEscalationOfContractPrice: string;
    implementationJobsGenerated: number;

    completionScopeAtCompletion: string;
    completionProjectStatus: string;

    maintenanceTypeOfWorks: string;
    maintenanceScope: string;
    maintenanceBudget: string;

    decommissioningTypeOfWorks: string;
    decommissioningWorksDescription: string;
    decommissioningPeriod: string;
    decommissioningCosts: string;

    dateCreated: string;
    dateUpdated: string;
    version: string;
}
