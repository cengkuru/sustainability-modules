import { Component, OnInit } from '@angular/core';
import { CommonModule, DatePipe, NgForOf } from '@angular/common';
import { Observable, of } from "rxjs";
import { ActivatedRoute, Router } from "@angular/router";
import { switchMap, tap } from "rxjs/operators";
import { animate, style, transition, trigger } from "@angular/animations";
import { ProjectService } from "../../services/project.service";
import { AttachmentListComponent } from "./attachment-list/attachment-list.component";

@Component({
    selector: 'app-project-details',
    standalone: true,
    imports: [
        DatePipe,
        NgForOf,
        CommonModule,
        AttachmentListComponent
    ],
    templateUrl: './project-details.component.html',
    styleUrls: ['./project-details.component.scss'],
    animations: [
        trigger('fadeSlideInOut', [
            transition(':enter', [
                style({ opacity: 0, transform: 'translateY(10px)' }),
                animate('300ms', style({ opacity: 1, transform: 'translateY(0)' })),
            ]),
            transition(':leave', [
                animate('300ms', style({ opacity: 0, transform: 'translateY(10px)' })),
            ]),
        ]),
    ],
})
export class ProjectDetailsComponent implements OnInit {

    stages = [
        { id: 'Identification', icon: 'bi-info-circle', label: 'Identification' },
        { id: 'Preparation', icon: 'bi-tools', label: 'Preparation' },
        { id: 'TenderManagement', icon: 'bi-file-earmark', label: 'Tender Management' },
        { id: 'Implementation', icon: 'bi-play-circle', label: 'Implementation' },
        { id: 'Completion', icon: 'bi-check-circle', label: 'Completion' },
        { id: 'OperationAndMaintenance', icon: 'bi-gear', label: 'Operation and Maintenance' },
        { id: 'Decommissioning', icon: 'bi-x-circle', label: 'Decommissioning' }
    ];

    project$: Observable<any> | undefined;
    projectIds: string[] = [];
    nextProject$!: Observable<any>;
    previousProject$!: Observable<any>;
    currentProjectIndex: number = 0;
    selectedTab: string = 'Identification';

    constructor(
        private route: ActivatedRoute,
        private router: Router,
        private projectService: ProjectService
    ) {}

    ngOnInit(): void {
        this.project$ = this.route.paramMap.pipe(
            switchMap(params => {
                const projectId = params.get('id');
                if (projectId) {
                    return this.projectService.getProjectById(projectId);
                }
                return of(null);
            }),
            tap(project => {
                if (project) {
                    this.nextProject$ = this.projectService.getNextProject(project.id);
                    this.previousProject$ = this.projectService.getPreviousProject(project.id);
                }
            })
        );
    }

    navigateToProject(project: any): void {
        if (project) {
            this.router.navigate(['/public/projects', project.id]);
        }
    }

    onTabChange(event: Event): void {
        const target = event.target as HTMLSelectElement;
        this.selectedTab = target.value;
    }

    selectTab(tabId: string): void {
        this.selectedTab = tabId;
    }

    getBasicDataItems(basicData: any) {
        if (!basicData) return {};
        return {
            'Project Reference Number': basicData.projectReferenceNumber || '',
            'Project Owner': basicData.projectOwner || '',
            'Sector, Subsector': basicData.sectorSubsector || '',
            'Project Name': basicData.projectName || '',
            'Project Location': basicData.projectLocation || '',
            'Purpose': basicData.purpose || '',
            'Project Description': basicData.projectDescription || '',
            'Project Brief or Feasibility Study': basicData.projectBriefOrFeasibilityStudy || ''
        };
    }

// Repeat this pattern for other get*Items methods.


    getClimateFinanceDataItems(climateFinanceData: any) {
        if (!climateFinanceData) return {};
        return {
            'Climate Objective': climateFinanceData.climateObjective,
            'Financial Instrument': climateFinanceData.financialInstrument,
            'Climate Transformation': climateFinanceData.climateTransformation,
            'Climate Finance Decision-Making': climateFinanceData.climateFinanceDecisionMaking,
            'Nationally Determined Contributions': climateFinanceData.nationallyDeterminedContributions,
            'Paris Agreement': climateFinanceData.parisAgreement,
            'Amount of Investment': climateFinanceData.amountOfInvestment,
            'Policy Coherence': climateFinanceData.policyCoherence,
            'Beneficiaries': climateFinanceData.beneficiaries
        };
    }

