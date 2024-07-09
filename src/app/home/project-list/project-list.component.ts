import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { AngularFirestore } from '@angular/fire/compat/firestore';
import { Observable, BehaviorSubject } from 'rxjs';
import { debounceTime, distinctUntilChanged, switchMap, map } from 'rxjs/operators';
import { RouterLink } from "@angular/router";
import { EmailService } from "../services/email.service";
import { IntersectionObserverDirective } from "../../directives/intersection-observer.directive";

@Component({
    selector: 'app-project-list',
    standalone: true,
    imports: [CommonModule, RouterLink, IntersectionObserverDirective],
    templateUrl: './project-list.component.html',
    styleUrls: ['./project-list.component.scss']
})
export class ProjectListComponent implements OnInit {
    projects$: Observable<any[]> | undefined;
    totalProjects$: Observable<number> | undefined;
    totalValueOfProjects$: Observable<number> | undefined;
    searchTerm = new BehaviorSubject<string>('');

    constructor(private firestore: AngularFirestore, private emailService: EmailService) {}

    ngOnInit(): void {
        this.projects$ = this.searchTerm.pipe(
            debounceTime(300),
            distinctUntilChanged(),
            switchMap(term => {
                return this.firestore.collection('projects').snapshotChanges().pipe(
                    map(actions => actions.map(a => {
                        const data = a.payload.doc.data() as any;
                        const id = a.payload.doc.id;
                        return { id, ...data };
                    }).filter(project => !term || project.name.toLowerCase().includes(term.toLowerCase())))
                );
            })
        );

        this.totalProjects$ = this.firestore.collection('projects').valueChanges().pipe(
            map(projects => projects.length)
        );

        this.totalValueOfProjects$ = this.firestore.collection('projects').valueChanges().pipe(
            map((projects: any) => {
                let total = 0;
                projects.forEach((project: any) => {
                    const contractPrice = project.stages?.tenderManagement?.basicData?.contractPrice;
                    if (contractPrice) {
                        total += parseFloat(contractPrice.replace(/[^0-9.-]+/g, ""));
                    }
                });
                return total;
            })
        );
    }

    onSearchChange(event: Event): void {
        const target = event.target as HTMLInputElement;
        this.searchTerm.next(target.value);
    }
}
