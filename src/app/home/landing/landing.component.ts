import {Component, OnInit, ViewEncapsulation} from '@angular/core';
import {animate, query, stagger, style, transition, trigger} from "@angular/animations";
import {HttpClient} from "@angular/common/http";
import {AngularFirestore} from "@angular/fire/compat/firestore";

@Component({
  selector: 'app-landing',
  templateUrl: './landing.component.html',
  styleUrl: './landing.component.scss',
  encapsulation: ViewEncapsulation.None,
  animations: [
    trigger('fadeInOut', [
      transition(':enter', [   // :enter is alias to 'void => *'
        style({ opacity: 0 }),
        animate(500, style({ opacity: 1 }))
      ]),
      transition(':leave', [   // :leave is alias to '* => void'
        animate(500, style({ opacity: 0 }))
      ])
    ]),
    trigger('listAnimation', [
      transition('* <=> *', [
        query(':enter', [
          style({ opacity: 0, transform: 'translateY(-15px)' }),
          stagger(100, [
            animate('0.5s ease-out', style({ opacity: 1, transform: 'translateY(0)' }))
          ])
        ], { optional: true })
      ])
    ])
  ]
})
export class LandingComponent implements OnInit {
  activeTab = 'sample-projects';  // Default active tab
  tabs = [
    { id: 'sample-projects', label: 'Sample Projects' },
    { id: 'data-points', label: 'Explore OC4IDS Data Points' }
  ];
  jsonData: any;  // Variable to hold the JSON data
  exampleData:  any;
  phases: string[] = ['identification', 'preparation', 'implementation', 'completion', 'maintenance', 'decommissioning']; // Add this property to define the phases


  sampleProjects: any;
  uniquePhases!: any[] ;
  selectedProject: any;
  activePhase: string | undefined;





  constructor(private http: HttpClient,private firestore: AngularFirestore) {}  // Inject HttpClient

  ngOnInit(): void {
    this.loadJsonData();
  }

  getItems() {
    this.firestore.collection('items').valueChanges({ idField: 'id' }).subscribe(items => {
      console.log(items);
    }, error => {
      console.error('Error fetching items: ', error);
    });
  }


  addItem(item: any) {
    this.firestore.collection('items').add(item).then(() => {
      console.log('Item added successfully!');
    }).catch(error => {
      console.error('Error adding item: ', error);
    });
  }

  loadJsonData(): void {
    this.http.get<any>('/assets/data/oc4ids.json').subscribe(data => {
      this.jsonData = data;
    }, error => console.error('Error loading the JSON data:', error));

    this.http.get<any>('/assets/data/example.json').subscribe(data => {
      this.exampleData = data;
    }, error => console.error('Error loading the JSON data:', error));

    this.http.get<any>('/assets/data/sample-projects.json').subscribe(data => {
      this.sampleProjects = data;
      this.extractUniquePhases();
    }, error => console.error('Error loading the JSON data:', error));
  }

  switchTab(tabId: string) {
    this.activeTab = tabId;
  }

  onTabChange(event: Event): void {
    const selectElement = event.target as HTMLSelectElement;
    this.activeTab = selectElement.value;
  }


  extractUniquePhases(): void {
    this.uniquePhases = this.sampleProjects
      .map((project: any) => project.phase as string)  // Ensuring phase is treated as a string
      .filter((phase: string, index: number, phases: string[]) => phases.indexOf(phase) === index);  // Explicitly specifying types
  }

  // ... (rest of the component)

// Helper method to toggle the project details view
  toggleProjectDetails(project: any): void {
    if (this.selectedProject && this.selectedProject.id === project.id) {
    this.selectedProject = null;
    this.activePhase = 'identification'; // Reset to default phase
  } else {
    this.selectedProject = project;
    this.activePhase = 'identification'; // Reset to default phase
  }
}

  setActivePhase(phase: string) {
    this.activePhase = phase;
  }


  // Get Project Details by ID
  getProjectDetails(projectId: any): any {
    const selectedProject = this.sampleProjects.find((project: any) => project.id === projectId);
    console.log(selectedProject);
    return selectedProject;
  }



  // In your component.ts













}
