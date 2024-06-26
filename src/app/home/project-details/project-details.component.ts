import { Component, OnInit } from '@angular/core';
import { CommonModule, DatePipe, NgForOf } from '@angular/common';
import { Observable } from 'rxjs';
import { ActivatedRoute } from '@angular/router';
import { AngularFirestore } from '@angular/fire/compat/firestore';
import { map } from 'rxjs/operators';

@Component({
    selector: 'app-project-details',
    standalone: true,
    imports: [
        DatePipe,
        NgForOf,
        CommonModule
    ],
    templateUrl: './project-details.component.html',
    styleUrls: ['./project-details.component.scss']
})
export class ProjectDetailsComponent implements OnInit {
    project$: Observable<any> | undefined;
    activeTab: string = 'identification';
    identificationActiveTab: string = 'basicData';
    preparationActiveTab: string = 'basicData';
    tenderManagementActiveTab: string = 'basicData';
    implementationActiveTab: string = 'basicData';
    completionActiveTab: string = 'basicData';
    operationAndMaintenanceActiveTab: string = 'basicData';
    decommissioningActiveTab: string = 'basicData';
    identificationTabs: { id: string, label: string }[] = [];
    preparationTabs: { id: string, label: string }[] = [];
    tenderManagementTabs: { id: string, label: string }[] = [];
    implementationTabs: { id: string, label: string }[] = [];
    completionTabs: { id: string, label: string }[] = [];
    operationAndMaintenanceTabs: { id: string, label: string }[] = [];
    decommissioningTabs: { id: string, label: string }[] = [];

    tabs = [
        { id: 'identification', label: 'Identification', icon: 'bi-info-circle' },
        { id: 'preparation', label: 'Preparation', icon: 'bi-tools' },
        { id: 'tender-management', label: 'Tender Management', icon: 'bi-file-earmark' },
        { id: 'implementation', label: 'Implementation', icon: 'bi-play-circle' },
        { id: 'completion', label: 'Completion', icon: 'bi-check-circle' },
        { id: 'operation-and-maintenance', label: 'Operation and Maintenance', icon: 'bi-gear' },
        { id: 'decommissioning', label: 'Decommissioning', icon: 'bi-x-circle' }
    ];

    constructor(
        private route: ActivatedRoute,
        private firestore: AngularFirestore
    ) {}

    ngOnInit(): void {
        this.route.paramMap.subscribe(params => {
            const projectId = params.get('id');
            if (projectId) {
                this.getProjectById(projectId);
            }
        });
    }

    getProjectById(projectId: string): void {
        this.project$ = this.firestore.collection('projects').doc(projectId).valueChanges().pipe(
            map(project => {
                if (project) {
                    this.generateIdentificationTabs(project);
                    this.generatePreparationTabs(project);
                    this.generateTenderManagementTabs(project);
                    this.generateImplementationTabs(project);
                    this.generateCompletionTabs(project);
                    this.generateOperationAndMaintenanceTabs(project);
                    this.generateDecommissioningTabs(project);
                    return { id: projectId, ...project as object };
                }
                return null;
            })
        );
    }

    generateIdentificationTabs(project: any): void {
        const identificationStage = project.stages.identification;
        this.identificationTabs = Object.keys(identificationStage).map(key => ({
            id: key,
            label: this.formatLabel(key)
        }));
    }

    generatePreparationTabs(project: any): void {
        const preparationStage = project.stages.preparation;
        this.preparationTabs = Object.keys(preparationStage).map(key => ({
            id: key,
            label: this.formatLabel(key)
        }));
    }

    generateTenderManagementTabs(project: any): void {
        const tenderManagementStage = project.stages['tenderManagement'];
        this.tenderManagementTabs = Object.keys(tenderManagementStage).map(key => ({
            id: key,
            label: this.formatLabel(key)
        }));
    }

    generateImplementationTabs(project: any): void {
        const implementationStage = project.stages.implementation;
        this.implementationTabs = Object.keys(implementationStage).map(key => ({
            id: key,
            label: this.formatLabel(key)
        }));
    }

    generateCompletionTabs(project: any): void {
        const completionStage = project.stages.completion;
        this.completionTabs = Object.keys(completionStage).map(key => ({
            id: key,
            label: this.formatLabel(key)
        }));
    }

    generateOperationAndMaintenanceTabs(project: any): void {
        const operationAndMaintenanceStage = project.stages['operationsAndMaintenance'];
        this.operationAndMaintenanceTabs = Object.keys(operationAndMaintenanceStage).map(key => ({
            id: key,
            label: this.formatLabel(key)
        }));
    }

    generateDecommissioningTabs(project: any): void {
        const decommissioningStage = project.stages['decommissioning'];
        this.decommissioningTabs = Object.keys(decommissioningStage).map(key => ({
            id: key,
            label: this.formatLabel(key)
        }));
    }

    formatLabel(key: string): string {
        return key.replace(/([A-Z])/g, ' $1').replace(/^./, str => str.toUpperCase());
    }

    setActiveTab(tab: string): void {
        this.activeTab = tab;
    }

    setIdentificationActiveTab(tab: string): void {
        this.identificationActiveTab = tab;
    }

    setPreparationActiveTab(tab: string): void {
        this.preparationActiveTab = tab;
    }

    setTenderManagementActiveTab(tab: string): void {
        this.tenderManagementActiveTab = tab;
    }

    setImplementationActiveTab(tab: string): void {
        this.implementationActiveTab = tab;
    }

    setCompletionActiveTab(tab: string): void {
        this.completionActiveTab = tab;
    }

    setOperationAndMaintenanceActiveTab(tab: string): void {
        this.operationAndMaintenanceActiveTab = tab;
    }

    setDecommissioningActiveTab(tab: string): void {
        this.decommissioningActiveTab = tab;
    }
}
