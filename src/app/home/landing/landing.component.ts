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
import { animate, style, transition, trigger, query, stagger } from "@angular/animations";
import * as L from 'leaflet';
import { ScriptLoaderService } from "../../services/scriptLoader.service";
import { NgIconComponent } from "@ng-icons/core";

interface ViewProjectDetailsEvent extends CustomEvent {
  detail: string;
}

@Component({
  selector: 'app-landing',
  templateUrl: './landing.component.html',
  styleUrls: ['./landing.component.scss'],
  standalone: true,
  imports: [
    CommonModule,
    RouterLink,
    IntersectionObserverDirective,
    NgIconComponent,
  ],
  animations: [
    // Existing slideInAnimation
    trigger('slideInAnimation', [
      transition(':enter', [
        style({ transform: 'translateY(20px)', opacity: 0 }),
        animate('1000ms ease-out', style({ transform: 'translateY(0)', opacity: 1 }))
      ])
    ]),
    // Existing fadeInAnimation
    trigger('fadeInAnimation', [
      transition(':enter', [
        style({ opacity: 0 }),
        animate('500ms', style({ opacity: 1 }))
      ])
    ]),
    // New fadeInUp animation definition
    trigger('fadeInUp', [
      transition(':enter', [
        style({ opacity: 0, transform: 'translateY(50px)' }),
        animate('500ms ease-out', style({ opacity: 1, transform: 'translateY(0)' }))
      ])
    ]),
    // Staggered list animation
    trigger('listAnimation', [
      transition('* <=> *', [
        query(':enter', [
          style({ opacity: 0, transform: 'translateY(50px)' }),
          stagger('50ms', animate('500ms ease-out', style({ opacity: 1, transform: 'translateY(0)' })))
        ], { optional: true })
      ])
    ]),

    // New staggered list animation
    trigger('staggeredList', [
      transition('* <=> *', [
        query(':enter', [
          style({ opacity: 0, transform: 'translateY(50px)' }),
          stagger('50ms', animate('500ms ease-out', style({ opacity: 1, transform: 'translateY(0)' })))
        ], { optional: true })
      ])
    ])
  ]
})
export class LandingComponent implements OnInit, OnDestroy, AfterViewInit {
  @ViewChild('mapContainer') mapContainer!: ElementRef;

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


  activeTab: 'recent' | 'highValue' = 'recent';
  showQuickMenu: boolean = false;

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
      { name: "GIZ", link: "https://www.giz.de/en/html/index.html", image: "../../../assets/giz.png" },
      { name: "FCDO", link: "https://www.gov.uk/government/organisations/foreign-commonwealth-development-office", image: "../../../assets/uk.png" },
    ]
  };

  constructor(
      private http: HttpClient,
      private firestore: AngularFirestore,
      private router: Router,
      private scriptLoader: ScriptLoaderService,
      private cdr: ChangeDetectorRef,
      private ngZone: NgZone
  ) {}

  async ngOnInit(): Promise<void> {
    try {
      await this.loadLeafletScripts();
      this.loadProjects();
      window.addEventListener('viewProjectDetails', this.handleViewProjectDetails as EventListener);
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
    // Implement contact form opening logic
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
          let totalValue = 0;
          querySnapshot.forEach((doc) => {
            const project = doc.data() as any;
            project.id = doc.id; // Ensure each project has an id
            projects.push(project);

            // Calculate total value
            const projectBudget = project.stages?.preparation?.basicData?.projectBudget;
            if (projectBudget) {
              const numericValue = parseFloat(projectBudget.replace(/[^0-9.-]+/g, ""));
              if (!isNaN(numericValue)) {
                totalValue += numericValue;
              }
            }
          });

          // Sort projects by start date (assuming there's a startDate field)
          const sortedProjects = projects.sort((a, b) => {
            return new Date(b.startDate).getTime() - new Date(a.startDate).getTime();
          });

          // Populate recentProjects
          this.recentProjects = sortedProjects.slice(0, 5);

          // Sort and populate highValueProjects
          this.highValueProjects = projects.sort((a, b) => {
            const aPrice = parseFloat(a.stages?.preparation?.basicData?.projectBudget?.replace(/[^0-9.-]+/g, "") || '0');
            const bPrice = parseFloat(b.stages?.preparation?.basicData?.projectBudget?.replace(/[^0-9.-]+/g, "") || '0');
            return bPrice - aPrice;
          }).slice(0, 5);

          // Populate featuredProjects (assuming there's a 'featured' boolean field)
          this.featuredProjects = projects.filter(project => project.featured).slice(0, 3);

          // If there aren't enough featured projects, add high-value projects to make up the difference
          if (this.featuredProjects.length < 3) {
            const additionalFeatured = this.highValueProjects
                .filter(project => !this.featuredProjects.some(fp => fp.id === project.id))
                .slice(0, 3 - this.featuredProjects.length);
            this.featuredProjects = [...this.featuredProjects, ...additionalFeatured];
          }

          this.numberOfProjects = projects.length;
          this.totalValueOfProjects = totalValue;

          this.generateMarkers();
          this.projectsLoaded = true;
          this.isLoading = false;
          this.checkAndInitializeMap();

          // Trigger change detection
          this.cdr.detectChanges();
        },
        (error) => {
          this.isLoading = false;
          console.error('Error loading projects:', error);
          // Optionally, implement error handling UI feedback here
        }
    );
  }

  formatCurrency(value: number): string {
    if (isNaN(value) || value === 0) {
      return 'N/A';
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
        const popup = `
          <div class="p-6 max-w-sm bg-primary-100 rounded-apple ">
            <h3 class="text-lg font-semibold mb-2 text-accent-300">${project.name}</h3>
            <p class="mb-2 text-accent-100">
              <span class="font-medium">Cost Estimate:</span> 
              ${project.stages?.tenderManagement?.basicData?.contractPrice || 'N/A'}
            </p>
            <p class="mb-4 text-accent-100">
              <span class="font-medium">Location:</span> ${project.location.name}
            </p>
            <button class="apple-button w-full text-center" data-project-id="${project.id}">
              View Details
            </button>
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
    return L.divIcon({
      className: 'pulsing-icon',
      html: `
        <div class="relative w-10 h-10">
          <div class="absolute inset-0 pulse-ring rounded-full border-2" style="border-color: ${color};"></div>
          <div class="absolute inset-2 rounded-full bg-white shadow-md" style="background-color: ${color};"></div>
        </div>
      `,
      iconSize: [40, 40],
      iconAnchor: [20, 20]
    });
  }

  private getColorForStatus(status: string): string {
    const statusColors: { [key: string]: string } = {
      'Active': '#61a8bd',
      'Completed': '#4caf50',
      'In Progress': '#ffc107',
      'Planned': '#2196f3',
      'Other': '#D60000'
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


  getFormattedPrice(price: string): string {
    if (!price) return 'N/A';

    const numericValue = parseFloat(price.replace(/[^0-9.-]+/g, ""));
    if (isNaN(numericValue)) {
      return 'N/A';
    } else {
      return new Intl.NumberFormat('en-US', {
        style: 'currency',
        currency: 'ZAR',
        minimumFractionDigits: 0,
        maximumFractionDigits: 0
      }).format(numericValue);
    }
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
}
