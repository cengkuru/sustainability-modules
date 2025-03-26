import {
  Component,
  OnInit,
  OnDestroy,
  ElementRef,
  ViewChild,
  AfterViewInit,
  ChangeDetectorRef,
  NgZone
} from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { AngularFirestore } from '@angular/fire/compat/firestore';
import {CommonModule} from '@angular/common';
import { Router, RouterLink } from '@angular/router';
import projectsData from '../../../assets/data/projects.json';
import { IntersectionObserverDirective } from "../../directives/intersection-observer.directive";
import { animate, style, transition, trigger, query, stagger, state } from "@angular/animations";
import * as L from 'leaflet';
import { ScriptLoaderService } from "../../services/scriptLoader.service";
import { NgIconComponent } from "@ng-icons/core";
import { TranslateModule, TranslateService } from '@ngx-translate/core';

interface ViewProjectDetailsEvent extends CustomEvent {
  detail: string;
}

interface ProjectStat {
  value: string | number;
  label: string;
}

@Component({
  selector: 'app-landing',
  templateUrl: './landing.component.html',
  styleUrls: ['./landing.component.scss'],
  standalone: true,
  imports: [
    CommonModule,
    RouterLink,
    TranslateModule,
    IntersectionObserverDirective,
    NgIconComponent,
  ],
  animations: [
    // Refined animations based on style guide's transition principles
    trigger('slideInAnimation', [
      transition(':enter', [
        style({ transform: 'translateY(20px)', opacity: 0 }),
        animate('500ms cubic-bezier(0.4, 0, 0.2, 1)', style({ transform: 'translateY(0)', opacity: 1 }))
      ])
    ]),
    trigger('fadeInAnimation', [
      transition(':enter', [
        style({ opacity: 0 }),
        animate('200ms cubic-bezier(0.4, 0, 0.2, 1)', style({ opacity: 1 }))
      ])
    ]),
    trigger('fadeInUp', [
      transition(':enter', [
        style({ opacity: 0, transform: 'translateY(20px)' }),
        animate('200ms cubic-bezier(0.4, 0, 0.2, 1)', style({ opacity: 1, transform: 'translateY(0)' }))
      ])
    ]),
    trigger('listAnimation', [
      transition('* <=> *', [
        query(':enter', [
          style({ opacity: 0, transform: 'translateY(20px)' }),
          stagger('50ms', animate('200ms cubic-bezier(0.4, 0, 0.2, 1)', style({ opacity: 1, transform: 'translateY(0)' })))
        ], { optional: true })
      ])
    ]),
    trigger('cardHover', [
      state('initial', style({
        transform: 'translateY(0)',
        boxShadow: '0 1px 3px rgba(0,0,0,0.05)'
      })),
      state('hovered', style({
        transform: 'translateY(-4px)',
        boxShadow: '0 10px 25px -5px rgba(0,0,0,0.05), 0 8px 10px -6px rgba(0,0,0,0.01)'
      })),
      transition('initial <=> hovered', animate('200ms cubic-bezier(0.4, 0, 0.2, 1)'))
    ]),
    trigger('staggeredList', [
      transition('* <=> *', [
        query(':enter', [
          style({ opacity: 0, transform: 'translateY(20px)' }),
          stagger('50ms', animate('200ms cubic-bezier(0.4, 0, 0.2, 1)', style({ opacity: 1, transform: 'translateY(0)' })))
        ], { optional: true })
      ])
    ]),
    trigger('subtleFloat', [
      transition(':enter', [
        style({ opacity: 0, transform: 'translateY(20px)' }),
        animate('400ms cubic-bezier(0.4, 0, 0.2, 1)', 
          style({ opacity: 1, transform: 'translateY(0)' }))
      ])
    ])
  ]
})
export class LandingComponent implements OnInit, OnDestroy, AfterViewInit {
  @ViewChild('mapContainer') mapContainer!: ElementRef;

  currentLang: string;

  private map!: L.Map;
  recentProjects: any[] = [];
  highValueProjects: any[] = [];
  markers: { lat: number; lng: number; popup: string; status: string; }[] = [];
  numberOfProjects: number = 0;
  totalValueOfProjects: number = 0;
  featuredProjects: any[] = [];

  isLoading: boolean = true;
  mapInitialized: boolean = false;
  projectsLoaded: boolean = false;
  private viewInitialized: boolean = false;
  totalRecentProjectsValue: number = 0;


  activeTab: 'recent' | 'highValue' = 'recent';
  showQuickMenu: boolean = false;

