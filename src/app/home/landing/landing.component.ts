import { Component, OnInit, OnDestroy } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { AngularFirestore } from '@angular/fire/compat/firestore';
import { CommonModule } from '@angular/common';
import { Router, RouterLink } from '@angular/router';
import { environment } from "../../../environments/environment";
import projectsData from '../../../assets/data/projects.json';
import {IntersectionObserverDirective} from "../../directives/intersection-observer.directive";
import {animate, style, transition, trigger} from "@angular/animations";

declare var H: any;

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
    IntersectionObserverDirective
  ],
  animations: [
    trigger('slideInAnimation', [
      transition(':enter', [
        style({ transform: 'translateY(20px)', opacity: 0 }),
        animate('1000ms ease-out', style({ transform: 'translateY(0)', opacity: 1 }))
      ])
    ])
  ]
})
export class LandingComponent implements OnInit, OnDestroy {
  pageTitle = 'Click Map Markers for More on Climate Finance Projects';
  private platform: any;
  private map: any;
  recentProjects: any[] = [];
  highValueProjects: any[] = [];
  markers: { lat: number; lng: number; popup: string; }[] = [];
  numberOfProjects: number = 0;
  totalValueOfProjects: number = 0;



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
      { name: "GIZ", link: "https://www.giz.de", image: "../../../assets/giz.png" },
      { name: "FCDO", link: "https://www.fcdo.gov.uk", image: "../../../assets/fcdo.png" },
      { name: "CoST", link: "#", image: "../../../assets/cost-logo-transparent.png" }
    ]
  };

  constructor(private http: HttpClient, private firestore: AngularFirestore, private router: Router) {
    console.log('markers: ', this.markers);
    this.platform = new H.service.Platform({
      apikey: environment.hereMapsApiKey
    });
  }

  ngOnInit(): void {

    // this.addProjectsToFirebase();
    this.loadProjects();
    window.addEventListener('viewProjectDetails', this.handleViewProjectDetails as EventListener);
  }

  ngOnDestroy(): void {
    window.removeEventListener('viewProjectDetails', this.handleViewProjectDetails as EventListener);
  }

  handleViewProjectDetails = (event: ViewProjectDetailsEvent) => {
    this.viewProjectDetails(event.detail);
  };

  initializeMap(): void {
    const defaultLayers = this.platform.createDefaultLayers();
    this.map = new H.Map(
        document.getElementById('map'),
        defaultLayers.vector.normal.map,
        {
          zoom: 6,
          center: { lat: -28.4793, lng: 24.6727 }
        }
    );

    const behavior = new H.mapevents.Behavior(new H.mapevents.MapEvents(this.map));
    const ui = H.ui.UI.createDefault(this.map, defaultLayers);

    this.markers.forEach(markerData => {
      const marker = new H.map.Marker({ lat: markerData.lat, lng: markerData.lng });
      marker.setData(markerData.popup);
      marker.addEventListener('tap', (event: any) => {
        const bubble = new H.ui.InfoBubble(event.target.getGeometry(), {
          content: event.target.getData()
        });
        ui.addBubble(bubble);
        this.map.setCenter(event.target.getGeometry());
        this.map.setZoom(12); // Adjust zoom level as needed to focus on the marker
      });
      this.map.addObject(marker);
    });

    this.fitMapBounds();
  }

  calculateBounds(): any {
    if (this.markers.length === 0) {
      return null;
    }

    let bounds = new H.geo.Rect(
        this.markers[0].lat, this.markers[0].lng,
        this.markers[0].lat, this.markers[0].lng
    );

    this.markers.forEach(markerData => {
      if (markerData.lat !== undefined && markerData.lng !== undefined) {
        bounds = bounds.mergePoint(new H.geo.Point(markerData.lat, markerData.lng));
      }
    });

    return bounds;
  }

  fitMapBounds() {
    const bounds = this.calculateBounds();
    if (bounds) {
      this.map.getViewModel().setLookAtData({
        bounds: bounds
      });
    }
  }

  viewProjectDetails(projectId: string) {
    this.router.navigate(['/public/projects', projectId]).then(
        r => console.log('Navigated to project details:', r ? 'success' : 'failed')
    );
  }

  loadProjects() {
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

          this.recentProjects = projects.slice(0, 5); // Display only the first 5 projects
          this.highValueProjects = projects.sort((a, b) => {
            const aPrice = parseFloat(a.stages?.tenderManagement?.basicData?.contractPrice.replace(/[^0-9.-]+/g, "") || '0');
            const bPrice = parseFloat(b.stages?.tenderManagement?.basicData?.contractPrice.replace(/[^0-9.-]+/g, "") || '0');
            return bPrice - aPrice;
          }).slice(0, 5); // Display top 5 high-value projects

          this.numberOfProjects = projects.length;
          this.totalValueOfProjects = totalValue;
          console.log('Loaded projects:', projects);
          this.generateMarkers();
          this.initializeMap();
        },
        (error) => {
          console.error('Error loading projects:', error);
        }
    );
  }



  generateMarkers() {
    this.markers = this.recentProjects.map(project => {
      if (project.location && project.location.coordinates) {
        const popup = `
          <div class="p-4 max-w-sm">
            <h3 class="text-lg font-semibold mb-2">${project.name}</h3>
            <p class="mb-2">Cost Estimate: ${project.stages?.tenderManagement?.basicData?.contractPrice || 'N/A'}</p>
            <p class="mb-4">Location: ${project.location.name}</p>
            <button class="view-details-button px-4 py-2 bg-accent text-secondary rounded hover:bg-secondary hover:text-accent transition duration-300" data-project-id="${project.id}">
              View Details
            </button>
          </div>
        `;
        return {
          lat: parseFloat(project.location.coordinates.lat),
          lng: parseFloat(project.location.coordinates.lng),
          popup: popup
        };
      }
      return null;
    }).filter((marker): marker is { lat: number; lng: number; popup: string } => marker !== null);
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
}
