import { Component, OnInit } from '@angular/core';
import {CommonModule, DatePipe, KeyValue, NgForOf} from '@angular/common';
import { Observable, of } from "rxjs";
import { ActivatedRoute, Router } from "@angular/router";
import { switchMap, tap } from "rxjs/operators";
import { animate, style, transition, trigger } from "@angular/animations";
import { ProjectService } from "../../services/project.service";
import { AttachmentListComponent } from "./attachment-list/attachment-list.component";
import {HttpClient, HttpClientModule} from "@angular/common/http";
import {FormatSectionTitlePipe} from "../../pipes/format-section-title.pipe";
import {JsonViewerComponent} from "../../shared/components/json-viewer/json-viewer.component";
import {DataItemComponent} from "../../shared/components/data-item/data-item.component";

@Component({
    selector: 'app-project-details',
    standalone: true,
    imports: [
        DatePipe,
        NgForOf,
        CommonModule,
        HttpClientModule,
        AttachmentListComponent,
        FormatSectionTitlePipe,
        JsonViewerComponent,
        DataItemComponent

    ],
    templateUrl: './project-details.component.html',
    styleUrls: ['./project-details.component.scss'],
    animations: [
        trigger('fadeSlideInOut', [
            transition(':enter', [
                style({ opacity: 0, transform: 'translateY(10px)' }),
                animate('300ms cubic-bezier(0.25, 0.1, 0.25, 1)', style({ opacity: 1, transform: 'translateY(0)' })),
            ]),
            transition(':leave', [
                animate('300ms cubic-bezier(0.25, 0.1, 0.25, 1)', style({ opacity: 0, transform: 'translateY(10px)' })),
            ]),
        ]),
        trigger('stageAnimation', [
            transition(':enter', [
                style({ opacity: 0, transform: 'translateY(20px)' }),
                animate('300ms cubic-bezier(0.33, 1, 0.68, 1)', style({ opacity: 1, transform: 'translateY(0)' })),
            ], { delay: '{{ delay }}' })
        ]),
        trigger('itemAnimation', [ // Example trigger for list items
            transition(':enter', [
                style({ opacity: 0, transform: 'scale(0.9)' }),
                animate('200ms ease-out', style({ opacity: 1, transform: 'scale(1)' })),
            ]),
            transition(':leave', [
                animate('200ms ease-in', style({ opacity: 0, transform: 'scale(0.9)' })),
            ]),
        ]),
        trigger('modalAnimation', [ // Example trigger for modals
            transition(':enter', [
                style({ opacity: 0, transform: 'translateY(-50%)' }),
                animate('300ms ease-out', style({ opacity: 1, transform: 'translateY(0)' })),
            ]),
            transition(':leave', [
                animate('300ms ease-in', style({ opacity: 0, transform: 'translateY(-50%)' })),
            ]),
        ]),
        // Add more triggers as needed based on your HTML structure
    ],
    providers: [ProjectService, DatePipe]
})
export class ProjectDetailsComponent implements OnInit {

    stages = [
        { id: 'Identification', icon: 'bi-info-circle', label: 'Identification' },
        { id: 'Preparation', icon: 'bi-tools', label: 'Preparation' },
        { id: 'TenderManagement', icon: 'bi-file-earmark', label: 'Tendering' },
        { id: 'Implementation', icon: 'bi-play-circle', label: 'Implementation' },
        { id: 'Completion', icon: 'bi-check-circle', label: 'Completion' },
        { id: 'OperationAndMaintenance', icon: 'bi-gear', label: 'Maintenance' },
        { id: 'Decommissioning', icon: 'bi-x-circle', label: 'Decommissioning' }
    ];
    hoveredStage: string | null = null;

    project$: Observable<any> | undefined;
    projectIds: string[] = [];
    nextProject$!: Observable<any>;
    previousProject$!: Observable<any>;
    currentProjectIndex: number = 0;
    selectedTab: string = 'Identification';
    isLoading: boolean = true;


    showIdentificationModal = false;
    // do for other stages
    showPreparationModal = false;
    showTenderManagementModal = false;
    showImplementationModal = false;
    showCompletionModal = false;
    showOperationsAndMaintenanceModal = false;
    showDecommissioningModal = false;



