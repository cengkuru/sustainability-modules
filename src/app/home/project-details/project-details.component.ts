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
}
