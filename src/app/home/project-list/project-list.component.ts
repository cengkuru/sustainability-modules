import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { AngularFirestore } from '@angular/fire/compat/firestore';
import { Observable, BehaviorSubject } from 'rxjs';
import { debounceTime, distinctUntilChanged, switchMap, map } from 'rxjs/operators';
import { RouterLink } from "@angular/router";

@Component({
    selector: 'app-project-list',
    standalone: true,
    imports: [CommonModule, RouterLink],
    templateUrl: './project-list.component.html',
    styleUrls: ['./project-list.component.scss']
})
export class ProjectListComponent implements OnInit {
    projects$: Observable<any[]> | undefined;
    totalProjects$: Observable<number> | undefined;
    searchTerm = new BehaviorSubject<string>('');

    constructor(private firestore: AngularFirestore) {}

    ngOnInit(): void {
        this.projects$ = this.searchTerm.pipe(
            debounceTime(300),
            distinctUntilChanged(),
            switchMap(term => {
                if (term) {
                    return this.firestore.collection('projects').snapshotChanges().pipe(
                        map(actions => actions.map(a => {
                            const data = a.payload.doc.data() as any;
                            const id = a.payload.doc.id;
                            return { id, ...data };
                        }).filter(project => project.name.toLowerCase().includes(term.toLowerCase())))
                    );
                } else {
                    return this.firestore.collection('projects').snapshotChanges().pipe(
                        map(actions => actions.map(a => {
                            const data = a.payload.doc.data() as any;
                            const id = a.payload.doc.id;
                            return { id, ...data };
                        }))
                    );
                }
            })
        );

        // Log projects to console
        this.projects$.subscribe(projects => {
            console.log('Projects:', projects);
        });

        this.totalProjects$ = this.firestore.collection('projects').valueChanges().pipe(
            map(projects => projects.length)
        );
    }

    onSearchChange(event: Event): void {
        const target = event.target as HTMLInputElement;
        this.searchTerm.next(target.value);
    }

    calculateProgress(project: any): number {
        const stages = project.stages;
        const stageWeights: { [key: string]: number } = {
            identification: 10,
            preparation: 20,
            tenderManagement: 20,
            implementation: 40,
            completion: 10
        };

        const stageProgress: { [key: string]: number } = {
            identification: this.getStageProgress(stages.identification, ['basicData', 'climateFinanceData', 'institutionalSustainabilityData']),
            preparation: this.getStageProgress(stages.preparation, ['basicData', 'climateFinanceData', 'environmentalAndClimateSustainabilityData', 'economicAndFinancialSustainabilityData', 'socialSustainabilityData', 'institutionalSustainabilityData']),
            tenderManagement: this.getStageProgress(stages.tenderManagement, ['basicData', 'socialSustainabilityData', 'environmentalAndClimateSustainabilityData', 'institutionalSustainabilityData']),
            implementation: this.getStageProgress(stages.implementation, ['basicData', 'climateFinanceData', 'environmentalAndClimateSustainabilityData', 'economicAndFinancialSustainabilityData', 'socialSustainabilityData', 'institutionalSustainabilityData']),
            completion: this.getStageProgress(stages.completion, ['basicData'])
        };

        let totalProgress = 0;
        for (const stage in stageWeights) {
            totalProgress += stageWeights[stage] * (stageProgress[stage] / 100);
        }

        return totalProgress;
    }

    getStageProgress(stage: any, keys: string[]): number {
        let completed = 0;
        let total = keys.length;

        keys.forEach(key => {
            if (stage[key] && Object.values(stage[key]).every(value => value !== 'Pending' && value !== 'Not Applicable')) {
                completed++;
            }
        });

        return (completed / total) * 100;
    }
}