  // Updated color variables to match style guide
  colors = {
    primary: 'var(--white)',
    accent: 'var(--accent-color-base)',
    text: {
      primary: 'var(--neutral-700)',
      secondary: 'var(--neutral-500)'
    },
    status: {
      active: 'var(--status-active)',
      completed: 'var(--status-completed)',
      inProgress: 'var(--status-in-progress)',
      planned: 'var(--status-planned)',
      other: 'var(--status-other)'
    }
  };

  // Updated typography system to match style guide
  typography = {
    display: 'font-light tracking-tight',
    heading: 'text-xl md:text-2xl font-light text-neutral-700',
    body: 'font-light leading-relaxed text-neutral-700',
    caption: 'font-light text-sm text-neutral-500'
  };

  // Design tokens
  spacing = {
    base: 'var(--space-4)',
    section: 'var(--space-8)',
    large: 'var(--space-12)'
  };

  mainSection = {
    title: "Advancing transparency and accountability in climate finance projects",
    description: "This prototype, developed by <a href='https://infrastructuretransparency.org/' target='_blank'>CoST – the Infrastructure Transparency Initiative</a>, showcases how the <a href='https://standard.open-contracting.org/infrastructure/latest/en/reference/schema/' target='_blank'>Open Contracting for Infrastructure Data Standard (OC4IDS)</a> can be applied to climate finance and sustainability efforts. It illustrates the potential to improve transparency and accountability in infrastructure projects aiming at adaptation and mitigation to climate change. The data presented is partially based on approved projects by the <a href='https://www.greenclimate.fund/' target='_blank'>Green Climate Fund (GCF)</a> for the Republic of South Africa, with values provided for illustrative purposes only.",
    buttonText: "Explore Projects "
  };

  featuredProjectsSection = {
    title: "Featured infrastructure projects",
    description: "Discover a range of infrastructure projects that are setting new benchmarks in sustainability, from sustainable energy initiatives to modern transportation systems and advanced water management, these projects exemplify best practices in development.",
    buttonText: "View Featured Projects →",
    buttonLink: "/projects/featured"
  };

  sponsorsSection = {
    title: "Supported by",
    sponsors: [
        {
            name: "Deutsche Gesellschaft für Internationale Zusammenarbeit (GIZ)",
            link: "https://www.giz.de/en/html/index.html",
            image: "../../../assets/giz.png"
        },
        {
            name: "Foreign, Commonwealth & Development Office (FCDO)",
            link: "https://www.gov.uk/government/organisations/foreign-commonwealth-development-office",
            image: "../../../assets/uk.png"
        }
    ]
  };

  totalHighValueProjectsValue: number = 0;

  projectStats: ProjectStat[] = [
    { value: '150+', label: 'Active Projects' },
    { value: '$2.5B', label: 'Total Value' },
    { value: '45', label: 'Partners' },
    { value: '12', label: 'Countries' }
  ];

  constructor(
      private http: HttpClient,
      private firestore: AngularFirestore,
      private router: Router,
      private scriptLoader: ScriptLoaderService,
      private cdr: ChangeDetectorRef,
      private ngZone: NgZone,
      private translateService: TranslateService
    ) {
      this.currentLang = this.translateService.currentLang;
    }

  async ngOnInit(): Promise<void> {
    try {
      await this.loadLeafletScripts();
      this.loadProjects();
      window.addEventListener('viewProjectDetails', this.handleViewProjectDetails as EventListener);

       // Subscribe to language changes
        this.translateService.onLangChange.subscribe(event => {
          this.currentLang = event.lang;
        });

    } catch (error) {
      console.error('Error during component initialization:', error);
    }
  }

  ngAfterViewInit() {
    this.viewInitialized = true;
    this.ngZone.runOutsideAngular(() => {
      setTimeout(() => {
        this.checkAndInitializeMap();
      }, 0);
    });
  }

  ngOnDestroy(): void {
    window.removeEventListener('viewProjectDetails', this.handleViewProjectDetails as EventListener);
    if (this.map) {
      this.map.remove();
    }
  }

  private async loadLeafletScripts(): Promise<void> {
    const scripts = [
      'https://unpkg.com/leaflet@1.7.1/dist/leaflet.js'
    ];
    const styles = [
      'https://unpkg.com/leaflet@1.7.1/dist/leaflet.css'
    ];

    try {
      await this.scriptLoader.loadScripts(scripts);
      await this.scriptLoader.loadStyles(styles);
    } catch (error) {
      console.error('Error loading Leaflet scripts or styles:', error);
      throw error;
    }
  }

  handleViewProjectDetails = (event: ViewProjectDetailsEvent) => {
    this.viewProjectDetails(event.detail);
  };

  openContactForm(): void {
    console.log('Opening contact form');
  }

