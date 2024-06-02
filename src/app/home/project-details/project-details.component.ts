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
    identificationTabs: { id: string, label: string }[] = [];

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

    formatLabel(key: string): string {
        return key.replace(/([A-Z])/g, ' $1').replace(/^./, str => str.toUpperCase());
    }

    setActiveTab(tab: string): void {
        this.activeTab = tab;
    }

    setIdentificationActiveTab(tab: string): void {
        this.identificationActiveTab = tab;
    }
}