    getInstitutionalSustainabilityDataItems(institutionalSustainabilityData: any) {
        if (!institutionalSustainabilityData) return {};
        return {
            'Policy Coherence Documentation': institutionalSustainabilityData.policyCoherenceDocumentation,
            'Number of Freedom of Information Requests': institutionalSustainabilityData.numberOfFreedomOfInformationRequests,
            'Number of Freedom of Information Answers': institutionalSustainabilityData.numberOfFreedomOfInformationAnswers,
            'Number of Lobbying Activities': institutionalSustainabilityData.numberOfLobbyingActivities,
            'Lobbying Meetings Minutes': institutionalSustainabilityData.lobbyingMeetingsMinutes,
            'Freedom of Information Requests and Answers': institutionalSustainabilityData.freedomOfInformationRequestsAndAnswers
        };
    }

    getAllAttachments(stage: any): any[] {
        if (!stage) return [];
        let attachments: any[] = [];
        Object.keys(stage).forEach(key => {
            if (stage[key] && stage[key].attachments) {
                attachments = attachments.concat(stage[key].attachments);
            }
        });
        return attachments;
    }

    getBasicDataItemsPreparation(basicData: any) {
        if (!basicData) return {};
        return {
            'Project Scope': basicData.projectScope,
            'Contact Details': basicData.contactDetails,
            'Funding Sources': basicData.fundingSources,
            'Project Budget': basicData.projectBudget,
            'Project Budget Approval Date': basicData.projectBudgetApprovalDate
        };
    }

