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
                        }).filter(project => project.projectName.toLowerCase().includes(term.toLowerCase())))
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

    getStatusPercentage(status: string): number {
        const statusMap: { [key: string]: number } = {
            'Planned': 10,
            'In Progress': 50,
            'Completed': 100
        };
        return statusMap[status] || 0;
    }
}