    identificationStructure: any;
    identificationDataExplanations: Map<string, string> = new Map([
        ["projectReferenceNumber", "A unique identifier for the project, crucial for tracking and ensuring no duplication in records."],
        ["projectOwner", "The entity or organization legally responsible for the project's execution, which also sets the tone for sustainability practices."],
        ["sectorSubsector", "Categorizes the project's focus, helping to align it with relevant sustainability goals or sectors like renewable energy or sustainable agriculture."],
        ["projectName", "The title that encapsulates the project's essence, often hinting at its sustainability focus (e.g., 'Green Energy Initiative')."],
        ["projectLocation", "Details where the project's impacts will be most felt, crucial for assessing local environmental and social sustainability."],
        ["purpose", "Outlines the project's objectives, which should inherently include or at least not conflict with sustainability goals."],
        ["projectDescription", "A comprehensive overview that should detail how sustainability is integrated into the project's core activities."],
        ["climateObjective", "Specifies how the project contributes to climate goals, a key aspect of sustainability in modern projects."],
        ["nationallyDeterminedContributions", "Links the project to international climate commitments, showing its role in global sustainability efforts."],
        ["parisAgreement", "Details how the project supports the Paris Agreement's goals, emphasizing global environmental responsibility."],
        ["climateTransformation", "Describes the project's role in either mitigating climate change or helping communities adapt to its effects."],
        ["climateFinanceDecisionMaking", "Explains how financial decisions are made with sustainability in mind, ensuring funds are used for environmentally beneficial outcomes."],
        ["amountOfInvestment", "The financial commitment, which can reflect the project's scale and its potential impact on sustainability."],
        ["preliminaryEIA", "An initial environmental impact assessment to foresee and mitigate negative environmental effects."],
        ["biodiversityImpact", "Assesses how the project affects local wildlife and ecosystems, aiming for biodiversity conservation."],
        ["ecosystemServicesImpact", "Evaluates changes to natural services like water purification or pollination due to the project."],
        ["carbonReductionTarget", "Sets specific goals for reducing carbon footprints, a direct measure of environmental sustainability."],
        ["waterUsage", "Details strategies for water conservation, crucial in areas facing water scarcity."],
        ["wasteManagement", "Plans for handling waste, aiming for minimal environmental impact through recycling or composting."],
        ["lifeCycleCosting", "Considers the project's cost over its lifespan, including sustainability costs like decommissioning or environmental cleanup."],
        ["environmentalFootprint", "An overall estimate of the project's environmental impact, guiding towards more sustainable practices."],
        ["sustainableMaterials", "Specifies the use of materials that are less harmful to the environment, promoting resource efficiency."],
        ["energyEfficiencyPlan", "Strategies to reduce energy consumption, contributing to lower greenhouse gas emissions."],
        ["renewableEnergyIntegration", "Plans to incorporate renewable energy, enhancing the project's environmental credentials."],
        ["wasteReductionAndRecycling", "Goals for reducing waste generation and increasing recycling rates, aligning with circular economy principles."],
        ["stakeholderEngagement", "How community and environmental groups are involved, ensuring projects meet local sustainability expectations."],
        ["sustainabilityCertifications", "Certifications like LEED or BREEAM that validate the project's sustainability efforts."],
        ["adaptationMeasures", "Steps taken to make the project resilient against future climate changes, ensuring long-term sustainability."],
        ["futureClimateProjections", "Incorporates future climate scenarios into project planning, preparing for sustainability challenges ahead."],
        ["communityEngagement", "Details how local communities are involved in decision-making, ensuring projects benefit and are supported by those they impact."],
        ["policyCoherenceDocumentation", "Shows how the project aligns with national and international sustainability policies."],
        ["freedomOfInformationRequestsAndAnswers", "Transparency measures that ensure public scrutiny over sustainability claims and practices."],
        ["lobbyingMeetingsMinutes", "Records of how external influences might affect the project's sustainability direction."]
    ]);

    // This will store the ordered sections
    orderedSectionsIdentification: string[] = [
        'basicData',
        'climateFinanceData',
        'socialSustainabilityData',
        'economicFinancialSustainabilityData',
        'environmentalClimateSustainabilityData',
        'institutionalSustainabilityData'
    ];

