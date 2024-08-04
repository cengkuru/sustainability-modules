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
}
