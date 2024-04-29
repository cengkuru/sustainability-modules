import {Component, OnInit, ViewEncapsulation} from '@angular/core';
import {HttpClient} from "@angular/common/http";
import { formatCurrency, getCurrencySymbol } from '@angular/common';
import {animate, query, stagger, style, transition, trigger} from "@angular/animations";

@Component({
  selector: 'app-root',
  templateUrl: './app.component.html',
  styleUrl: './app.component.scss',
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
export class AppComponent implements OnInit {
  activeTab = 'sample-projects';  // Default active tab
  tabs = [
    { id: 'sample-projects', label: 'Sample Projects' },
    { id: 'data-points', label: 'Explore OC4IDS Data Points' }
  ];
  jsonData: any;  // Variable to hold the JSON data
  exampleData:  any;
  activeProjectId: any;

  sampleProjects: any;
  uniquePhases!: any[] ;
  selectedProject: any;





  constructor(private http: HttpClient) {}  // Inject HttpClient

  ngOnInit(): void {
    this.loadJsonData();
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
    // Check if the project is already selected, if so, deselect it.
    if (this.selectedProject && this.selectedProject.id === project.id) {
      this.selectedProject = null;
    } else {
      // Else, select the new project.
      this.selectedProject = project;
    }
  }


  // Get Project Details by ID
  getProjectDetails(projectId: any): any {
    const selectedProject = this.sampleProjects.find((project: any) => project.id === projectId);
    console.log(selectedProject);
    return selectedProject;
  }



  // In your component.ts













}