    preparationStructure: any;
    preparationDataExplanations: Map<string, string> = new Map([
        // Basic Data
        ["projectScope", "This outlines what the project aims to achieve and its limits, helping everyone know what's in and out of the project's focus."],
        ["contactDetails", "Who to call or email if you have questions about the project."],
        ["fundingSources", "Where the money for the project is coming from, so everyone knows who's backing it."],
        ["projectBudget", "How much money has been set aside for the project, like your allowance for the project."],
        ["projectBudgetApprovalDate", "The day when the money was officially okayed for use, marking when the project could really start."],

        // Climate Finance Data
        ["greenClimateFundAccreditedEntity", "If the project is officially recognized by a big climate fund, which can help get more money."],
        ["accreditedEntityType", "What kind of organization is managing the climate money."],
        ["ratioOfCoFinance", "How much of the project's funding comes from different places, showing how much of the money is 'green'."],
        ["projectApprovalPeriod", "How long it took to get the project officially green-lit."],
        ["carbonEfficiency", "How good the project is at reducing carbon for the money spent."],
        ["projectPreparationPeriod", "The time set aside to plan everything before starting work."],
        ["nonClimateCoBenefits", "Extra good things the project does, like helping local jobs or health, beyond just helping the climate."],
        ["termsOfClimateFinance", "The rules or conditions under which the climate money is given."],
        ["projectPreparationCosts", "How much it costs just to get ready for the project."],
        ["fundingSource", "Exactly where the money for the project comes from."],

        // Environmental and Climate Sustainability Data
        ["environmentalLicensesAndExemptions", "The official papers needed to make sure the project follows environmental laws."],
        ["forecastOfGreenhouseGasEmissions", "How much carbon the project might add to the air."],
        ["protectedArea", "If the project might affect areas that are legally protected for nature."],
        ["climateMeasures", "What the project does specifically to fight climate change."],
        ["environmentalMeasures", "Steps taken to reduce harm to the environment."],
        ["environmentalImpactCategory", "What kind of environmental issues the project might cause."],
        ["climateAndDisasterRiskAssessment", "Looking at how climate change might mess with the project."],
        ["conservationMeasures", "What's being done to keep nature safe around the project."],

        // Economic and Financial Sustainability Data
        ["valueForMoney", "Is the project worth the money it costs?"],
        ["budgetForPreparation", "Money set aside just for planning."],
        ["maintenancePlan", "How the project will be kept running smoothly long-term."],
        ["assetLifetime", "How long the project or its parts are expected to last."],
        ["costBenefitAnalysis", "Does the project's benefits outweigh its costs?"],
        ["fundingSourceForPreparation", "Where the planning money comes from."],
        ["budgetProjections", "Guessing how much money will be needed in the future."],
        ["procurementStrategy", "How goods and services for the project are bought."],
        ["lifeCycleCostCalculationMethodology", "How they figure out all the costs from start to finish."],
        ["lifeCycleCost", "All the money the project will ever cost."],

        // Institutional Sustainability Data
        ["numberOfFreedomOfInformationRequests", "How many times people asked for project info."],
        ["policyCoherenceDocumentation", "How the project fits with other government plans."],
        ["numberOfFreedomOfInformationAnswers", "How many times the project answered public questions."],
        ["freedomOfInformationRequestsAndAnswers", "All the questions asked and answers given."],
        ["riskManagementPlans", "Plans to deal with anything that could go wrong."],

        // Social Sustainability Data
        ["publicConsultationMeetings", "Meetings where the public can give their opinion on the project."],
        ["inclusiveDesign", "Making sure the project works for everyone, not just some."],
        ["laborObligations", "Rules about how workers should be treated."],
        ["landCompensationBudget", "Money set aside to pay people if their land is used."],
        ["indigenousLand", "Special care taken if the project affects land of indigenous people."],
        ["beneficiaries", "Who will gain from the project."],
        ["numberOfBeneficiaries", "How many people will benefit."]
    ]);
    orderedSectionsPreparation: string[] = [
        'basicData',
        'climateFinanceData',
        'environmentalAndClimateSustainabilityData',
        'economicAndFinancialSustainabilityData',
        'institutionalSustainabilityData',
        'socialSustainabilityData'
    ];

    tenderManagementStructure: any;
    tenderManagementDataExplanations: Map<string, string> = new Map([
        // Basic Data
        ["sustainabilityCriteriaInEvaluation", "How environmental, social, and governance factors are considered when choosing suppliers or contractors."],
        ["sustainabilityCriteriaInEvaluation.weight", "How much of the decision-making process is influenced by sustainability considerations."],
        ["sustainabilityCriteriaInEvaluation.criteria", "The specific sustainability benchmarks that bidders must meet."],

        // Environmental and Climate Sustainability Data
        ["sustainabilityCertifications", "Proof that the project or its components meet recognized environmental standards, which can sway tender decisions."],
        ["carbonFootprint", "The total greenhouse gas emissions the project will cause, a key metric for tenders focused on climate impact."],
        ["carbonFootprint.constructionPhase", "Carbon emissions expected during the building phase, crucial for contractors to plan and bid."],
        ["carbonFootprint.operationPhase", "Ongoing emissions during the project's life, important for long-term sustainability commitments."],
        ["carbonFootprint.offsetStrategies", "Plans to reduce or compensate for emissions, showing bidders' commitment to sustainability."],
        ["materialUsage", "Details on the types and origins of materials, influencing the tender's environmental impact."],
        ["materialUsage.recycledContent", "The use of recycled materials, which can lower costs and environmental impact."],
        ["materialUsage.localSourcing", "Preference for local materials to reduce transport emissions and support local economies."],
        ["energyEfficiency", "How the project will minimize energy use, a key consideration for operational costs and environmental impact."],
        ["energyEfficiency.standards", "The energy efficiency standards the project aims to meet, guiding tender specifications."],
        ["energyEfficiency.renewableEnergy", "The commitment to using renewable energy sources, which can be a tender requirement."],

        // Social Sustainability Data
        ["communityEngagement", "How the project plans to involve and benefit local communities, a factor in social impact assessments."],
        ["communityEngagement.strategy", "The methods used to engage with the community, which can influence public support and tender outcomes."],
        ["communityEngagement.outcomes", "The expected or achieved benefits for the community, often required in tender documentation."],
        ["wasteManagement", "The approach to handling project waste, important for environmental compliance and cost management."],
        ["wasteManagement.strategy", "Plans for waste reduction and recycling, which can affect the project's environmental score."],
        ["wasteManagement.facilities", "The infrastructure for waste management, which bidders might need to provide or use."],

        // Institutional Sustainability Data
        ["sustainabilityReporting", "How often and in what detail the project's sustainability performance will be reported."],
        ["sustainabilityReporting.frequency", "The schedule for sustainability reports, ensuring transparency and accountability."],
        ["sustainabilityReporting.KPIs", "The metrics used to gauge sustainability success, which bidders must align with."],
        ["compliance", "The legal and regulatory frameworks the project must adhere to, crucial for tender eligibility."],
        ["compliance.laws", "Specific laws or regulations that the project must comply with, affecting tender requirements."],
        ["compliance.standards", "Global or industry standards for sustainability, which can be tender criteria."],
        ["innovationInSustainability", "New or unique sustainability practices the project will employ, potentially giving a competitive edge in tenders."],
        ["innovationInSustainability.description", "Details on how these innovations work, useful for tender proposals."],
        ["innovationInSustainability.benefit", "The tangible benefits of these innovations, which can influence tender scores."]
    ]);
    orderedSectionsTenderManagement: string[] = [
        'basicData',
        'environmentalAndClimateSustainabilityData',
        'socialSustainabilityData',
        'institutionalSustainabilityData'
    ];

