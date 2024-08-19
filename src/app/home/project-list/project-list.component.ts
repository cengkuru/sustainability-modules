import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { AngularFirestore } from '@angular/fire/compat/firestore';
import { Observable, BehaviorSubject, combineLatest } from 'rxjs';
import { debounceTime, distinctUntilChanged, switchMap, map } from 'rxjs/operators';
import { trigger, transition, style, animate, query, stagger } from '@angular/animations';
import { ActivatedRoute, RouterLink } from "@angular/router";
import { EmailService } from "../services/email.service";
import { IntersectionObserverDirective } from "../../directives/intersection-observer.directive";
import { NgIconComponent, provideIcons } from "@ng-icons/core";
import { heroMagnifyingGlass, heroArrowRight, heroMapPin } from "@ng-icons/heroicons/outline";

@Component({
    selector: 'app-project-list',
    standalone: true,
    imports: [
        CommonModule,
        RouterLink,
        IntersectionObserverDirective, NgIconComponent],
    templateUrl: './project-list.component.html',
    styleUrls: ['./project-list.component.scss'],
    animations: [
        trigger('fadeInOut', [
            transition(':enter', [
                style({ opacity: 0 }),
                animate('300ms', style({ opacity: 1 })),
            ]),
            transition(':leave', [
                animate('300ms', style({ opacity: 0 })),
            ]),
        ]),
        trigger('listAnimation', [
            transition('* <=> *', [
                query(':enter',
                    [style({ opacity: 0, transform: 'translateY(50px)' }),
                        stagger('50ms', animate('500ms ease', style({ opacity: 1, transform: 'translateY(0)' })))],
                    { optional: true }
                ),
            ]),
        ]),
        trigger('fadeInAnimation', [
            transition(':enter', [
                style({ opacity: 0 }),
                animate('300ms', style({ opacity: 1 })),
            ]),
        ]),
    ],
    providers: [provideIcons({
        heroMagnifyingGlass,
        heroArrowRight,
        heroMapPin
    })],
})
export class ProjectListComponent implements OnInit {
    projects$: Observable<any[]> | undefined;
    totalProjects$: Observable<number> | undefined;
    totalValueOfProjects$: Observable<number> | undefined;
    searchTerm = new BehaviorSubject<string>('');
    showFeatured = new BehaviorSubject<boolean>(false);

    isLoading: boolean = true;

    constructor(
        private firestore: AngularFirestore,
        private emailService: EmailService,
        private route: ActivatedRoute
    ) {}

    ngOnInit(): void {
        this.isLoading = true;
        this.route.queryParams.subscribe(params => {
            const featured = params['featured'] === 'true';
            this.showFeatured.next(featured);
        });

        this.projects$ = combineLatest([
            this.searchTerm.pipe(debounceTime(300), distinctUntilChanged()),
            this.showFeatured
        ]).pipe(
            switchMap(([term, showFeatured]) => {
                return this.firestore.collection('projects').snapshotChanges().pipe(
                    map(actions => actions.map(a => {
                        const data = a.payload.doc.data() as any;
                        const id = a.payload.doc.id;
                        this.isLoading = false;
                        return { id, ...data };
                    }).filter(project =>
                        (!term || project.name.toLowerCase().includes(term.toLowerCase())) &&
                        (!showFeatured || project.featured)
                    ))
                );
            })
        );

        this.totalProjects$ = this.projects$.pipe(
            map(projects => projects.length)
        );

        this.totalValueOfProjects$ = this.projects$.pipe(
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

    toggleFeatured(): void {
        this.showFeatured.next(!this.showFeatured.value);
    }

    onProjectInView(project: any): void {
        project.inView = true;
    }
}
