import { SharedModule } from './../../dashboard/shared/shared.module';
import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { AngularFirestore } from '@angular/fire/compat/firestore';
import { Observable, BehaviorSubject, combineLatest } from 'rxjs';
import { debounceTime, distinctUntilChanged, switchMap, map, catchError } from 'rxjs/operators';
import { trigger, transition, style, animate, query, stagger } from '@angular/animations';
import { ActivatedRoute, RouterLink } from "@angular/router";
import { EmailService } from "../services/email.service";
import { IntersectionObserverDirective } from "../../directives/intersection-observer.directive";
import { of } from 'rxjs';

// First, let's define an interface for the Project type
interface Project {
  id: string;
  name: string;
  parsedBudget: number;
  startDate?: string;
  status?: string;
  featured?: boolean;
  location?: {
    name?: string;
  };
  stages?: {
    preparation?: {
      basicData?: {
        projectBudget?: string | number;
      };
    };
    identification?: {
      basicData?: {
        projectDescription?: string;
        sectorSubsector?: string;
      };
    };
    tenderManagement?: {
      basicData?: {
        contractPrice?: string | number;
      };
    };
  };
  // Add other properties as needed
}

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
    projects$!: Observable<Project[]>;
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

    numberOfProjects: number = 0;
    totalValueOfProjects: number = 0;

    constructor(
        private firestore: AngularFirestore,
        private emailService: EmailService,
        private route: ActivatedRoute
    ) {}

    // In the component class
    ngOnInit(): void {
        this.isLoading = true;
        
        this.projects$ = combineLatest([
          this.searchTerm.pipe(debounceTime(300), distinctUntilChanged()),
          this.showFeatured,
          this.selectedSectors,
          this.selectedStatus,
          this.sortOption
        ]).pipe(
          switchMap(([term, showFeatured, sectors, status, sortBy]) => {
            return this.firestore.collection('projects').snapshotChanges().pipe(
              map(actions => {
                const projects = actions.map(a => {
                  const data = a.payload.doc.data() as any;
                  const id = a.payload.doc.id;
                  return { id, ...data };
                });
      
                // Filter projects
                const filteredProjects = projects.filter(project => 
                  (!term || project.name.toLowerCase().includes(term.toLowerCase())) &&
                  (!showFeatured || project.featured) &&
                  (sectors.length === 0 || sectors.includes(project.stages?.identification?.basicData?.sectorSubsector)) &&
                  (!status || project.status === status)
                );
      
                // Parse budgets and sort
                filteredProjects.forEach(project => {
                  const budget = project.stages?.preparation?.basicData?.projectBudget;
                  project.parsedBudget = budget ? this.parseProjectBudget(budget) : 0;
                });
      
                // Sort projects
                filteredProjects.sort((a: Project, b: Project) => {
                  if (sortBy === 'name') {
                    return (a?.name || '').localeCompare(b?.name || '');
                  }
                  if (sortBy === 'budget') {
                    return (b?.parsedBudget || 0) - (a?.parsedBudget || 0);
                  }
                  if (sortBy === 'date') {
                    const dateA = a?.startDate ? new Date(a.startDate).getTime() : 0;
                    const dateB = b?.startDate ? new Date(b.startDate).getTime() : 0;
                    return dateB - dateA;
                  }
                  return 0;
                });
      
                this.isLoading = false;
                return filteredProjects;
              }),
              catchError(error => {
                console.error('Error loading projects:', error);
                this.isLoading = false;
                return of([]);
              })
            );
          })
        );
      
        // Initialize derived observables
        this.totalProjects$ = this.projects$.pipe(
          map(projects => projects.length)
        );
      
        this.totalValueOfProjects$ = this.projects$.pipe(
          map(projects => projects.reduce((total, project) => {
            const budget = project.stages?.preparation?.basicData?.projectBudget;
            if (budget) {
              const numericValue = this.parseProjectBudget(budget);
              return total + numericValue;
            }
            return total;
          }, 0))
        );
      
        this.averageProjectValue$ = combineLatest([
          this.totalValueOfProjects$,
          this.totalProjects$
        ]).pipe(
          map(([totalValue, totalProjects]) => 
            totalProjects > 0 ? totalValue / totalProjects : 0
          )
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
        if (value === null) return '';
        return new Intl.NumberFormat('en-US', { style: 'currency', currency: 'USD' }).format(value);
    }


    loadProjects() {
        this.isLoading = true;
        this.firestore.collection('projects').get().subscribe(
          (querySnapshot) => {
            const projects: any[] = [];
            let totalBudget = 0;
            
            querySnapshot.forEach((doc) => {
              const project = doc.data() as Project;
              project.id = doc.id;
              projects.push(project);
    
              // Calculate project budget
              const projectBudget = project.stages?.preparation?.basicData?.projectBudget;
              if (projectBudget) {
                let numericValue: number;
                if (typeof projectBudget === 'string') {
                  numericValue = parseFloat(projectBudget.replace(/[^0-9.-]+/g, ""));
                } else {
                  numericValue = projectBudget;
                }
                if (!isNaN(numericValue)) {
                  totalBudget += numericValue;
                  project.parsedBudget = numericValue;
                }
              }
            });
    
            // Update projects count
            this.numberOfProjects = projects.length;
            this.totalValueOfProjects = totalBudget;
    
            // Apply filters and sorting
            this.projects$ = combineLatest([
              this.searchTerm.pipe(debounceTime(300), distinctUntilChanged()),
              this.showFeatured,
              this.selectedSectors,
              this.selectedStatus,
              this.sortOption
            ]).pipe(
              map(([term, showFeatured, sectors, status, sortBy]) => {
                return projects.filter(project => 
                  (!term || project.name.toLowerCase().includes(term.toLowerCase())) &&
                  (!showFeatured || project.featured) &&
                  (sectors.length === 0 || sectors.includes(project.stages?.identification?.basicData?.sectorSubsector)) &&
                  (!status || project.status === status)
                ).sort((a: Project, b: Project) => {
                  if (sortBy === 'name') {
                    return (a?.name || '').localeCompare(b?.name || '');
                  }
                  if (sortBy === 'budget') {
                    return (b?.parsedBudget || 0) - (a?.parsedBudget || 0);
                  }
                  if (sortBy === 'date') {
                    const dateA = a?.startDate ? new Date(a.startDate).getTime() : 0;
                    const dateB = b?.startDate ? new Date(b.startDate).getTime() : 0;
                    return dateB - dateA;
                  }
                  return 0;
                });
              })
            );
    
            this.isLoading = false;
          },
          (error) => {
            console.error('Error loading projects:', error);
            this.isLoading = false;
          }
        );
      }
    
      getFormattedPrice(price: any): string {
        if (!price) {
          return '';
        }
    
        try {
          if (typeof price === 'string') {
            const cleanedPrice = price.replace(/,/g, '').replace('ZAR', '').trim();
            const numericValue = parseFloat(cleanedPrice);
            
            if (isNaN(numericValue)) {
              return '';
            }
    
            return new Intl.NumberFormat('en-ZA', {
              style: 'currency',
              currency: 'ZAR',
              minimumFractionDigits: 0,
              maximumFractionDigits: 0
            }).format(numericValue);
          }
    
          if (typeof price === 'number') {
            return new Intl.NumberFormat('en-ZA', {
              style: 'currency',
              currency: 'ZAR',
              minimumFractionDigits: 0,
              maximumFractionDigits: 0
            }).format(price);
          }
    
          return '';
        } catch (error) {
          console.error('Error formatting price:', error);
          return '';
        }
      }
    
}