    implementationStructure: any;
    implementationDataExplanations: Map<string, string> = new Map([
        // Basic Data
        ["variationToContractPrice", "How much the project's cost changed from what was originally agreed upon, showing if it cost more or less than expected."],
        ["escalationOfContractPrice", "The increase in project cost due to things like inflation or unexpected expenses."],
        ["variationToContractDuration", "How the project's timeline has shifted, indicating if it's taking longer or was completed sooner than planned."],
        ["variationToContractScope", "Changes in what the project is supposed to do or achieve, showing if it grew or shrank in ambition."],
        ["reasonsForPriceChanges", "Why the project's cost changed, giving a clear picture of where the extra money went or why less was needed."],
        ["reasonsForScope", "Explains why the project's goals or activities were modified, often due to new information or changing needs."],
        ["reasonsForDurationChanges", "Details on why the project timeline was adjusted, whether due to delays or efficiencies."],

        // Environmental and Climate Sustainability Data
        ["environmentalMeasures", "Steps taken to ensure the project doesn't harm the environment, like reducing pollution or protecting wildlife."],
        ["climateMeasures", "Actions specifically aimed at reducing carbon emissions or adapting to climate change effects."],
        ["conservationMeasures", "What's being done to preserve or enhance local natural resources and biodiversity."],
        ["environmentalImpactMonitoring", "Regular checks to see how the project is affecting the environment, ensuring minimal negative impact."],
        ["energyUsage", "How much energy the project uses, with a focus on using renewable sources like solar or wind."],
        ["wasteManagement", "How waste from the project is handled, focusing on recycling and minimizing landfill use."],
        ["carbonFootprint", "The total greenhouse gases produced by the project, helping to understand its contribution to global warming."],
        ["materialSustainability", "Choosing materials for the project that have lower environmental impacts or are more sustainable."],
        ["longTermSustainabilityPlan", "Plans for how the project will continue to be sustainable long after it's completed."],
        ["supplyChainSustainability", "Ensuring that all parts of the project's supply chain, from raw materials to final product, are environmentally and socially responsible."],

        // Social Sustainability Data
        ["workersAccidents", "Incidents at work that show how safe or unsafe the project environment is for workers."],
        ["inclusiveImplementation", "Efforts to make sure the project benefits everyone in the community, not just a select few."],
        ["jobsGenerated", "The number of jobs created, showing the project's impact on local employment."],
        ["communityImpact", "How the project affects the local community, including social, cultural, and economic changes."],

        // Economic and Financial Sustainability Data
        ["budgetForImplementation", "The total amount of money set aside for this phase of the project."],
        ["fundingSourceForImplementation", "Where the money for the project comes from, like government funds, private investment, or grants."],
        ["budgetShortfall", "If the project is running out of money, this shows how much more is needed."],

        // Institutional Sustainability Data
        ["numberOfFreedomOfInformationRequests", "How many times the public has asked for information about the project, indicating public interest."],
        ["numberOfFreedomOfInformationAnswers", "How many of those requests were answered, showing how open the project management is."],

        // Climate Finance Data (Moved here for logical grouping)
        ["disbursementRecords", "Records of how money is being spent, ensuring funds are used as intended."],
        ["typeOfMonitoring", "How the financial and environmental aspects of the project are being watched over."],
        ["performanceMonitoring", "How often and in what way the project's success is being measured."],
        ["reportingPeriod", "The time frame for which the data is being reported, giving context to the figures."],
        ["independentMonitoring", "Checks by external parties to ensure everything is above board and transparent."]
    ]);
    orderedSectionsImplementation: string[] = [
        'basicData',
        'climateFinanceData',
        'environmentalAndClimateSustainabilityData',
        'socialSustainabilityData',
        'economicAndFinancialSustainabilityData',
        'institutionalSustainabilityData'
    ];