  checkAndInitializeMap(): void {
    if (this.viewInitialized && this.projectsLoaded && this.mapContainer && this.mapContainer.nativeElement) {
      this.initializeMap();
    } else {
      if (!this.mapContainer) {
        console.error('Map container is not available');
      }
      setTimeout(() => this.checkAndInitializeMap(), 100);
    }
  }

  initializeMap(): void {
    if (this.mapInitialized) {
      return;
    }
    this.map = L.map(this.mapContainer.nativeElement).setView([-28.4793, 24.6727], 6);

    L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
      attribution: '© OpenStreetMap contributors'
    }).addTo(this.map);
    this.markers.forEach(markerData => {
      const marker = L.marker([markerData.lat, markerData.lng], {
        icon: this.getPulsingIcon(markerData.status)
      }).addTo(this.map);
      marker.bindPopup(markerData.popup);
    });

    this.fitMapBounds();
    this.mapInitialized = true;
  }

  fitMapBounds() {
    if (this.markers.length > 0 && this.map) {
      const bounds = L.latLngBounds(this.markers.map(m => [m.lat, m.lng]));
      this.map.fitBounds(bounds);
    }
  }

  viewProjectDetails(projectId: string) {
    this.router.navigate(['/public/projects', projectId]).then(
        r => console.log('Navigated to project details:', r ? 'success' : 'failed')
    );
  }

  navigateToProjects(): void {
    this.router.navigate(['/public/projects']);
  }

  navigateToFeaturedProjects(): void {
    this.router.navigate(['/public/projects'], { queryParams: { featured: 'true' } });
  }

  loadProjects() {
    this.isLoading = true;
    this.firestore.collection('projects').get().subscribe(
      (querySnapshot) => {
        const projects: any[] = [];
        let totalBudget = 0;
        
        querySnapshot.forEach((doc) => {
          const project = doc.data() as any;
          project.id = doc.id;
          projects.push(project);
  
          const projectBudget = project.stages?.preparation?.basicData?.projectBudget;
          if (projectBudget) {
            const numericValue = parseFloat(projectBudget.replace(/[^0-9.-]+/g, ""));
            if (!isNaN(numericValue)) {
              totalBudget += numericValue;
            }
          }
        });
  
        // Sort by start date
        const sortedProjects = projects.sort((a, b) => {
          return new Date(b.startDate).getTime() - new Date(a.startDate).getTime();
        });
  
        // Get recent projects
        this.recentProjects = sortedProjects.slice(0, 5);
        this.calculateTotalRecentProjectsValue();
  
        // Sort and get high value projects
        this.highValueProjects = projects.sort((a, b) => {
          const aPrice = parseFloat(a.stages?.preparation?.basicData?.projectBudget?.replace(/[^0-9.-]+/g, "") || '0');
          const bPrice = parseFloat(b.stages?.preparation?.basicData?.projectBudget?.replace(/[^0-9.-]+/g, "") || '0');
          return bPrice - aPrice;
        }).slice(0, 5);
  
        // Calculate total high value projects
        this.totalHighValueProjectsValue = this.highValueProjects.reduce((total, project) => {
          const budget = project.stages?.preparation?.basicData?.projectBudget;
          if (budget) {
            const numericValue = parseFloat(budget.replace(/[^0-9.-]+/g, ""));
            return !isNaN(numericValue) ? total + numericValue : total;
          }
          return total;
        }, 0);
  
        // Get featured projects
        this.featuredProjects = projects.filter(project => project.featured).slice(0, 3);
  
        // Add high value projects if not enough featured
        if (this.featuredProjects.length < 3) {
          const additionalFeatured = this.highValueProjects
            .filter(project => !this.featuredProjects.some(fp => fp.id === project.id))
            .slice(0, 3 - this.featuredProjects.length);
          this.featuredProjects = [...this.featuredProjects, ...additionalFeatured];
        }
  
        this.numberOfProjects = projects.length;
        this.totalValueOfProjects = totalBudget;
  
        this.generateMarkers();
        this.projectsLoaded = true;
        this.isLoading = false;
        this.checkAndInitializeMap();
  
        this.cdr.detectChanges();
      },
      (error) => {
        this.isLoading = false;
        console.error('Error loading projects:', error);
      }
    );
  }

  formatCurrency(value: number): string {
    if (isNaN(value) || value === 0) {
      return '';
    }
    if (value >= 1000000000) {
      return 'ZAR ' + (value / 1000000000).toFixed(1) + 'B';
    } else if (value >= 1000000) {
      return 'ZAR ' + (value / 1000000).toFixed(1) + 'M';
    } else if (value >= 1000) {
      return 'ZAR ' + (value / 1000).toFixed(1) + 'K';
    }
    return 'ZAR ' + value.toFixed(0);
  }

  generateMarkers() {
    this.markers = this.recentProjects.map(project => {
      if (project.location && project.location.coordinates) {
        // Updated popup HTML with style guide colors and typography
        const popup = `
          <div class="p-6 max-w-sm bg-white rounded-xl shadow-sm">
            <h3 class="text-lg font-light mb-2 text-neutral-700">${project.name}</h3>
            <p class="mb-2 text-neutral-700 text-sm">
              <span class="font-medium">Cost Estimate:</span> 
              ${project.stages?.tenderManagement?.basicData?.contractPrice || ''}
            </p>
            <p class="mb-4 text-neutral-700 text-sm">
              <span class="font-medium">Location:</span> ${project.location.name}
            </p>
            <a href="/public/projects/${project.id}" class="inline-flex px-4 py-2 bg-black text-white text-sm rounded-full transition-all duration-200 hover:bg-neutral-800">
              View Details
            </a>
          </div>
        `;
        return {
          lat: project.location.coordinates.lat,
          lng: project.location.coordinates.lng,
          popup: popup,
          status: project.status || 'Other'
        };
      }
      return null;
    }).filter((marker): marker is { lat: number; lng: number; popup: string; status: string } => marker !== null);
  }

  private getPulsingIcon(status: string): L.DivIcon {
    const color = this.getColorForStatus(status);
    // Updated icon design to match style guide
    return L.divIcon({
      className: 'pulsing-icon',
      html: `
        <div class="relative w-10 h-10">
          <div class="absolute inset-0 pulse-ring rounded-full border-2" style="border-color: ${color};"></div>
          <div class="absolute inset-2 rounded-full bg-white shadow-sm" style="background-color: ${color};"></div>
        </div>
      `,
      iconSize: [40, 40],
      iconAnchor: [20, 20]
    });
  }

  private getColorForStatus(status: string): string {
    // Updated to use style guide status colors
    const statusColors: { [key: string]: string } = {
      'Active': this.colors.status.active,
      'Completed': this.colors.status.completed,
      'In Progress': this.colors.status.inProgress,
      'Planned': this.colors.status.planned,
      'Other': this.colors.status.other
    };
    return statusColors[status] || statusColors['Other'];
  }

  addProjectsToFirebase(): void {
    const projects = (projectsData as any).projects;
    projects.forEach((project: any) => {
      const id = this.generateUniqueId();
      this.firestore.collection('projects').doc(id).set({ id, ...project });
    });
  }

  generateUniqueId(): string {
    const prefix = 'oc4ids_sa_';
    const suffix = Math.random().toString(36).substr(2, 6);
    return prefix + suffix;
  }

  formatLargeNumber(num: number): string {
    if (num >= 1000000) {
      return (num / 1000000).toFixed(1) + 'M';
    } else if (num >= 1000) {
      return (num / 1000).toFixed(1) + 'K';
    }
    return num.toString();
  }

  getFormattedPrice(price: any): string {
    if (!price) {
      return '';
    }
    
    try {
      // If price is a string, clean and extract numeric value
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
  
      // If price is already a number
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

  calculateTotalHighValueProjectsValue(): void {
    this.totalHighValueProjectsValue = this.highValueProjects.reduce((total, project) => {
      const budget = project.stages?.preparation?.basicData?.projectBudget;
      if (budget) {
        const numericValue = parseFloat(budget.replace(/[^0-9.-]+/g, ""));
        return !isNaN(numericValue) ? total + numericValue : total;
      }
      return total;
    }, 0);
  }

  calculateTotalBudget(): number {
    return this.highValueProjects.reduce((total, project) => {
      const budget = project.stages?.preparation?.basicData?.projectBudget;
      if (budget) {
        const numericValue = parseFloat(budget.replace(/[^0-9.-]+/g, ""));
        if (!isNaN(numericValue)) {
          return total + numericValue;
        }
      }
      return total;
    }, 0);
  }

  toggleMobileMenu(): void {
    const mobileMenu = document.getElementById('mobileMenu');
    if (mobileMenu) {
      mobileMenu.classList.toggle('hidden');
    }
  }

  setActiveTab(tab: 'recent' | 'highValue'): void {
    this.activeTab = tab;
  }

  openQuickMenu(): void {
    this.showQuickMenu = true;
  }

  closeQuickMenu(): void {
    this.showQuickMenu = false;
  }

  calculateTotalRecentProjectsValue() {
    this.totalRecentProjectsValue = this.recentProjects.reduce((total, project) => {
      const budget = project.stages?.preparation?.basicData?.projectBudget;
      if (budget) {
        const numericValue = parseFloat(budget.replace(/[^0-9.-]+/g, ""));
        return !isNaN(numericValue) ? total + numericValue : total;
      }
      return total;
    }, 0);
  }
}
