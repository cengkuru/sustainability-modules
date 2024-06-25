import { Injectable } from '@angular/core';
import { AngularFirestore } from '@angular/fire/compat/firestore';
import { Observable } from 'rxjs';
import { map } from "rxjs/operators";

@Injectable({
    providedIn: 'root'
})
export class ProjectService {
    constructor(private firestore: AngularFirestore) {}

    getProjects(): Observable<any[]> {
        return this.firestore.collection('projects', ref => ref.orderBy('id')).snapshotChanges().pipe(
            map(actions => actions.map(a => {
                const data = a.payload.doc.data() as { [key: string]: any };
                const id = a.payload.doc.id;
                return { id, ...data };
            }))
        );
    }

    getProjectIds(): Observable<string[]> {
        return this.firestore.collection('projects').snapshotChanges().pipe(
            map(actions => actions.map(a => a.payload.doc.id))
        );
    }

    getProjectById(projectId: string): Observable<any> {
        return this.firestore.collection('projects', ref => ref.where('id', '==', projectId)).snapshotChanges().pipe(
            map(actions => {
                if (actions.length > 0) {
                    const data = actions[0].payload.doc.data() as { [key: string]: any };
                    const id = actions[0].payload.doc.id;
                    return { id, ...data };
                }
                return null;
            })
        );
    }

    getNextProject(currentProjectId: string): Observable<any> {
        return this.getProjects().pipe(
            map(projects => {
                const currentIndex = projects.findIndex(p => p.id === currentProjectId);
                return (currentIndex < projects.length - 1) ? projects[currentIndex + 1] : null;
            })
        );
    }

    getPreviousProject(currentProjectId: string): Observable<any> {
        return this.getProjects().pipe(
            map(projects => {
                const currentIndex = projects.findIndex(p => p.id === currentProjectId);
                return (currentIndex > 0) ? projects[currentIndex - 1] : null;
            })
        );
    }


}