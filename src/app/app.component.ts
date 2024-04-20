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
  projectDetailsOpen = new Map<string, boolean>();



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

  switchTab(tab: string): void {
    this.activeTab = tab;
  }

  onTabChange(event: Event): void {
    const selectElement = event.target as HTMLSelectElement;
    this.activeTab = selectElement.value;
  }

  currency(value: number, currencyCode: string = 'USD', locale: string = 'en-US'): string {
    return formatCurrency(value, locale, getCurrencySymbol(currencyCode, 'wide'), currencyCode);
  }

  extractUniquePhases(): void {
    this.uniquePhases = this.sampleProjects
      .map((project: any) => project.phase as string)  // Ensuring phase is treated as a string
      .filter((phase: string, index: number, phases: string[]) => phases.indexOf(phase) === index);  // Explicitly specifying types
  }

  isProjectDetailsOpen(projectId: string): boolean {
    return this.projectDetailsOpen.get(projectId) || false;
  }

  setFilterPhase(phase: string): void {
    this.filterPhase = phase;
  }

  clearFilter(): void {
    this.filterPhase = '';
  }

  toggleProjectDetails(projectId: string): void {
    this.projectDetailsOpen.set(projectId, !this.isProjectDetailsOpen(projectId));
  }




}
