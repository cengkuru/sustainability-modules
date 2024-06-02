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
    identificationActiveTab: string = 'basicData'; // Add this line
    preparationActiveTab: string = 'basicData';
    tenderManagementActiveTab: string = 'basicData';
    implementationActiveTab: string = 'basicData';
    completionActiveTab: string = 'basicData';
    operationAndMaintenanceActiveTab: string = 'basicData';
    decommissioningActiveTab: string = 'basicData';

    steps: string[] = ['Planned', 'In Progress', 'Completed'];

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
                    return { id: projectId, ...project as object };
                }
                return null;
            })
        );
    }

    setActiveTab(tab: string): void {
        this.activeTab = tab;
    }

    setPreparationActiveTab(tab: string): void {
        this.preparationActiveTab = tab;
    }

    setIdentificationActiveTab(tab: string): void { // Add this method
        this.identificationActiveTab = tab;
    }

    setTenderManagementActiveTab(tab: string): void {
        this.tenderManagementActiveTab = tab;
    }

    setImplementationActiveTab(tab: string): void { // Add this method
        this.implementationActiveTab = tab;
    }

    setCompletionActiveTab(tab: string): void { // Add this method
        this.completionActiveTab = tab;
    }

    setOperationAndMaintenanceActiveTab(tab: string): void { // Add this method
        this.operationAndMaintenanceActiveTab = tab;
    }

    setDecommissioningActiveTab(tab: string): void { // Add this method
        this.decommissioningActiveTab = tab;
    }

}