    getClimateFinanceDataItemsPreparation(climateFinanceData: any) {
        if (!climateFinanceData) return {};
        return {
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

    getSocialSustainabilityDataItemsPreparation(socialSustainabilityData: any) {
        if (!socialSustainabilityData) return {};
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

    getInstitutionalSustainabilityDataItemsPreparation(institutionalSustainabilityData: any) {
        if (!institutionalSustainabilityData) return {};
        return {
            'Number of Freedom of Information Requests': institutionalSustainabilityData.numberOfFreedomOfInformationRequests,
            'Policy Coherence Documentation': institutionalSustainabilityData.policyCoherenceDocumentation,
            'Number of Freedom of Information Answers': institutionalSustainabilityData.numberOfFreedomOfInformationAnswers,
            'Freedom of Information Requests and Answers': institutionalSustainabilityData.freedomOfInformationRequestsAndAnswers,
            'Risk Management Plans': institutionalSustainabilityData.riskManagementPlans
        };
    }

    getEconomicFinancialSustainabilityDataItemsPreparation(economicFinancialSustainabilityData: any) {
        if (!economicFinancialSustainabilityData) return {};
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

    getEnvironmentalClimateSustainabilityDataItemsPreparation(environmentalClimateSustainabilityData: any) {
        if (!environmentalClimateSustainabilityData) return {};
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

    getAllAttachmentsPreparation(preparationStage: any) {
        if (!preparationStage) return [];
        return [
            ...(preparationStage.basicData?.attachments || []),
            ...(preparationStage.climateFinanceData?.attachments || []),
            ...(preparationStage.socialSustainabilityData?.attachments || []),
            ...(preparationStage.institutionalSustainabilityData?.attachments || []),
            ...(preparationStage.economicAndFinancialSustainabilityData?.attachments || []),
            ...(preparationStage.environmentalAndClimateSustainabilityData?.attachments || [])
        ];
    }

    getBasicDataItemsTenderManagement(basicData: any) {
        if (!basicData) return {};
        return {
            'Procuring Entity': basicData.procuringEntity,
            'Procuring Entity Contact Details': basicData.procuringEntityContactDetails,
            'Procurement Process': basicData.procurementProcess,
            'Procurement Method': basicData.procurementMethod,
            'Number of Firms Tendering': basicData.numberOfFirmsTendering,
            'Cost Estimate': basicData.costEstimate,
            'Contract Type': basicData.contractType,
            'Contract Administration Entity': basicData.contractAdministrationEntity,
            'Contract Officials and Roles': basicData.contractOfficialsAndRoles?.map((official: any) => `${official.name} - ${official.role}`).join(', '),
            'Contract Title': basicData.contractTitle,
            'Contract Firm': basicData.contractFirm,
            'Contract Price': basicData.contractPrice,
            'Contract Scope of Work': basicData.contractScopeOfWork,
            'Contract Start Date': basicData.contractStartDate,
            'Contract Duration': basicData.contractDuration,
            'Contract Status': basicData.contractStatus
        };
    }

    getSocialSustainabilityDataItemsTenderManagement(socialSustainabilityData: any) {
        if (!socialSustainabilityData) return {};
        return {
            'Labor Budget': socialSustainabilityData.laborBudget,
            'Health and Safety Certifications': socialSustainabilityData.healthAndSafetyCertifications
        };
    }

    getInstitutionalSustainabilityDataItemsTenderManagement(institutionalSustainabilityData: any) {
        if (!institutionalSustainabilityData) return {};
        return {
            'Number of Freedom of Information Requests': institutionalSustainabilityData.numberOfFreedomOfInformationRequests,
            'Number of Freedom of Information Answers': institutionalSustainabilityData.numberOfFreedomOfInformationAnswers,
            'Beneficial Ownership': institutionalSustainabilityData.beneficialOwnership,
            'Sustainability Criteria': institutionalSustainabilityData.sustainabilityCriteria,
            'Freedom of Information Requests and Answers': institutionalSustainabilityData.freedomOfInformationRequestsAndAnswers,
            'Anti-Corruption Certifications': institutionalSustainabilityData.antiCorruptionCertifications
        };
    }

    getEnvironmentalClimateSustainabilityDataItemsTenderManagement(environmentalClimateSustainabilityData: any) {
        if (!environmentalClimateSustainabilityData) return {};
        return {
            'Number of Environmental Certifications': environmentalClimateSustainabilityData.numberOfEnvironmentalCertifications,
            'Environmental Certifications': environmentalClimateSustainabilityData.environmentalCertifications
        };
    }

    getAllAttachmentsTenderManagement(stage: any) {
        if (!stage) return [];
        return [
            ...(stage.basicData?.attachments || []),
            ...(stage.socialSustainabilityData?.attachments || []),
            ...(stage.institutionalSustainabilityData?.attachments || []),
            ...(stage.environmentalAndClimateSustainabilityData?.attachments || [])
        ];
    }

    getBasicDataItemsImplementation(basicData: any) {
        if (!basicData) return {};
        return {
            'Variation to Contract Price': basicData.variationToContractPrice,
            'Escalation of Contract Price': basicData.escalationOfContractPrice,
            'Variation to Contract Duration': basicData.variationToContractDuration,
            'Variation to Contract Scope': basicData.variationToContractScope,
            'Reasons for Price Changes': basicData.reasonsForPriceChanges,
            'Reasons for Scope': basicData.reasonsForScope,
            'Reasons for Duration Changes': basicData.reasonsForDurationChanges
        };
    }

    getClimateFinanceDataItemsImplementation(climateFinanceData: any) {
        if (!climateFinanceData) return {};
        return {
            'Disbursement Records': climateFinanceData.disbursementRecords,
            'Type of Monitoring': climateFinanceData.typeOfMonitoring,
            'Performance Monitoring': climateFinanceData.performanceMonitoring,
            'Reporting Period': climateFinanceData.reportingPeriod,
            'Independent Monitoring': climateFinanceData.independentMonitoring
        };
    }

    getSocialSustainabilityDataItemsImplementation(socialSustainabilityData: any) {
        if (!socialSustainabilityData) return {};
        return {
            'Jobs Generated': socialSustainabilityData.jobsGenerated,
            'Inclusive Implementation': socialSustainabilityData.inclusiveImplementation,
            'Workers’ Accidents': socialSustainabilityData.workersAccidents
        };
    }

    getInstitutionalSustainabilityDataItemsImplementation(institutionalSustainabilityData: any) {
        if (!institutionalSustainabilityData) return {};
        return {
            'Number of Freedom of Information Requests': institutionalSustainabilityData.numberOfFreedomOfInformationRequests,
            'Number of Freedom of Information Answers': institutionalSustainabilityData.numberOfFreedomOfInformationAnswers
        };
    }

    getEconomicAndFinancialSustainabilityDataItemsImplementation(economicAndFinancialSustainabilityData: any) {
        if (!economicAndFinancialSustainabilityData) return {};
        return {
            'Budget Shortfall': economicAndFinancialSustainabilityData.budgetShortfall,
            'Funding Source for Implementation': economicAndFinancialSustainabilityData.fundingSourceForImplementation,
            'Budget for Implementation': economicAndFinancialSustainabilityData.budgetForImplementation
        };
    }

    getEnvironmentalAndClimateSustainabilityDataItemsImplementation(environmentalAndClimateSustainabilityData: any) {
        if (!environmentalAndClimateSustainabilityData) return {};
        return {
            'Environmental Measures': environmentalAndClimateSustainabilityData.environmentalMeasures,
            'Conservation Measures': environmentalAndClimateSustainabilityData.conservationMeasures,
            'Climate Measures': environmentalAndClimateSustainabilityData.climateMeasures
        };
    }

    getAllAttachmentsImplementation(stage: any) {
        if (!stage) return [];
        return [
            ...(stage.basicData?.attachments || []),
            ...(stage.climateFinanceData?.attachments || []),
            ...(stage.socialSustainabilityData?.attachments || []),
            ...(stage.institutionalSustainabilityData?.attachments || []),
            ...(stage.economicAndFinancialSustainabilityData?.attachments || []),
            ...(stage.environmentalAndClimateSustainabilityData?.attachments || [])
        ];
    }

    getBasicDataItemsCompletion(basicData: any) {
        if (!basicData) return {};
        return {
            'Project Status': basicData.projectStatus,
            'Completion Cost': basicData.completionCost,
            'Completion Date': basicData.completionDate,
            'Scope at Completion': basicData.scopeAtCompletion,
            'Reasons for Project Changes': basicData.reasonsForProjectChanges
        };
    }

    getInstitutionalSustainabilityDataItemsCompletion(institutionalSustainabilityData: any) {
        if (!institutionalSustainabilityData) return {};
        return {
            'Number of Freedom of Information Requests': institutionalSustainabilityData.numberOfFreedomOfInformationRequests,
            'Number of Freedom of Information Answers': institutionalSustainabilityData.numberOfFreedomOfInformationAnswers
        };
    }

    getAllAttachmentsCompletion(stage: any) {
        if (!stage) return [];
        return [
            ...(stage.basicData?.attachments || []),
            ...(stage.institutionalSustainabilityData?.attachments || [])
        ];
    }

    getBasicDataItemsOandM(basicData: any) {
        if (!basicData) return {};
        return {
            'Asset Name': basicData.assetName,
            'Asset Location': basicData.assetLocation,
            'Type of Maintenance Works': basicData.typeOfMaintenanceWorks,
            'Works Description': basicData.worksDescription,
            'Project Officials and Roles': basicData.projectOfficialsAndRoles?.map((official: any) => `${official.name} - ${official.role}`).join(', '),
            'Maintenance Scope': basicData.maintenanceScope,
            'Maintenance Plan': basicData.maintenancePlan
        };
    }

    getClimateFinanceDataItemsOandM(climateFinanceData: any) {
        if (!climateFinanceData) return {};
        return {
            'Impact Measurement': climateFinanceData.impactMeasurement,
            'Carbon Footprint': climateFinanceData.carbonFootprint
        };
    }

    getSocialSustainabilityDataItemsOandM(socialSustainabilityData: any) {
        if (!socialSustainabilityData) return {};
        return {
            'Jobs Generated': socialSustainabilityData.jobsGenerated,
            'Inclusive Implementation': socialSustainabilityData.inclusiveImplementation,
            'Workers’ Accidents': socialSustainabilityData.workersAccidents
        };
    }

    getInstitutionalSustainabilityDataItemsOandM(institutionalSustainabilityData: any) {
        if (!institutionalSustainabilityData) return {};
        return {
            'Number of Freedom of Information Requests': institutionalSustainabilityData.numberOfFreedomOfInformationRequests,
            'Number of Freedom of Information Answers': institutionalSustainabilityData.numberOfFreedomOfInformationAnswers
        };
    }

    getEconomicFinancialSustainabilityDataItemsOandM(economicFinancialSustainabilityData: any) {
        if (!economicFinancialSustainabilityData) return {};
        return {
            'Funding Source for Maintenance': economicFinancialSustainabilityData.fundingSourceForMaintenance,
            'Budget for Maintenance': economicFinancialSustainabilityData.budgetForMaintenance
        };
    }

    getEnvironmentalClimateSustainabilityDataItemsOandM(environmentalClimateSustainabilityData: any) {
        if (!environmentalClimateSustainabilityData) return {};
        return {
            'Environmental Measures': environmentalClimateSustainabilityData.environmentalMeasures,
            'Conservation Measures': environmentalClimateSustainabilityData.conservationMeasures,
            'Climate Measures': environmentalClimateSustainabilityData.climateMeasures,
            'Environmental Licenses and Exemptions': environmentalClimateSustainabilityData.environmentalLicensesAndExemptions
        };
    }

    getAllAttachmentsOandM(stage: any) {
        if (!stage) return [];
        return [
            ...(stage.basicData?.attachments || []),
            ...(stage.climateFinanceData?.attachments || []),
            ...(stage.socialSustainabilityData?.attachments || []),
            ...(stage.institutionalSustainabilityData?.attachments || []),
            ...(stage.economicAndFinancialSustainabilityData?.attachments || []),
            ...(stage.environmentalAndClimateSustainabilityData?.attachments || [])
        ];
    }

    getBasicDataItemsDecommissioning(basicData: any) {
        if (!basicData) return {};
        return {
            'Decommission Cost Forecast': basicData.decommissionCostForecast,
            'Infrastructure Assets to be Decommissioned': basicData.infrastructureAssetsToBeDecommissioned,
            'Decision of Asset Disposal': basicData.decisionOfAssetDisposal,
            'Carbon Decommission Savings': basicData.carbonDecommissionSavings,
            'Decommission Period': basicData.decommissionPeriod,
            'Decommission Plan': basicData.decommissionPlan,
            'Decommission Mitigation Plan': basicData.decommissionMitigationPlan
        };
    }

    getSocialSustainabilityDataItemsDecommissioning(socialSustainabilityData: any) {
        if (!socialSustainabilityData) return {};
        return {
            'Jobs Generated': socialSustainabilityData.jobsGenerated,
            'Workers’ Accidents': socialSustainabilityData.workersAccidents
        };
    }

    getEnvironmentalClimateSustainabilityDataItemsDecommissioning(environmentalClimateSustainabilityData: any) {
        if (!environmentalClimateSustainabilityData) return {};
        return {
            'Decommission Mitigation Plan': environmentalClimateSustainabilityData.decommissionMitigationPlan
        };
    }

    getEconomicFinancialSustainabilityDataItemsDecommissioning(economicFinancialSustainabilityData: any) {
        if (!economicFinancialSustainabilityData) return {};
        return {
            'Decommission Cost Forecast': economicFinancialSustainabilityData.decommissionCostForecast
        };
    }

    getInstitutionalSustainabilityDataItemsDecommissioning(institutionalSustainabilityData: any) {
        if (!institutionalSustainabilityData) return {};
        return {
            'Number of Freedom of Information Requests': institutionalSustainabilityData.numberOfFreedomOfInformationRequests,
            'Number of Freedom of Information Answers': institutionalSustainabilityData.numberOfFreedomOfInformationAnswers
        };
    }

    getAllAttachmentsDecommissioning(stage: any) {
        if (!stage) return [];
        return [
            ...(stage.basicData?.attachments || []),
            ...(stage.socialSustainabilityData?.attachments || []),
            ...(stage.environmentalAndClimateSustainabilityData?.attachments || []),
            ...(stage.economicAndFinancialSustainabilityData?.attachments || []),
            ...(stage.institutionalSustainabilityData?.attachments || [])
        ];
    }


}
