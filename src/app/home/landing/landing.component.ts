import { Component, OnInit, OnDestroy } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { AngularFirestore } from '@angular/fire/compat/firestore';
import { CommonModule } from '@angular/common';
import { Router, RouterLink } from '@angular/router';
import { environment } from "../../../environments/environment";
import * as projectsData from '../../../assets/data/projects.json';
import {IntersectionObserverDirective} from "../../directives/intersection-observer.directive";

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
    const redMarkerSVG = `
    <svg width="24" height="24" xmlns="http://www.w3.org/2000/svg">
        <g fill="none" fill-rule="evenodd">
            <circle fill="#FF0000" cx="12" cy="12" r="12"/>
            <path d="M12 3c-4.97 0-9 4.03-9 9 0 2.94 2.69 6.14 8.16 10.61.39.32.85.39 1.27.13.41-.25.67-.71.67-1.21V12.07c1.51.48 3.16.27 4.34-.71.53-.47.95-1.04 1.23-1.67C18.86 6.52 15.87 3 12 3z" fill="#FFF"/>
        </g>
    </svg>
    `;

    const icon = new H.map.Icon(redMarkerSVG, {
      size: { w: 24, h: 24 },
      anchor: { x: 12, y: 24 }
    });
    this.markers = this.recentProjects.map(project => {
      if (project.location && project.location.coordinates) {
        const popup = `
          <div>
            <h3 class="text-lg font-semibold">${project.name}</h3>
            <p>Cost Estimate: ${project.stages?.tenderManagement?.basicData?.contractPrice || 'N/A'}</p>
            <p>Location: ${project.location.name}</p>
            <a [routerLink]="['/public/projects', project.id]" class="mt-2 px-2 py-1 bg-accent text-black rounded hover:bg-secondary ">View Details</a>
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

    console.log('Generated markers:', this.markers);
  }

  navigateToProjects() {
    this.router.navigate(['/projects']);
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
