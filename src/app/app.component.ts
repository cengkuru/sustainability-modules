import {Component, OnInit, ViewEncapsulation} from '@angular/core';
import {HttpClient} from "@angular/common/http";
import { formatCurrency, getCurrencySymbol } from '@angular/common';

@Component({
  selector: 'app-root',
  templateUrl: './app.component.html',
  styleUrl: './app.component.scss',
  encapsulation: ViewEncapsulation.None
})
export class AppComponent implements OnInit {
  activeTab = 'data-points';  // Default active tab
  jsonData: any;  // Variable to hold the JSON data
  exampleData:  any;

  sampleProjects: any;
  uniquePhases!: any[] ;  // Array to hold unique phases
  filterPhase: any;  // Property to hold the current filtered phase



  constructor(private http: HttpClient) {}  // Inject HttpClient

  ngOnInit(): void {
    this.loadJsonData();
  }

  loadJsonData(): void {
    this.http.get<any>('/assets/data/oc4ids.json').subscribe(data => {
      this.jsonData = data;
    }, error => {
      console.error('Error loading the JSON data:', error);
    });

    this.http.get<any>('/assets/data/example.json').subscribe(data => {
      this.exampleData = data;
    }, error => {
      console.error('Error loading the JSON data:', error);
    });

    this.http.get<any>('/assets/data/sample-projects.json').subscribe(data => {
      this.sampleProjects = data;
      this.extractUniquePhases();
    }, error => {
      console.error('Error loading the JSON data:', error);
    });
  }

  switchTab(tab: string): void {
    this.activeTab = tab;
  }

  onTabChange(event: Event): void {
    const selectElement = event.target as HTMLSelectElement;
    this.activeTab = selectElement.value;
  }

  protected readonly HTMLSelectElement = HTMLSelectElement;

  currency(value: number, currencyCode: string = 'USD', locale: string = 'en-US'): string {
    return formatCurrency(value, locale, getCurrencySymbol(currencyCode, 'wide'), currencyCode);
  }

  // ... existing methods ...

  extractUniquePhases(): void {
    this.uniquePhases = this.sampleProjects
      .map((project: any) => project.phase) // Explicitly specifying the type of 'project'
      .filter((value: string, index: number, self: string[]) => self.indexOf(value) === index);
  }

  // Method to handle view details action
  viewProjectDetails(projectId: string): void {
    // Handle the action, like navigating to a different view
  }




}