    completionStructure: any;
    orderedSectionsCompletion: string[] = [
        'basicData',
        'institutionalSustainabilityData'
    ];
    completionDataExplanations: Map<string, string> = new Map([
        // Basic Data
        ["projectStatus", "Whether the project is finished, ongoing, or has been put on hold."],
        ["completionDate", "The day we officially said 'done' and handed over the project."],
        ["completionCost", "How much the project ended up costing in total, to see if we stayed within budget."],
        ["scopeAtCompletion", "What the project actually ended up being, including any changes from what we first planned."],
        ["reasonsForProjectChanges", "Why we made any changes to the project during its life."],

        // Environmental Sustainability Data
        ["environmentalImpactData", "How the project affected the environment, including what we did to lessen the impact."],
        ["environmentalImpactData.postProjectEnvironmentalImpact", "What the environment looks like now that the project is done."],
        ["environmentalImpactData.sustainabilityMeasures", "What we're doing to keep the project environmentally friendly after it's finished."],

        // Social Sustainability Data
        ["socialSustainability", "How the project has influenced the community and society."],
        ["socialSustainability.communityFeedback", "What people in the community think about the project now that it's done."],
        ["socialSustainability.employmentAndTraining", "How many jobs were created and what skills were taught because of the project."],

        // Economic Sustainability Data
        ["economicSustainability", "Whether the project was a good investment for the economy."],
        ["economicSustainability.costBenefitAnalysis", "Comparing what the project cost versus what benefits it brought."],
        ["economicSustainability.revenueGeneration", "How much money the project is making now that it's up and running."],

        // Operational Sustainability Data
        ["operationalSustainability", "How we're planning to keep the project running smoothly and effectively."],

        // Institutional and Governance Sustainability Data
        ["institutionalAndGovernanceSustainability", "The rules and systems in place to manage the project long-term."],

        // Technological Sustainability Data
        ["technologicalSustainability", "How we're keeping the technology in the project up-to-date and efficient."],

        // Risk Management
        ["riskManagement", "What could go wrong in the future and how we're preparing for it."],

        // Institutional Sustainability Data
        ["numberOfFreedomOfInformationRequests", "How many times people asked for project information, showing public interest."],
        ["numberOfFreedomOfInformationAnswers", "How many of those requests we answered, showing our commitment to openness."]
    ]);

    operationsAndMaintenanceStructure: any;
    orderedSectionsOperationsAndMaintenance: string[] = [
        'basicData',
        'climateFinanceData',
        'environmentalAndClimateSustainabilityData',
        'socialSustainabilityData',
        'economicAndFinancialSustainabilityData',
        'institutionalSustainabilityData'
    ];
    operationsAndMaintenanceDataExplanations: Map<string, string> = new Map([
        // Basic Data
        ["assetName", "The name of what we're fixing or maintaining, like a bridge or a building."],
        ["assetLocation", "Where exactly this maintenance is happening, so you know where to look or avoid."],
        ["typeOfMaintenanceWorks", "What kind of work we're doing, like repairs, upgrades, or routine checks."],
        ["worksDescription", "A detailed rundown of what we're doing step by step."],
        ["maintenanceScope", "How big or small the maintenance job is, what parts of the asset are involved."],
        ["projectOfficialsAndRoles", "Who's in charge of what during the maintenance, so you know who to thank or blame."],
        ["healthAndSafetyMeasures", "Steps we take to make sure everyone stays safe while the work is going on."],

        // Climate Finance Data
        ["impactMeasurement", "How we're figuring out if our maintenance work is good or bad for the climate."],
        ["carbonFootprint", "How much CO2 and other gases we're putting out while maintaining the asset."],

        // Environmental and Climate Sustainability Data
        ["environmentalMeasures", "What we're doing to not mess up the environment while we maintain the asset."],
        ["climateMeasures", "Special steps to make sure our maintenance doesn't make climate change worse."],
        ["conservationMeasures", "How we're protecting local nature and wildlife during our work."],
        ["waterManagement", "Ways we're saving water or using it wisely during maintenance."],
        ["biodiversityImpact", "Checking if our work affects the local plants and animals, and what we're doing about it."],
        ["sustainableProcurement", "Choosing materials and suppliers that are good for the planet."],

        // Social Sustainability Data
        ["jobsGenerated", "How many jobs we've created with this maintenance work."],
        ["inclusiveImplementation", "Making sure everyone gets a fair shot at these jobs, not just the usual suspects."],
        ["workersAccidents", "How many mishaps happened on the job, showing how safe or unsafe it is."],

        // Economic and Financial Sustainability Data
        ["budgetForMaintenance", "How much money we've set aside for keeping this asset in good shape."],
        ["fundingSourceForMaintenance", "Where the money for maintenance is coming from, like taxes or special funds."],
        ["sustainableProcurementCost", "The extra cost (or savings) from choosing eco-friendly materials and methods."],

        // Institutional Sustainability Data
        ["numberOfFreedomOfInformationRequests", "How many times people asked for info about what we're doing."],
        ["numberOfFreedomOfInformationAnswers", "How many of those questions we've answered, showing how open we are."]
    ]);

