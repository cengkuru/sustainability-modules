import { Component, OnInit } from '@angular/core';
import { CommonModule, DatePipe, NgForOf } from '@angular/common';
import { Observable, of } from "rxjs";
import { ActivatedRoute, Router } from "@angular/router";
import { switchMap } from "rxjs/operators";
import { animate, style, transition, trigger } from "@angular/animations";
import {ProjectService} from "../../services/project.service";

@Component({
    selector: 'app-project-details',
    standalone: true,
    imports: [
        DatePipe,
        NgForOf,
        CommonModule
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
    currentProjectIndex: number = 0;
    selectedTab: string = 'Identification';

    constructor(
        private route: ActivatedRoute,
        private router: Router,
        private projectService: ProjectService
    ) {}

    ngOnInit(): void {
        this.projectService.getProjectIds().subscribe(projectIds => {
            this.projectIds = projectIds;
            this.route.paramMap.subscribe(params => {
                const projectId = params.get('id');
                console.log(projectId);
                if (projectId) {
                    this.currentProjectIndex = this.projectIds.indexOf(projectId);
                    this.project$ = this.projectService.getProjectById(projectId);
                } else {
                    this.project$ = of(null);
                }
            });
        });
    }

    onTabChange(event: Event): void {
        const target = event.target as HTMLSelectElement;
        this.selectedTab = target.value;
    }

    selectTab(tabId: string): void {
        this.selectedTab = tabId;
    }

    navigateToNextProject(): void {
        if (this.currentProjectIndex < this.projectIds.length - 1) {
            const nextProjectId = this.projectIds[this.currentProjectIndex + 1];
            this.router.navigate(['/public/projects', nextProjectId]);
        }
    }

    navigateToPreviousProject(): void {
        if (this.currentProjectIndex > 0) {
            const previousProjectId = this.projectIds[this.currentProjectIndex - 1];
            this.router.navigate(['/public/projects', previousProjectId]);
        }
    }

    getBasicDataItems(basicData: any) {
        return {
            'Project Reference Number': basicData.projectReferenceNumber,
            'Project Owner': basicData.projectOwner,
            'Sector, Subsector': basicData.sectorSubsector,
            'Project Name': basicData.projectName,
            'Project Location': basicData.projectLocation,
            'Purpose': basicData.purpose,
            'Project Description': basicData.projectDescription,
            'Project Brief or Feasibility Study': basicData.projectBriefOrFeasibilityStudy
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
            'Beneficiaries': climateFinanceData.beneficiaries
        };
    }

    getInstitutionalSustainabilityDataItems(institutionalSustainabilityData: any) {
        return {
            'Policy Coherence Documentation': institutionalSustainabilityData.policyCoherenceDocumentation,
            'Number of Freedom of Information Requests': institutionalSustainabilityData.numberOfFreedomOfInformationRequests,
            'Number of Freedom of Information Answers': institutionalSustainabilityData.numberOfFreedomOfInformationAnswers,
            'Number of Lobbying Activities': institutionalSustainabilityData.numberOfLobbyingActivities,
            'Lobbying Meetings Minutes': institutionalSustainabilityData.lobbyingMeetingsMinutes,
            'Freedom of Information Requests and Answers': institutionalSustainabilityData.freedomOfInformationRequestsAndAnswers
        };
    }

    getAllAttachments(identificationStage: any) {
        return [
            ...(identificationStage.basicData.attachments || []),
            ...(identificationStage.climateFinanceData.attachments || []),
            ...(identificationStage.institutionalSustainabilityData.attachments || [])
        ];
    }
}
