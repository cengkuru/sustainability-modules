import { Component, OnInit } from '@angular/core';
import { CommonModule, DatePipe, NgForOf } from '@angular/common';
import { Observable, of } from "rxjs";
import { ActivatedRoute, Router } from "@angular/router";
import { AngularFirestore } from "@angular/fire/compat/firestore";
import { switchMap } from "rxjs/operators";

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
        private firestore: AngularFirestore,
        private router: Router
    ) {}

    ngOnInit(): void {
        this.firestore.collection('projects').snapshotChanges().subscribe(actions => {
            this.projectIds = actions.map(a => a.payload.doc.id);
            this.route.paramMap.subscribe(params => {
                const projectId = params.get('id');
                if (projectId) {
                    this.currentProjectIndex = this.projectIds.indexOf(projectId);
                    this.project$ = this.firestore.collection('projects').doc(projectId).valueChanges();
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
}
