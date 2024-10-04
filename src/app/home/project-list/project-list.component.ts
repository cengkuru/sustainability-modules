import { SharedModule } from './../../dashboard/shared/shared.module';
import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { AngularFirestore } from '@angular/fire/compat/firestore';
import { Observable, BehaviorSubject, combineLatest } from 'rxjs';
import { debounceTime, distinctUntilChanged, switchMap, map } from 'rxjs/operators';
import { trigger, transition, style, animate, query, stagger } from '@angular/animations';
import { ActivatedRoute, RouterLink } from "@angular/router";
import { EmailService } from "../services/email.service";
import { IntersectionObserverDirective } from "../../directives/intersection-observer.directive";

@Component({
    selector: 'app-project-list',
    standalone: true,
    imports: [
        CommonModule,
        RouterLink,
        IntersectionObserverDirective,
        SharedModule // Add the pipe to the imports array
    ],
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
})
export class ProjectListComponent implements OnInit {
    projects$!: Observable<any[]>;
    totalProjects$!: Observable<number>;
    totalValueOfProjects$!: Observable<number>;
    averageProjectValue$!: Observable<number>;
    featuredProjectsCount$!: Observable<number>;
    searchTerm = new BehaviorSubject<string>('');
    showFeatured = new BehaviorSubject<boolean>(false);
    selectedSectors = new BehaviorSubject<string[]>([]);
    selectedStatus = new BehaviorSubject<string>('');
    sortOption = new BehaviorSubject<string>('name');

    sectors: string[] = ['Transport', 'Energy', 'Water and Sanitation', 'Health', 'Education'];

    isLoading: boolean = true;
    showModal: boolean = false;
    showFilters: boolean = false;  // New property for mobile filter toggle


    // Pagination
    currentPage = 1;
    pageSize = 10;
    totalPages = 1;


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
            this.showFeatured,
            this.selectedSectors,
            this.selectedStatus,
            this.sortOption
        ]).pipe(
            switchMap(([term, showFeatured, sectors, status, sortBy]) => {
                return this.firestore.collection('projects').snapshotChanges().pipe(
                    // In your switchMap function, modify the line where you access project.stages.preparation

map(actions => actions.map(a => {
    const data = a.payload.doc.data() as any;
    const id = a.payload.doc.id;
    return { id, ...data };
}).filter(project =>
    (!term || project.name.toLowerCase().includes(term.toLowerCase())) &&
    (!showFeatured || project.featured) &&
    (sectors.length === 0 || sectors.includes(project.stages.identification.basicData.sectorSubsector)) &&
    (!status || project.status === status)
)),
map(projects => {
    console.log(projects);
    // Parse project budget to ensure it's a number
    projects.forEach(project => {
        const budget = project.stages?.preparation?.basicData?.projectBudget; // Safe navigation operator to check if preparation exists
        project.parsedBudget = budget ? this.parseProjectBudget(budget) : 0; // Default to 0 if budget is undefined
    });

    // Sort projects
    projects.sort((a, b) => {
        if (sortBy === 'name') return a.name.localeCompare(b.name);
        if (sortBy === 'budget') return a.parsedBudget - b.parsedBudget;
        if (sortBy === 'date') return new Date(a.startDate).getTime() - new Date(b.startDate).getTime();
        return 0;
    });

    this.isLoading = false;
    this.totalPages = Math.ceil(projects.length / this.pageSize);
    const startIndex = (this.currentPage - 1) * this.pageSize;
    return projects.slice(startIndex, startIndex + this.pageSize);
})

                );
            })
        );


        this.totalProjects$ = this.projects$.pipe(
            map(projects => projects.length)
        );

        this.totalValueOfProjects$ = this.projects$.pipe(
            map(projects => projects.reduce((total, project) => total + project.parsedBudget, 0))
        );

        this.averageProjectValue$ = combineLatest([
            this.totalValueOfProjects$,
            this.totalProjects$
        ]).pipe(
            map(([totalValue, totalProjects]) => totalProjects > 0 ? totalValue / totalProjects : 0)
        );

        this.featuredProjectsCount$ = this.projects$.pipe(
            map(projects => projects.filter(project => project.featured).length)
        );

        this.totalValueOfProjects$ = this.projects$.pipe(
            map((projects: any[]) => {
                return projects.reduce((total, project) => {
                    const contractPrice = project.stages?.tenderManagement?.basicData?.contractPrice;
                    if (contractPrice) {
                        const numericValue = this.parseProjectBudget(contractPrice);
                        return total + numericValue;
                    }
                    return total;
                }, 0);
            })
        );

        this.averageProjectValue$ = combineLatest([
            this.totalValueOfProjects$,
            this.totalProjects$
        ]).pipe(
            map(([totalValue, totalProjects]) => {
                return totalProjects > 0 ? totalValue / totalProjects : 0;
            })
        );

        this.featuredProjectsCount$ = this.projects$.pipe(
            map(projects => projects.filter(project => project.featured).length)
        );
    }

    onSearchChange(event: Event): void {
        const target = event.target as HTMLInputElement;
        this.searchTerm.next(target.value);
    }

    toggleFeatured(): void {
        this.showFeatured.next(!this.showFeatured.value);
    }

    toggleFilters(): void {
        this.showFilters = !this.showFilters;
    }


    toggleSector(sector: string): void {
        const currentSectors = this.selectedSectors.value;
        const updatedSectors = currentSectors.includes(sector)
            ? currentSectors.filter(s => s !== sector)
            : [...currentSectors, sector];
        this.selectedSectors.next(updatedSectors);
        this.applyFilters();
    }

    onStatusChange(event: Event): void {
        const target = event.target as HTMLSelectElement;
        this.selectedStatus.next(target.value);
        this.applyFilters();
    }

    onSortChange(event: Event): void {
        const target = event.target as HTMLSelectElement;
        this.sortOption.next(target.value);
        this.applyFilters();
    }

    applyFilters(): void {
        this.currentPage = 1; // Reset to first page when applying filters
    }

    onProjectInView(project: any): void {
        project.inView = true;
    }

    toggleModal(): void {
        this.showModal = !this.showModal;
    }

    changePage(newPage: number): void {
        if (newPage >= 1 && newPage <= this.totalPages) {
            this.currentPage = newPage;
        }
    }

    isSectorSelected(sector: string): boolean {
        return this.selectedSectors.value.includes(sector);
    }

    onProjectClick(project: any): void {
        // Implement any additional logic you want to execute when a project card is clicked
    }

    onBulkDownload(): void {
        // Implement the logic for bulk download
        // You might want to call a service method here to handle the actual download
    }

    resetFilters(): void {
        this.searchTerm.next('');
        this.showFeatured.next(false);
        this.selectedSectors.next([]);
        this.selectedStatus.next('');
        this.sortOption.next('name');
        this.applyFilters();
    }

    parseProjectBudget(budget: string | number): number {
        if (typeof budget === 'number') return budget;
        if (typeof budget === 'string') {
            const numericString = budget.replace(/[^0-9.-]+/g, '');
            return parseFloat(numericString) || 0;
        }
        return 0;
    }

    formatCurrency(value: number | null): string {
        if (value === null) return 'N/A';
        return new Intl.NumberFormat('en-US', { style: 'currency', currency: 'USD' }).format(value);
    }
}
