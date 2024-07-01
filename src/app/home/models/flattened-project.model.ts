export interface FlattenedProject {
    id: string;
    name: string;
    featured: boolean;
    location: string;
    coordinates: { lat: number; lng: number };
    sector: string;
    projectOwner: string;
    projectReferenceNumber: string;
    purpose: string;
    description: string;
    status: string;
    completionDate: string;
    completionCost: string;

    // Identification Stage
    identificationClimateObjective: string;
    identificationAmountOfInvestment: string;

    // Preparation Stage
    preparationProjectBudget: string;
    preparationProjectBudgetApprovalDate: string;
    preparationNumberOfBeneficiaries: number;
    preparationFundingSources: string;

    // Tender Management Stage
    tenderContractType: string;
    tenderProcurementMethod: string;
    tenderContractStatus: string;
    tenderContractDuration: string;
    tenderContractStartDate: string;
    tenderNumberOfFirmsTendering: number;
    tenderCostEstimate: string;
    tenderContractPrice: string;

    // Implementation Stage
    implementationVariationToContractPrice: string;
    implementationVariationToContractDuration: string;
    implementationEscalationOfContractPrice: string;
    implementationJobsGenerated: number;

    // Completion Stage
    completionScopeAtCompletion: string;
    completionProjectStatus: string;

    // Operations and Maintenance Stage
    maintenanceTypeOfWorks: string;
    maintenanceScope: string;
    maintenanceBudget: string;

    // Decommissioning Stage
    decommissioningTypeOfWorks: string;
    decommissioningWorksDescription: string;
    decommissioningPeriod: string;
    decommissioningCosts: string;

    // Metadata
    dateCreated: string;
    dateUpdated: string;
    version: string;
}

function flattenProject(project: any): FlattenedProject {
    return {
        id: project.id,
        name: project.name,
        featured: project.featured,
        location: project.location.name,
        coordinates: project.location.coordinates,
        sector: project.stages.identification.basicData.sectorSubsector,
        projectOwner: project.stages.identification.basicData.projectOwner,
        projectReferenceNumber: project.stages.identification.basicData.projectReferenceNumber,
        purpose: project.stages.identification.basicData.purpose,
        description: project.stages.identification.basicData.projectDescription,
        status: project.stages.completion.basicData.projectStatus,
        completionDate: project.stages.completion.basicData.completionDate,
        completionCost: project.stages.completion.basicData.completionCost,

        // Identification Stage
        identificationClimateObjective: project.stages.identification.climateFinanceData.climateObjective,
        identificationAmountOfInvestment: project.stages.identification.climateFinanceData.amountOfInvestment,

        // Preparation Stage
        preparationProjectBudget: project.stages.preparation.basicData.projectBudget,
        preparationProjectBudgetApprovalDate: project.stages.preparation.basicData.projectBudgetApprovalDate,
        preparationNumberOfBeneficiaries: project.stages.preparation.socialSustainabilityData.numberOfBeneficiaries,
        preparationFundingSources: project.stages.preparation.basicData.fundingSources,

        // Tender Management Stage
        tenderContractType: project.stages.tenderManagement.basicData.contractType,
        tenderProcurementMethod: project.stages.tenderManagement.basicData.procurementMethod,
        tenderContractStatus: project.stages.tenderManagement.basicData.contractStatus,
        tenderContractDuration: project.stages.tenderManagement.basicData.contractDuration,
        tenderContractStartDate: project.stages.tenderManagement.basicData.contractStartDate,
        tenderNumberOfFirmsTendering: project.stages.tenderManagement.basicData.numberOfFirmsTendering,
        tenderCostEstimate: project.stages.tenderManagement.basicData.costEstimate,
        tenderContractPrice: project.stages.tenderManagement.basicData.contractPrice,

        // Implementation Stage
        implementationVariationToContractPrice: project.stages.implementation.basicData.variationToContractPrice,
        implementationVariationToContractDuration: project.stages.implementation.basicData.variationToContractDuration,
        implementationEscalationOfContractPrice: project.stages.implementation.basicData.escalationOfContractPrice,
        implementationJobsGenerated: project.stages.implementation.socialSustainabilityData.jobsGenerated,

        // Completion Stage
        completionScopeAtCompletion: project.stages.completion.basicData.scopeAtCompletion,
        completionProjectStatus: project.stages.completion.basicData.projectStatus,

        // Operations and Maintenance Stage
        maintenanceTypeOfWorks: project.stages.operationsAndMaintenance.basicData.typeOfMaintenanceWorks,
        maintenanceScope: project.stages.operationsAndMaintenance.basicData.maintenanceScope,
        maintenanceBudget: project.stages.operationsAndMaintenance.economicAndFinancialSustainabilityData.budgetForMaintenance,

        // Decommissioning Stage
        decommissioningTypeOfWorks: project.stages.decommissioning.basicData.typeOfMaintenanceWorks,
        decommissioningWorksDescription: project.stages.decommissioning.basicData.worksDescription,
        decommissioningPeriod: project.stages.decommissioning.climateFinanceData.decommissionPeriod,
        decommissioningCosts: project.stages.decommissioning.climateFinanceData.decommissionCosts,

        // Metadata
        dateCreated: project.metadata.dateCreated,
        dateUpdated: project.metadata.dateUpdated,
        version: project.metadata.version
    };
}
