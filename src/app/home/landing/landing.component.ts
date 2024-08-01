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
import { CommonModule } from '@angular/common';
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
    trigger('slideInAnimation', [
      transition(':enter', [
        style({ transform: 'translateY(20px)', opacity: 0 }),
        animate('1000ms ease-out', style({ transform: 'translateY(0)', opacity: 1 }))
      ])
    ]),
    trigger('fadeInAnimation', [
      transition(':enter', [
        style({ opacity: 0 }),
        animate('500ms', style({ opacity: 1 }))
      ])
    ]),
    trigger('listAnimation', [
      transition('* <=> *', [
        query(':enter',
            [style({ opacity: 0, transform: 'translateY(50px)' }), stagger('50ms', animate('500ms ease-out', style({ opacity: 1, transform: 'translateY(0px)' })))],
            { optional: true }
        )
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

  isLoading: boolean = true;
  mapInitialized: boolean = false;
  projectsLoaded: boolean = false;
  private viewInitialized: boolean = false;

  mainSection = {
    title: "Explore GCF Projects: Boosting Climate Finance Investments in South Africa",
    description: "This prototype, developed by the Infrastructure Transparency Initiative (CoST), demonstrates the implementation of the Open Contracting for Infrastructure Data Standard (OC4IDS). It specifically focuses on the climate finance and sustainability modules to highlight their potential applications and benefits. The information shown is based on projects approved by the Green Climate Fund (GCF) for the Republic of South Africa. Values are for illustrative purposes only.",
    buttonText: "Explore Projects →"
  };

  featuredProjectsSection = {
    title: "Explore Featured Projects",
    description: "Discover the innovative projects that are leading the way in infrastructure development. Whether it's sustainable energy, modern transportation, or advanced water management, our projects set the standard for excellence.",
    buttonText: "View Featured Projects →",
    buttonLink: "/projects/featured"
  };

  sponsorsSection = {
    title: "Supported by",
    sponsors: [
      { name: "GIZ", link: "https://www.giz.de/en/html/index.html", image: "../../../assets/giz.png" },
      { name: "FCDO", link: "https://www.gov.uk/government/organisations/foreign-commonwealth-development-office", image: "../../../assets/uk.png" },
      { name: "CoST", link: "https://infrastructuretransparency.org/", image: "../../../assets/cost-logo-transparent.png" }
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
    console.log('ngOnInit called');
    try {
      await this.loadLeafletScripts();
      this.loadProjects();
      window.addEventListener('viewProjectDetails', this.handleViewProjectDetails as EventListener);
    } catch (error) {
      console.error('Error during component initialization:', error);
    }
  }

  ngAfterViewInit() {
    console.log('ngAfterViewInit called');
    this.viewInitialized = true;
    this.ngZone.runOutsideAngular(() => {
      setTimeout(() => {
        this.checkAndInitializeMap();
      }, 0);
    });
  }

  ngOnDestroy(): void {
    console.log('ngOnDestroy called');
    window.removeEventListener('viewProjectDetails', this.handleViewProjectDetails as EventListener);
    if (this.map) {
      this.map.remove();
    }
  }

  private async loadLeafletScripts(): Promise<void> {
    console.log('loadLeafletScripts called');
    const scripts = [
      'https://unpkg.com/leaflet@1.7.1/dist/leaflet.js'
    ];
    const styles = [
      'https://unpkg.com/leaflet@1.7.1/dist/leaflet.css'
    ];

    try {
      await this.scriptLoader.loadScripts(scripts);
      await this.scriptLoader.loadStyles(styles);
      console.log('Leaflet scripts and styles loaded successfully');
    } catch (error) {
      console.error('Error loading Leaflet scripts or styles:', error);
      throw error;
    }
  }

  handleViewProjectDetails = (event: ViewProjectDetailsEvent) => {
    console.log('handleViewProjectDetails called', event.detail);
    this.viewProjectDetails(event.detail);
  };

  checkAndInitializeMap(): void {
    console.log('checkAndInitializeMap called');
    console.log('viewInitialized:', this.viewInitialized);
    console.log('projectsLoaded:', this.projectsLoaded);
    console.log('mapContainer:', this.mapContainer);

    if (this.viewInitialized && this.projectsLoaded && this.mapContainer && this.mapContainer.nativeElement) {
      this.initializeMap();
    } else {
      console.log('Map initialization deferred');
      if (!this.mapContainer) {
        console.error('Map container is not available');
      }
      setTimeout(() => this.checkAndInitializeMap(), 100);
    }
  }

  initializeMap(): void {
    console.log('initializeMap called');
    if (this.mapInitialized) {
      console.log('Map already initialized');
      return;
    }

    console.log('Creating map instance');
    this.map = L.map(this.mapContainer.nativeElement).setView([-28.4793, 24.6727], 6);

    console.log('Adding tile layer');
    L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
      attribution: '© OpenStreetMap contributors'
    }).addTo(this.map);

    console.log('Adding markers', this.markers);
    this.markers.forEach(markerData => {
      const marker = L.marker([markerData.lat, markerData.lng], {
        icon: this.getPulsingIcon(markerData.status)
      }).addTo(this.map);
      marker.bindPopup(markerData.popup);
    });

    this.fitMapBounds();
    this.mapInitialized = true;
    console.log('Map initialized successfully');
  }

  fitMapBounds() {
    console.log('fitMapBounds called', this.markers.length);
    if (this.markers.length > 0 && this.map) {
      const bounds = L.latLngBounds(this.markers.map(m => [m.lat, m.lng]));
      this.map.fitBounds(bounds);
    }
  }

  viewProjectDetails(projectId: string) {
    console.log('viewProjectDetails called', projectId);
    this.router.navigate(['/public/projects', projectId]).then(
        r => console.log('Navigated to project details:', r ? 'success' : 'failed')
    );
  }

  loadProjects() {
    this.isLoading = true;
    this.firestore.collection('projects').get().subscribe(
        (querySnapshot) => {
          const projects: any[] = [];
          let totalValue = 0;
          querySnapshot.forEach((doc) => {
            const project = doc.data() as any;
            projects.push(project);
            const contractPrice = project.stages?.tenderManagement?.basicData?.contractPrice;
            if (contractPrice) {
              totalValue += parseFloat(contractPrice.replace(/[^0-9.-]+/g, ""));
            }
          });

          console.log('Projects loaded:', projects.length);
          this.recentProjects = projects.slice(0, 5);
          this.highValueProjects = projects.sort((a, b) => {
            const aPrice = parseFloat(a.stages?.tenderManagement?.basicData?.contractPrice?.replace(/[^0-9.-]+/g, "") || '0');
            const bPrice = parseFloat(b.stages?.tenderManagement?.basicData?.contractPrice?.replace(/[^0-9.-]+/g, "") || '0');
            return bPrice - aPrice;
          }).slice(0, 5);

          this.numberOfProjects = projects.length;
          this.totalValueOfProjects = totalValue;
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

  generateMarkers() {
    console.log('generateMarkers called');
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
    console.log('Generated markers:', this.markers);
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

  navigateToProjects() {
    this.router.navigate(['/public/projects']);
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

  navigateToFeaturedProjects(): void {
    this.router.navigate(['/public/projects'], { queryParams: { featured: 'true' } });
  }

  formatLargeNumber(num: number): string {
    if (num >= 1000000) {
      return (num / 1000000).toFixed(1) + 'M';
    } else if (num >= 1000) {
      return (num / 1000).toFixed(1) + 'K';
    }
    return num.toString();
  }

  formatCurrency(value: number): string {
    if (value >= 1000000000) {
      return '$' + (value / 1000000000).toFixed(1) + 'B';
    } else if (value >= 1000000) {
      return '$' + (value / 1000000).toFixed(1) + 'M';
    } else if (value >= 1000) {
      return '$' + (value / 1000).toFixed(1) + 'K';
    }
    return '$' + value.toFixed(0);
  }
}
