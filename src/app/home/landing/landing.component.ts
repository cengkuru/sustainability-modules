import { Component, OnInit, AfterViewInit } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { AngularFirestore } from '@angular/fire/compat/firestore';
import { CommonModule } from '@angular/common';

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
export class LandingComponent implements OnInit, AfterViewInit {
  private platform: any;
  private map: any;
  recentProjects: any[] = [];

  markers = [
    { lat: -33.7139, lng: 25.5207, popup: 'Nelson Mandela Metropolitan Municipality' },
    { lat: -26.2041, lng: 28.0473, popup: 'City of Johannesburg Metropolitan Municipality (JW)' },
    { lat: -25.7461, lng: 28.1881, popup: 'City of Tshwane Metropolitan Municipality' },
    { lat: -33.9258, lng: 18.4232, popup: 'City of Cape Town Metropolitan Municipality' },
    { lat: -25.6545, lng: 27.2559, popup: 'Rustenburg Local Municipality' }
  ];



  constructor(private http: HttpClient, private firestore: AngularFirestore) {
    console.log('markers: ', this.markers)
    this.platform = new H.service.Platform({
      apikey: 'bo0uc_5TPAXOiS7C10x1rrlkJ1J7v9ezqiWOmtFi_Ik'
    });
  }

  ngOnInit(): void {
    this.loadProjects();
    this.getItems();
  }

  ngAfterViewInit(): void {
    this.initializeMap();
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

    this.map.getViewModel().setLookAtData({
      bounds: this.calculateBounds()
    });
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
        bounds = bounds.mergePoint({ lat: markerData.lat, lng: markerData.lng });
      }
    });

    return bounds;
  }

  getItems() {
    this.firestore.collection('items').valueChanges({ idField: 'id' }).subscribe(items => {
      console.log(items);
    }, error => {
      console.error('Error fetching items: ', error);
    });
  }

  // Function to generate a random alphanumeric string
  generateOC4IDSId(): string {
    const prefix = 'oc4ids_sa_';
    const chars = 'abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789';
    const randomStr = Array(8).fill(null).map(() => chars.charAt(Math.floor(Math.random() * chars.length))).join('');
    return `${prefix}${randomStr}`;
  }

  // Add projects to Firestore with unique OC4IDS ID
  addProject(project: any) {
    project.id = this.generateOC4IDSId();
    this.firestore.collection('projects').add(project).then(() => {
      console.log('Project added successfully');
    }).catch(error => {
      console.error('Error adding project: ', error);
    });
  }

  generateMarkers() {
    this.markers = this.recentProjects.map(project => {
      if (project.location && project.location.coordinates) {
        return {
          lat: parseFloat(project.location.coordinates.lat),
          lng: parseFloat(project.location.coordinates.lng),
          popup: project.location.name
        };
      }
      return null;
    }).filter((marker): marker is { lat: number; lng: number; popup: string } => marker !== null);

    console.log('Generated markers:', this.markers);
    this.initializeMap();
  }

  loadProjects() {
    this.http.get<any[]>('assets/data/projects.json').subscribe(data => {
      this.recentProjects = data;
      this.generateMarkers();
      this.recentProjects.forEach(project => {
        this.addProject(project);
      });
    }, error => {
      console.error('Error loading projects: ', error);
    });
  }
}