    decommissioningStructure: any;
    orderedSectionsDecommissioning: string[] = [
        'basicData',
        'climateFinanceData',
        'environmentalAndClimateSustainabilityData',
        'socialSustainabilityData',
        'economicAndFinancialSustainabilityData',
        'institutionalSustainabilityData'
    ];
    decommissioningDataExplanations: Map<string, string> = new Map([
        // Basic Data
        ["maintenanceScope", "What exactly we're doing to shut down and clean up the site."],
        ["decommissioningTimeline", "When we started, when we'll finish, and key dates in between."],
        ["decommissioningTimeline.start", "The day we kicked off the decommissioning process."],
        ["decommissioningTimeline.end", "When we expect to be completely done with decommissioning."],
        ["decommissioningTimeline.milestones", "Important steps or achievements along the way."],
        ["safetyMeasures", "How we're keeping everyone safe while we're taking things apart."],
        ["safetyMeasures.trainingHoursPerWorker", "How much safety training each worker gets."],
        ["safetyMeasures.safetyIncidents", "Any accidents or near-misses during the work."],
        ["safetyMeasures.safetyProtocolCompliance", "How well we're following our own safety rules."],

        // Climate Finance Data
        ["carbonDecommissionSavings", "How much less CO2 we're putting out by decommissioning this way."],
        ["energyConsumption", "What types of energy we're using to do the decommissioning."],
        ["energyConsumption.renewable", "How much of our energy comes from green sources like wind or solar."],
        ["energyConsumption.nonRenewable", "How much energy comes from sources like coal or gas."],
        ["decommissionPeriod", "How long the whole decommissioning process is expected to take."],
        ["decommissionCosts", "How much money we're spending to decommission the site."],

        // Environmental and Climate Sustainability Data
        ["decommissionMitigationPlan", "What we're doing to make sure decommissioning doesn't harm the environment."],
        ["actualEnvironmentalImpact", "What actually happened to the environment during decommissioning."],
        ["wasteManagement", "How we're dealing with all the stuff we're taking out."],
        ["wasteManagement.recycledWaste", "What percentage of waste we're recycling."],
        ["wasteManagement.landfillWaste", "What percentage of waste is going to the dump."],
        ["wasteManagement.hazardousWaste", "How much of the waste is dangerous and needs special handling."],
        ["biodiversityImpact", "How decommissioning affects local plants and animals."],

        // Social Sustainability Data
        ["jobsGenerated", "How many jobs we've created with this decommissioning project."],
        ["communityImpact", "What this shutdown means for the people living nearby."],
        ["communityImpact.localEconomicImpact", "How it's affecting local businesses and jobs."],
        ["communityImpact.healthServices", "Changes in health care or emergency services due to decommissioning."],
        ["trainingAndDevelopment", "What skills we're teaching workers for this job."],
        ["trainingAndDevelopment.workersTrained", "How many workers got new training."],
        ["trainingAndDevelopment.trainingPrograms", "What kinds of training we're offering."],
        ["workersAccidents", "How many accidents happened on the job."],

        // Economic and Financial Sustainability Data
        ["decommissionCostForecast", "How much we thought decommissioning would cost."],
        ["actualDecommissionCosts", "How much it actually cost to decommission."],
        ["costVarianceAnalysis", "Why there's a difference between what we thought it would cost and what it really cost."],
        ["fundingSources", "Where the money to pay for decommissioning came from."],

        // Institutional Sustainability Data
        ["stakeholderEngagement", "How we're keeping everyone in the loop about what's happening."],
        ["stakeholderEngagement.publicHearings", "Meetings where the public can ask questions about decommissioning."],
        ["stakeholderEngagement.consultationMeetings", "Meetings with specific groups to discuss decommissioning."],
        ["regulatoryCompliance", "How well we're following all the rules and laws."],
        ["regulatoryCompliance.complianceStatus", "Are we meeting all the legal requirements?"],
        ["regulatoryCompliance.regulatoryBodies", "Who's making sure we're doing things right."],
        ["numberOfFreedomOfInformationRequests", "How many times people asked for info about decommissioning."],
        ["numberOfFreedomOfInformationAnswers", "How many of those requests we answered."]
    ]);


    constructor(
        private route: ActivatedRoute,
        private router: Router,
        private projectService: ProjectService,
        private datePipe: DatePipe,
        private http: HttpClient
    ) {}

