import { Component, OnInit } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { AngularFirestore } from '@angular/fire/compat/firestore';
import { CommonModule } from '@angular/common';
import { Router } from '@angular/router';

declare var H: any;

@Component({
  selector: 'app-landing',
  templateUrl: './landing.component.html',
  styleUrls: ['./landing.component.scss'],
  standalone: true,
  imports: [
    CommonModule
  ]
})
export class LandingComponent implements OnInit {
  private platform: any;
  private map: any;
  recentProjects: any[] = [];
  markers: { lat: number; lng: number; popup: string; }[] = [];

  constructor(private http: HttpClient, private firestore: AngularFirestore, private router: Router) {
    console.log('markers: ', this.markers);
    this.platform = new H.service.Platform({
      apikey: 'bo0uc_5TPAXOiS7C10x1rrlkJ1J7v9ezqiWOmtFi_Ik'
    });
  }

  ngOnInit(): void {
    this.loadProjects();
  }

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
      });
      this.map.addObject(marker);
    });

    const bounds = this.calculateBounds();
    if (bounds) {
      this.map.getViewModel().setLookAtData({
        bounds: bounds
      });
    }
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
    // Navigate to the project details page with the projectId
    this.router.navigate(['/project-details', projectId]);
  }

  loadProjects() {
    this.firestore.collection('projects').get().subscribe(
        (querySnapshot) => {
          const projects: any[] = [];
          querySnapshot.forEach((doc) => {
            projects.push(doc.data());
          });
          this.recentProjects = projects;
          console.log('Loaded projects:', this.recentProjects);
          this.generateMarkers();

          // Initialize the map after the markers are generated
          this.initializeMap();

          // Wait for the map to be initialized before fitting the bounds
          if (this.map) {
            this.fitMapBounds();
          } else {
            // If the map is not initialized yet, wait for it to be ready
            const mapReadyInterval = setInterval(() => {
              if (this.map) {
                clearInterval(mapReadyInterval);
                this.fitMapBounds();
              }
            }, 100);
          }
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
          <div>
            <h3 class="text-lg font-semibold">${project.name}</h3>
            <p class="text-gray-600">${project.description}</p>
            <p class="text-gray-500">Location: ${project.location.name}</p>
            <button class="mt-2 px-4 py-2 bg-blue-500 text-white rounded hover:bg-blue-600" (click)="viewProjectDetails('${project.id}')">View Details</button>
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
}
