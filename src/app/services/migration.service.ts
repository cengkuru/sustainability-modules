import { Injectable } from '@angular/core';
import { AngularFirestore } from '@angular/fire/compat/firestore';
import { HttpClient } from '@angular/common/http';
import { Observable, from, forkJoin } from 'rxjs';
import { map, mergeMap, tap } from 'rxjs/operators';
import {Project} from "../models/vizprojects.model";


@Injectable({
    providedIn: 'root'
})
export class MigrationService {
    private readonly COLLECTION_NAME = 'dataVizProjects';

    private sustainableSubsectors = [
        'Renewable energy', 'Solar', 'Wind', 'Hydropower', 'Biomass', 'Geothermal',
        'Water and wastewater management', 'Transport', 'Low carbon transport',
        'Natural resource management', 'Flood protection'
    ];


    constructor(
        private firestore: AngularFirestore,
        private http: HttpClient
    ) {}

    migrateProjects(): Observable<number> {
        return this.http.get<Project[]>('assets/data/vizProjects.json').pipe(
            tap(projects => console.log(`Total projects to migrate: ${projects.length}`)),
            mergeMap(projects => forkJoin(
                projects.map(project => this.addProjectIfNotExists(project))
            )),
            map(results => results.filter(Boolean).length),
            tap(count => console.log(`Total projects migrated: ${count}`))
        );
    }

    private addProjectIfNotExists(project: Project): Observable<boolean> {
        return from(this.firestore.collection(this.COLLECTION_NAME).doc(project.id).get()).pipe(
            mergeMap(doc => {
                if (doc.exists) {
                    return from(Promise.resolve(false));
                } else {
                    return from(this.firestore.collection(this.COLLECTION_NAME).doc(project.id).set(project)).pipe(
                        map(() => true)
                    );
                }
            })
        );
    }


    async updateAllProjects() {
        const snapshot = await this.firestore.collection<Project>('dataVizProjects').get().toPromise();
        if (!snapshot) {
            console.error('No projects found to update');
            return;
        }

        const updatePromises = snapshot.docs.map(doc => {
            const project = doc.data() as Project;
            const updatedProject = this.addNewIndicators(project);
            return this.firestore.collection('dataVizProjects').doc(doc.id).update(updatedProject);
        });

        try {
            await Promise.all(updatePromises);
            console.log('All projects updated successfully');
        } catch (error) {
            console.error('Error updating projects:', error);
        }
    }

    private addNewIndicators(project: Project): Partial<Project> {
        return {
            climateAndDisasterRiskAssessmentPublished: Math.random() < 0.7, // 70% chance of being true
            sustainableSubsector: this.getRandomSubsector()
        };
    }

    private getRandomSubsector(): string {
        const index = Math.floor(Math.random() * this.sustainableSubsectors.length);
        return this.sustainableSubsectors[index];
    }
}
