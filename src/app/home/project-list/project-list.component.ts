import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { AngularFirestore } from '@angular/fire/compat/firestore';
import { Observable, BehaviorSubject } from 'rxjs';
import { debounceTime, distinctUntilChanged, switchMap, map } from 'rxjs/operators';
import { RouterLink } from "@angular/router";
import {EmailService} from "../services/email.service";

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

    constructor(private firestore: AngularFirestore, private emailService: EmailService) {}

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

        this.sendTestEmail();
    }

    onSearchChange(event: Event): void {
        const target = event.target as HTMLInputElement;
        this.searchTerm.next(target.value);
    }

    sendTestEmail(): void {
        this.emailService.sendEmail('michael@cengkuru.com', 'Test Email', 'Hi, this is an email from Cloud Functions.')
            .then(response => console.log('Email sent successfully', response))
            .catch(error => console.error('Error sending email', error));
    }


}