    ngOnInit(): void {
        this.isLoading = true;
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
                    console.log('Project:', project);
                    this.nextProject$ = this.projectService.getNextProject(project.id);
                    this.previousProject$ = this.projectService.getPreviousProject(project.id);
                }
                this.isLoading = false;
            })
        );

        // Fetch all project IDs to calculate total projects
        this.projectService.getAllProjectIds().subscribe(ids => {
            this.projectIds = ids;
        });

        this.loadIdentificationStructure();

        // do for other stages
        this.loadPreparationStructure();
        this.loadTenderManagementStructure();
        this.loadImplementationStructure();
        this.loadCompletionStructure();
        this.loadOperationsAndMaintenanceStructure();
        this.loadDecommissioningStructure();
    }

    loadIdentificationStructure() {
        this.http.get('assets/data/identification.json').subscribe(
            (data: any) => {
                this.identificationStructure = data.identification;
            },
            error => {
                console.error('Error loading identification structure:', error);
            }
        );
    }
    // do for other stages
    loadPreparationStructure() {
        this.http.get('assets/data/preparation.json').subscribe(
            (data: any) => {
                this.preparationStructure = data.preparation;
            },
            error => {
                console.error('Error loading preparation structure:', error);
            }
        );
    }

    loadTenderManagementStructure() {
        this.http.get('assets/data/tender-management.json').subscribe(
            (data: any) => {
                this.tenderManagementStructure = data.tenderManagement;
            },
            error => {
                console.error('Error loading tender management structure:', error);
            }
        );
    }

    loadImplementationStructure() {
        this.http.get('assets/data/implementation.json').subscribe(
            (data: any) => {
                this.implementationStructure = data.implementation;
            },
            error => {
                console.error('Error loading implementation structure:', error);
            }
        );
    }

    loadCompletionStructure() {
        this.http.get('assets/data/completion.json').subscribe(
            (data: any) => {
                this.completionStructure = data.completion;
            },
            error => {
                console.error('Error loading completion structure:', error);
            }
        );
    }

    loadOperationsAndMaintenanceStructure() {
        this.http.get('assets/data/operations-and-maintenance.json').subscribe(
            (data: any) => {
                this.operationsAndMaintenanceStructure = data.operationsAndMaintenance;
            },
            error => {
                console.error('Error loading operations and maintenance structure:', error);
            }
        );
    }

    loadDecommissioningStructure() {
        this.http.get('assets/data/decommissioning.json').subscribe(
            (data: any) => {
                this.decommissioningStructure = data.decommissioning;
            },
            error => {
                console.error('Error loading decommissioning structure:', error);
            }
        );
    }

    openIdentificationModal() {
        this.showIdentificationModal = true;
    }

    // do for other stages
    openPreparationModal() {
        this.showPreparationModal = true;
    }

    openTenderManagementModal() {
        this.showTenderManagementModal = true;
    }

    openImplementationModal() {
        this.showImplementationModal = true;
    }

    openCompletionModal() {
        this.showCompletionModal = true;
    }

    openOperationsAndMaintenanceModal() {
        this.showOperationsAndMaintenanceModal = true;
    }

    openDecommissioningModal() {
        this.showDecommissioningModal = true;
    }





    // Helper method to safely get the explanation
    getExplanation(key: unknown): string {
        if (typeof key === 'string') {
            return this.identificationDataExplanations.get(key) || 'No explanation available.';
        }
        return 'No explanation available.';
    }

    // do for other stages
    getExplanationPreparation(key: unknown): string {
        if (typeof key === 'string') {
            return this.preparationDataExplanations.get(key) || 'No explanation available.';
        }
        return 'No explanation available.';
    }

    getExplanationTenderManagement(key: unknown): string {
        if (typeof key === 'string') {
            return this.tenderManagementDataExplanations.get(key) || 'No explanation available.';
        }
        return 'No explanation available.';
    }

    getExplanationImplementation(key: unknown): string {
        if (typeof key === 'string') {
            return this.implementationDataExplanations.get(key) || 'No explanation available.';
        }
        return 'No explanation available.';
    }

    getExplanationCompletion(key: unknown): string {
        if (typeof key === 'string') {
            return this.completionDataExplanations.get(key) || 'No explanation available.';
        }
        return 'No explanation available.';
    }

    getExplanationOperationsAndMaintenance(key: unknown): string {
        if (typeof key === 'string') {
            return this.operationsAndMaintenanceDataExplanations.get(key) || 'No explanation available.';
        }
        return 'No explanation available.';
    }

    getExplanationDecommissioning(key: unknown): string {
        if (typeof key === 'string') {
            return this.decommissioningDataExplanations.get(key) || 'No explanation available.';
        }
        return 'No explanation available.';
    }

    getOrderedKeys(section: string): string[] {
        const sectionData = this.identificationStructure[section];
        if (!sectionData) return [];

        return Array.from(this.identificationDataExplanations.keys())
            .filter(key => key in sectionData);
    }

    // do for other stages
    getOrderedKeysPreparation(section: string): string[] {
        const sectionData = this.preparationStructure[section];
        if (!sectionData) return [];

        return Array.from(this.preparationDataExplanations.keys())
            .filter(key => key in sectionData);
    }

    getOrderedKeysTenderManagement(section: string): string[] {
        const sectionData = this.tenderManagementStructure[section];
        if (!sectionData) return [];

        return Array.from(this.tenderManagementDataExplanations.keys())
            .filter(key => key in sectionData);
    }

    getOrderedKeysImplementation(section: string): string[] {
        const sectionData = this.implementationStructure[section];
        if (!sectionData) return [];

        return Array.from(this.implementationDataExplanations.keys())
            .filter(key => key in sectionData);
    }

    getOrderedKeysCompletion(section: string): string[] {
        const sectionData = this.completionStructure[section];
        if (!sectionData) return [];

        return Array.from(this.completionDataExplanations.keys())
            .filter(key => key in sectionData);
    }

    getOrderedKeysOperationsAndMaintenance(section: string): string[] {
        const sectionData = this.operationsAndMaintenanceStructure[section];
        if (!sectionData) return [];

        return Array.from(this.operationsAndMaintenanceDataExplanations.keys())
            .filter(key => key in sectionData);
    }

    getOrderedKeysDecommissioning(section: string): string[] {
        const sectionData = this.decommissioningStructure[section];
        if (!sectionData) return [];

        return Array.from(this.decommissioningDataExplanations.keys())
            .filter(key => key in sectionData);
    }

    // Helper method to handle KeyValue pairs
    handleKeyValue(keyValue: KeyValue<unknown, unknown>): KeyValue<string, unknown> {
        return {
            key: String(keyValue.key),
            value: keyValue.value
        };
    }

    // Helper method to get sections
    getSections(): string[] {
        return this.orderedSectionsIdentification;
    }

    // do for other stages
    getSectionsPreparation(): string[] {
        return this.orderedSectionsPreparation;
    }

    getSectionsTenderManagement(): string[] {
        return this.orderedSectionsTenderManagement;
    }

    getSectionsImplementation(): string[] {
        return this.orderedSectionsImplementation;
    }

    getSectionsCompletion(): string[] {
        return this.orderedSectionsCompletion;
    }

    getSectionsOperationsAndMaintenance(): string[] {
        return this.orderedSectionsOperationsAndMaintenance;
    }

    getSectionsDecommissioning(): string[] {
        return this.orderedSectionsDecommissioning;
    }

    // Helper method to check if a value is an object
    isObject(value: any): boolean {
        return value !== null && typeof value === 'object' && !Array.isArray(value);
    }

    navigateToProject(project: any): void {
        if (project) {
            this.router.navigate(['/public/projects', project.id]);
        }
    }

    getCurrentStageName(): string {
        const currentStage = this.stages.find(stage => stage.id === this.selectedTab);
        return currentStage ? currentStage.label : '';
    }

    getTotalProjects(): number {
        return this.projectIds.length;
    }




    onTabChange(event: Event): void {
        const target = event.target as HTMLSelectElement;
        this.selectedTab = target.value;
    }

    getCurrentProjectIndex(): number {
        return this.currentProjectIndex + 1;
    }

    closeModalOnOverlayClick(event: MouseEvent): void {
        // Check if the click is on the overlay itself, not on the modal content
        if ((event.target as HTMLElement).classList.contains('bg-black')) {
            this.closeIdentificationModal();
        }
    }

    closeIdentificationModal(): void {
        this.showIdentificationModal = false;
    }

    // do for other stages
    closePreparationModal(): void {
        this.showPreparationModal = false;
    }

    closeTenderManagementModal(): void {
        this.showTenderManagementModal = false;
    }

    closeImplementationModal(): void {
        this.showImplementationModal = false;
    }

    closeCompletionModal(): void {
        this.showCompletionModal = false;
    }

    closeOperationsAndMaintenanceModal(): void {
        this.showOperationsAndMaintenanceModal = false;
    }

    closeDecommissioningModal(): void {
        this.showDecommissioningModal = false;
    }






    selectTab(tabId: string): void {
        this.selectedTab = tabId;
    }

    getStageStatus(index: number): 'completed' | 'current' | 'upcoming' {
        const selectedIndex = this.stages.findIndex(stage => stage.id === this.selectedTab);
        if (index < selectedIndex) return 'completed';
        if (index === selectedIndex) return 'current';
        return 'upcoming';
    }

    formatHumanFriendlyDate(dateString: string): string {
        if (!dateString) return '';
        return this.datePipe.transform(dateString, 'MMMM d, y, h:mm a') || '';
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
            'Project Scope': basicData.projectScope || '',
            'Contact Details': basicData.contactDetails || '',
            'Funding Sources': basicData.fundingSources || '',
            'Project Budget': basicData.projectBudget || '',
            'Project Budget Approval Date': basicData.projectBudgetApprovalDate || ''
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
            'Funding Source': climateFinanceData.fundingSource,
            'Total Amount of Investments': climateFinanceData.totalAmountOfInvestments,
            'Amount of Investment': climateFinanceData.amountOfInvestment
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
            'Contract Start Date': this.formatHumanFriendlyDate(basicData.contractStartDate),
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
            'Completion Date': this.formatHumanFriendlyDate(basicData.completionDate),
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

    getIconClass(key: string): string {
        if (key.includes('Requests')) {
            return 'bi-file-earmark-text-fill';
        } else if (key.includes('Answers')) {
            return 'bi-chat-square-text-fill';
        }
        return 'bi-info-circle-fill';  // default icon
    }

    formatDateRange(dateRange: string): string {
        if (!dateRange) return '';
        const [start, end] = dateRange.split(' to ');
        const formatDate = (date: string) => new Date(date).toLocaleDateString('en-US', { 
          year: 'numeric', 
          month: 'short', 
          day: 'numeric' 
        });
        return `${formatDate(start)} to ${formatDate(end)}`;
      }

    getSocialIconClass(key: string): string {
        switch (key) {
            case 'Jobs Generated':
                return 'bi-briefcase-fill text-accent6';
            case 'Inclusive Implementation':
                return 'bi-diagram-3-fill text-accent5';
            case 'Workers\' Accidents':
                return 'bi-exclamation-triangle-fill text-secondary-300';
            default:
                return 'bi-info-circle-fill text-accent4';
        }
    }

    // Add this helper method to clean currency values
    private cleanCurrencyValue(value: string | number): number {
        if (typeof value === 'number') return value;
        if (!value) return 0;
        // Remove any currency symbols, spaces, and get just the number
        return parseFloat(value.toString().replace(/[^0-9.-]+/g, ''));
    }

    parseFloat(value: any): number {
        if (!value) return 0;
        if (typeof value === 'number') return value;
        // Remove any non-numeric characters except decimal point
        const numStr = value.toString().replace(/[^0-9.]/g, '');
        return parseFloat(numStr) || 0;
    }

    parseCurrencyValue(value: string | number): { amount: number; currency: string } | null {
        if (!value) return null;
        
        // If it's already a number, return it with default currency
        if (typeof value === 'number') {
            return { amount: value, currency: 'USD' };
        }
        
        // Convert string value to clean number
        const amount = this.cleanCurrencyValue(value);
        
        // Extract currency code if present (assuming it's a 3-letter code)
        const currencyMatch = value.toString().match(/[A-Z]{3}/);
        const currency = currencyMatch ? currencyMatch[0] : 'USD';
        
        return { amount, currency };
    }

}
